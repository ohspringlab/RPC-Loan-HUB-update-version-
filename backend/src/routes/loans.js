const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/config');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');
const { generateTermSheet } = require('../services/pdfService');
const { generateSoftQuote, calculateDSCR, getInitialNeedsList } = require('../services/quoteService');
const { sendWelcomeEmail, sendNeedsListEmail, sendSoftQuoteEmail } = require('../services/emailService');

const router = express.Router();

// Loan status constants matching the tracker
const LOAN_STATUSES = [
  'new_request',
  'quote_requested',
  'soft_quote_issued',
  'term_sheet_issued',
  'term_sheet_signed',
  'needs_list_sent',
  'needs_list_complete',
  'submitted_to_underwriting',
  'appraisal_ordered',
  'appraisal_received',
  'conditionally_approved',
  'conditional_items_needed',
  'conditional_commitment_issued',
  'clear_to_close',
  'closing_scheduled',
  'funded'
];

// Get all loans for current user (borrower)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT id, loan_number, property_address, property_city, property_state, property_zip,
             property_type, residential_units, commercial_type, is_portfolio, portfolio_count,
             request_type, transaction_type, borrower_type, property_value, loan_amount,
             requested_ltv, documentation_type, dscr_ratio,
             status, current_step, soft_quote_generated, term_sheet_url, term_sheet_signed,
             credit_authorized, appraisal_paid, full_application_completed,
             created_at, updated_at
      FROM loan_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({ loans: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get single loan details
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT * FROM loan_requests WHERE id = $1 AND user_id = $2
    `, [req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Get status history
    const history = await db.query(`
      SELECT lsh.*, u.full_name as changed_by_name
      FROM loan_status_history lsh
      LEFT JOIN users u ON lsh.changed_by = u.id
      WHERE lsh.loan_id = $1
      ORDER BY lsh.created_at DESC
    `, [req.params.id]);

    // Get needs list with folder status
    const needsList = await db.query(`
      SELECT nli.*, 
             (SELECT COUNT(*) FROM documents d WHERE d.needs_list_item_id = nli.id) as document_count,
             (SELECT MAX(uploaded_at) FROM documents d WHERE d.needs_list_item_id = nli.id) as last_upload
      FROM needs_list_items nli
      WHERE nli.loan_id = $1
      ORDER BY nli.required DESC, nli.folder_name, nli.created_at
    `, [req.params.id]);

    // Get documents grouped by folder
    const documents = await db.query(`
      SELECT id, file_name, original_name, file_type, file_size, folder_name, uploaded_at, needs_list_item_id
      FROM documents WHERE loan_id = $1 ORDER BY folder_name, uploaded_at DESC
    `, [req.params.id]);

    // Get payments
    const payments = await db.query(`
      SELECT * FROM payments WHERE loan_id = $1 ORDER BY created_at DESC
    `, [req.params.id]);

    res.json({
      loan: result.rows[0],
      statusHistory: history.rows,
      needsList: needsList.rows,
      documents: documents.rows,
      payments: payments.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create new loan request (for existing users - duplicates personal info)
router.post('/', authenticate, [
  body('propertyAddress').trim().notEmpty(),
  body('propertyCity').trim().notEmpty(),
  body('propertyState').trim().notEmpty(),
  body('propertyZip').trim().isLength({ min: 5 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyAddress, propertyCity, propertyState, propertyZip, propertyName } = req.body;

    // Generate loan number
    const loanCount = await db.query('SELECT COUNT(*) FROM loan_requests');
    const loanNumber = `RPC-${new Date().getFullYear()}-${String(parseInt(loanCount.rows[0].count) + 1).padStart(4, '0')}`;

    const result = await db.query(`
      INSERT INTO loan_requests (
        user_id, loan_number, property_address, property_city, property_state, property_zip, property_name,
        status, current_step
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'new_request', 1)
      RETURNING *
    `, [req.user.id, loanNumber, propertyAddress, propertyCity, propertyState, propertyZip, propertyName || null]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'new_request', 1, $2, 'New loan request created')
    `, [result.rows[0].id, req.user.id]);

    // Create document folders automatically
    await createDocumentFoldersForLoan(result.rows[0].id);

    await logAudit(req.user.id, 'LOAN_CREATED', 'loan', result.rows[0].id, req);

    res.status(201).json({ loan: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update loan request (Step 2-3 - Property & Loan Details)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    // Verify ownership
    const check = await db.query('SELECT id, status FROM loan_requests WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const {
      propertyType, residentialUnits, isPortfolio, portfolioCount, commercialType,
      requestType, transactionType, borrowerType, propertyValue, requestedLtv, documentationType,
      annualRentalIncome, annualOperatingExpenses, annualLoanPayments,
      propertyAddress, propertyCity, propertyState, propertyZip, propertyName
    } = req.body;

    // Calculate loan amount
    const loanAmount = propertyValue && requestedLtv ? (propertyValue * requestedLtv / 100) : null;

    // Calculate DSCR if income data provided
    let dscrRatio = null;
    let noi = null;
    if (annualRentalIncome && annualOperatingExpenses !== undefined && annualLoanPayments) {
      noi = annualRentalIncome - annualOperatingExpenses;
      dscrRatio = calculateDSCR(annualRentalIncome, annualOperatingExpenses, annualLoanPayments);
    }

    const result = await db.query(`
      UPDATE loan_requests SET
        property_address = COALESCE($1, property_address),
        property_city = COALESCE($2, property_city),
        property_state = COALESCE($3, property_state),
        property_zip = COALESCE($4, property_zip),
        property_name = COALESCE($5, property_name),
        property_type = COALESCE($6, property_type),
        residential_units = COALESCE($7, residential_units),
        is_portfolio = COALESCE($8, is_portfolio),
        portfolio_count = COALESCE($9, portfolio_count),
        commercial_type = COALESCE($10, commercial_type),
        request_type = COALESCE($11, request_type),
        transaction_type = COALESCE($12, transaction_type),
        borrower_type = COALESCE($13, borrower_type),
        property_value = COALESCE($14, property_value),
        requested_ltv = COALESCE($15, requested_ltv),
        loan_amount = COALESCE($16, loan_amount),
        documentation_type = COALESCE($17, documentation_type),
        annual_rental_income = COALESCE($18, annual_rental_income),
        annual_operating_expenses = COALESCE($19, annual_operating_expenses),
        noi = COALESCE($20, noi),
        annual_loan_payments = COALESCE($21, annual_loan_payments),
        dscr_ratio = COALESCE($22, dscr_ratio),
        current_step = GREATEST(current_step, 2),
        updated_at = NOW()
      WHERE id = $23
      RETURNING *
    `, [
      propertyAddress, propertyCity, propertyState, propertyZip, propertyName,
      propertyType, residentialUnits, isPortfolio, portfolioCount, commercialType,
      requestType, transactionType, borrowerType, propertyValue, requestedLtv, loanAmount, documentationType,
      annualRentalIncome, annualOperatingExpenses, noi, annualLoanPayments, dscrRatio,
      req.params.id
    ]);

    await logAudit(req.user.id, 'LOAN_UPDATED', 'loan', req.params.id, req);

    res.json({ loan: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Submit loan request for quote
router.post('/:id/submit', authenticate, async (req, res, next) => {
  try {
    const check = await db.query('SELECT * FROM loan_requests WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = check.rows[0];

    // Validate required fields
    if (!loan.property_type || !loan.request_type || !loan.property_value) {
      return res.status(400).json({ error: 'Please complete all required loan details' });
    }

    await db.query(`
      UPDATE loan_requests SET status = 'quote_requested', current_step = 3, updated_at = NOW()
      WHERE id = $1
    `, [req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'quote_requested', 3, $2, 'Loan request submitted for quote')
    `, [req.params.id, req.user.id]);

    await logAudit(req.user.id, 'LOAN_SUBMITTED', 'loan', req.params.id, req);

    res.json({ message: 'Loan request submitted successfully' });
  } catch (error) {
    next(error);
  }
});

// Credit authorization (Step 4)
router.post('/:id/credit-auth', authenticate, [
  body('consent').custom((value) => {
    if (value !== true && value !== 'true') {
      throw new Error('Consent must be provided');
    }
    return true;
  })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const check = await db.query('SELECT id FROM loan_requests WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const clientIp = req.ip || req.connection?.remoteAddress;

    await db.query(`
      UPDATE loan_requests SET
        credit_authorized = true,
        credit_auth_timestamp = NOW(),
        credit_auth_ip = $1,
        credit_status = 'authorized',
        current_step = GREATEST(current_step, 4),
        updated_at = NOW()
      WHERE id = $2
    `, [clientIp, req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'credit_authorized', 4, $2, 'Credit authorization consent provided')
    `, [req.params.id, req.user.id]);

    await logAudit(req.user.id, 'CREDIT_AUTHORIZED', 'loan', req.params.id, req, { ip: clientIp });

    res.json({ message: 'Credit authorization recorded' });
  } catch (error) {
    next(error);
  }
});

// Generate soft quote (Step 5)
router.post('/:id/soft-quote', authenticate, async (req, res, next) => {
  try {
    const check = await db.query('SELECT * FROM loan_requests WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = check.rows[0];

    if (!loan.credit_authorized) {
      return res.status(400).json({ error: 'Credit authorization required first' });
    }

    // Get user's credit score if available
    const profile = await db.query('SELECT credit_score, fico_score FROM crm_profiles WHERE user_id = $1', [req.user.id]);
    const creditScore = profile.rows[0]?.fico_score || profile.rows[0]?.credit_score || null;

    // Generate soft quote with DSCR validation
    const quoteData = generateSoftQuote(loan, creditScore);

    // Check for auto-decline
    if (!quoteData.approved) {
      await db.query(`
        UPDATE loan_requests SET
          dscr_auto_declined = true,
          soft_quote_data = $1,
          updated_at = NOW()
        WHERE id = $2
      `, [JSON.stringify(quoteData), req.params.id]);

      return res.status(400).json({
        error: 'Loan request declined',
        reason: quoteData.declineReason,
        quote: quoteData
      });
    }

    // Generate term sheet PDF
    const termSheetPath = await generateTermSheet(loan, quoteData);

    await db.query(`
      UPDATE loan_requests SET
        soft_quote_generated = true,
        soft_quote_data = $1,
        soft_quote_rate_min = $2,
        soft_quote_rate_max = $3,
        term_sheet_url = $4,
        status = 'soft_quote_issued',
        current_step = GREATEST(current_step, 5),
        updated_at = NOW()
      WHERE id = $5
    `, [JSON.stringify(quoteData), quoteData.interestRateMin, quoteData.interestRateMax, termSheetPath, req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'soft_quote_issued', 5, $2, $3)
    `, [req.params.id, req.user.id, `Soft quote generated: ${quoteData.rateRange}`]);

    // Generate initial needs list
    await generateInitialNeedsListForLoan(req.params.id, loan);

    // Send email notification
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    await sendSoftQuoteEmail(user.rows[0], { ...loan, term_sheet_url: termSheetPath }, quoteData);

    res.json({ 
      message: 'Soft quote generated',
      quote: quoteData,
      termSheetUrl: termSheetPath
    });
  } catch (error) {
    next(error);
  }
});

// Sign term sheet
router.post('/:id/sign-term-sheet', authenticate, async (req, res, next) => {
  try {
    const check = await db.query('SELECT id, soft_quote_generated FROM loan_requests WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (!check.rows[0].soft_quote_generated) {
      return res.status(400).json({ error: 'Soft quote must be generated first' });
    }

    await db.query(`
      UPDATE loan_requests SET
        term_sheet_signed = true,
        term_sheet_signed_at = NOW(),
        status = 'term_sheet_signed',
        updated_at = NOW()
      WHERE id = $1
    `, [req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'term_sheet_signed', 5, $2, 'Term sheet signed by borrower')
    `, [req.params.id, req.user.id]);

    // Send needs list email
    const loan = await db.query('SELECT * FROM loan_requests WHERE id = $1', [req.params.id]);
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const needsList = await db.query('SELECT * FROM needs_list_items WHERE loan_id = $1', [req.params.id]);
    
    await sendNeedsListEmail(user.rows[0], loan.rows[0], needsList.rows);

    // Update status to needs list sent
    await db.query(`
      UPDATE loan_requests SET status = 'needs_list_sent' WHERE id = $1
    `, [req.params.id]);

    res.json({ message: 'Term sheet signed successfully' });
  } catch (error) {
    next(error);
  }
});

// Submit full application (Step 7)
router.post('/:id/full-application', authenticate, async (req, res, next) => {
  try {
    const check = await db.query('SELECT id FROM loan_requests WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const { applicationData } = req.body;

    await db.query(`
      UPDATE loan_requests SET
        full_application_data = $1,
        full_application_completed = true,
        current_step = GREATEST(current_step, 7),
        updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(applicationData), req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'full_application_submitted', 7, $2, 'Full loan application submitted')
    `, [req.params.id, req.user.id]);

    res.json({ message: 'Full application submitted' });
  } catch (error) {
    next(error);
  }
});

// Helper: Create document folders for a loan
async function createDocumentFoldersForLoan(loanId) {
  const folders = [
    { name: 'Application', description: 'Loan application documents' },
    { name: 'Entity Documents', description: 'LLC/Corp documents, Operating Agreement, Articles of Organization' },
    { name: 'Property Insurance', description: 'Property insurance documents' },
    { name: 'Personal Financial Statement', description: 'Personal financial statements and supporting documents' },
    { name: 'Property Financial Statements', description: 'Property income statements, tax returns, and financial records' },
    { name: 'Rent Roll & Leases', description: 'Rent roll and lease agreements' }
  ];

  // Create a placeholder needs_list_item for each folder to make it appear in the UI
  for (const folder of folders) {
    await db.query(`
      INSERT INTO needs_list_items (loan_id, document_type, folder_name, description, status, required)
      VALUES ($1, $2, $3, $4, 'pending', false)
      ON CONFLICT DO NOTHING
    `, [loanId, `Folder: ${folder.name}`, folder.name, folder.description]);
  }
}

// Helper: Generate initial needs list for loan
async function generateInitialNeedsListForLoan(loanId, loan) {
  const items = getInitialNeedsList(loan);

  for (const item of items) {
    await db.query(`
      INSERT INTO needs_list_items (loan_id, document_type, folder_name, description, status, required)
      VALUES ($1, $2, $3, $4, 'pending', $5)
      ON CONFLICT DO NOTHING
    `, [loanId, item.type, item.folder, item.description, item.required]);
  }
}

module.exports = router;

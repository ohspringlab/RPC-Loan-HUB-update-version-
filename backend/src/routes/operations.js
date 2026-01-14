const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/config');
const { authenticate, requireOps } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');
const { notifyOpsDocumentUpload } = require('../services/emailService');

const router = express.Router();

// All routes require operations role
router.use(authenticate, requireOps);

// Status options for dropdown
const STATUS_OPTIONS = [
  { value: 'new_request', label: 'New Request', step: 1 },
  { value: 'quote_requested', label: 'Quote Requested', step: 2 },
  { value: 'soft_quote_issued', label: 'Soft Quote Issued', step: 3 },
  { value: 'term_sheet_issued', label: 'Term Sheet Issued', step: 4 },
  { value: 'term_sheet_signed', label: 'Term Sheet Signed', step: 5 },
  { value: 'needs_list_sent', label: 'Needs List Sent', step: 6 },
  { value: 'needs_list_complete', label: 'Needs List Complete', step: 7 },
  { value: 'submitted_to_underwriting', label: 'Submitted to Underwriting', step: 8 },
  { value: 'appraisal_ordered', label: 'Appraisal Ordered', step: 9 },
  { value: 'appraisal_received', label: 'Appraisal Received', step: 10 },
  { value: 'conditionally_approved', label: 'Conditionally Approved', step: 11 },
  { value: 'conditional_items_needed', label: 'Conditional Items Needed', step: 11 },
  { value: 'conditional_commitment_issued', label: 'Conditional Commitment Issued', step: 12 },
  { value: 'clear_to_close', label: 'Clear to Close', step: 13 },
  { value: 'closing_scheduled', label: 'Closing Scheduled', step: 14 },
  { value: 'funded', label: 'Funded', step: 15 }
];

// Get status options
router.get('/status-options', (req, res) => {
  res.json({ statuses: STATUS_OPTIONS });
});

// Get pipeline overview
router.get('/pipeline', async (req, res, next) => {
  try {
    const { status, search, processor, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lr.*, 
             u.full_name as borrower_name, 
             u.email as borrower_email, 
             u.phone as borrower_phone,
             p.full_name as processor_name,
             (SELECT COUNT(*) FROM documents d WHERE d.loan_id = lr.id) as document_count,
             (SELECT COUNT(*) FROM needs_list_items nli WHERE nli.loan_id = lr.id AND nli.status = 'pending') as pending_docs,
             (SELECT MAX(uploaded_at) FROM documents d WHERE d.loan_id = lr.id) as last_upload,
             EXTRACT(DAY FROM NOW() - lr.updated_at) as days_in_status
      FROM loan_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN users p ON lr.assigned_processor_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND lr.status = $${params.length}`;
    }

    if (processor) {
      params.push(processor);
      query += ` AND lr.assigned_processor_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (lr.loan_number ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR lr.property_address ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    query += ` ORDER BY lr.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM loan_requests lr JOIN users u ON lr.user_id = u.id WHERE 1=1';
    const countParams = [];
    if (status && status !== 'all') {
      countParams.push(status);
      countQuery += ` AND lr.status = $${countParams.length}`;
    }
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (lr.loan_number ILIKE $${countParams.length} OR u.full_name ILIKE $${countParams.length})`;
    }
    const countResult = await db.query(countQuery, countParams);

    res.json({
      loans: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get pipeline stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(loan_amount) as total_amount
      FROM loan_requests
      GROUP BY status
    `);

    const totalLoans = await db.query('SELECT COUNT(*) FROM loan_requests');
    const totalFunded = await db.query(`
      SELECT COUNT(*), SUM(funded_amount) as amount 
      FROM loan_requests WHERE status = 'funded'
    `);

    // Get loans needing attention (stale > 3 days)
    const staleLoans = await db.query(`
      SELECT COUNT(*) FROM loan_requests 
      WHERE status NOT IN ('funded', 'clear_to_close', 'closing_scheduled')
      AND updated_at < NOW() - INTERVAL '3 days'
    `);

    // Recent uploads (last 24 hours)
    const recentUploads = await db.query(`
      SELECT COUNT(*) FROM documents WHERE uploaded_at > NOW() - INTERVAL '24 hours'
    `);

    // This month's volume
    const monthlyVolume = await db.query(`
      SELECT COUNT(*), SUM(funded_amount) as amount 
      FROM loan_requests 
      WHERE status = 'funded' 
      AND funded_date >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    res.json({
      byStatus: stats.rows,
      totalLoans: parseInt(totalLoans.rows[0].count),
      fundedLoans: parseInt(totalFunded.rows[0].count || 0),
      fundedAmount: parseFloat(totalFunded.rows[0].amount || 0),
      staleLoans: parseInt(staleLoans.rows[0].count),
      recentUploads: parseInt(recentUploads.rows[0].count),
      monthlyFunded: parseInt(monthlyVolume.rows[0].count || 0),
      monthlyVolume: parseFloat(monthlyVolume.rows[0].amount || 0)
    });
  } catch (error) {
    next(error);
  }
});

// Get single loan (ops view) - can access borrower portal view
router.get('/loan/:id', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT lr.*, 
             u.id as borrower_id, u.full_name as borrower_name, u.email as borrower_email, u.phone as borrower_phone,
             cp.address_line1, cp.address_line2, cp.city as borrower_city, cp.state as borrower_state, 
             cp.zip_code as borrower_zip, cp.credit_score, cp.fico_score, cp.annual_income,
             p.full_name as processor_name
      FROM loan_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN crm_profiles cp ON u.id = cp.user_id
      LEFT JOIN users p ON lr.assigned_processor_id = p.id
      WHERE lr.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const history = await db.query(`
      SELECT lsh.*, u.full_name as changed_by_name
      FROM loan_status_history lsh
      LEFT JOIN users u ON lsh.changed_by = u.id
      WHERE lsh.loan_id = $1
      ORDER BY lsh.created_at DESC
    `, [req.params.id]);

    // Get needs list with folder colors
    const needsList = await db.query(`
      SELECT nli.*, 
             (SELECT COUNT(*) FROM documents d WHERE d.needs_list_item_id = nli.id) as document_count,
             (SELECT MAX(uploaded_at) FROM documents d WHERE d.needs_list_item_id = nli.id) as last_upload
      FROM needs_list_items nli
      WHERE nli.loan_id = $1
      ORDER BY nli.folder_name, nli.created_at
    `, [req.params.id]);

    // Add folder color status
    const needsListWithColors = needsList.rows.map(item => {
      let folderColor = 'tan'; // No documents
      if (item.document_count > 0) {
        folderColor = 'blue'; // Has documents
        if (item.last_upload && new Date(item.last_upload) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          folderColor = 'red'; // New upload in last 24 hours
        }
      }
      return { ...item, folder_color: folderColor };
    });

    const documents = await db.query(`
      SELECT d.*, u.full_name as uploaded_by_name
      FROM documents d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.loan_id = $1 
      ORDER BY d.folder_name, d.uploaded_at DESC
    `, [req.params.id]);

    const payments = await db.query(`
      SELECT * FROM payments WHERE loan_id = $1 ORDER BY created_at DESC
    `, [req.params.id]);

    res.json({
      loan: result.rows[0],
      statusHistory: history.rows,
      needsList: needsListWithColors,
      documents: documents.rows,
      payments: payments.rows,
      statusOptions: STATUS_OPTIONS
    });
  } catch (error) {
    next(error);
  }
});

// Update loan status (main ops action)
router.put('/loan/:id/status', [
  body('status').notEmpty(),
  body('notes').optional()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;

    // Find the step for this status
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    const step = statusOption?.step || null;

    await db.query(`
      UPDATE loan_requests SET status = $1, current_step = COALESCE($2, current_step), updated_at = NOW()
      WHERE id = $3
    `, [status, step, req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.params.id, status, step, req.user.id, notes]);

    // Create notification for borrower
    const loan = await db.query('SELECT user_id, loan_number FROM loan_requests WHERE id = $1', [req.params.id]);
    const statusLabel = statusOption?.label || status;
    
    await db.query(`
      INSERT INTO notifications (user_id, loan_id, type, title, message)
      VALUES ($1, $2, 'status_update', $3, $4)
    `, [loan.rows[0].user_id, req.params.id, 'Loan Status Updated', `Your loan ${loan.rows[0].loan_number} status: ${statusLabel}`]);

    await logAudit(req.user.id, 'LOAN_STATUS_UPDATED', 'loan', req.params.id, req, { status, notes });

    res.json({ message: 'Status updated', newStatus: status, step });
  } catch (error) {
    next(error);
  }
});

// Assign processor
router.put('/loan/:id/assign', [
  body('processorId').notEmpty()
], async (req, res, next) => {
  try {
    const { processorId } = req.body;

    await db.query(`
      UPDATE loan_requests SET assigned_processor_id = $1, updated_at = NOW()
      WHERE id = $2
    `, [processorId, req.params.id]);

    await logAudit(req.user.id, 'PROCESSOR_ASSIGNED', 'loan', req.params.id, req, { processorId });

    res.json({ message: 'Processor assigned' });
  } catch (error) {
    next(error);
  }
});

// Add needs list item
router.post('/loan/:id/needs-list', [
  body('documentType').notEmpty(),
  body('folderName').notEmpty(),
  body('description').optional()
], async (req, res, next) => {
  try {
    const { documentType, folderName, description, required = true } = req.body;

    const result = await db.query(`
      INSERT INTO needs_list_items (loan_id, document_type, folder_name, description, required, requested_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.params.id, documentType, folderName, description, required, req.user.id]);

    // Notify borrower
    const loan = await db.query('SELECT user_id, loan_number FROM loan_requests WHERE id = $1', [req.params.id]);
    await db.query(`
      INSERT INTO notifications (user_id, loan_id, type, title, message)
      VALUES ($1, $2, 'document_request', $3, $4)
    `, [loan.rows[0].user_id, req.params.id, 'Document Requested', `New document requested for loan ${loan.rows[0].loan_number}: ${documentType}`]);

    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Review document / needs list item
router.put('/needs-list/:id/review', [
  body('status').isIn(['reviewed', 'rejected']),
  body('notes').optional()
], async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    await db.query(`
      UPDATE needs_list_items SET 
        status = $1, 
        reviewed_by = $2, 
        review_notes = $3,
        updated_at = NOW()
      WHERE id = $4
    `, [status, req.user.id, notes, req.params.id]);

    res.json({ message: 'Document reviewed' });
  } catch (error) {
    next(error);
  }
});

// Upload commitment letter
router.post('/loan/:id/commitment', [
  body('commitmentLetterUrl').notEmpty()
], async (req, res, next) => {
  try {
    const { commitmentLetterUrl, conditionalItems } = req.body;

    await db.query(`
      UPDATE loan_requests SET 
        commitment_letter_url = $1,
        conditional_items_needed = $2,
        status = 'conditional_commitment_issued',
        current_step = 12,
        updated_at = NOW()
      WHERE id = $3
    `, [commitmentLetterUrl, conditionalItems, req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'conditional_commitment_issued', 12, $2, 'Conditional commitment letter issued')
    `, [req.params.id, req.user.id]);

    // Notify borrower
    const loan = await db.query('SELECT user_id, loan_number FROM loan_requests WHERE id = $1', [req.params.id]);
    await db.query(`
      INSERT INTO notifications (user_id, loan_id, type, title, message)
      VALUES ($1, $2, 'commitment', $3, $4)
    `, [loan.rows[0].user_id, req.params.id, 'Commitment Letter Ready', `Your commitment letter for loan ${loan.rows[0].loan_number} is ready for download.`]);

    res.json({ message: 'Commitment letter uploaded' });
  } catch (error) {
    next(error);
  }
});

// Schedule closing
router.post('/loan/:id/schedule-closing', [
  body('closingDate').isISO8601()
], async (req, res, next) => {
  try {
    const { closingDate } = req.body;

    await db.query(`
      UPDATE loan_requests SET 
        closing_scheduled_date = $1,
        status = 'closing_scheduled',
        current_step = 14,
        updated_at = NOW()
      WHERE id = $2
    `, [closingDate, req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'closing_scheduled', 14, $2, $3)
    `, [req.params.id, req.user.id, `Closing scheduled for ${closingDate}`]);

    // Notify borrower
    const loan = await db.query('SELECT user_id, loan_number FROM loan_requests WHERE id = $1', [req.params.id]);
    await db.query(`
      INSERT INTO notifications (user_id, loan_id, type, title, message)
      VALUES ($1, $2, 'closing', $3, $4)
    `, [loan.rows[0].user_id, req.params.id, 'Closing Scheduled', `Your closing for loan ${loan.rows[0].loan_number} is scheduled for ${new Date(closingDate).toLocaleDateString()}.`]);

    res.json({ message: 'Closing scheduled' });
  } catch (error) {
    next(error);
  }
});

// Mark loan as funded
router.post('/loan/:id/fund', [
  body('fundedAmount').isNumeric()
], async (req, res, next) => {
  try {
    const { fundedAmount } = req.body;

    await db.query(`
      UPDATE loan_requests SET 
        funded_date = NOW(),
        funded_amount = $1,
        status = 'funded',
        current_step = 15,
        updated_at = NOW()
      WHERE id = $2
    `, [fundedAmount, req.params.id]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'funded', 15, $2, $3)
    `, [req.params.id, req.user.id, `Loan funded: $${fundedAmount.toLocaleString()}`]);

    await logAudit(req.user.id, 'LOAN_FUNDED', 'loan', req.params.id, req, { fundedAmount });

    // Notify borrower
    const loan = await db.query('SELECT user_id, loan_number FROM loan_requests WHERE id = $1', [req.params.id]);
    await db.query(`
      INSERT INTO notifications (user_id, loan_id, type, title, message)
      VALUES ($1, $2, 'funded', $3, $4)
    `, [loan.rows[0].user_id, req.params.id, 'Congratulations! Loan Funded', `Your loan ${loan.rows[0].loan_number} has been funded!`]);

    res.json({ message: 'Loan marked as funded' });
  } catch (error) {
    next(error);
  }
});

// CRM search
router.get('/crm/search', async (req, res, next) => {
  try {
    const { q } = req.query;

    const result = await db.query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.created_at,
             cp.city, cp.state, cp.credit_score, cp.fico_score,
             (SELECT COUNT(*) FROM loan_requests lr WHERE lr.user_id = u.id) as loan_count,
             (SELECT SUM(loan_amount) FROM loan_requests lr WHERE lr.user_id = u.id) as total_volume
      FROM users u
      LEFT JOIN crm_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'borrower'
        AND (u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)
      ORDER BY u.created_at DESC
      LIMIT 50
    `, [`%${q}%`]);

    res.json({ borrowers: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get borrower profile with loan history
router.get('/crm/borrower/:id', async (req, res, next) => {
  try {
    const user = await db.query(`
      SELECT u.*, cp.*
      FROM users u
      LEFT JOIN crm_profiles cp ON u.id = cp.user_id
      WHERE u.id = $1
    `, [req.params.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    const loans = await db.query(`
      SELECT * FROM loan_requests WHERE user_id = $1 ORDER BY created_at DESC
    `, [req.params.id]);

    res.json({
      borrower: user.rows[0],
      loans: loans.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get processors list
router.get('/processors', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT id, full_name, email 
      FROM users 
      WHERE role IN ('operations', 'admin') AND is_active = true
      ORDER BY full_name
    `);
    res.json({ processors: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get closing checklist for a loan
router.get('/loan/:id/closing-checklist', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT cci.*, 
             u1.full_name as created_by_name,
             u2.full_name as completed_by_name
      FROM closing_checklist_items cci
      LEFT JOIN users u1 ON cci.created_by = u1.id
      LEFT JOIN users u2 ON cci.completed_by = u2.id
      WHERE cci.loan_id = $1
      ORDER BY cci.category, cci.created_at
    `, [req.params.id]);

    res.json({ checklist: result.rows });
  } catch (error) {
    next(error);
  }
});

// Add closing checklist item (operations only)
router.post('/loan/:id/closing-checklist', [
  body('itemName').trim().notEmpty(),
  body('category').optional(),
  body('required').optional().isBoolean(),
  body('description').optional()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemName, description, category, required } = req.body;
    const checklistId = require('uuid').v4();

    const result = await db.query(`
      INSERT INTO closing_checklist_items (
        id, loan_id, item_name, description, category, required, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [checklistId, req.params.id, itemName, description || null, category || 'general', required !== false, req.user.id]);

    await logAudit(req.user.id, 'CLOSING_CHECKLIST_ITEM_ADDED', 'loan', req.params.id, req, {
      itemName,
      category
    });

    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update closing checklist item
router.put('/loan/:id/closing-checklist/:itemId', [
  body('completed').optional().isBoolean(),
  body('notes').optional()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { completed, notes } = req.body;

    let updateQuery = `
      UPDATE closing_checklist_items SET
        updated_at = NOW()
    `;
    const params = [];
    let paramIndex = 1;

    if (completed !== undefined) {
      updateQuery += `, completed = $${paramIndex++}`;
      params.push(completed);
      
      if (completed) {
        updateQuery += `, completed_by = $${paramIndex++}, completed_at = NOW()`;
        params.push(req.user.id);
      } else {
        updateQuery += `, completed_by = NULL, completed_at = NULL`;
      }
    }

    if (notes !== undefined) {
      updateQuery += `, notes = $${paramIndex++}`;
      params.push(notes);
    }

    updateQuery += ` WHERE id = $${paramIndex++} AND loan_id = $${paramIndex++}`;
    params.push(req.params.itemId, req.params.id);

    const result = await db.query(updateQuery, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    await logAudit(req.user.id, 'CLOSING_CHECKLIST_ITEM_UPDATED', 'loan', req.params.id, req, {
      itemId: req.params.itemId,
      completed
    });

    res.json({ message: 'Checklist item updated' });
  } catch (error) {
    next(error);
  }
});

// Delete closing checklist item (operations only)
router.delete('/loan/:id/closing-checklist/:itemId', async (req, res, next) => {
  try {
    const result = await db.query(`
      DELETE FROM closing_checklist_items
      WHERE id = $1 AND loan_id = $2
    `, [req.params.itemId, req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    await logAudit(req.user.id, 'CLOSING_CHECKLIST_ITEM_DELETED', 'loan', req.params.id, req, {
      itemId: req.params.itemId
    });

    res.json({ message: 'Checklist item deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

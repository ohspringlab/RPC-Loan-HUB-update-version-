const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../db/config');
const { generateToken, authenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');
const { sendWelcomeEmail } = require('../services/emailService');

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

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').trim().isLength({ min: 2 }),
  body('phone').trim().isLength({ min: 10 }),
  body('propertyAddress').trim().notEmpty(),
  body('propertyCity').trim().notEmpty(),
  body('propertyState').trim().notEmpty(),
  body('propertyZip').trim().isLength({ min: 5 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Register new borrower (with initial loan request)
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      email, password, fullName, phone,
      propertyAddress, propertyCity, propertyState, propertyZip, propertyName 
    } = req.body;

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await db.query(`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES ($1, $2, $3, $4, 'borrower')
      RETURNING id, email, full_name, phone, role
    `, [email, passwordHash, fullName, phone]);

    const user = userResult.rows[0];

    // Create CRM profile
    await db.query(`
      INSERT INTO crm_profiles (user_id)
      VALUES ($1)
    `, [user.id]);

    // Generate loan number
    const loanCount = await db.query('SELECT COUNT(*) FROM loan_requests');
    const loanNumber = `RPC-${new Date().getFullYear()}-${String(parseInt(loanCount.rows[0].count) + 1).padStart(4, '0')}`;

    // Create initial loan request (Step 1)
    const loanResult = await db.query(`
      INSERT INTO loan_requests (
        user_id, loan_number, property_address, property_city, property_state, property_zip, property_name,
        status, current_step
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'new_request', 1)
      RETURNING id, loan_number
    `, [user.id, loanNumber, propertyAddress, propertyCity, propertyState, propertyZip, propertyName || null]);

    const loan = loanResult.rows[0];

    // Log initial status
    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'new_request', 1, $2, 'Loan request initiated during registration')
    `, [loan.id, user.id]);

    // Create document folders automatically
    await createDocumentFoldersForLoan(loan.id);

    // Audit log (non-blocking - don't fail registration if audit fails)
    logAudit(user.id, 'USER_REGISTERED', 'user', user.id, req).catch(error => {
      console.error('Failed to log audit:', error);
    });

    // Send welcome email via HubSpot (non-blocking - don't fail registration if email fails)
    sendWelcomeEmail(
      { id: user.id, full_name: fullName, email },
      { id: loan.id, loan_number: loanNumber, property_address: propertyAddress, property_city: propertyCity, property_state: propertyState, property_zip: propertyZip }
    ).catch(error => {
      console.error('Failed to send welcome email:', error);
      // Don't throw - email failure shouldn't break registration
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role
      },
      loan: {
        id: loan.id,
        loanNumber: loan.loan_number
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await db.query(`
      SELECT id, email, password_hash, full_name, phone, role, is_active
      FROM users WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await logAudit(user.id, 'USER_LOGIN', 'user', user.id, req);

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  // Get additional profile data
  const profile = await db.query(`
    SELECT cp.* FROM crm_profiles cp WHERE cp.user_id = $1
  `, [req.user.id]);

  // Get loan count
  const loanCount = await db.query(`
    SELECT COUNT(*) FROM loan_requests WHERE user_id = $1
  `, [req.user.id]);

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.full_name,
      phone: req.user.phone,
      role: req.user.role
    },
    profile: profile.rows[0] || null,
    loanCount: parseInt(loanCount.rows[0].count)
  });
});

// Change password
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const validPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    await logAudit(req.user.id, 'PASSWORD_CHANGED', 'user', req.user.id, req);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

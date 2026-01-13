const express = require('express');
const db = require('../db/config');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// Initialize Stripe (mock for development)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// Get payment status for a loan
router.get('/loan/:loanId', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT * FROM payments WHERE loan_id = $1 ORDER BY created_at DESC
    `, [req.params.loanId]);

    res.json({ payments: result.rows });
  } catch (error) {
    next(error);
  }
});

// Create appraisal payment intent (Step 8)
router.post('/appraisal-intent', authenticate, async (req, res, next) => {
  try {
    const { loanId } = req.body;

    // Verify loan ownership
    const loanCheck = await db.query(
      'SELECT * FROM loan_requests WHERE id = $1 AND user_id = $2',
      [loanId, req.user.id]
    );

    if (loanCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = loanCheck.rows[0];

    if (loan.appraisal_paid) {
      return res.status(400).json({ error: 'Appraisal already paid' });
    }

    // Appraisal fee (could be dynamic based on property type)
    const appraisalAmount = loan.property_type === 'commercial' ? 75000 : 50000; // in cents (750.00 or 500.00)

    if (stripe) {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: appraisalAmount,
        currency: 'usd',
        metadata: {
          loanId,
          paymentType: 'appraisal',
          loanNumber: loan.loan_number
        }
      });

      // Record pending payment
      await db.query(`
        INSERT INTO payments (loan_id, user_id, payment_type, amount, stripe_payment_intent, status)
        VALUES ($1, $2, 'appraisal', $3, $4, 'pending')
      `, [loanId, req.user.id, appraisalAmount / 100, paymentIntent.id]);

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: appraisalAmount / 100
      });
    } else {
      // Mock payment for development
      const mockIntentId = `pi_mock_${Date.now()}`;
      
      await db.query(`
        INSERT INTO payments (loan_id, user_id, payment_type, amount, stripe_payment_intent, status)
        VALUES ($1, $2, 'appraisal', $3, $4, 'pending')
      `, [loanId, req.user.id, appraisalAmount / 100, mockIntentId]);

      res.json({
        clientSecret: `mock_secret_${mockIntentId}`,
        amount: appraisalAmount / 100,
        mockMode: true
      });
    }
  } catch (error) {
    next(error);
  }
});

// Confirm payment (for mock/development)
router.post('/confirm', authenticate, async (req, res, next) => {
  try {
    const { loanId, paymentIntentId } = req.body;

    // Update payment status
    await db.query(`
      UPDATE payments SET status = 'completed', paid_at = NOW()
      WHERE loan_id = $1 AND stripe_payment_intent = $2
    `, [loanId, paymentIntentId]);

    // Update loan
    await db.query(`
      UPDATE loan_requests SET
        appraisal_paid = true,
        appraisal_payment_id = $1,
        current_step = GREATEST(current_step, 8),
        updated_at = NOW()
      WHERE id = $2
    `, [paymentIntentId, loanId]);

    await db.query(`
      INSERT INTO loan_status_history (loan_id, status, step, changed_by, notes)
      VALUES ($1, 'appraisal_paid', 8, $2, 'Appraisal payment completed')
    `, [loanId, req.user.id]);

    await logAudit(req.user.id, 'PAYMENT_COMPLETED', 'payment', loanId, req, {
      paymentType: 'appraisal',
      paymentIntentId
    });

    res.json({ message: 'Payment confirmed' });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(400).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { loanId } = paymentIntent.metadata;

    await db.query(`
      UPDATE payments SET status = 'completed', paid_at = NOW()
      WHERE stripe_payment_intent = $1
    `, [paymentIntent.id]);

    await db.query(`
      UPDATE loan_requests SET
        appraisal_paid = true,
        appraisal_payment_id = $1,
        current_step = GREATEST(current_step, 8),
        updated_at = NOW()
      WHERE id = $2
    `, [paymentIntent.id, loanId]);
  }

  res.json({ received: true });
});

module.exports = router;

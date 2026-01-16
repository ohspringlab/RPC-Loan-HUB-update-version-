// Clerk webhook and integration routes
const express = require('express');
const db = require('../db/config');

// Svix webhook verification (install: npm install svix)
let Webhook;
try {
  Webhook = require('svix').Webhook;
} catch (e) {
  console.warn('svix package not installed. Webhook verification will be disabled.');
  Webhook = null;
}

const router = express.Router();

// Clerk webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Get the Svix headers for verification
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Create a new Svix instance with your secret
  if (!Webhook) {
    console.error('svix package not installed. Install with: npm install svix');
    return res.status(500).json({ error: 'Webhook verification not available' });
  }
  
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    // Verify the webhook
    evt = wh.verify(req.body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
        // Create user in database
        const email = email_addresses?.[0]?.email_address;
        const emailVerified = email_addresses?.[0]?.verification?.status === 'verified';
        
        await db.query(
          `INSERT INTO users (id, email, full_name, phone, role, email_verified, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             email = EXCLUDED.email,
             email_verified = EXCLUDED.email_verified,
             updated_at = NOW()`,
          [
            id,
            email,
            first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || 'User',
            phone_numbers?.[0]?.phone_number || '',
            'borrower',
            emailVerified,
            true
          ]
        );
        console.log(`[Clerk Webhook] User created: ${email}`);
        break;

      case 'user.updated':
        // Update user in database
        const updatedEmail = email_addresses?.[0]?.email_address;
        const updatedEmailVerified = email_addresses?.[0]?.verification?.status === 'verified';
        
        await db.query(
          `UPDATE users 
           SET email = $1,
               full_name = COALESCE($2, full_name),
               phone = COALESCE($3, phone),
               email_verified = $4,
               updated_at = NOW()
           WHERE id = $5`,
          [
            updatedEmail,
            first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name,
            phone_numbers?.[0]?.phone_number,
            updatedEmailVerified,
            id
          ]
        );
        console.log(`[Clerk Webhook] User updated: ${updatedEmail}`);
        break;

      case 'user.deleted':
        // Soft delete user (set is_active to false)
        await db.query(
          `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`,
          [id]
        );
        console.log(`[Clerk Webhook] User deleted: ${id}`);
        break;

      case 'email.created':
      case 'email.updated':
        // Update email verification status
        const emailAddr = email_addresses?.[0]?.email_address;
        const isVerified = email_addresses?.[0]?.verification?.status === 'verified';
        
        await db.query(
          `UPDATE users 
           SET email = $1, email_verified = $2, updated_at = NOW()
           WHERE id = $3`,
          [emailAddr, isVerified, id]
        );
        console.log(`[Clerk Webhook] Email ${eventType}: ${emailAddr} (verified: ${isVerified})`);
        break;

      default:
        console.log(`[Clerk Webhook] Unhandled event type: ${eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Clerk Webhook] Error processing event:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

// Get user info from Clerk (for frontend)
router.get('/user-info', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get user from database
    const userResult = await db.query(
      `SELECT id, email, full_name, phone, role, is_active, email_verified
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;


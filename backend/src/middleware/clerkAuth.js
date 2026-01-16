// Clerk authentication middleware for Express
const { createClerkClient } = require('@clerk/backend');
const { getAuth } = require('@clerk/express');

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

// Middleware to verify Clerk session and sync user to database
const requireClerkAuth = async (req, res, next) => {
  try {
    // Get Clerk session from request
    const authResult = getAuth(req);
    const userId = authResult?.userId;
    const sessionId = authResult?.sessionId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    
    if (!clerkUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if email is verified in Clerk
    const emailVerified = clerkUser.emailAddresses?.some(
      email => email.emailAddress === clerkUser.primaryEmailAddress?.emailAddress && email.verification?.status === 'verified'
    ) || false;

    // Sync user to database (create or update)
    const db = require('../db/config');
    const userResult = await db.query(
      `SELECT id, email, full_name, phone, role, is_active, email_verified 
       FROM users 
       WHERE email = $1 OR id = $2`,
      [clerkUser.primaryEmailAddress?.emailAddress, userId]
    );

    let user;
    if (userResult.rows.length > 0) {
      // Update existing user
      user = userResult.rows[0];
      await db.query(
        `UPDATE users 
         SET email = $1, 
             email_verified = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [
          clerkUser.primaryEmailAddress?.emailAddress,
          emailVerified,
          user.id
        ]
      );
    } else {
      // Create new user from Clerk data
      const insertResult = await db.query(
        `INSERT INTO users (id, email, full_name, phone, role, email_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, full_name, phone, role, is_active, email_verified`,
        [
          userId,
          clerkUser.primaryEmailAddress?.emailAddress,
          clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.username || 'User',
          clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
          'borrower', // Default role
          emailVerified,
          true
        ]
      );
      user = insertResult.rows[0];
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      email_verified: emailVerified,
      clerkUserId: userId,
      clerkSessionId: sessionId
    };

    next();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is operations/admin
const requireClerkOps = (req, res, next) => {
  if (!req.user || !['operations', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Operations access required' });
  }
  next();
};

// Middleware to check if user is admin
const requireClerkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  requireClerkAuth,
  requireClerkOps,
  requireClerkAdmin
};


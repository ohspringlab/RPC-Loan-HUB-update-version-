const db = require('../db/config');

const logAudit = async (userId, action, entityType, entityId, req, details = {}) => {
  try {
    await db.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      action,
      entityType,
      entityId,
      req.ip || req.connection?.remoteAddress,
      req.headers['user-agent'],
      JSON.stringify(details)
    ]);
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

module.exports = { logAudit };

// Email service for HubSpot integration
const db = require('../db/config');

// HubSpot API configuration
// In production, install: npm install @hubspot/api-client
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

// Uncomment when HubSpot SDK is installed:
// const hubspot = require('@hubspot/api-client');
// const hubspotClient = HUBSPOT_API_KEY ? new hubspot.Client({ apiKey: HUBSPOT_API_KEY }) : null;

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  NEEDS_LIST: 'needs_list',
  DOCUMENT_UPLOADED: 'document_uploaded',
  STATUS_UPDATE: 'status_update',
  SOFT_QUOTE: 'soft_quote',
  TERM_SHEET: 'term_sheet',
  APPRAISAL_REQUEST: 'appraisal_request',
  COMMITMENT_LETTER: 'commitment_letter',
  CLEAR_TO_CLOSE: 'clear_to_close'
};

// Queue email for sending
const queueEmail = async (userId, loanId, emailType, recipientEmail, subject, templateData) => {
  try {
    await db.query(`
      INSERT INTO email_queue (user_id, loan_id, email_type, recipient_email, subject, template_data, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    `, [userId, loanId, emailType, recipientEmail, subject, JSON.stringify(templateData)]);
    
    return true;
  } catch (error) {
    console.error('Failed to queue email:', error);
    return false;
  }
};

// Send welcome email via HubSpot
const sendWelcomeEmail = async (user, loan) => {
  const templateData = {
    fullName: user.full_name,
    email: user.email,
    loanNumber: loan.loan_number,
    propertyAddress: `${loan.property_address}, ${loan.property_city}, ${loan.property_state} ${loan.property_zip}`,
    portalUrl: `${process.env.FRONTEND_URL}/dashboard`
  };

  await queueEmail(
    user.id,
    loan.id,
    EMAIL_TEMPLATES.WELCOME,
    user.email,
    'Welcome to RPC Lending - Your Loan Request Has Been Received',
    templateData
  );

  // Create/update HubSpot contact
  if (HUBSPOT_API_KEY) {
    // Uncomment when HubSpot SDK is installed:
    /*
    try {
      const properties = {
        email: user.email,
        firstname: user.full_name.split(' ')[0],
        lastname: user.full_name.split(' ').slice(1).join(' ') || '',
        phone: user.phone,
        hs_lead_status: 'NEW',
        loan_number: loan.loan_number,
        property_address: `${loan.property_address}, ${loan.property_city}, ${loan.property_state}`
      };
      
      await hubspotClient.crm.contacts.basicApi.create({ properties });
      console.log(`[HubSpot] Contact created for ${user.email}`);
    } catch (error) {
      console.error('[HubSpot] Failed to create contact:', error);
    }
    */
    console.log(`[HubSpot] Contact sync ready for ${user.email} (SDK integration needed)`);
  } else {
    console.log(`[HubSpot] API key not configured - skipping contact creation`);
  }
};

// Send needs list email with upload link
const sendNeedsListEmail = async (user, loan, needsList) => {
  const templateData = {
    fullName: user.full_name,
    loanNumber: loan.loan_number,
    propertyAddress: `${loan.property_address}, ${loan.property_city}, ${loan.property_state}`,
    needsList: needsList.map(item => ({
      documentType: item.document_type,
      description: item.description,
      required: item.required
    })),
    uploadUrl: `${process.env.FRONTEND_URL}/dashboard/loans/${loan.id}/documents`
  };

  await queueEmail(
    user.id,
    loan.id,
    EMAIL_TEMPLATES.NEEDS_LIST,
    user.email,
    `Document Request for Loan ${loan.loan_number}`,
    templateData
  );
};

// Notify operations team of document upload
const notifyOpsDocumentUpload = async (loan, document, uploaderName) => {
  // Get all operations users
  const opsUsers = await db.query(`
    SELECT email, full_name FROM users WHERE role IN ('operations', 'admin') AND is_active = true
  `);

  for (const opsUser of opsUsers.rows) {
    const templateData = {
      opsName: opsUser.full_name,
      borrowerName: uploaderName,
      loanNumber: loan.loan_number,
      documentName: document.original_name,
      folderName: document.folder_name,
      uploadedAt: new Date().toISOString(),
      viewUrl: `${process.env.FRONTEND_URL}/ops/loans/${loan.id}`
    };

    await queueEmail(
      null,
      loan.id,
      EMAIL_TEMPLATES.DOCUMENT_UPLOADED,
      opsUser.email,
      `New Document Uploaded - ${loan.loan_number}`,
      templateData
    );
  }
};

// Send soft quote email
const sendSoftQuoteEmail = async (user, loan, quote) => {
  const templateData = {
    fullName: user.full_name,
    loanNumber: loan.loan_number,
    propertyAddress: `${loan.property_address}, ${loan.property_city}, ${loan.property_state}`,
    loanAmount: quote.loanAmount,
    rateRange: quote.rateRange,
    termSheetUrl: loan.term_sheet_url ? `${process.env.FRONTEND_URL}${loan.term_sheet_url}` : null,
    portalUrl: `${process.env.FRONTEND_URL}/dashboard/loans/${loan.id}`
  };

  await queueEmail(
    user.id,
    loan.id,
    EMAIL_TEMPLATES.SOFT_QUOTE,
    user.email,
    `Your Soft Quote is Ready - ${loan.loan_number}`,
    templateData
  );
};

// Process email queue (would be called by a cron job or worker)
const processEmailQueue = async () => {
  const pendingEmails = await db.query(`
    SELECT * FROM email_queue WHERE status = 'pending' ORDER BY created_at LIMIT 10
  `);

  for (const email of pendingEmails.rows) {
    try {
      // In production, integrate with HubSpot transactional emails or SMTP
      // For HubSpot: Use HubSpot Marketing Email API
      // For SMTP: Use nodemailer or similar
      
      if (HUBSPOT_API_KEY) {
        // Uncomment when HubSpot SDK is installed:
        /*
        try {
          // Use HubSpot transactional email API
          await hubspotClient.marketing.transactional.singleSendApi.send({
            emailId: getEmailTemplateId(email.email_type),
            message: email.template_data
          });
        } catch (hubspotError) {
          throw new Error(`HubSpot send failed: ${hubspotError.message}`);
        }
        */
        console.log(`[Email] Would send ${email.email_type} to ${email.recipient_email} via HubSpot`);
      } else {
        // Fallback to SMTP or other email service
        console.log(`[Email] Would send ${email.email_type} to ${email.recipient_email} via SMTP`);
      }
      
      // Mark as sent (in production, only after successful send)
      await db.query(`
        UPDATE email_queue SET status = 'sent', sent_at = NOW() WHERE id = $1
      `, [email.id]);
    } catch (error) {
      console.error(`[Email] Failed to send ${email.email_type}:`, error);
      await db.query(`
        UPDATE email_queue SET status = 'failed', error_message = $1 WHERE id = $2
      `, [error.message, email.id]);
    }
  }
};

module.exports = {
  EMAIL_TEMPLATES,
  queueEmail,
  sendWelcomeEmail,
  sendNeedsListEmail,
  notifyOpsDocumentUpload,
  sendSoftQuoteEmail,
  processEmailQueue
};

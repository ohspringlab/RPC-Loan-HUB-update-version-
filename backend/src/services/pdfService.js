const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateTermSheet = async (loan, quote) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `term-sheet-${loan.loan_number}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/term-sheets', fileName);

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('RPC LENDING', { align: 'center' });
      doc.fontSize(18).font('Helvetica').text('Term Sheet', { align: 'center' });
      doc.moveDown();

      // Loan info
      doc.fontSize(12).font('Helvetica-Bold').text(`Loan Number: ${loan.loan_number}`);
      doc.font('Helvetica').text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Property Information
      doc.fontSize(14).font('Helvetica-Bold').text('Subject Property');
      doc.fontSize(11).font('Helvetica');
      doc.text(`Address: ${loan.property_address}`);
      doc.text(`City, State ZIP: ${loan.property_city}, ${loan.property_state} ${loan.property_zip}`);
      doc.text(`Property Type: ${formatPropertyType(loan.property_type)}`);
      if (loan.property_name) doc.text(`Property Name: ${loan.property_name}`);
      doc.moveDown();

      // Loan Terms
      doc.fontSize(14).font('Helvetica-Bold').text('Proposed Loan Terms');
      doc.fontSize(11).font('Helvetica');
      doc.text(`Loan Amount: ${formatCurrency(quote.loanAmount)}`);
      doc.text(`Property Value: ${formatCurrency(quote.propertyValue)}`);
      doc.text(`Loan-to-Value (LTV): ${quote.ltv}%`);
      doc.text(`Interest Rate Range: ${quote.rateRange || `${quote.interestRateMin.toFixed(2)}% - ${quote.interestRateMax.toFixed(2)}%`}`);
      doc.text(`Loan Type: ${formatTransactionType(loan.transaction_type)}`);
      doc.text(`Documentation: ${formatDocType(loan.documentation_type)}`);
      doc.moveDown();

      // Fees
      doc.fontSize(14).font('Helvetica-Bold').text('Estimated Fees');
      doc.fontSize(11).font('Helvetica');
      if (quote.originationPoints) {
        doc.text(`Origination Fee (${quote.originationPoints}%): ${formatCurrency(quote.originationFee || 0)}`);
      }
      doc.text(`Processing Fee: ${formatCurrency(quote.processingFee || 995)}`);
      doc.text(`Underwriting Fee: ${formatCurrency(quote.underwritingFee || 1495)}`);
      doc.text(`Appraisal Fee: ${formatCurrency(quote.appraisalFee || (loan.property_type === 'commercial' ? 750 : 500))}`);
      doc.font('Helvetica-Bold').text(`Total Estimated Closing Costs: ${formatCurrency(quote.totalClosingCosts || 0)}`);
      doc.moveDown();

      // Monthly Payment
      doc.fontSize(14).font('Helvetica-Bold').text('Estimated Monthly Payment');
      doc.fontSize(11).font('Helvetica');
      if (quote.estimatedMonthlyPayment) {
        doc.text(`Interest Only Payment: ${formatCurrency(quote.estimatedMonthlyPayment)}/month`);
      }
      doc.moveDown();

      // Disclaimer
      doc.moveDown();
      doc.fontSize(9).font('Helvetica-Oblique');
      doc.text(quote.disclaimer, { align: 'justify' });
      doc.moveDown();
      doc.text(`This term sheet is valid until: ${new Date(quote.validUntil).toLocaleDateString()}`);

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica');
      doc.text('RPC Lending | www.rpc-lending.com', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/term-sheets/${fileName}`);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Generate full loan application PDF
const generateApplicationPdf = async (loan, applicationData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `application-${loan.loan_number}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/applications', fileName);

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(20).font('Helvetica-Bold').text('Loan Application', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(`Loan Number: ${loan.loan_number}`, { align: 'center' });
      doc.moveDown(2);

      // Add application data sections
      if (applicationData) {
        Object.entries(applicationData).forEach(([section, data]) => {
          doc.fontSize(14).font('Helvetica-Bold').text(formatSectionTitle(section));
          doc.fontSize(11).font('Helvetica');
          
          if (typeof data === 'object') {
            Object.entries(data).forEach(([key, value]) => {
              doc.text(`${formatFieldName(key)}: ${value || 'N/A'}`);
            });
          }
          doc.moveDown();
        });
      }

      // Add state-specific disclosures
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('State Disclosures and Legal Notices', { align: 'center' });
      doc.moveDown();
      
      const state = loan.property_state?.toUpperCase() || 'CA';
      const disclosures = getStateDisclosures(state);
      
      doc.fontSize(11).font('Helvetica');
      disclosures.forEach(disclosure => {
        doc.fontSize(12).font('Helvetica-Bold').text(disclosure.title);
        doc.fontSize(11).font('Helvetica');
        doc.text(disclosure.content, { align: 'left' });
        doc.moveDown();
      });

      // General disclosures
      doc.fontSize(12).font('Helvetica-Bold').text('General Disclosures');
      doc.fontSize(11).font('Helvetica');
      doc.text('This loan application is subject to credit approval and property valuation. Rates and terms are estimates and subject to change. Final terms will be provided in the commitment letter.');
      doc.moveDown();
      doc.text('Riverside Park Capital is licensed in accordance with applicable state and federal lending regulations.');
      doc.moveDown();
      doc.text('By signing this application, you acknowledge that you have read and understand all disclosures provided.');

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/applications/${fileName}`);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Helper functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatPropertyType(type) {
  const types = {
    residential: 'Residential (1-4 Units)',
    commercial: 'Commercial'
  };
  return types[type] || type;
}

function formatTransactionType(type) {
  const types = {
    purchase_fix_flip: 'Purchase - Fix & Flip',
    purchase_ground_up: 'Purchase - Ground-Up Construction',
    refinance_rate_term: 'Refinance - Rate & Term',
    refinance_cash_out: 'Refinance - Cash-Out'
  };
  return types[type] || type;
}

function formatDocType(type) {
  const types = {
    full_doc: 'Full Documentation',
    light_doc: 'Light Doc (No Tax Returns)',
    bank_statement: 'Bank Statement Program',
    no_doc: 'Streamline No-Doc'
  };
  return types[type] || type;
}

function formatSectionTitle(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function formatFieldName(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

module.exports = { generateTermSheet, generateApplicationPdf };

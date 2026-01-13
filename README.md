# RPC Lending Portal - Full Stack Application

A comprehensive fintech lending platform for Riverside Park Capital (RPC) that enables borrowers to submit loan requests, track applications, and manage documents through a guided, TurboTax-style experience.

## 🚀 Features

### Borrower Portal
- **Registration & Authentication**: Secure account creation with email verification
- **Loan Request Workflow**: Step-by-step guided loan application
  - Property type selection (Residential 1-4 units or Commercial)
  - Portfolio refinance support (multiple properties)
  - DSCR calculation with auto-decline rules
  - Documentation type selection
- **Credit Authorization**: Digital consent for soft credit pull
- **Soft Quote Generation**: Automated rate range based on credit score and DSCR
- **Term Sheet**: Auto-generated PDF with loan terms
- **Document Management**: 
  - Color-coded folder system (Tan → Blue → Red)
  - Automatic folder organization
  - Upload notifications to operations team
- **Loan Tracker**: 17-stage visual progress indicator
- **Payment Processing**: Appraisal payment integration (Stripe-ready)
- **Full Application**: Complete loan application with PDF export

### Operations Portal
- **Pipeline Management**: View all loans with filtering and search
- **Status Updates**: Dropdown-based status progression
- **Document Review**: Review and approve/reject uploaded documents
- **CRM Integration**: Borrower search and profile management
- **Processor Assignment**: Assign loans to team members
- **Notifications**: Real-time alerts for document uploads and status changes

## 📋 Loan Products Supported

### Residential (1-4 Units)
- DSCR / Investor Rental Loans (Purchase & Refinance)
- Portfolio Refinance (Multiple Properties)
- Fix & Flip / Value-Add Bridge
- Ground-Up Construction
- Investment HELOC (up to 90% LTV)

### Commercial (5+ Units)
- Multifamily Bridge Loans
- Value-Add / Renovation Loans
- Cash-Out Refinance
- Permanent Financing

### Documentation Types
- Full Documentation
- Light Doc (No Tax Returns)
- Bank Statement Program
- Streamline No-Doc (DSCR-based)

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **Stripe** payment processing (ready)
- **HubSpot** CRM integration (ready)
- **PDFKit** for document generation
- **Multer** for file uploads

### Frontend
- **React** with TypeScript
- **Vite** build tool
- **shadcn/ui** component library
- **Tailwind CSS** styling
- **React Router** for navigation
- **React Query** for data fetching
- **Sonner** for toast notifications

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- (Optional) Stripe account for payments
- (Optional) HubSpot account for CRM

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# (Optional) Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Demo Accounts

After seeding the database:

- **Borrower**: `demo@example.com` / `demo123456`
- **Operations**: `ops@rpc-lending.com` / `ops123456`

## 📊 Loan Status Flow

The platform tracks loans through 17 stages:

1. **New Request** - Initial loan request created
2. **Quote Requested** - Borrower submitted for quote
3. **Soft Quote Issued** - Rate range generated
4. **Term Sheet Issued** - PDF term sheet available
5. **Term Sheet Signed** - Borrower accepted terms
6. **Needs List Sent** - Document checklist sent
7. **Needs List Complete** - All required docs uploaded
8. **Submitted to Underwriting** - File in review
9. **Appraisal Ordered** - Appraisal in progress
10. **Appraisal Received** - Value confirmed
11. **Conditionally Approved** - Conditions issued
12. **Conditional Items Needed** - Additional docs required
13. **Conditional Commitment Issued** - Commitment letter ready
14. **Clear to Close** - All conditions satisfied
15. **Closing Scheduled** - Closing date set
16. **Funded** - Loan complete

## 💰 DSCR Calculation

Debt Service Coverage Ratio (DSCR) is automatically calculated:

```
DSCR = NOI / Annual Debt Service
NOI = Annual Rental Income - Annual Operating Expenses

Example:
- Annual rental income: $120,000
- Annual operating expenses: $40,000
- NOI: $80,000
- Annual loan payments: $65,000
- DSCR = $80,000 ÷ $65,000 = 1.23x
```

**Auto-Decline Rule**: Loans with DSCR < 1.0x are automatically declined unless using Light Doc, Bank Statement, or No-Doc programs.

## 📁 Document Folder System

Documents are organized into folders with color-coded status:

- **Tan/Beige**: No documents uploaded (pending)
- **Blue**: Has documents uploaded
- **Red**: New upload in last 24 hours (requires attention)

Operations team receives email notifications when documents are uploaded.

## 🔗 API Documentation

See `backend/README.md` for complete API endpoint documentation.

## 🔒 Security Features

- JWT authentication with role-based access control
- Password hashing (bcrypt, 12 rounds)
- Credit authorization with IP/timestamp logging
- Complete audit trail for all sensitive actions
- Input validation (express-validator)
- CORS configuration
- Helmet security headers
- Encrypted file storage

## 📧 Email Integration

The platform integrates with HubSpot for:
- Welcome emails on registration
- Needs list emails with upload links
- Document upload notifications to operations
- Soft quote notifications
- Status update notifications

Email queue system ensures reliable delivery.

## 🚢 Deployment

### Backend
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Deploy to your Node.js hosting (Heroku, AWS, etc.)

### Frontend
1. Build: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, AWS S3, etc.)
3. Configure API URL in environment variables

## 📝 Development Notes

### Adding New Loan Products
1. Update `backend/src/services/quoteService.js` with pricing logic
2. Add transaction type to frontend form
3. Update needs list generator for product-specific documents

### Customizing Email Templates
Edit `backend/src/services/emailService.js` to customize email content and integrate with your email provider.

### Adding Payment Methods
The Stripe integration is ready. Update `backend/src/routes/payments.js` to add additional payment types.

## 🤝 Contributing

This is a production-ready application. When making changes:

1. Update database migrations if schema changes
2. Add audit logging for sensitive operations
3. Update API documentation
4. Test all user flows

## 📄 License

Proprietary - Riverside Park Capital

## 🆘 Support

For technical issues or questions, contact the development team.

---

**Built with ❤️ for Riverside Park Capital**


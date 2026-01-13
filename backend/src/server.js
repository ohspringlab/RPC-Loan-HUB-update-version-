require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');
const documentRoutes = require('./routes/documents');
const paymentRoutes = require('./routes/payments');
const opsRoutes = require('./routes/operations');
const profileRoutes = require('./routes/profile');

const { errorHandler } = require('./middleware/errorHandler');
const { pool } = require('./db/config');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (dev only)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/operations', opsRoutes);
app.use('/api/profile', profileRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    console.log('📊 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    const { current_time, pg_version } = result.rows[0];
    const version = pg_version.split(' ')[0] + ' ' + pg_version.split(' ')[1];
    
    console.log('✅ Database connection successful!');
    console.log(`   └─ PostgreSQL ${version}`);
    console.log(`   └─ Server time: ${current_time}`);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(`   └─ Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error('   └─ Make sure PostgreSQL is running and DATABASE_URL is correct');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   └─ Database host not found. Check your DATABASE_URL');
    } else if (error.code === '3D000') {
      console.error('   └─ Database does not exist. Create it first or check DATABASE_URL');
    } else if (error.code === '28P01') {
      console.error('   └─ Authentication failed. Check database credentials in DATABASE_URL');
    }
    return false;
  }
}

// Start server with database connection check
async function startServer() {
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.error('\n⚠️  Server starting without database connection. Some features may not work.\n');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 RPC Lending API running on port ${PORT}`);
    console.log(`   └─ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   └─ Database: ${dbConnected ? '✅ Connected' : '❌ Not connected'}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;

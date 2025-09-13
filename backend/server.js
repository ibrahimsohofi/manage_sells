import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { testConnection, initializeDatabase, seedInitialData } from './config/database-sqlite.js';

// Import routes
import salesRoutes from './routes/sales.js';
import inventoryRoutes from './routes/inventory.js';
import storesRoutes from './routes/stores.js';
import categoriesRoutes from './routes/categories.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    /https:\/\/.*\.preview\.same-app\.com$/,
    /https:\/\/.*\.same\.new$/
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sales Management API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use("/api/:id",salesRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize SQLite database
    console.log('🔄 Initializing SQLite database...');
    const dbInitialized = initializeDatabase();

    // Test database connection
    const dbConnected = await testConnection();

    if (dbConnected) {
      console.log('🌱 Seeding initial data...');
      seedInitialData();
      console.log('✅ Database setup complete!');
    } else {
      console.log('⚠️  Database not available. Starting server in demo mode...');
      console.log('📝 Note: API endpoints will return mock responses or errors');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Sales Management API server running on port ${PORT}`);
      console.log(`📊 Database: ${dbConnected ? 'SQLite (Full Features)' : 'Demo Mode (No DB)'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: SQLite with full backend functionality enabled`);
      if (dbConnected) {
        console.log('✨ Full API functionality available!');
        console.log('📈 Multi-store, analytics, and inventory management ready');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

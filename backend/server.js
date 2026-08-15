const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const path = require('path');

// Load configuration and validate environment
const { config, validateEnv } = require('./config/env');
validateEnv();

// Redis client
const { initRedisClient, closeRedisConnection, isRedisConnected } = require('./config/redisClient');
const { connectToQueue } = require('./services/queueService');
const { connectToElastic, createIndices } = require('./services/searchService');

// New Elasticsearch client
const { testConnection: testEsConnection, initializeIndices } = require('./config/elasticsearchClient');


// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validation');
const requestLogger = require('./middleware/requestLogger');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy (for rate limiting and correct IP addresses)
app.set('trust proxy', 1);

// Security middleware - Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
const allowedOrigins = config.nodeEnv === 'development'
  ? ['http://localhost:3000', 'http://localhost:5173', config.frontendUrl]
  : [config.frontendUrl];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    const isVercelPreview = origin.endsWith('.vercel.app');
    if (allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (in development)
if (config.nodeEnv === 'development') {
  app.use(requestLogger);
}

// Input sanitization (prevent NoSQL injection)
app.use(sanitizeInput);

// General rate limiting
app.use(generalLimiter);

// MongoDB Connection
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize Redis
console.log('🔄 Initializing Redis...');
initRedisClient();

// Wait a moment for Redis to connect
setTimeout(() => {
  if (isRedisConnected()) {
    console.log('✅ Redis is ready');
  } else {
    console.warn('⚠️ Redis connection failed - app will run without caching');
  }

  // Initialize RabbitMQ and Elastic (legacy)
  connectToQueue();
  connectToElastic();

  // Initialize new Elasticsearch client
  setTimeout(async () => {
    const esConnected = await testEsConnection();
    if (esConnected) {
      await initializeIndices();
    } else {
      console.warn('⚠️ Elasticsearch not available - search features will be limited');
    }
  }, 2000);

  // Create legacy indices after a delay to ensure connection
  setTimeout(createIndices, 5000);
}, 1000);
// Root route - Render/browser test
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediConnect API is running successfully 🚀'
  });
});
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediConnect API is running',
    environment: config.nodeEnv,
    features: {
      email: config.features.emailEnabled,
      payment: config.features.paymentEnabled,
      redis: isRedisConnected()
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/doctor', require('./routes/doctorDashboardRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/patient', require('./routes/patientBookingRoutes'));
app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/pharmacists', require('./routes/pharmacistRoutes'));
app.use('/api/prescription-orders', require('./routes/prescriptionOrderRoutes'));
app.use('/api/prescriptions', require('./routes/advancedPrescriptionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/recent-searches', require('./routes/recentSearchRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));


// 404 handler - must be after all routes
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

// Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join a room based on User ID (for private notifications)
  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('🛑 HTTP server closed');

    // Close Redis connection
    closeRedisConnection().then(() => {
      // Close MongoDB connection
      mongoose.connection.close(false, () => {
        console.log('🛑 MongoDB connection closed');
        process.exit(0);
      });
    });
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('🛑 HTTP server closed');

    // Close Redis connection
    closeRedisConnection().then(() => {
      // Close MongoDB connection
      mongoose.connection.close(false, () => {
        console.log('🛑 MongoDB connection closed');
        process.exit(0);
      });
    });
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 MediConnect Server (Restarted)`);
  console.log(`${'='.repeat(50)}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${config.features.emailEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`💳 Payment service: ${config.features.paymentEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🔄 Redis: ${isRedisConnected() ? '✅ Connected' : '⚠️ Disconnected'}`);
  console.log(`${'='.repeat(50)}\n`);
});
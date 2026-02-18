const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const adminRoutes = require('./routes/adminRoutes');
const parentRoutes = require('./routes/parentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');
const absenceRoutes = require('./routes/absenceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const otpRoutes = require('./routes/otp');
// Report card routes import removed

const http = require('http');
const socketHandler = require('./utils/socketHandler');

const app = express();
const server = http.createServer(app);

// Initialiser Socket.io
socketHandler.init(server);

connectDB();

// CORS configuration - allow all common development origins
app.use(cors({
  origin: [
    'http://localhost:3000',      // React default
    'http://localhost:5173',      // Vite default
    'http://localhost:5174',      // Vite alternate
    'http://localhost:8081',      // Expo web
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,  // Local network IPs
    /^exp:\/\/192\.168\.\d+\.\d+:\d+$/,   // Expo scheme
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', express.static('uploads')); // Serve uploaded files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/class', classRoutes);
app.use('/api/absence', absenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/otp', otpRoutes);
// Report card routes removed

// Health check endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'API Kbarwilly - Gestion des absences scolaires en Mauritanie' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
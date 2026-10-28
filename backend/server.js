import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analysisRoutes from './src/routes/analysis.routes.js';
import { detectCompiler } from './src/modules/compiler.js';
import { connectDatabase, isDbConnected } from './src/config/database.js';
import { historyStore } from './src/modules/historyStore.js';

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration to allow local Vite frontend
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Root health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Hybrid LLM Error Detector'
  });
});

// API Routes
app.use('/api', analysisRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.url} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(` Hybrid LLM C++ Error Detector Backend Running`);
  console.log(` Port:        http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health:      http://localhost:${PORT}/api/health`);
  
  // Connect to MongoDB Atlas
  const dbConnected = await connectDatabase();
  if (dbConnected) {
    await historyStore.syncWithDatabase();
  }

  const compiler = await detectCompiler();
  console.log(` C++ Compiler: ${compiler?.command} (${compiler?.version || 'detected'})`);
  console.log(` Groq LLM:     ${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'}`);
  console.log(` Database:     ${dbConnected ? 'MongoDB Atlas (Cluster0)' : 'Local Disk File (history.json)'}`);
  console.log(`====================================================`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import userRouter from './routes/userRouters.js';
import imageRouter from './routes/imageRouts.js';

const PORT = process.env.PORT || 4000;
const app = express();

// Allow JSON parsing
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: [
    'https://image-generator-ai-client-6gp4-mmqh2m8ci.vercel.app', // Your frontend URL
    'http://localhost:5173' // Local development URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
};

app.use(cors(corsOptions));

// Connect to DB
await connectDB();

// Routes
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

// Test route
app.get('/', (req, res) => res.send("API Working fine"));

// Start server
app.listen(PORT, () => console.log('Server is running on port ' + PORT));

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Groq configuration
// First try OPEN_KEY from system environment, then fall back to GROQ_API_KEY from .env
const GROQ_API_KEY = process.env.OPEN_KEY;
const GROQ_MODEL = 'openai/gpt-oss-120b'; // Using a valid Groq model

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['https://chipper-snickerdoodle-ed545c.netlify.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    model: GROQ_MODEL
  });
});

// Chat endpoint - handles Groq API calls
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ 
        error: 'Groq API key not configured. Please set GROQ_API_KEY in .env file or OPEN_KEY system variable.' 
      });
    }

    // Build conversation messages for Groq
    const messages = [
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    // Extract the response
    const aiResponse = completion.choices[0].message.content;

    res.json({
      response: aiResponse,
      model: GROQ_MODEL,
      usage: {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      }
    });

  } catch (error) {
    console.error('Error calling Groq:', error.message);
    
    // Handle Groq API errors
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Groq API error', 
        details: error.response.data.error?.message || error.message
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Start server
// Start server — bind to 0.0.0.0 so external hosts can connect
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend server running on http://${HOST}:${PORT}`);
  console.log(`🤖 Using Groq model: ${GROQ_MODEL}`);
});

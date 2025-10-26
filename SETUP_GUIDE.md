# OpenAI Chat Setup Guide

## 🎯 Overview

This application has been updated to use **OpenAI's GPT models** instead of Ollama. The backend now uses the official OpenAI Node.js SDK for AI-powered conversations.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies (including the OpenAI SDK)
npm install

# Create .env file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `backend/.env` and add your OpenAI API key:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Server Configuration
PORT=3001

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

**Important**: 
- Replace `sk-your-actual-openai-api-key-here` with your actual OpenAI API key
- Never commit your `.env` file to version control
- You can change the model to `gpt-4`, `gpt-4-turbo`, or other available models

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional - uses default if not present)
# echo "VITE_API_URL=http://localhost:3001" > .env
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🎨 Using the Application

1. Open your browser to `http://localhost:3000`
2. Start chatting with the AI
3. The backend will communicate with OpenAI's API to generate responses

## 🔧 Key Changes

### What Changed?
- ✅ Replaced Ollama with OpenAI GPT
- ✅ Using official OpenAI Node.js SDK
- ✅ Cloud-based AI (no local model required)
- ✅ Ollama code is commented out (can be restored if needed)

### Backend Configuration
- `server.js` now uses `OpenAI` client from the SDK
- Messages are formatted for OpenAI's chat completion API
- Returns token usage information in responses

### Frontend Updates
- Updated branding from "Mistral" to "OpenAI GPT"
- Updated messaging to reflect cloud-based AI
- No changes to the chat functionality

## 🛡️ Security Best Practices

1. **Never commit API keys** - Already in `.gitignore`
2. **Use environment variables** - API keys are loaded from `.env`
3. **Set spending limits** - Configure usage limits in OpenAI dashboard
4. **Monitor usage** - Check token consumption regularly

## 💰 Cost Considerations

- **GPT-3.5-turbo**: ~$0.50 per million input tokens, ~$1.50 per million output tokens
- **GPT-4**: ~$10 per million input tokens, ~$30 per million output tokens
- Set up billing alerts in OpenAI dashboard
- Monitor usage via the OpenAI API dashboard

## 🔍 Troubleshooting

### "OpenAI API key not configured"
- Ensure `OPENAI_API_KEY` is set in `backend/.env`
- Check for typos or extra spaces

### "OpenAI API error"
- Verify your API key is valid
- Check if you have credits/quota available
- Review error message for specific issue

### Model not responding
- Check internet connection
- Verify OpenAI service status
- Check backend logs for detailed errors

## 📚 Additional Resources

- [OpenAI Platform Docs](https://platform.openai.com/docs)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [OpenAI Pricing](https://openai.com/api/pricing/)

## 🔄 Switching Back to Ollama

If you want to use Ollama again:
1. Uncomment the Ollama code in `server.js`
2. Comment out the OpenAI code
3. Set up Ollama locally
4. Update environment variables

## 📝 License

ISC

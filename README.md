# OpenAI Chat - Full-Stack Application

A full-stack chat application with a Node.js/Express backend that connects to OpenAI's GPT models and a React frontend with a modern chat UI.

## Architecture Overview

```
Frontend (React + Vite)     Backend (Node.js + Express)     OpenAI API
     ↓                              ↓                            ↓
  Port 3000              Port 3001 /api/chat            Cloud API
     |                              |                            |
     └───────── HTTP Request ───────┼────────────────────────────┘
                                    |
                          Receives user message
                                    |
                          Calls OpenAI API
                                    |
                          Returns AI response
                                    |
     └────────── Response ──────────┘
```

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## Project Structure

```
aws/
├── backend/
│   ├── server.js              # Express server with OpenAI integration
│   ├── .env                   # Environment variables (create from .env.example)
│   ├── .env.example           # Example environment variables
│   ├── package.json           # Backend dependencies
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatUI.jsx         # Main chat container
│   │   │   ├── MessageList.jsx    # Message list component
│   │   │   ├── MessageBubble.jsx  # Individual message component
│   │   │   ├── InputBox.jsx       # Message input component
│   │   │   └── LoadingIndicator.jsx # Loading animation
│   │   ├── services/
│   │   │   └── api.js             # API communication service
│   │   ├── App.jsx                # Root component
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles with Tailwind
│   ├── index.html                 # HTML template
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # Tailwind CSS config
│   ├── postcss.config.js          # PostCSS config
│   ├── package.json               # Frontend dependencies
│   └── .env                       # Frontend environment variables (optional)
├── README.md
└── SETUP_GUIDE.md
```

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your OpenAI API key
# OPENAI_API_KEY=sk-your-api-key-here
# OPENAI_MODEL=gpt-3.5-turbo
# PORT=3001
# ALLOWED_ORIGINS=http://localhost:3000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (optional - defaults to http://localhost:3001)
# VITE_API_URL=http://localhost:3001
```

## Running the Application

### Start Backend

```bash
cd backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will start on `http://localhost:3001`

### Start Frontend

```bash
cd frontend

# Development server
npm run dev
```

The frontend will automatically open at `http://localhost:3000`

## How It Works

### Backend (`server.js`)

1. **Express Server**: Creates an HTTP server on port 3001
2. **CORS Middleware**: Allows requests from the frontend origin
3. **`/api/chat` Endpoint**:
   - Receives user message and conversation history
   - Builds conversation messages for OpenAI
   - Calls OpenAI API using the official SDK
   - Passes the messages to the GPT model
   - Returns the AI-generated response with token usage
4. **Error Handling**: Catches API errors and provides helpful error messages

### Frontend (`src/`)

1. **ChatUI Component**: Main container managing:
   - Message state and history
   - Loading states
   - API calls to backend
   - Error handling

2. **MessageList Component**: Renders all messages from the conversation

3. **MessageBubble Component**: Displays individual messages with:
   - Different styling for user vs AI messages
   - Role indicators (You / Assistant)
   - Message content with proper formatting

4. **InputBox Component**: Handles user input with:
   - Auto-resizing textarea
   - Enter to send, Shift+Enter for new line
   - Disabled state during loading

5. **API Service**: Centralized HTTP client for backend communication

## Features

✅ **Real-time Chat Interface** - Smooth, responsive UI
✅ **Message History** - Maintains conversation context
✅ **Loading Indicators** - Visual feedback during AI processing
✅ **Error Handling** - Graceful error messages
✅ **Modern UI** - Beautiful gradient design with Tailwind CSS
✅ **Token Usage Tracking** - Monitor API usage
✅ **Environment Configuration** - Easy to configure via .env files

## Configuration

### Backend Environment Variables (.env)

```env
OPENAI_API_KEY=sk-your-api-key-here    # Your OpenAI API key
OPENAI_MODEL=gpt-3.5-turbo              # Model name (gpt-3.5-turbo, gpt-4, etc.)
PORT=3001                                # Backend port
ALLOWED_ORIGINS=http://localhost:3000   # Frontend origin
```

### Frontend Environment Variables (.env)

```env
VITE_API_URL=http://localhost:3001   # Backend API URL
```

### Change the Model

To use a different OpenAI model:

1. Update backend `.env`: `OPENAI_MODEL=gpt-4`
2. Restart the backend server

Available models: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo-preview`, etc.

## API Endpoints

### POST `/api/chat`

Send a message to the AI model.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you!",
  "model": "gpt-3.5-turbo",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 20,
    "total_tokens": 70
  }
}
```

### GET `/health`

Check if the backend is running and configured.

**Response:**
```json
{
  "status": "ok",
  "model": "gpt-3.5-turbo"
}
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify .env configuration
- Run `npm install` to ensure dependencies are installed

### "OpenAI API key not configured" error
- Ensure OPENAI_API_KEY is set in backend .env
- Check for typos or extra spaces

### "OpenAI API error"
- Verify your API key is valid and has credits
- Check OpenAI service status
- Review error message for specific issue

### CORS errors
- Ensure ALLOWED_ORIGINS in backend .env includes frontend URL
- Clear browser cache and restart both servers

## Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

The `dist/` folder contains the production build. Serve it with any static file server.

### Deploy Backend

- Use a process manager like PM2
- Set production environment variables
- Use a reverse proxy (Nginx) for HTTPS
- Ensure API keys are securely stored

## Cost Considerations

- **GPT-3.5-turbo**: ~$0.50 per million input tokens, ~$1.50 per million output tokens
- **GPT-4**: ~$10 per million input tokens, ~$30 per million output tokens
- Set up billing alerts in OpenAI dashboard
- Monitor usage via the OpenAI API dashboard

## Security Best Practices

1. **Never commit API keys** - Already in `.gitignore`
2. **Use environment variables** - API keys are loaded from `.env`
3. **Set spending limits** - Configure usage limits in OpenAI dashboard
4. **Monitor usage** - Check token consumption regularly
5. **Rate limiting** - Consider implementing rate limiting in production

## Technologies Used

- **Backend**: Node.js, Express, OpenAI SDK, dotenv
- **Frontend**: React, Vite, Tailwind CSS, Axios
- **AI Model**: OpenAI GPT (gpt-3.5-turbo or gpt-4)

## Additional Resources

- [OpenAI Platform Docs](https://platform.openai.com/docs)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [OpenAI API Keys](https://platform.openai.com/api-keys)

## License

ISC

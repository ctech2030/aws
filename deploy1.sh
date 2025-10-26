#!/bin/bash

# AWS EC2 Deployment Script for Groq Chat Application
# This script sets up the server and deploys the application

set -e  # Exit on error

echo "🚀 Starting AWS EC2 deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install PM2 (process manager)
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Git
echo "📦 Installing Git..."
sudo apt-get install git -y

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt-get install nginx -y

# Create application directory
echo "📁 Setting up application directory..."
APP_DIR="/home/ubuntu/groq-chat"
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Copy application files (assuming you'll upload or clone)
echo "📋 Application files should be in: $APP_DIR"

# Install dependencies
echo "📦 Installing application dependencies..."
if [ -f "package.json" ]; then
    npm install --production
else
    echo "⚠️  Warning: package.json not found. Please make sure application files are in place."
fi

# Create .env file (you'll need to update this with your actual values)
echo "📝 Creating .env file..."
cat > .env << EOF
GROQ_API_KEY=<>
GROQ_MODEL=openai/gpt-oss-120b
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=*
EOF

# Start application with PM2
echo "🚀 Starting application with PM2..."
if [ -f "server.js" ]; then
    pm2 start server.js --name groq-chat-backend
    pm2 save
    pm2 startup
    echo "✅ Application started successfully!"
else
    echo "⚠️  Warning: server.js not found. Please upload your application files."
fi

# Configure Nginx
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/groq-chat > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for AI responses
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/groq-chat /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Install UFW firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow SSH
sudo ufw --force enable

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your application should be accessible at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: pm2 logs groq-chat-backend"
echo "  - Restart app: pm2 restart groq-chat-backend"
echo "  - Check status: pm2 status"
echo "  - View Nginx logs: sudo tail -f /var/log/nginx/error.log"

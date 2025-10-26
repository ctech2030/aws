#!/bin/bash

# AWS EC2 Deployment Script for Amazon Linux / Amazon Linux 2023
# This script sets up the server and deploys the Groq Chat application

set -e  # Exit on error

echo "🚀 Starting AWS EC2 deployment for Amazon Linux..."

# Detect which Amazon Linux version
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "Cannot detect OS version"
    exit 1
fi

echo "Detected OS: $OS $VERSION"

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install basic tools
echo "📦 Installing basic tools..."
sudo yum install -y git gcc-c++ make

# Install Node.js (using NodeSource for Amazon Linux)
echo "📦 Installing Node.js..."
if [[ "$OS" == "amzn" ]] || [[ "$OS" == "amazonlinux" ]]; then
    # For Amazon Linux 2 or 2023
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
else
    # Alternative installation method
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18
    nvm use 18
fi

# Verify Node.js installation
echo "Node.js version:"
node --version
echo "npm version:"
npm --version

# Install PM2 (process manager)
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
if command -v amazon-linux-extras &> /dev/null; then
    # Amazon Linux 2
    sudo amazon-linux-extras install nginx1 -y
else
    # Amazon Linux 2023
    sudo yum install -y nginx
fi

# Create application directory
echo "📁 Setting up application directory..."
APP_DIR="/home/ec2-user/groq-chat"
mkdir -p $APP_DIR
cd $APP_DIR

echo "📋 Application files should be in: $APP_DIR"
echo "Please ensure your application files are in this directory."

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing application dependencies..."
    npm install --production
else
    echo "⚠️  Warning: package.json not found in $APP_DIR"
    echo "Please upload your application files first."
fi

# Create .env file (update with your values)
echo "📝 Creating .env file..."
cat > .env << 'EOF'
GROQ_API_KEY=<>
GROQ_MODEL=openai/gpt-oss-120b
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=*
EOF

# Start application with PM2
echo "🚀 Starting application with PM2..."
if [ -f "server.js" ]; then
    # If app is already running, stop it first
    pm2 stop groq-chat-backend 2>/dev/null || true
    pm2 delete groq-chat-backend 2>/dev/null || true
    
    # Start the application
    pm2 start server.js --name groq-chat-backend
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup systemd -u ec2-user --hp /home/ec2-user
    echo "✅ Application started successfully!"
else
    echo "⚠️  Warning: server.js not found. Please upload your application files."
fi

# Configure Nginx
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/conf.d/groq-chat.conf > /dev/null << 'EOF'
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

# Remove default Nginx config
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start and enable Nginx
echo "🔄 Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure Security Group (firewall for EC2)
echo "🔒 Note: Configure your EC2 Security Group to allow:"
echo "  - Port 22 (SSH)"
echo "  - Port 80 (HTTP)"
echo "  - Port 3001 (Application)"

echo ""
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
echo ""
echo "📝 Application directory: $APP_DIR"

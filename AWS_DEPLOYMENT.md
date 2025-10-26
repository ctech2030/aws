# AWS Deployment Guide

This guide will help you deploy the Groq Chat application on AWS.

## Deployment Options

### Option 1: AWS Elastic Beanstalk (Easiest)
- Automatically handles server management
- Good for beginners
- Scales automatically

### Option 2: AWS EC2 (More Control)
- Full control over the server
- More configuration options
- Good for advanced users

### Option 3: AWS App Runner (Serverless-like)
- Automatic scaling
- Container-based
- Good for production

## Prerequisites

1. AWS Account
2. AWS CLI installed
3. Node.js installed locally
4. Groq API key

## Deployment Option 1: AWS Elastic Beanstalk (Recommended)

### Step 1: Install EB CLI

```bash
pip install awsebcli
```

### Step 2: Initialize Elastic Beanstalk

```bash
cd backend
eb init

# Follow the prompts:
# - Select region (e.g., us-east-1)
# - Select Node.js platform
# - Select Node.js version (18.x or higher)
```

### Step 3: Create Environment Variables File

Create `.ebextensions/environment.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
    GROQ_API_KEY: 'your_groq_api_key_here'
    GROQ_MODEL: 'openai/gpt-oss-120b'
    ALLOWED_ORIGINS: 'https://your-frontend-domain.com'
```

### Step 4: Create Application Bundle

Create `.ebextensions/nodecommand.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node server.js"
```

### Step 5: Deploy

```bash
eb create production
# This will create and deploy your application
```

### Step 6: Get Your Backend URL

After deployment:
```bash
eb status
# Note the CNAME endpoint
```

## Deployment Option 2: AWS EC2

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch Instance
3. Choose Ubuntu Server 22.04 LTS
4. Select t2.micro (free tier) or t2.small
5. Configure security group:
   - Port 22 (SSH)
   - Port 3001 (HTTP)
6. Launch and download key pair

### Step 2: Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Setup Server

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt-get install git -y
```

### Step 4: Clone and Setup Application

```bash
# Clone your repository
cd /home/ubuntu
git clone your-repository-url
cd aws/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

Add to `.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=*
```

### Step 5: Start Application with PM2

```bash
# Start the application
pm2 start server.js --name groq-chat-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions to complete setup
```

### Step 6: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt-get install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/groq-chat
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/groq-chat /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Deployment Option 3: Frontend on AWS Amplify

### Step 1: Prepare Frontend

```bash
cd frontend
npm run build
```

### Step 2: Deploy to Amplify

1. Go to AWS Console → Amplify
2. Click "New app" → "Host web app"
3. Connect your repository or upload the `dist` folder
4. Update build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Step 3: Update Frontend Environment Variables

In Amplify Console → App settings → Environment variables:

```
VITE_API_URL=https://your-backend-url.com
```

## Security Best Practices

### 1. Use AWS Secrets Manager for API Keys

```javascript
// Install AWS SDK
npm install @aws-sdk/client-secrets-manager

// Update server.js
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getSecret() {
  const command = new GetSecretValueCommand({ SecretId: "groq-api-key" });
  const response = await client.send(command);
  return response.SecretString;
}
```

### 2. Configure CORS Properly

Update `ALLOWED_ORIGINS` in your environment variables.

### 3. Enable HTTPS

Use AWS Certificate Manager (ACM) for SSL certificates.

## Monitoring and Logging

### CloudWatch Logs

EB and EC2 automatically send logs to CloudWatch.

### Set Up Monitoring

```bash
# Install CloudWatch agent (for EC2)
sudo wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

## Auto Scaling (EC2)

1. Create Launch Template
2. Create Auto Scaling Group
3. Set min/max instances
4. Configure scaling policies

## Cost Optimization

- Use EC2 Spot Instances for development
- Use Reserved Instances for production
- Set up billing alerts
- Use AWS Cost Explorer

## Troubleshooting

### Application Not Starting

```bash
# Check logs
pm2 logs groq-chat-backend

# Check if port is open
sudo netstat -tuln | grep 3001
```

### Cannot Connect to Backend

```bash
# Check security group rules
# Ensure port 3001 is open
```

### API Key Issues

```bash
# Verify environment variables
pm2 env groq-chat-backend
```

## Quick Start Script for EC2

Save this as `deploy.sh`:

```bash
#!/bin/bash

# Update system
sudo apt-get update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup (update with your repo)
cd /home/ubuntu
git clone your-repo-url
cd aws/backend

# Install dependencies
npm install

# Create .env (update with your values)
echo "GROQ_API_KEY=your_key" > .env
echo "GROQ_MODEL=openai/gpt-oss-120b" >> .env
echo "PORT=3001" >> .env
echo "ALLOWED_ORIGINS=*" >> .env

# Start application
pm2 start server.js --name groq-chat
pm2 save
pm2 startup
```

Make executable and run:
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

## Next Steps

1. Set up custom domain
2. Configure SSL certificate
3. Set up CI/CD pipeline
4. Configure monitoring and alerts
5. Set up backup strategy

## Support

For issues, check:
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Groq API Documentation](https://console.groq.com/docs)

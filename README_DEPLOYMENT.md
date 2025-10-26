# AWS EC2 Deployment Guide - Step by Step

## Quick Overview
This guide will help you deploy the Groq Chat application on AWS EC2.

## Prerequisites Checklist
- [ ] AWS Account created
- [ ] AWS CLI installed locally
- [ ] Groq API key ready
- [ ] Your application code ready to deploy

## Step 1: Launch EC2 Instance

### 1.1 Login to AWS Console
1. Go to https://console.aws.amazon.com
2. Sign in to your AWS account

### 1.2 Navigate to EC2
1. Search for "EC2" in the AWS Console
2. Click on "EC2" service

### 1.3 Launch Instance
1. Click "Launch Instance" button
2. Name your instance: `groq-chat-backend`

### 1.4 Choose AMI (Amazon Machine Image)
- Select: **Ubuntu Server 22.04 LTS** (or latest)

### 1.5 Choose Instance Type
- For testing: **t2.micro** (Free tier eligible)
- For production: **t2.small** or larger

### 1.6 Create or Select Key Pair
1. Create a new key pair
2. Name it: `groq-chat-key`
3. Download the `.pem` file
4. **Important:** Save it securely, you'll need it to connect

### 1.7 Configure Network Settings
- Security Group: Create new security group
- Rules to add:
  - **Type:** SSH, **Port:** 22, **Source:** My IP
  - **Type:** HTTP, **Port:** 80, **Source:** Anywhere (0.0.0.0/0)
  - **Type:** Custom TCP, **Port:** 3001, **Source:** Anywhere (0.0.0.0/0)

### 1.8 Launch Instance
1. Review your settings
2. Click "Launch Instance"
3. Wait for instance to be "Running"

### 1.9 Get Your Instance Public IP
- Note the **Public IPv4 address** (e.g., 54.123.45.67)

## Step 2: Connect to EC2 Instance

### 2.1 Set Permissions (Mac/Linux)
```bash
chmod 400 groq-chat-key.pem
```

### 2.2 Connect via SSH
```bash
ssh -i groq-chat-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```
Replace `YOUR_EC2_PUBLIC_IP` with your actual IP address.

**Note:** For Windows, use PuTTY or WSL.

## Step 3: Upload Application Files

### Option A: Using Git (Recommended)
```bash
# On EC2 instance
cd ~
git clone YOUR_REPOSITORY_URL
cd aws/backend
```

### Option B: Using SCP (From Local Machine)
```bash
# From your local machine
scp -i groq-chat-key.pem -r backend/ ubuntu@YOUR_EC2_IP:/home/ubuntu/groq-chat/
```

### Option C: Using AWS CLI (From Local Machine)
```bash
# Install AWS CLI if not installed
# Then upload files
aws s3 sync backend/ s3://your-bucket/backend/
# Then download on EC2
```

## Step 4: Run Deployment Script

### 4.1 Transfer deploy.sh to EC2
```bash
# From local machine
scp -i groq-chat-key.pem deploy.sh ubuntu@YOUR_EC2_IP:/home/ubuntu/
```

### 4.2 Run the script
```bash
# On EC2 instance
chmod +x deploy.sh
sudo ./deploy.sh
```

### 4.3 Manual Setup (Alternative)
If the script doesn't work, follow these steps manually:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx -y

# Navigate to your app directory
cd /home/ubuntu/groq-chat  # or wherever your code is

# Install dependencies
npm install

# Create .env file
nano .env
```

Add this content to `.env`:
```env
GROQ_API_KEY=<>
GROQ_MODEL=openai/gpt-oss-120b
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=*
```

Save and exit (Ctrl+X, then Y, then Enter)

```bash
# Start application
pm2 start server.js --name groq-chat-backend
pm2 save
pm2 startup  # Follow the instructions shown

# Configure Nginx
sudo nano /etc/nginx/sites-available/groq-chat
```

Add this configuration:
```nginx
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
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/groq-chat /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow SSH
sudo ufw --force enable
```

## Step 5: Test Your Deployment

### 5.1 Test Backend API
Open your browser and visit:
```
http://YOUR_EC2_PUBLIC_IP/health
```

You should see:
```json
{"status":"ok","model":"openai/gpt-oss-120b"}
```

### 5.2 Test Chat Endpoint
```bash
curl -X POST http://YOUR_EC2_PUBLIC_IP/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, how are you?"}'
```

## Step 6: Deploy Frontend (Optional)

### Option A: Update Frontend to Use Your Backend
1. Update `frontend/.env` or environment variables:
   ```
   VITE_API_URL=http://YOUR_EC2_PUBLIC_IP
   ```

2. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy `dist` folder to static hosting (AWS S3, Netlify, Vercel, etc.)

### Option B: Serve Frontend from EC2
```bash
# Install Node.js on EC2 (already done)
cd /path/to/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

## Step 7: Useful Commands

### Check Application Status
```bash
pm2 status
pm2 logs groq-chat-backend
```

### Restart Application
```bash
pm2 restart groq-chat-backend
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check if Port is Open
```bash
sudo netstat -tuln | grep 3001
```

### Monitor Resources
```bash
htop
# or
top
```

## Step 8: Security Hardening

### 8.1 Update .env File
Never commit your actual API key. Use environment variables securely.

### 8.2 Setup SSL Certificate (HTTPS)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com
```

### 8.3 Regular Updates
```bash
sudo apt-get update && sudo apt-get upgrade
```

## Troubleshooting

### Application Not Starting
```bash
# Check logs
pm2 logs groq-chat-backend

# Check if port is in use
sudo lsof -i :3001
```

### Cannot Access Application
1. Check Security Group rules in AWS Console
2. Ensure port 80 and 3001 are open
3. Check firewall: `sudo ufw status`

### Nginx Errors
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Monitoring and Maintenance

### Setup CloudWatch Monitoring (Optional)
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### Setup Auto-restart on Reboot
Already done with `pm2 startup` command.

## Estimated Costs

- **EC2 t2.micro**: Free (within free tier) or ~$8.50/month
- **EC2 t2.small**: ~$15/month
- **Data Transfer**: First 100GB free
- **Groq API**: Pay per use

## Next Steps

1. ✅ Set up custom domain
2. ✅ Configure SSL certificate
3. ✅ Set up automated backups
4. ✅ Configure monitoring alerts
5. ✅ Set up CI/CD pipeline

## Support

Need help? Check:
- AWS EC2 Documentation
- Groq API Documentation
- PM2 Documentation


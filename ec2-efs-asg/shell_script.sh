#!/bin/bash
set -ex

# Update system and install necessary packages
sudo dnf update -y
sudo dnf install -y git nginx

# Install Node.js 18 and PM2 (Amazon Linux 2023)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
sudo npm install -g pm2

# Clone your repository (Replace with your GitHub repo)
REPO_URL="https://github.com/your-username/your-repo.git"
APP_DIR="/home/ec2-user/app"

if [ -d "$APP_DIR" ]; then
    sudo rm -rf $APP_DIR
fi

git clone $REPO_URL $APP_DIR
cd $APP_DIR

# Install dependencies for backend
cd backend
npm install
pm2 start server.js --name backend

# Install dependencies for frontend
cd ../frontend
npm install
npm run build
pm2 start npm --name frontend -- start

# Configure Nginx as a reverse proxy
sudo tee /etc/nginx/nginx.conf > /dev/null <<EOL
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;
events {
    worker_connections 1024;
}
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    server {
        listen 80;
        
        location /api/ {
            proxy_pass http://localhost:5000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }

        location / {
            proxy_pass http://localhost:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
EOL

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Ensure PM2 starts on boot
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user

#!/bin/bash
set -ex

# Update system and install necessary packages
dnf update -y
dnf install -y git nginx

# Install Node.js 20 and PM2 (Amazon Linux 2023)
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
# Verify installations
node -v
npm -v
npm install -g pm2
pm2 -version

# Clone your repository (Replace with your GitHub repo)
REPO_URL="https://github.com/your-username/your-repo.git"
APP_DIR="/home/ec2-user/apps"

mkdir -p $APP_DIR
cd $APP_DIR

git clone $REPO_URL 

dnf install -y amazon-efs-utils
mkdir -p /mnt/efs/uploads
mount -t efs fs-038f44c16485e4dc7:/ /mnt/efs/uploads
# Install dependencies for backend
cd backend
npm install
pm2 start server.js --name backend

# Install dependencies for frontend
cd /home/ec2-user/apps/aws-tutorials/ec2-efs-asg/frontend
npm install
npm run build
pm2 start npm --name "citizenscoop" -- run start

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
            proxy_pass http://localhost:4000/;
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


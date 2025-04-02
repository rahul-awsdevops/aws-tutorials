# File Upload Service with EFS & Nginx Proxy

This project allows users to upload files via a React.js frontend to a Node.js backend. The files are stored in an **Amazon EFS (Elastic File System)**, ensuring persistence even if the EC2 instance restarts. **Nginx** is used as a reverse proxy to route requests between the frontend and backend.

## Features
- **React.js Frontend** (Port 3000) for file upload and listing
- **Node.js Express Backend** (Port 4000) with file handling via **Multer**
- **EFS Storage** for persistent file storage across EC2 instances
- **Nginx Reverse Proxy** for request routing

---
## 1️⃣ Setup & Installation

### **Step 1: Install Required Packages**

#### **On the EC2 Instance (Backend Server):**
```bash
sudo yum update -y  # Update packages
sudo yum install -y nginx git nodejs npm
```

#### **Install Dependencies for Backend:**
```bash
mkdir file-upload-service && cd file-upload-service
git clone <repo-url> . # Replace with your GitHub repo
cd backend
npm install  # Install Node.js dependencies
```

---
## 2️⃣ Configure Nginx as a Reverse Proxy

Create or update **nginx.conf**:
```bash
sudo tee /etc/nginx/nginx.conf > /dev/null <<EOL
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 4096;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;

        location /api/ {
            proxy_pass http://localhost:4000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_redirect off;
            proxy_cache_bypass \$http_upgrade;
        }

        location / {
            proxy_pass http://localhost:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_redirect off;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
EOL
```

Restart Nginx:
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---
## 3️⃣ Start the Node.js Backend

### **Configure Environment Variables**
Create a `.env` file inside the `backend/` directory:
```bash
echo "PORT=4000" > backend/.env
```

### **Run Backend Server:**
```bash
cd backend
node server.js  # OR use PM2 for process management
```

Alternatively, use **PM2** to keep the backend running:
```bash
npm install -g pm2
pm2 start server.js --name file-upload-backend
pm2 save
pm2 startup
```

---
## 4️⃣ Running the React Frontend

Go to the frontend directory:
```bash
cd ../frontend
npm install  # Install dependencies
npm run build  # Build React app
npm start  # Start frontend (or serve the build folder with Nginx)
```

---
## 5️⃣ Testing the Application

- **Upload a file:** Open `http://<EC2-Public-IP>/` and test the upload form.
- **View uploaded files:** Open `http://<EC2-Public-IP>/api/files`
- **Access files:** Open `http://<EC2-Public-IP>/api/files/<filename>`

---
## 6️⃣ Automating with Systemd (Optional)

Create a systemd service for the Node.js backend:
```bash
sudo tee /etc/systemd/system/file-upload.service > /dev/null <<EOL
[Unit]
Description=File Upload Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/file-upload-service/backend
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOL
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable file-upload.service
sudo systemctl start file-upload.service
```

---
## 7️⃣ Logs & Debugging

Check logs for Nginx:
```bash
sudo journalctl -u nginx --no-pager --since "10 minutes ago"
```

Check logs for Node.js server:
```bash
journalctl -u file-upload.service --no-pager
```

---
## 8️⃣ Future Enhancements
- ✅ **Implement authentication** (JWT for secure file uploads)
- ✅ **Integrate S3 storage** (Instead of EFS for better scalability)
- ✅ **Enable HTTPS with Let's Encrypt**

---
### 🚀 Now your File Upload Service is ready! 🎉


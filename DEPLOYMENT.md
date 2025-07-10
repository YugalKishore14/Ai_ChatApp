# 🚀 Deployment Guide for YUG-AI ChatApp

This guide covers various deployment options for the YUG-AI ChatApp, from simple hosting to enterprise-level deployments.

## 📋 Prerequisites

- Node.js 16+ installed
- MongoDB database (local or cloud)
- Domain name (optional)
- SSL certificate (for production)

## 🌐 Frontend Deployment

### Vercel (Recommended)

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

### Netlify

1. **Build and deploy**
   ```bash
   cd client
   npm run build
   # Upload dist/ folder to Netlify
   ```

2. **Configure redirects**
   Create `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### Static Hosting (Apache/Nginx)

1. **Build the application**
   ```bash
   cd client
   npm run build
   ```

2. **Configure web server**
   
   **Nginx example:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/yugai-chat/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🖥️ Backend Deployment

### Heroku

1. **Prepare for deployment**
   ```bash
   cd server
   # Ensure package.json has correct start script
   ```

2. **Deploy to Heroku**
   ```bash
   heroku create yugai-chatapp-api
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   git push heroku main
   ```

### Railway

1. **Deploy via Railway CLI**
   ```bash
   cd server
   railway login
   railway init
   railway up
   ```

2. **Set environment variables**
   ```bash
   railway variables:set NODE_ENV=production
   railway variables:set MONGODB_URI=your-mongodb-uri
   railway variables:set JWT_SECRET=your-jwt-secret
   ```

### DigitalOcean App Platform

1. **Create app specification**
   ```yaml
   name: yugai-chatapp
   services:
   - name: api
     source_dir: /server
     github:
       repo: your-username/yugai-chatapp
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: MONGODB_URI
       value: your-mongodb-uri
       type: SECRET
     - key: JWT_SECRET
       value: your-jwt-secret
       type: SECRET
   ```

### VPS/Dedicated Server

1. **Set up the server**
   ```bash
   # Install Node.js and PM2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2

   # Clone and setup
   git clone https://github.com/your-username/yugai-chatapp.git
   cd yugai-chatapp/server
   npm install --production
   ```

2. **Configure PM2**
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'yugai-chatapp',
       script: 'app.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'development'
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 5000,
         MONGODB_URI: 'your-mongodb-uri',
         JWT_SECRET: 'your-jwt-secret'
       }
     }]
   };
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## 🗄️ Database Deployment

### MongoDB Atlas (Recommended)

1. **Create cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create new cluster
   - Configure network access

2. **Get connection string**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/yugai-chatapp?retryWrites=true&w=majority
   ```

### Self-hosted MongoDB

1. **Install MongoDB**
   ```bash
   sudo apt-get install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

2. **Configure security**
   ```bash
   # Create admin user
   mongo
   > use admin
   > db.createUser({
       user: "admin",
       pwd: "password",
       roles: ["userAdminAnyDatabase"]
     })
   > exit

   # Enable authentication
   sudo nano /etc/mongod.conf
   # Add: security: authorization: enabled
   sudo systemctl restart mongodb
   ```

## 🐳 Docker Deployment

### Dockerfile for Backend

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Dockerfile for Frontend

```dockerfile
# client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: yugai-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./server
    container_name: yugai-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/yugai-chatapp?authSource=admin
      JWT_SECRET: your-jwt-secret
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./client
    container_name: yugai-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

### Backend Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yugai-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: yugai-backend
  template:
    metadata:
      labels:
        app: yugai-backend
    spec:
      containers:
      - name: backend
        image: your-registry/yugai-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: yugai-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: yugai-secrets
              key: jwt-secret
---
apiVersion: v1
kind: Service
metadata:
  name: yugai-backend-service
spec:
  selector:
    app: yugai-backend
  ports:
  - port: 5000
    targetPort: 5000
  type: ClusterIP
```

### Frontend Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yugai-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: yugai-frontend
  template:
    metadata:
      labels:
        app: yugai-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/yugai-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: yugai-frontend-service
spec:
  selector:
    app: yugai-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL in Cloudflare dashboard
4. Set SSL mode to "Full (strict)"

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs yugai-chatapp

# Restart application
pm2 restart yugai-chatapp
```

### Log Management

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/yugai-chatapp

/var/log/yugai-chatapp/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload yugai-chatapp
    endscript
}
```

## 🔧 Environment Variables

### Production Environment Variables

```env
# Server/.env.production
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yugai-chatapp
JWT_SECRET=your-super-secure-jwt-secret-for-production
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Client Environment Variables

```env
# client/.env.production
VITE_API_URL=https://your-backend-domain.com
VITE_APP_NAME=YUG-AI ChatApp
VITE_APP_VERSION=1.0.0
```

## 🚨 Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure JWT secrets
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Update dependencies regularly
- [ ] Monitor for vulnerabilities
- [ ] Implement proper logging
- [ ] Set up firewall rules
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication
- [ ] Implement proper backup strategy

## 📈 Performance Optimization

### Frontend Optimization

```bash
# Build with optimization
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets
```

### Backend Optimization

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd client && npm ci
        cd ../server && npm ci
        
    - name: Build frontend
      run: cd client && npm run build
      
    - name: Deploy to production
      run: |
        # Your deployment script here
```

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   sudo netstat -tulpn | grep :5000
   sudo kill -9 <PID>
   ```

2. **MongoDB connection issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongodb
   
   # Check logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. **Memory issues**
   ```bash
   # Check memory usage
   free -h
   
   # Restart PM2 if needed
   pm2 restart all
   ```

4. **SSL certificate issues**
   ```bash
   # Test SSL
   openssl s_client -connect your-domain.com:443
   
   # Renew certificate
   sudo certbot renew
   ```

---

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section
2. Review application logs
3. Open an issue on GitHub
4. Contact the development team

Remember to never commit sensitive information like API keys or database passwords to version control!

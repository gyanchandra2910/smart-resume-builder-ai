# 🚀 Deployment Guide

## Production Deployment Checklist

### 📋 Pre-Deployment

- [ ] Environment variables configured
- [ ] MongoDB connection string updated for production
- [ ] OpenAI API key added
- [ ] JWT secret configured
- [ ] Dependencies installed (`npm install`)
- [ ] Code tested locally

### 🌐 Platform-Specific Deployments

#### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-connection-string
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set OPENAI_API_KEY=your-openai-api-key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Production deployment"
   git push heroku main
   ```

#### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all required environment variables

#### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Choose Ubuntu/Amazon Linux
   - Configure security groups (ports 22, 80, 443, 5000)

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone your-repository-url
   cd smart-resume-builder-ai
   
   # Install dependencies
   npm install
   
   # Create environment file
   nano .env
   # Add your environment variables
   
   # Install PM2 for process management
   npm install -g pm2
   
   # Start application
   pm2 start server/index.js --name "smart-resume-builder"
   pm2 startup
   pm2 save
   ```

#### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 5000
   
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   # Build image
   docker build -t smart-resume-builder .
   
   # Run container
   docker run -d \
     -p 5000:5000 \
     -e MONGODB_URI=your-mongodb-uri \
     -e JWT_SECRET=your-jwt-secret \
     -e OPENAI_API_KEY=your-openai-key \
     --name smart-resume-builder \
     smart-resume-builder
   ```

### 🗄️ Database Setup

#### MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database user and password
4. Configure network access (allow your deployment IP)
5. Get connection string
6. Update `MONGODB_URI` in environment variables

#### Local MongoDB (Development)

```bash
# Install MongoDB locally
# Ubuntu/Debian
sudo apt-get install -y mongodb

# macOS
brew install mongodb/brew/mongodb-community

# Start MongoDB service
sudo systemctl start mongod
```

### 🔐 Security Considerations

#### Environment Variables
- Never commit `.env` file to version control
- Use strong, unique JWT secrets
- Rotate API keys regularly
- Use environment-specific variables

#### MongoDB Security
- Enable authentication
- Use strong passwords
- Restrict network access
- Enable SSL/TLS
- Regular backups

#### Application Security
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use secure headers

### 📊 Monitoring & Maintenance

#### Health Checks
```bash
# Check application status
curl http://your-domain.com/health

# Monitor logs
pm2 logs smart-resume-builder

# Restart application
pm2 restart smart-resume-builder
```

#### Performance Monitoring
- Set up application monitoring (New Relic, DataDog)
- Monitor database performance
- Set up alerts for downtime
- Regular performance audits

### 🔄 CI/CD Pipeline

#### GitHub Actions Example
```yaml
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
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

### 🚨 Troubleshooting

#### Common Issues

**Application won't start**
- Check environment variables
- Verify MongoDB connection
- Check port availability
- Review application logs

**AI features not working**
- Verify OpenAI API key
- Check API quota/billing
- Test API connectivity
- Review error logs

**Database connection issues**
- Verify connection string
- Check network connectivity
- Validate credentials
- Test from deployment environment

### 📈 Scaling Considerations

#### Horizontal Scaling
- Use load balancers
- Implement session management
- Database clustering
- CDN for static assets

#### Vertical Scaling
- Monitor resource usage
- Upgrade server specifications
- Optimize database queries
- Code optimization

---

**Remember to test thoroughly in a staging environment before production deployment!**

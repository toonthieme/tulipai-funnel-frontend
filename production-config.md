# Production Configuration Guide

## Environment Variables (.env.production)

```bash
# TulipAI Funnel - Production Environment
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tulipai_production?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-strong-random-secret-min-32-chars

# CORS (restrict to production domain only)
CORS_ORIGIN=https://funnel.tulipai.nl

# Email Configuration
EMAIL_FROM=noreply@tulipai.nl
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key

# Server Configuration
PORT=3003
```

## Quick Deployment Commands

### Build Frontend
```bash
cd frontend
npm install
npm run build
```

### Deploy Backend (Docker)
```bash
cd backend
docker build -t tulipai-backend .
docker run -d -p 3003:3003 --env-file .env.production tulipai-backend
```

### Deploy Backend (Node + PM2)
```bash
cd backend
npm install
npm run build
pm2 start dist/app.js --name tulipai-backend
```

## Security Checklist

- [ ] Change admin password from default
- [ ] Use strong JWT_SECRET (min 32 random chars)
- [ ] Restrict CORS to your domain only
- [ ] Use SendGrid/SES instead of Gmail
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules

## WordPress Integration

Add this to your WordPress page/post:

```html
<a href="https://funnel.tulipai.nl" 
   class="button button-primary" 
   target="_blank">
   Get Your AI Assessment
</a>
```

Or as a popup:
```html
<button onclick="window.open('https://funnel.tulipai.nl', 'funnel', 'width=1200,height=800')">
   Start AI Assessment
</button>
```



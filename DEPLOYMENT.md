# 🚀 TulipAI Funnel Deployment Guide

## Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up and create a **free M0 cluster**
3. **Database Access** → Add New Database User:
   - Username: `tulipai_user`
   - Password: Generate secure password (save it!)
   - Built-in Role: **Atlas admin**
4. **Network Access** → Add IP Address:
   - **Allow access from anywhere: 0.0.0.0/0** (temporary)
5. **Connect** → Connect your application:
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Database name: `tulipai_production`

**Example connection string:**
```
mongodb+srv://tulipai_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tulipai_production?retryWrites=true&w=majority
```

## Step 2: Backend Deployment (Render)

### GitHub Setup
```bash
cd backend
git init (if not already a git repo)
git add .
git commit -m "Production-ready backend"
git remote add origin https://github.com/yourusername/tulipai-backend.git
git push -u origin main
```

### Render Configuration
1. Go to [render.com](https://render.com) → Sign up
2. **New** → **Web Service**
3. Connect your GitHub repo
4. **Settings:**
   - **Runtime:** Node
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `node dist/app.js`
   - **Auto-Deploy:** Yes

### Environment Variables (Render → Environment)
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://tulipai_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tulipai_production?retryWrites=true&w=majority
JWT_SECRET=your-super-strong-random-secret-at-least-32-characters-long
CORS_ORIGIN=https://tulipai-funnel-frontend.vercel.app
EMAIL_FROM=noreply@tulipai.nl
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Your backend URL will be:** `https://tulipai-funnel-backend.onrender.com`

## Step 3: Frontend Deployment (Vercel)

### GitHub Setup
```bash
cd frontend
git init (if not already a git repo)
git add .
git commit -m "Production-ready frontend"
git remote add origin https://github.com/yourusername/tulipai-frontend.git
git push -u origin main
```

### Vercel Configuration
1. Go to [vercel.com](https://vercel.com) → Sign up
2. **New Project** → Import your frontend repo
3. **Framework Preset:** Vite (should auto-detect)
4. **Root Directory:** `./` (default)

### Environment Variables (Vercel → Settings → Environment Variables)
```bash
VITE_API_URL=https://tulipai-funnel-backend.onrender.com/api
```

**Your frontend URL will be:** `https://tulipai-funnel-frontend.vercel.app`

## Step 4: Test Everything

1. **Backend Health Check:**
   ```bash
   curl https://tulipai-funnel-backend.onrender.com/health
   ```

2. **Frontend Test:**
   - Open `https://tulipai-funnel-xxxx.vercel.app`
   - Complete a full submission
   - Check if emails are sent

3. **Admin Test:**
   - Login with `admin@tulipai.nl` / `admin123`
   - Generate and send a quote

## Step 5: Domain Setup

### Add Domain to Vercel
1. Vercel → Your Project → **Settings** → **Domains**
2. Add domain: `funnel.tulipai.nl`
3. Vercel will show DNS instructions

### DNS Configuration
Add this CNAME record at your domain provider:
```
Type: CNAME
Name: funnel
Value: cname.vercel-dns.com
TTL: Auto or 300
```

## Step 6: Security Lockdown

### Update CORS (after domain is live)
Update Render environment variable:
```bash
CORS_ORIGIN=https://tulipai-funnel-frontend.vercel.app
```

### Update Frontend API URL
Update Vercel environment variable:
```bash
VITE_API_URL=https://tulipai-funnel-backend.onrender.com/api
```

### Change Admin Password
1. Login to admin panel
2. Change password from default `admin123`

## Email Service Options

### SendGrid (Recommended)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Add to Render: `EMAIL_PASSWORD=your-sendgrid-api-key`

### Alternative: Resend
1. Sign up at [resend.com](https://resend.com)
2. Add domain `tulipai.nl`
3. Use these settings:
   ```bash
   EMAIL_HOST=smtp.resend.com
   EMAIL_PORT=587
   EMAIL_USER=resend
   EMAIL_PASSWORD=your-resend-api-key
   ```

## Final Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Backend deployed and health check passing
- [ ] Frontend deployed and loading
- [ ] End-to-end test completed
- [ ] Domain pointing to Vercel
- [ ] HTTPS working
- [ ] CORS restricted to production domain
- [ ] Admin password changed
- [ ] Email sending working
- [ ] WordPress integration link added

## Costs

- **MongoDB Atlas:** Free (M0 cluster)
- **Render:** Free tier for hobby projects
- **Vercel:** Free tier for personal projects
- **SendGrid:** Free tier (100 emails/day)

**Total: $0/month for low-traffic usage**



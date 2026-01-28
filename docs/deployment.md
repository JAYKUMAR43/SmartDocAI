# 🚀 Deployment Guide - SmartDocAI

Follow these steps to deploy SmartDocAI as a live website.

## ✅ Cross-Platform Compatibility

SmartDocAI now supports **both Windows and Linux** environments:

- **Windows (Local Development)**: Uses Microsoft Office COM automation for document conversions
- **Linux (Cloud Deployment)**: Uses LibreOffice for document conversions

The application automatically detects the platform and uses the appropriate conversion method.

---

## 1. Backend Deployment (Railway, Render, or DigitalOcean)

The backend is containerized using Docker with LibreOffice support.

### Option A: Railway (Recommended)

1. **Create Account**: Sign up at [Railway](https://railway.app/)
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Connect Repository**: Authorize and select your SmartDocAI repository
4. **Configure Service**:
   - **Root Directory**: Leave as `/` (Railway will auto-detect the Dockerfile)
   - **Dockerfile Path**: `backend/Dockerfile`
5. **Environment Variables**:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
   PORT=8000
   ```
6. **Deploy**: Railway will automatically build and deploy your backend
7. **Get URL**: Copy the generated URL (e.g., `https://smartdocai-backend.up.railway.app`)

### Option B: Render

1. **Create Account**: Sign up at [Render](https://render.com/)
2. **New Web Service**: Click "New" → "Web Service"
3. **Connect Repository**: Connect your GitHub repository
4. **Configure**:
   - **Name**: `smartdocai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Instance Type**: Free or Starter
5. **Environment Variables**: Same as Railway above
6. **Deploy**: Render will build from the Dockerfile

---

## 2. Frontend Deployment (Vercel)

The frontend is a Next.js application optimized for Vercel.

1. **Create Account**: Sign up at [Vercel](https://vercel.com/)
2. **Import Project**: Click "Add New" → "Project"
3. **Import Repository**: Select your SmartDocAI repository
4. **Configure Build**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
   ⚠️ **Important**: Replace with your actual backend URL from step 1
6. **Deploy**: Click "Deploy"
7. **Custom Domain** (Optional): Add your custom domain in project settings

---

## 3. Environment Setup

### Backend (.env)

Create a `.env` file in the `backend/` directory (use `.env.example` as template):

```env
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
PORT=8000
```

### Frontend (.env.local)

Create a `.env.local` file in the `frontend/` directory (use `.env.local.example` as template):

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 4. Local Testing (Optional)

Test the production build locally before deploying:

### Backend (Docker)
```bash
cd backend
docker build -t smartdoc-backend .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key smartdoc-backend
```

### Frontend (Production Build)
```bash
cd frontend
npm run build
npm start
```

Visit `http://localhost:3000` to test the production build.

---

## 5. Post-Deployment Verification

After deployment, verify everything works:

- [ ] Backend health check: `https://your-backend-url/health` returns `{"status": "ok"}`
- [ ] Frontend loads correctly
- [ ] File upload works
- [ ] PDF conversions work (merge, split, compress)
- [ ] Office conversions work (DOCX, Excel, PowerPoint to PDF)
- [ ] Image compression works
- [ ] Video compression works
- [ ] AI features work (chat, summarize, recreate)

---

## 6. Troubleshooting

### CORS Errors
- Ensure the frontend URL is **exactly** matched in `CORS_ORIGINS` (including `https://`)
- No trailing slashes in URLs
- Redeploy backend after changing environment variables

### AI Features Not Working
- Verify `GEMINI_API_KEY` is set correctly in backend environment
- Check API key has sufficient quota
- View backend logs for detailed error messages

### Document Conversion Failures
- **On Cloud**: LibreOffice is installed automatically via Dockerfile
- **On Windows**: Ensure Microsoft Office is installed for local development
- Check backend logs for conversion errors

### Build Failures
- **Backend**: Ensure Dockerfile path is correct (`backend/Dockerfile`)
- **Frontend**: Verify `NEXT_PUBLIC_API_URL` is set before build
- Check build logs for specific error messages

---

## 7. Updating Your Deployment

### Backend Updates
1. Push changes to GitHub
2. Railway/Render will automatically rebuild and redeploy

### Frontend Updates
1. Push changes to GitHub
2. Vercel will automatically rebuild and redeploy

### Manual Redeploy
- **Railway**: Click "Deploy" in the deployment tab
- **Render**: Click "Manual Deploy" → "Deploy latest commit"
- **Vercel**: Click "Redeploy" in the deployments tab

---

## 8. Cost Estimation

### Free Tier Limits
- **Railway**: $5 free credit/month, then pay-as-you-go
- **Render**: 750 hours/month free (enough for 1 service 24/7)
- **Vercel**: Unlimited deployments, 100GB bandwidth/month

### Recommended Setup (Free)
- Backend: Render Free Tier
- Frontend: Vercel Free Tier
- **Total Cost**: $0/month for moderate usage

---

## Need Help?

- Check backend logs in Railway/Render dashboard
- Check frontend logs in Vercel dashboard
- Ensure all environment variables are set correctly
- Test locally with Docker before deploying

# SmartDocAI - Railway Deployment Guide

This guide will walk you through deploying your SmartDocAI application to Railway using a **two-service architecture**: one for the FastAPI backend and one for the Next.js frontend.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **API Keys**: Have your Gemini and/or OpenAI API keys ready

---

## 🚀 Deployment Steps

### Step 1: Deploy the Backend Service

1. **Create New Project**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Authorize Railway to access your GitHub account
   - Select your `SmartDocAI` repository

2. **Configure Backend Service**
   - After selecting the repo, Railway will create a service
   - Click on the service settings (gear icon)
   - Update the following settings:

   **Root Directory**:
   ```
   backend
   ```

   **Build Command** (optional, Railway auto-detects):
   ```
   pip install -r requirements.txt
   ```

   **Start Command** (optional, uses Procfile):
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Set Environment Variables**
   - In the service settings, go to **"Variables"** tab
   - Add the following variables:

   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `GEMINI_API_KEY` | `your_actual_key` | Your Google Gemini API key |
   | `OPENAI_API_KEY` | `your_actual_key` | Your OpenAI API key (if using) |
   | `CORS_ORIGINS` | `*` | Allow all origins (update after frontend deployment) |
   | `PORT` | Auto-set by Railway | Don't manually set this |

4. **Deploy Backend**
   - Click **"Deploy"** or wait for auto-deployment
   - Monitor the build logs
   - Once deployed, note your backend URL (e.g., `https://smartdocai-backend-production.up.railway.app`)

5. **Verify Backend**
   - Visit `https://your-backend-url.railway.app/health`
   - You should see: `{"status": "ok"}`

---

### Step 2: Deploy the Frontend Service

1. **Add Frontend Service**
   - In your Railway project, click **"New"** → **"GitHub Repo"**
   - Select the **same** `SmartDocAI` repository
   - Railway will create a second service

2. **Configure Frontend Service**
   - Click on the new service settings
   - Update the following:

   **Root Directory**:
   ```
   frontend
   ```

   **Build Command** (optional, auto-detected):
   ```
   npm run build
   ```

   **Start Command** (optional, uses package.json):
   ```
   npm start
   ```

3. **Set Environment Variables**
   - Go to **"Variables"** tab
   - Add the following:

   | Variable Name | Value |
   |--------------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-url.railway.app` |

   > Replace `your-backend-url.railway.app` with your actual backend URL from Step 1

4. **Deploy Frontend**
   - Click **"Deploy"**
   - Wait for the build to complete
   - Note your frontend URL (e.g., `https://smartdocai-frontend-production.up.railway.app`)

---

### Step 3: Update CORS Settings

1. **Update Backend CORS**
   - Go back to your **backend service** in Railway
   - Update the `CORS_ORIGINS` environment variable:
   ```
   https://your-frontend-url.railway.app,http://localhost:3000
   ```
   - This allows your frontend to communicate with the backend
   - The backend will automatically redeploy

---

## ✅ Verification

### 1. Test Backend Health
```bash
curl https://your-backend-url.railway.app/health
```
Expected response:
```json
{"status": "ok"}
```

### 2. Test Frontend
- Visit your frontend URL in a browser
- Try uploading a file
- Check browser console for any CORS errors

### 3. Test Full Flow
- Upload a PDF and try compressing it
- Upload an image and try compressing it
- Test the PDF editor functionality

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` or dependency errors

**Solution**:
- Check the build logs in Railway
- Ensure `requirements.txt` is in the `backend` folder
- Some dependencies may need system libraries (Railway uses Nixpacks)

**Problem**: Backend crashes on startup

**Solution**:
- Check the deployment logs
- Verify all environment variables are set
- Check that `app/main.py` exists and is correct

### Frontend Issues

**Problem**: Build fails with "Module not found"

**Solution**:
- Ensure `package.json` is in the `frontend` folder
- Check that all dependencies are listed in `package.json`
- Try clearing Railway's build cache (in service settings)

**Problem**: Frontend can't connect to backend (CORS errors)

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Update backend `CORS_ORIGINS` to include your frontend URL
- Check browser console for exact error message

### File Upload Issues

**Problem**: File uploads fail or files are lost after deployment

**Solution**:
- Railway uses ephemeral storage (files are deleted on redeploy)
- For production, you'll need to add persistent storage:
  - Use Railway Volumes (for persistent disk)
  - Or use cloud storage (AWS S3, Google Cloud Storage, etc.)

---

## 📝 Important Notes

> [!WARNING]
> **Ephemeral Storage**: Railway's filesystem is ephemeral. Files uploaded to `backend/storage` will be deleted when the service restarts or redeploys. For production use, implement cloud storage (S3, GCS, etc.).

> [!IMPORTANT]
> **Environment Variables**: Never commit `.env` files with real API keys to GitHub. Always use Railway's environment variable settings.

> [!NOTE]
> **Free Tier Limits**: Railway's free tier includes $5 of usage per month. Monitor your usage to avoid unexpected charges.

---

## 🎯 Next Steps

1. **Add Persistent Storage**
   - Implement AWS S3 or Google Cloud Storage for file uploads
   - Update backend to use cloud storage instead of local filesystem

2. **Custom Domain** (Optional)
   - In Railway service settings, add your custom domain
   - Update CORS settings accordingly

3. **Monitoring**
   - Set up Railway's built-in monitoring
   - Add error tracking (Sentry, etc.)

4. **Database** (If needed)
   - Add a PostgreSQL database from Railway's marketplace
   - Update backend to use the database

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Nixpacks](https://nixpacks.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

## 🆘 Getting Help

If you encounter issues:

1. Check Railway's build and deployment logs
2. Review the troubleshooting section above
3. Check Railway's [Discord community](https://discord.gg/railway)
4. Review Railway's [status page](https://status.railway.app/)

---

**Deployment Complete!** 🎉

Your SmartDocAI application should now be live on Railway with both frontend and backend services running.

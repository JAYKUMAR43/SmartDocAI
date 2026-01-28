# 🚀 Deployment Guide - SmartDocAI

Follow these steps to deploy SmartDocAI as a live website.

## 1. Backend Deployment (Railway, Render, or DigitalOcean)

The backend is containerized using Docker.

1. **Host**: Create a new Web Service on [Railway](https://railway.app/) or [Render](https://render.com/).
2. **Repository**: Connect your GitHub repository.
3. **Environment Variables**:
   - `GEMINI_API_KEY`: Your Google AI Gemini key.
   - `CORS_ORIGINS`: `https://your-frontend-domain.vercel.app,http://localhost:3000`
   - `PORT`: `8000`
4. **Build Settings**: The service should automatically detect the `Dockerfile` in the `backend/` directory.

## 2. Frontend Deployment (Vercel)

The frontend is a Next.js application.

1. **Host**: Create a new project on [Vercel](https://vercel.com/).
2. **Repository**: Connect your GitHub repository.
3. **Root Directory**: Set to `frontend`.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.railway.app` (The URL provided by your backend host).
5. **Deploy**: Vercel will build and host your frontend.

## 3. Local Verification (Optional)

You can test the production build locally:

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend (Docker)
cd backend
docker build -t smartdoc-backend .
docker run -p 8000:8000 smartdoc-backend
```

## 4. Troubleshooting

- **CORS Error**: Ensure the frontend URL is exactly matched in the backend's `CORS_ORIGINS` variable.
- **AI Failure**: Check that the `GEMINI_API_KEY` is valid and correct in the backend environment.

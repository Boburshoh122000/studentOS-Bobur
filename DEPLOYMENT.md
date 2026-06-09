# StudentOS Deployment Guide 🚀

This guide outlines how to deploy the StudentOS platform (Frontend + Backend) to Railway using Docker. This approach bypasses local environment issues (like `EPERM` on macOS).

## Prerequisites

- GitHub account (where your code is hosted)
- Railway account

## 1. Backend Deployment

1.  **Create New Service** on Railway choose **GitHub Repo**.
2.  Select your repository.
3.  **Variables**: Add the following:
    - `DATABASE_URL`: Your PostgreSQL connection string (Railway can provision one for you).
    - `JWT_SECRET`: A long random string.
    - `PORT`: `5001` (or let Railway assign one, but code expects 5001 default).
    - `FRONTEND_URL`: URL of your frontend (add this _after_ deploying frontend).
4.  **Settings**:
    - **Root Directory**: `/backend`
    - **Dockerpath**: `Dockerfile` (should detect automatically)
5.  **Build & Deploy**: Railway will build the Docker verification.

## 2. Frontend Deployment

1.  **Create New Service** (Project > New > GitHub Repo).
2.  Select the **same repository**.
3.  **Settings**:
    - **Root Directory**: `/` (Repository Root)
    - **Dockerpath**: `Dockerfile.frontend`
4.  **Variables**:
    - `VITE_API_URL`: The URL of your **Backend Service** (e.g., `https://backend-production.up.railway.app/api`).
    - **IMPORTANT**: You must set this variable properly for the frontend to talk to the backend.
5.  **Build & Deploy**:
    - The Dockerfile uses `ARG` and `ENV` to burn the API URL into the static files during build.

## 3. Verify Connection

1.  Open your Frontend URL.
2.  Open **Developer Tools > Network**.
3.  Try to **Sign In**.
4.  Verify the request goes to your Backend URL (not localhost).

## Local Docker Testing (Optional)

If you want to test the build locally before pushing:

```bash
# Build Frontend
docker build -t studentos-frontend -f Dockerfile.frontend --build-arg VITE_API_URL=http://localhost:5001/api .

# Run Frontend (serves on $PORT, default 4173)
docker run -p 8080:4173 studentos-frontend
```

## Common Issues

- **CORS Errors**: Ensure `FRONTEND_URL` in Backend Variables matches your actual Frontend URL (no trailing slash).
- **Build Fails**: Check `npm ci` errors. If `package-lock.json` is out of sync, try changing `npm ci` to `npm install` in the Dockerfiles.

# Render Deployment Guide

## Issue: Cannot find module '/opt/render/project/src/dist/server.js'

This error occurs because Render isn't running the build step before starting the server.

## Solution

### Option 1: Using render.yaml (Recommended)

If you're using `render.yaml`, make sure it includes the build command:

```yaml
services:
  - type: web
    name: ecommerce-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

### Option 2: Configure in Render Dashboard

1. Go to your Render dashboard
2. Select your service
3. Go to **Settings** → **Build & Deploy**
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`
6. Save and redeploy

### Option 3: Update package.json scripts

You can also combine build and start in one command:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "deploy": "npm run build && npm start"
  }
}
```

Then set **Start Command** in Render to: `npm run deploy`

## Required Environment Variables

Make sure to set these in Render Dashboard → **Environment**:

- `NODE_ENV=production`
- `PORT=10000` (or let Render assign automatically)
- `MONGODB_URI=your-mongodb-connection-string`
- `JWT_SECRET=your-secret-key`
- `CORS_ORIGIN=your-frontend-url`
- `PARCEL2GO_API_KEY=optional`
- `GOCARDLESS_ACCESS_TOKEN=optional`

## Verify Build Output

After deployment, check that:
1. Build logs show: `✓ Compiled successfully`
2. The `dist` folder exists with `server.js`
3. No TypeScript compilation errors

## Troubleshooting

If build still fails:
1. Check that `typescript` is in `dependencies` (not just `devDependencies`)
2. Verify `tsconfig.json` has correct `outDir: "./dist"`
3. Check build logs for TypeScript errors


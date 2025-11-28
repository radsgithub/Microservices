# Fix CORS Error - Step by Step Guide

## Problem
You're getting a CORS error because the backend doesn't allow requests from your frontend domain.

## Solution: Update CORS_ORIGIN in Render

### Step 1: Find Your Frontend URL

What's your frontend deployed URL?
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`
- Local dev: `http://localhost:3001` or `http://localhost:3000`

### Step 2: Update Backend Environment Variable in Render

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Click on your backend service (e.g., `microservices-toro`)

2. **Go to Environment Tab**
   - Click on **Environment** in the left sidebar

3. **Add/Update CORS_ORIGIN**
   - Find `CORS_ORIGIN` variable (or add it if it doesn't exist)
   - Set the value to your frontend URL(s)

   **For Production Only:**
   ```
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

   **For Production + Local Development:**
   ```
   CORS_ORIGIN=https://your-frontend-domain.vercel.app,http://localhost:3001,http://localhost:3000
   ```

   **Important:** 
   - Use commas to separate multiple origins
   - No spaces after commas (or they'll be trimmed automatically)
   - Include the protocol (`https://` or `http://`)
   - No trailing slashes

4. **Save Changes**
   - Click **Save Changes**
   - Render will automatically redeploy your service

### Step 3: Wait for Redeploy

- Wait 1-2 minutes for the redeploy to complete
- Check the deploy logs to ensure it's successful

### Step 4: Test

1. Open your frontend in the browser
2. Open browser console (F12)
3. Try to make an API request (e.g., load products)
4. Check if CORS error is gone

## Example Configurations

### Example 1: Single Production URL
```
CORS_ORIGIN=https://glowtika.vercel.app
```

### Example 2: Multiple Origins (Production + Local)
```
CORS_ORIGIN=https://glowtika.vercel.app,http://localhost:3001,http://localhost:3000
```

### Example 3: Vercel Preview URLs (Advanced)
If you want to allow all Vercel preview deployments:
```
CORS_ORIGIN=https://glowtika.vercel.app,https://*.vercel.app,http://localhost:3001
```

## Troubleshooting

### Still Getting CORS Error?

1. **Verify the URL is exact:**
   - Check for typos
   - Ensure protocol matches (http vs https)
   - No trailing slashes

2. **Check Browser Console:**
   - Look at the exact error message
   - It will show which origin was blocked

3. **Verify Backend Redeployed:**
   - Check Render logs
   - Make sure the new environment variable is being used

4. **Test Backend Directly:**
   - Visit: `https://microservices-toro.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

5. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - Look at the failed request
   - Check the "Response Headers" for `Access-Control-Allow-Origin`

### Common Mistakes

❌ **Wrong:**
```
CORS_ORIGIN=https://glowtika.vercel.app/
```
(No trailing slash)

❌ **Wrong:**
```
CORS_ORIGIN=glowtika.vercel.app
```
(Missing protocol)

✅ **Correct:**
```
CORS_ORIGIN=https://glowtika.vercel.app
```

## Quick Test Command

After updating, test with curl:
```bash
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://microservices-toro.onrender.com/api/products
```

You should see `Access-Control-Allow-Origin` in the response headers.


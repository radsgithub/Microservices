# 🔴 URGENT: Update CORS_ORIGIN in Render NOW

## Your Frontend URL
```
https://glow-tika-mxl620423-radhikas-projects-1c20befc.vercel.app
```

## Step-by-Step Instructions

### 1. Go to Render Dashboard
- Open: https://dashboard.render.com
- Click on your backend service

### 2. Go to Environment Variables
- Click **Environment** in the left sidebar
- Scroll to find `CORS_ORIGIN` (or add it if missing)

### 3. Set This Exact Value

**Copy and paste this EXACTLY:**

```
https://glow-tika-mxl620423-radhikas-projects-1c20befc.vercel.app,http://localhost:3001,http://localhost:3000
```

**OR if you only want production (no local dev):**

```
https://glow-tika-mxl620423-radhikas-projects-1c20befc.vercel.app
```

### 4. Important Notes
- ✅ NO trailing slash after `.app`
- ✅ Include `https://`
- ✅ Use commas to separate multiple origins
- ✅ No spaces (they'll be trimmed automatically)

### 5. Save and Wait
- Click **Save Changes**
- Wait 1-2 minutes for automatic redeploy
- Check deploy logs to confirm it's running

### 6. Test
1. Refresh your frontend page
2. Open browser console (F12)
3. Try loading products
4. CORS error should be gone!

## If Still Not Working

### Check Backend Logs
1. Go to Render → Your Service → **Logs**
2. Look for CORS warnings
3. Verify the environment variable is being read

### Verify Environment Variable
The backend will log blocked origins. Check logs for:
```
CORS blocked origin: ...
```

### Test Backend Directly
Visit in browser:
```
https://microservices-toro.onrender.com/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Quick Verification

After updating, test with this curl command:
```bash
curl -H "Origin: https://glow-tika-mxl620423-radhikas-projects-1c20befc.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     -v \
     https://microservices-toro.onrender.com/api/products
```

You should see `Access-Control-Allow-Origin` in the response headers.


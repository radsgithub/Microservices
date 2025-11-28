# Verify CORS Configuration

## Check Render Environment Variable

1. **Go to Render Dashboard** → Your Service → **Environment**
2. **Verify CORS_ORIGIN is set to:**
   ```
   https://glow-tika-mxl620423-radhikas-projects-1c20befc.vercel.app,http://localhost:3001,http://localhost:3000
   ```

## Check Backend Logs

After the update, check your Render logs. You should now see detailed CORS logging:

```
CORS check - Origin: https://glow-tika-mxl620423-radhikas-projects-1c20befc.vercel.app, CORS_ORIGIN env: ...
CORS: Allowed origins: [...]
CORS: Allowing origin: ...
```

## Common Issues

### Issue 1: Environment Variable Not Set
- **Symptom**: Logs show `CORS_ORIGIN env: http://localhost:3000` (default value)
- **Fix**: Make sure `CORS_ORIGIN` is set in Render Environment tab

### Issue 2: Trailing Slash Mismatch
- **Symptom**: Origin has trailing slash but env variable doesn't (or vice versa)
- **Fix**: The code now handles this automatically, but make sure your env variable has NO trailing slash

### Issue 3: Wrong Protocol
- **Symptom**: Origin is `http://` but env has `https://` (or vice versa)
- **Fix**: Make sure protocol matches exactly

## Test After Update

1. **Check Logs** - Look for CORS logging messages
2. **Test Frontend** - Try loading products
3. **Check Console** - Should see no CORS errors

## If Still Blocked

The logs will now show:
- What origin was sent
- What origins are allowed
- Why it was blocked

Use this information to fix the mismatch.


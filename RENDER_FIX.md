# Render Deployment Fix

## Problem
Error: `Cannot find module '/opt/render/project/src/dist/server.js'`

The build step is not running, so `dist/server.js` doesn't exist.

## Solution

### Step 1: Update Render Dashboard Settings

Go to **Render Dashboard** → Your Service → **Settings** → **Build & Deploy**:

1. **Build Command**: 
   ```
   yarn install && yarn build
   ```
   OR
   ```
   npm install && npm run build
   ```

2. **Start Command**:
   ```
   yarn start
   ```
   OR
   ```
   npm start
   ```

### Step 2: Verify Root Directory

Make sure your **Root Directory** in Render is set to:
- If deploying from monorepo: `backend`
- If deploying backend separately: leave empty (root)

### Step 3: Check Build Logs

After redeploying, check the build logs. You should see:
```
✓ Compiled successfully
```

And verify that `dist/server.js` is created.

### Step 4: Alternative - Use postinstall script

The `package.json` now includes `"postinstall": "npm run build"` which will automatically build after `npm install` or `yarn install`.

**Important**: Make sure your **Build Command** in Render is:
```
yarn install
```
(not `yarn install && yarn build` since postinstall will handle the build)

OR if using npm:
```
npm install
```

### Step 5: If Still Failing

If the build still doesn't run, try this **Start Command**:
```
cd /opt/render/project/src && npm run build && npm start
```

But first, check:
1. Are build logs showing TypeScript compilation?
2. Is the `dist` folder being created?
3. What's the actual working directory in Render?

### Debugging

Add this to your `package.json` scripts temporarily:
```json
"debug": "pwd && ls -la && ls -la dist 2>&1 || echo 'dist folder not found'"
```

Then set **Start Command** to: `npm run debug` to see what's happening.


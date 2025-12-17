# How to Cancel In-Progress Deployment

If you see the error: "Deployment request failed due to in progress deployment", follow these steps:

## Option 1: Wait for Current Deployment (Easiest)

1. Go to: https://github.com/JiamingW-Official/5.Data_Visualization/actions
2. Find the workflow run that's currently running (yellow/orange indicator)
3. Wait 2-3 minutes for it to complete
4. Then run your new workflow

## Option 2: Cancel Current Deployment

1. Go to: https://github.com/JiamingW-Official/5.Data_Visualization/actions
2. Click on the **running** workflow (the one with yellow/orange status)
3. Click **"Cancel workflow"** button (top right)
4. Wait 10-15 seconds
5. Then run your new workflow

## Option 3: Use the Updated Workflow

I've updated the workflow to:
- Wait 15 seconds before deploying (gives time for previous to complete)
- Automatically retry if deployment fails
- Cancel previous runs automatically

Just commit and push the updated workflow, then run it again.

## Quick Fix Right Now

1. **Wait 2-3 minutes** for the current deployment to finish
2. Then go to Actions and click **"Run workflow"** again
3. The new workflow should work once the previous one completes

The error happens because GitHub Pages only allows one deployment at a time. Once the current one finishes, you can deploy again.


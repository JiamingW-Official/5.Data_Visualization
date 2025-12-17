# GitHub Pages Setup Checklist

Follow these steps to deploy your Market Sentiment Dashboard to GitHub Pages.

## ✅ Step 1: Enable GitHub Pages

1. Go to: https://github.com/JiamingW-Official/5.Data_Visualization/settings/pages
2. Under **Source**, select:
   - **Source**: `GitHub Actions` (NOT "Deploy from a branch")
3. Click **Save**

## ✅ Step 2: Commit and Push Files

Make sure all files are committed and pushed:

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

## ✅ Step 3: Verify Workflow Files

The following files should exist:
- ✅ `.github/workflows/deploy.yml` - Main deployment workflow
- ✅ `.github/workflows/update-data.yml` - Data update workflow
- ✅ `public/index.html` - Main HTML file
- ✅ `public/app.js` - Frontend JavaScript
- ✅ `public/calendar.js` - Calendar functionality
- ✅ `public/styles.css` - Styling
- ✅ `data/market-data.json` - Current market data
- ✅ `data/historical-data.json` - Historical data

## ✅ Step 4: Trigger First Deployment

1. Go to: https://github.com/JiamingW-Official/5.Data_Visualization/actions
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Select branch: `main`
5. Click **Run workflow**

## ✅ Step 5: Wait for Deployment

1. Watch the workflow run in the **Actions** tab
2. Wait for it to complete (usually 2-3 minutes)
3. Check for any errors in the workflow logs

## ✅ Step 6: Access Your Site

Once deployed, your site will be available at:
```
https://JiamingW-Official.github.io/5.Data_Visualization/
```

## ✅ Step 7: Verify Data

1. Open your site
2. Check that:
   - Calendar displays correctly
   - Charts load with data
   - Clicking calendar days shows details
   - All metrics display values

## 🔄 Automatic Updates

The site will automatically:
- **Deploy** daily at 6 PM UTC on weekdays
- **Update data** daily at 6:30 PM UTC on weekdays

You can also manually trigger updates from the **Actions** tab.

## 🐛 Troubleshooting

### Site shows 404
- Check that GitHub Pages is enabled (Step 1)
- Verify workflow completed successfully
- Wait a few minutes for DNS propagation

### No data showing
- Check that `data/historical-data.json` exists
- Verify workflow fetched data successfully
- Check browser console for errors

### Workflow fails
- Check workflow logs in **Actions** tab
- Verify Node.js version (should be 18+)
- Check that all dependencies are in `package.json`

### Data not updating
- Manually trigger "Update Market Data" workflow
- Check workflow logs for API errors
- Verify Yahoo Finance API is accessible

## 📝 Notes

- First deployment may take 5-10 minutes
- Data updates happen automatically after market close
- The site is fully static - no backend server needed
- All data is pre-fetched and stored in JSON files

## 🎉 Success!

Once everything is working, your dashboard will be live and automatically update daily!


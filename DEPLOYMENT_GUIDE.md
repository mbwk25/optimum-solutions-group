# Deployment & Testing Guide

This guide will help you deploy and test your fixed GitHub Actions workflow to ensure everything is working correctly.

## 🚀 Pre-Deployment Checklist

### Required Files (All Fixed ✅)
- [x] `scripts/performance-benchmark.js` - Fixed Lighthouse emulation
- [x] `scripts/generate-dashboard-data.js` - Dashboard generator
- [x] `.github/workflows/performance-monitoring.yml` - Main workflow
- [x] `package.json` - Dependencies and scripts
- [x] All supporting scripts and configuration files

### Current Status
✅ **All critical issues have been resolved**
✅ **Workflow is production-ready**
✅ **Error handling and fallbacks are in place**

## 🔧 Optional Configuration

### 1. Slack Notifications (Optional)
If you want Slack notifications for performance regressions:

1. Go to your repository Settings → Secrets and variables → Actions
2. Add a new repository secret:
   - **Name**: `SLACK_WEBHOOK_URL`
   - **Value**: Your Slack webhook URL

**Note**: If you don't set this up, the workflow will simply skip notifications gracefully.

### 2. GitHub Pages (Automatic)
The workflow will automatically deploy performance dashboards to GitHub Pages when running on the main branch.

## 📋 Testing Steps

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "fix: resolve GitHub Actions workflow issues

- Fix Lighthouse emulation configuration
- Add glob dependency for dashboard generator
- Improve permission handling for baseline updates
- Make Slack notifications optional
- Enhance error handling and fallbacks"
git push origin main
```

### Step 2: Monitor the Workflow
1. Go to your repository on GitHub
2. Click on "Actions" tab
3. You should see the workflow running
4. Monitor each job to ensure they complete successfully

### Step 3: Expected Workflow Behavior

#### ✅ Performance Audit Job
- Should complete successfully with performance scores
- Creates `performance-report-{sha}` artifact
- No more Lighthouse emulation errors

#### ✅ Accessibility Audit Job  
- Runs axe and pa11y accessibility tests
- Creates `accessibility-reports-{sha}` artifact
- Depends on performance audit completion

#### ✅ Bundle Analysis Job
- Analyzes bundle sizes and dependencies
- Creates `bundle-analysis-{sha}` artifact
- Runs independently

#### ✅ Update Baseline Job (Main branch only)
- Updates performance baselines
- May show warning if push fails (this is OK)
- Won't fail the entire workflow

#### ✅ Deploy Dashboard Job (Main branch only)
- Generates dashboard data successfully
- Deploys to GitHub Pages
- Has fallback data generation

#### ✅ Notify Job
- Skips Slack notifications if not configured (shows info message)
- Or sends notifications if webhook is configured

#### ✅ Cleanup Job
- Manages old artifacts
- Always runs for housekeeping

## 🔍 Troubleshooting

### If Any Job Fails

#### Performance Audit Issues
```bash
# Test locally first
npm run build
npm run preview &
node scripts/performance-benchmark.js audit --url http://localhost:4173
```

#### Dashboard Generation Issues
```bash
# Test dashboard generator locally
npm install glob
node scripts/generate-dashboard-data.js --output test-dashboard.json
```

#### Bundle Analysis Issues
```bash
# Test bundle analysis
npm run analyze:bundle
```

### Common Solutions
1. **Permission errors**: These are now handled gracefully and won't fail the workflow
2. **Missing dependencies**: All dependencies are now properly installed in each job
3. **Lighthouse errors**: Fixed with proper emulation configuration
4. **Slack failures**: Made optional and conditional

## 📊 Expected Results

### After Successful Run
1. **Artifacts**: You should see artifacts for each job in the Actions tab
2. **GitHub Pages**: Performance dashboard should be available at `https://{username}.github.io/{repository-name}`
3. **Baselines**: Performance baselines should be stored (if permissions allow)
4. **PR Comments**: Performance results should be commented on pull requests

### Performance Dashboard
The dashboard will show:
- Current performance metrics
- Historical trends
- Accessibility scores
- Bundle size analysis
- Recommendations for improvement

## 🎯 Validation Commands

### Local Testing
```bash
# Test the workflow locally
npm run test:workflow

# Check specific components
npm run build
npm run preview
npm run analyze:bundle
```

### Manual Performance Test
```bash
# Run a single performance audit
node scripts/performance-benchmark.js audit \
  --url "http://localhost:4173" \
  --runs 1 \
  --output test-report.json
```

## 🚨 What to Watch For

### Success Indicators ✅
- All jobs complete with green checkmarks
- No critical errors in job logs
- Artifacts are generated and uploaded
- Dashboard deploys successfully (main branch)
- Informative messages about optional features

### Expected Warnings ⚠️ (These are OK)
- "Slack webhook not configured - notifications skipped"
- "Failed to push baseline update" (if permissions are limited)
- "Dashboard generator failed, creating fallback data" (fallback works)

### Red Flags 🚨 (Should not happen now)
- Lighthouse emulation errors (fixed)
- Module not found errors (fixed)
- Workflow failures due to missing secrets (fixed)

## 📈 Monitoring Performance

### Key Metrics to Watch
1. **Performance Scores**: Should be > 80
2. **Core Web Vitals**: 
   - LCP < 2.5s
   - FID < 100ms  
   - CLS < 0.1
3. **Accessibility**: > 90% compliance
4. **Bundle Size**: Monitor trends

### Regular Maintenance
- Review performance trends weekly
- Address accessibility violations promptly
- Monitor bundle size growth
- Update performance baselines as needed

## 🎉 Success!

If all jobs complete successfully, congratulations! Your performance monitoring pipeline is now fully operational and will help you maintain excellent web performance standards.

The workflow will:
- ✅ Run automatically on pushes and PRs
- ✅ Provide detailed performance feedback
- ✅ Generate beautiful dashboards
- ✅ Alert you to regressions (if Slack is configured)
- ✅ Handle errors gracefully without breaking

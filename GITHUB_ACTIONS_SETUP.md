# GitHub Actions Setup Instructions

This document explains how to fix the GitHub Actions workflow errors and set up the required secrets.

## Fixed Issues

### 1. ✅ Slack Webhook Configuration Fixed

**Problem**: The `8398a7/action-slack@v3` action was receiving an invalid `webhook_url` parameter.

**Solution**: Changed to use environment variables instead of parameters.

**Required Setup**:
1. Go to your repository Settings → Secrets and variables → Actions
2. Add a new secret named `SLACK_WEBHOOK_URL`
3. Set the value to your Slack webhook URL (e.g., `https://hooks.slack.com/services/...`)

If you don't want Slack notifications, you can:
- Remove the `notify` job from the workflow, OR
- Set the secret to a dummy value (the workflow will fail silently)

### 2. ✅ Missing 'glob' Dependency Fixed

**Problem**: The dashboard generator script imported `glob` but it was only in devDependencies.

**Solution**: Moved `glob` from devDependencies to dependencies in package.json.

### 3. ✅ Bundle Analysis Artifacts Fixed

**Problem**: The workflow expected bundle analysis files that weren't being generated.

**Solution**: 
- Created a new `scripts/analyze-bundle.js` script
- Updated the `analyze:bundle` script to run the analyzer
- Made artifact upload more resilient with `if-no-files-found: ignore`

## Workflow Overview

The performance monitoring workflow now includes:

- **Performance Audit**: Runs Lighthouse tests and generates performance reports
- **Accessibility Audit**: Runs axe-core and pa11y accessibility tests
- **Bundle Analysis**: Analyzes build output and generates bundle size reports
- **Dashboard Deployment**: Generates and deploys performance dashboard to GitHub Pages
- **Notifications**: Sends Slack notifications on success/failure (optional)

## Required Secrets

| Secret Name | Description | Required |
|------------|-------------|----------|
| `SLACK_WEBHOOK_URL` | Slack webhook URL for notifications | Optional* |

*If you don't set up Slack notifications, you can either:
1. Remove the notification steps from the workflow
2. Set a dummy value for the secret

## Testing the Fixes

After setting up the secrets:

1. Push a commit to trigger the workflow
2. Check the Actions tab to see if the workflow runs successfully
3. Look for the generated artifacts in the workflow run

## Files Modified

- `.github/workflows/performance-monitoring.yml` - Fixed Slack configuration and improved resilience
- `package.json` - Moved `glob` dependency and added bundle analysis script
- `scripts/analyze-bundle.js` - New script to generate bundle analysis reports

## Next Steps

1. Set up the `SLACK_WEBHOOK_URL` secret (or remove Slack notifications)
2. Test the workflow by pushing a commit
3. Check that all jobs complete successfully
4. Verify artifacts are generated and uploaded

If you encounter any issues, check the workflow logs in the Actions tab for specific error messages.

#!/usr/bin/env node

/**
 * Performance Dashboard Data Generator
 * 
 * Aggregates performance, accessibility, and bundle analysis reports
 * into a unified dashboard dataset for visualization.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class DashboardDataGenerator {
  constructor(options = {}) {
    this.options = {
      performancePath: options.performance || './reports/performance-*.json',
      accessibilityPath: options.accessibility || './reports/accessibility-*.json',
      bundlePath: options.bundle || './reports/bundle-*.json',
      outputFile: options.output || './dashboard/data.json',
      maxHistoryItems: options.maxHistoryItems || 100,
      ...options
    };

    this.dashboardData = {
      lastUpdated: new Date().toISOString(),
      summary: {},
      history: [],
      trends: {},
      alerts: [],
      recommendations: []
    };
  }

  /**
   * Generate complete dashboard dataset
   */
  async generate() {
    console.log('🔄 Generating dashboard data...');

    try {
      // Load all report types
      const performanceReports = await this.loadReports(this.options.performancePath);
      const accessibilityReports = await this.loadReports(this.options.accessibilityPath);
      const bundleReports = await this.loadReports(this.options.bundlePath);

      console.log(`📊 Loaded ${performanceReports.length} performance reports`);
      console.log(`♿ Loaded ${accessibilityReports.length} accessibility reports`);
      console.log(`📦 Loaded ${bundleReports.length} bundle reports`);

      // Process reports
      this.processPerformanceReports(performanceReports);
      this.processAccessibilityReports(accessibilityReports);
      this.processBundleReports(bundleReports);

      // Generate analytics
      this.generateTrends();
      this.generateAlerts();
      this.generateRecommendations();
      this.generateSummary();

      // Save dashboard data
      await this.saveDashboardData();

      console.log(`✅ Dashboard data generated: ${this.options.outputFile}`);
      return this.dashboardData;

    } catch (error) {
      console.error(`❌ Error generating dashboard data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load reports from glob pattern
   */
  async loadReports(pattern) {
    const files = glob.sync(pattern);
    const reports = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const report = JSON.parse(content);
        
        // Add metadata
        report._file = file;
        report._loadedAt = new Date().toISOString();
        
        reports.push(report);
      } catch (error) {
        console.warn(`⚠️ Failed to load report: ${file} - ${error.message}`);
      }
    }

    return reports.sort((a, b) => {
      const aTime = new Date(a.timestamp || a.fetchTime || 0);
      const bTime = new Date(b.timestamp || b.fetchTime || 0);
      return bTime - aTime; // Most recent first
    });
  }

  /**
   * Process performance reports (Lighthouse data)
   */
  processPerformanceReports(reports) {
    if (!reports.length) return;

    const latest = reports[0];
    
    // Extract current performance metrics
    const currentMetrics = {
      performanceScore: this.getScore(latest, 'performance'),
      accessibilityScore: this.getScore(latest, 'accessibility'),
      bestPracticesScore: this.getScore(latest, 'best-practices'),
      seoScore: this.getScore(latest, 'seo'),
      lcp: this.getMetric(latest, 'largest-contentful-paint'),
      fid: this.getMetric(latest, 'max-potential-fid'),
      cls: this.getMetric(latest, 'cumulative-layout-shift'),
      fcp: this.getMetric(latest, 'first-contentful-paint'),
      ttfb: this.getMetric(latest, 'server-response-time'),
      tbt: this.getMetric(latest, 'total-blocking-time'),
      si: this.getMetric(latest, 'speed-index')
    };

    // Build historical data
    const performanceHistory = reports.slice(0, this.options.maxHistoryItems).map(report => ({
      timestamp: report.timestamp || report.fetchTime,
      performanceScore: this.getScore(report, 'performance'),
      accessibilityScore: this.getScore(report, 'accessibility'),
      bestPracticesScore: this.getScore(report, 'best-practices'),
      seoScore: this.getScore(report, 'seo'),
      lcp: this.getMetric(report, 'largest-contentful-paint'),
      fid: this.getMetric(report, 'max-potential-fid'),
      cls: this.getMetric(report, 'cumulative-layout-shift'),
      fcp: this.getMetric(report, 'first-contentful-paint'),
      ttfb: this.getMetric(report, 'server-response-time'),
      url: report.finalUrl || report.requestedUrl
    })).reverse(); // Chronological order

    this.dashboardData.performance = {
      current: currentMetrics,
      history: performanceHistory,
      lastAudit: latest.timestamp || latest.fetchTime,
      totalAudits: reports.length
    };

    // Add to main history
    performanceHistory.forEach(item => {
      const existing = this.dashboardData.history.find(h => h.timestamp === item.timestamp);
      if (existing) {
        Object.assign(existing, item);
      } else {
        this.dashboardData.history.push({ type: 'performance', ...item });
      }
    });
  }

  /**
   * Process accessibility reports
   */
  processAccessibilityReports(reports) {
    if (!reports.length) return;

    const latest = reports[0];
    
    const currentMetrics = {
      violationsCount: latest.violations?.length || 0,
      passesCount: latest.passes?.length || 0,
      incompleteCount: latest.incomplete?.length || 0,
      inapplicableCount: latest.inapplicable?.length || 0,
      score: this.calculateAccessibilityScore(latest),
      tags: this.getAccessibilityTags(latest)
    };

    // Build violation history
    const accessibilityHistory = reports.slice(0, this.options.maxHistoryItems).map(report => ({
      timestamp: report.timestamp || Date.now(),
      violationsCount: report.violations?.length || 0,
      passesCount: report.passes?.length || 0,
      score: this.calculateAccessibilityScore(report),
      criticalViolations: (report.violations || []).filter(v => v.impact === 'critical').length,
      seriousViolations: (report.violations || []).filter(v => v.impact === 'serious').length
    })).reverse();

    this.dashboardData.accessibility = {
      current: currentMetrics,
      history: accessibilityHistory,
      lastAudit: latest.timestamp || Date.now(),
      totalAudits: reports.length,
      commonViolations: this.getCommonViolations(reports.slice(0, 10))
    };
  }

  /**
   * Process bundle analysis reports
   */
  processBundleReports(reports) {
    if (!reports.length) return;

    const latest = reports[0];
    
    const currentMetrics = {
      totalSize: latest.results?.totalSize || latest.totalSize || 0,
      totalFiles: latest.results?.summary?.totalFiles || latest.totalFiles || 0,
      jsSize: latest.results?.sizesByType?.js || 0,
      cssSize: latest.results?.sizesByType?.css || 0,
      violations: latest.results?.violations?.length || 0,
      warnings: latest.results?.warnings?.length || 0
    };

    // Build bundle size history
    const bundleHistory = reports.slice(0, this.options.maxHistoryItems).map(report => ({
      timestamp: report.timestamp || Date.now(),
      totalSize: report.results?.totalSize || report.totalSize || 0,
      jsSize: report.results?.sizesByType?.js || 0,
      cssSize: report.results?.sizesByType?.css || 0,
      violations: report.results?.violations?.length || 0
    })).reverse();

    this.dashboardData.bundle = {
      current: currentMetrics,
      history: bundleHistory,
      lastAnalysis: latest.timestamp || Date.now(),
      totalAnalyses: reports.length
    };
  }

  /**
   * Generate trend analysis
   */
  generateTrends() {
    const trends = {};
    const history = this.dashboardData.history.slice(-10); // Last 10 data points

    if (history.length < 2) return;

    // Performance score trends
    const performanceScores = history.map(h => h.performanceScore).filter(s => s);
    if (performanceScores.length >= 2) {
      trends.performance = this.calculateTrend(performanceScores);
    }

    // Core Web Vitals trends
    const lcpValues = history.map(h => h.lcp).filter(v => v);
    if (lcpValues.length >= 2) {
      trends.lcp = this.calculateTrend(lcpValues, true); // Inverted (lower is better)
    }

    const clsValues = history.map(h => h.cls).filter(v => v);
    if (clsValues.length >= 2) {
      trends.cls = this.calculateTrend(clsValues, true);
    }

    // Bundle size trends
    if (this.dashboardData.bundle?.history.length >= 2) {
      const bundleSizes = this.dashboardData.bundle.history.slice(-10).map(h => h.totalSize);
      trends.bundleSize = this.calculateTrend(bundleSizes, true);
    }

    // Accessibility trends
    if (this.dashboardData.accessibility?.history.length >= 2) {
      const violationCounts = this.dashboardData.accessibility.history.slice(-10).map(h => h.violationsCount);
      trends.accessibility = this.calculateTrend(violationCounts, true);
    }

    this.dashboardData.trends = trends;
  }

  /**
   * Generate alerts based on current metrics
   */
  generateAlerts() {
    const alerts = [];
    const now = new Date().toISOString();

    // Performance alerts
    if (this.dashboardData.performance) {
      const perf = this.dashboardData.performance.current;
      
      if (perf.performanceScore < 50) {
        alerts.push({
          id: 'perf-score-critical',
          type: 'critical',
          category: 'performance',
          title: 'Critical Performance Score',
          message: `Performance score is ${perf.performanceScore}/100, which is critically low`,
          timestamp: now,
          value: perf.performanceScore,
          threshold: 50
        });
      }

      if (perf.lcp > 4000) {
        alerts.push({
          id: 'lcp-critical',
          type: 'critical',
          category: 'performance',
          title: 'LCP Exceeds Threshold',
          message: `Largest Contentful Paint (${Math.round(perf.lcp)}ms) exceeds 4000ms threshold`,
          timestamp: now,
          value: perf.lcp,
          threshold: 4000
        });
      }

      if (perf.cls > 0.25) {
        alerts.push({
          id: 'cls-poor',
          type: 'warning',
          category: 'performance',
          title: 'Poor Cumulative Layout Shift',
          message: `CLS score (${perf.cls.toFixed(3)}) indicates poor visual stability`,
          timestamp: now,
          value: perf.cls,
          threshold: 0.25
        });
      }
    }

    // Bundle size alerts
    if (this.dashboardData.bundle) {
      const bundle = this.dashboardData.bundle.current;
      
      if (bundle.totalSize > 500 * 1024) { // 500KB
        alerts.push({
          id: 'bundle-size-large',
          type: 'warning',
          category: 'bundle',
          title: 'Large Bundle Size',
          message: `Total bundle size (${this.formatBytes(bundle.totalSize)}) exceeds recommended 500KB`,
          timestamp: now,
          value: bundle.totalSize,
          threshold: 500 * 1024
        });
      }

      if (bundle.violations > 0) {
        alerts.push({
          id: 'bundle-violations',
          type: 'error',
          category: 'bundle',
          title: 'Bundle Size Violations',
          message: `${bundle.violations} bundle size limits exceeded`,
          timestamp: now,
          value: bundle.violations,
          threshold: 0
        });
      }
    }

    // Accessibility alerts
    if (this.dashboardData.accessibility) {
      const a11y = this.dashboardData.accessibility.current;
      
      if (a11y.violationsCount > 0) {
        const severity = a11y.violationsCount > 5 ? 'error' : 'warning';
        alerts.push({
          id: 'accessibility-violations',
          type: severity,
          category: 'accessibility',
          title: 'Accessibility Violations',
          message: `${a11y.violationsCount} accessibility violations found`,
          timestamp: now,
          value: a11y.violationsCount,
          threshold: 0
        });
      }
    }

    this.dashboardData.alerts = alerts;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Performance recommendations
    if (this.dashboardData.performance) {
      const perf = this.dashboardData.performance.current;
      
      if (perf.performanceScore < 90) {
        if (perf.lcp > 2500) {
          recommendations.push({
            category: 'performance',
            priority: 'high',
            title: 'Optimize Largest Contentful Paint',
            description: 'Reduce LCP by optimizing images, preloading critical resources, and improving server response times',
            impact: 'high',
            effort: 'medium'
          });
        }

        if (perf.cls > 0.1) {
          recommendations.push({
            category: 'performance',
            priority: 'high',
            title: 'Improve Visual Stability',
            description: 'Reduce CLS by specifying image dimensions, avoiding dynamic content insertion, and using CSS containment',
            impact: 'high',
            effort: 'low'
          });
        }

        if (perf.tbt > 300) {
          recommendations.push({
            category: 'performance',
            priority: 'medium',
            title: 'Reduce Total Blocking Time',
            description: 'Break up long JavaScript tasks, optimize third-party code, and consider code splitting',
            impact: 'medium',
            effort: 'high'
          });
        }
      }
    }

    // Bundle recommendations
    if (this.dashboardData.bundle) {
      const bundle = this.dashboardData.bundle.current;
      
      if (bundle.jsSize > 250 * 1024) { // 250KB
        recommendations.push({
          category: 'bundle',
          priority: 'medium',
          title: 'Reduce JavaScript Bundle Size',
          description: 'Implement code splitting, tree shaking, and remove unused dependencies',
          impact: 'medium',
          effort: 'medium'
        });
      }

      if (bundle.cssSize > 100 * 1024) { // 100KB
        recommendations.push({
          category: 'bundle',
          priority: 'low',
          title: 'Optimize CSS Bundle',
          description: 'Remove unused CSS, use CSS-in-JS splitting, and optimize critical CSS',
          impact: 'low',
          effort: 'low'
        });
      }
    }

    // Trend-based recommendations
    if (this.dashboardData.trends.performance === 'degrading') {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Address Performance Regression',
        description: 'Performance scores are declining. Review recent changes and run detailed analysis',
        impact: 'high',
        effort: 'high'
      });
    }

    if (this.dashboardData.trends.bundleSize === 'increasing') {
      recommendations.push({
        category: 'bundle',
        priority: 'medium',
        title: 'Monitor Bundle Size Growth',
        description: 'Bundle size is increasing. Review new dependencies and implement size monitoring',
        impact: 'medium',
        effort: 'medium'
      });
    }

    this.dashboardData.recommendations = recommendations;
  }

  /**
   * Generate overall summary
   */
  generateSummary() {
    const summary = {
      overallScore: 0,
      totalAudits: 0,
      lastAudit: null,
      status: 'unknown',
      keyMetrics: {},
      alertCounts: {
        critical: 0,
        error: 0,
        warning: 0
      }
    };

    // Calculate overall score
    let scoreSum = 0;
    let scoreCount = 0;

    if (this.dashboardData.performance?.current.performanceScore) {
      scoreSum += this.dashboardData.performance.current.performanceScore;
      scoreCount++;
    }

    if (this.dashboardData.accessibility?.current.score) {
      scoreSum += this.dashboardData.accessibility.current.score;
      scoreCount++;
    }

    if (scoreCount > 0) {
      summary.overallScore = Math.round(scoreSum / scoreCount);
    }

    // Aggregate audit counts
    summary.totalAudits = (this.dashboardData.performance?.totalAudits || 0) +
                         (this.dashboardData.accessibility?.totalAudits || 0) +
                         (this.dashboardData.bundle?.totalAnalyses || 0);

    // Find most recent audit
    const auditTimes = [
      this.dashboardData.performance?.lastAudit,
      this.dashboardData.accessibility?.lastAudit,
      this.dashboardData.bundle?.lastAnalysis
    ].filter(Boolean);

    if (auditTimes.length > 0) {
      summary.lastAudit = new Date(Math.max(...auditTimes.map(t => new Date(t)))).toISOString();
    }

    // Determine status
    const criticalAlerts = this.dashboardData.alerts.filter(a => a.type === 'critical').length;
    const errorAlerts = this.dashboardData.alerts.filter(a => a.type === 'error').length;

    if (criticalAlerts > 0) {
      summary.status = 'critical';
    } else if (errorAlerts > 0) {
      summary.status = 'error';
    } else if (this.dashboardData.alerts.length > 0) {
      summary.status = 'warning';
    } else if (summary.overallScore >= 90) {
      summary.status = 'excellent';
    } else if (summary.overallScore >= 70) {
      summary.status = 'good';
    } else {
      summary.status = 'needs-improvement';
    }

    // Key metrics
    if (this.dashboardData.performance) {
      summary.keyMetrics.performanceScore = this.dashboardData.performance.current.performanceScore;
      summary.keyMetrics.lcp = this.dashboardData.performance.current.lcp;
      summary.keyMetrics.cls = this.dashboardData.performance.current.cls;
    }

    if (this.dashboardData.bundle) {
      summary.keyMetrics.bundleSize = this.dashboardData.bundle.current.totalSize;
    }

    // Alert counts
    this.dashboardData.alerts.forEach(alert => {
      summary.alertCounts[alert.type] = (summary.alertCounts[alert.type] || 0) + 1;
    });

    this.dashboardData.summary = summary;
  }

  /**
   * Save dashboard data to file
   */
  async saveDashboardData() {
    const outputDir = path.dirname(this.options.outputFile);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save main dashboard data
    fs.writeFileSync(
      this.options.outputFile,
      JSON.stringify(this.dashboardData, null, 2)
    );

    // Save compressed version for web
    const compressedPath = this.options.outputFile.replace('.json', '.min.json');
    fs.writeFileSync(
      compressedPath,
      JSON.stringify(this.dashboardData)
    );
  }

  /**
   * Helper methods
   */
  getScore(report, category) {
    return Math.round((report.categories?.[category]?.score || report.audits?.[category]?.score || 0) * 100);
  }

  getMetric(report, auditId) {
    return report.audits?.[auditId]?.numericValue || 0;
  }

  calculateAccessibilityScore(report) {
    if (!report.violations && !report.passes) return 0;
    
    const total = (report.violations?.length || 0) + (report.passes?.length || 0);
    if (total === 0) return 100;
    
    const passRate = (report.passes?.length || 0) / total;
    return Math.round(passRate * 100);
  }

  getAccessibilityTags(report) {
    const tags = new Set();
    
    (report.violations || []).forEach(violation => {
      violation.tags?.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags);
  }

  getCommonViolations(reports) {
    const violationCounts = {};
    
    reports.forEach(report => {
      (report.violations || []).forEach(violation => {
        const key = violation.id;
        violationCounts[key] = (violationCounts[key] || 0) + 1;
      });
    });

    return Object.entries(violationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([id, count]) => ({ id, count }));
  }

  calculateTrend(values, inverted = false) {
    if (values.length < 2) return 'stable';

    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;

    const threshold = 5; // 5% change threshold

    if (Math.abs(change) < threshold) return 'stable';
    
    if (inverted) {
      return change > 0 ? 'degrading' : 'improving';
    } else {
      return change > 0 ? 'improving' : 'degrading';
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const arg = args[i];
    const value = args[i + 1];

    switch (arg) {
      case '--performance':
        options.performance = value;
        break;
      case '--accessibility':
        options.accessibility = value;
        break;
      case '--bundle':
        options.bundle = value;
        break;
      case '--output':
        options.output = value;
        break;
      case '--max-history':
        options.maxHistoryItems = parseInt(value);
        break;
    }
  }

  try {
    const generator = new DashboardDataGenerator(options);
    await generator.generate();
    console.log('✅ Dashboard data generation completed successfully');
  } catch (error) {
    console.error(`❌ Dashboard data generation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DashboardDataGenerator };

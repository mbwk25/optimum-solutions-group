/**
 * @fileoverview Error Reporting Domain Service
 * @description Business logic for error reporting and analysis
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { ErrorContext, isBrowserErrorContext, isUserErrorContext, isNetworkErrorContext } from '../types/errorContext';

export interface ErrorReport {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'browser' | 'user' | 'network' | 'promise' | 'resource';
  context: ErrorContext;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  sessionId?: string;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: ErrorReport[];
  errorTrend: Array<{ date: string; count: number }>;
}

export class ErrorReportingService {
  private reports: ErrorReport[] = [];
  private readonly maxReports = 1000;

  /**
   * Report an error with business logic for categorization and severity
   */
  reportError(error: Error, context: ErrorContext): ErrorReport {
    const userAgent: string | undefined = this.extractUserAgent(context);
    const url: string | undefined = this.extractUrl(context);
    const sessionId: string | undefined = this.extractSessionId(context);

    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      severity: this.calculateSeverity(error, context),
      category: this.categorizeError(context),
      context,
      ...(error.stack && { stackTrace: error.stack }),
      ...(userAgent && { userAgent }),
      ...(url && { url }),
      ...(sessionId && { sessionId }),
    };

    this.addReport(report);
    return report;
  }

  /**
   * Get error analytics for business insights
   */
  getAnalytics(): ErrorAnalytics {
    const now: Date = new Date();
    const last24Hours: Date = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentErrors: ErrorReport[] = this.reports.filter(
      (report: ErrorReport) => new Date(report.timestamp) > last24Hours
    );

    return {
      totalErrors: this.reports.length,
      errorsByCategory: this.groupByCategory(this.reports),
      errorsBySeverity: this.groupBySeverity(this.reports),
      recentErrors: recentErrors.slice(-10), // Last 10 errors
      errorTrend: this.calculateErrorTrend(),
    };
  }

  /**
   * Get errors by category for targeted analysis
   */
  getErrorsByCategory(category: string): ErrorReport[] {
    return this.reports.filter((report: ErrorReport) => report.category === category);
  }

  /**
   * Get critical errors that need immediate attention
   */
  getCriticalErrors(): ErrorReport[] {
    return this.reports.filter((report: ErrorReport) => report.severity === 'critical');
  }

  /**
   * Clear old reports to prevent memory issues
   */
  cleanup(): void {
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, this.maxReports);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Business logic for severity calculation
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'low'; // Chunk loading errors are usually not critical
    }

    if (isBrowserErrorContext(context)) {
      if (context.filename?.includes('vendor') || context.filename?.includes('chunk')) {
        return 'medium';
      }
      return 'high';
    }

    if (isUserErrorContext(context)) {
      if (context.action?.includes('click') || context.action?.includes('scroll')) {
        return 'low';
      }
      return 'medium';
    }

    if (isNetworkErrorContext(context)) {
      if (context.statusCode && context.statusCode >= 500) {
        return 'critical';
      }
      if (context.statusCode && context.statusCode >= 400) {
        return 'high';
      }
      return 'medium';
    }

    return 'medium';
  }

  private categorizeError(context: ErrorContext): 'browser' | 'user' | 'network' | 'promise' | 'resource' {
    if (isBrowserErrorContext(context)) return 'browser';
    if (isUserErrorContext(context)) return 'user';
    if (isNetworkErrorContext(context)) return 'network';
    if ('reason' in context) return 'promise';
    if ('resourceType' in context) return 'resource';
    return 'browser'; // Default fallback
  }

  private extractUserAgent(context: ErrorContext): string | undefined {
    if ('userAgent' in context) return context.userAgent;
    return typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
  }

  private extractUrl(context: ErrorContext): string | undefined {
    if ('url' in context) return context.url;

    if (
      typeof window !== 'undefined' &&
      typeof window.location === 'object' &&
      typeof window.location.href === 'string'
    ) {
      return window.location.href;
    }

    return undefined;
  }

  private extractSessionId(context: ErrorContext): string | undefined {
    if ('sessionId' in context) return context.sessionId;
    try {
      return typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('sessionId') || undefined
        : undefined;
    } catch {
      return undefined;
    }
  }

  private addReport(report: ErrorReport): void {
    this.reports.unshift(report); // Add to beginning for recent first
    this.cleanup();
  }

  private groupByCategory(reports: ErrorReport[]): Record<string, number> {
    return reports.reduce((acc: Record<string, number>, report: ErrorReport) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupBySeverity(reports: ErrorReport[]): Record<string, number> {
    return reports.reduce((acc: Record<string, number>, report: ErrorReport) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateErrorTrend(): Array<{ date: string; count: number }> {
    const last7Days: string[] = Array.from({ length: 7 }, (_, i: number) => {
      const date: Date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0]!;
    }).reverse();

    return last7Days.map((date: string) => {
      return {
        date,
        count: this.reports.filter((report: ErrorReport) =>
          report.timestamp.startsWith(date)
        ).length
      };
    });
  }
}

// Singleton instance
export const errorReportingService = new ErrorReportingService();

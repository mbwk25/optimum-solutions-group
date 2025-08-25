/**
 * Analytics Page
 * 
 * Displays the analytics dashboard for monitoring user behavior,
 * performance metrics, and site insights.
 */

import React from 'react';
import AnalyticsDashboard from '@/shared/components/AnalyticsDashboard';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/shared/hooks/useAnalytics';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Track page view for analytics page
  const { trackEvent } = useAnalytics({
    pageTitle: 'Analytics Dashboard',
    pageCategory: 'admin',
    trackPageViews: true,
  });

  const handleBackToHome = () => {
    trackEvent('navigation', 'back_to_home', 'analytics_page');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Optimum Solutions Group</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsDashboard
          timeRange="24h"
          autoRefresh={true}
          refreshInterval={30000}
          compact={false}
          showExportOptions={true}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Analytics dashboard powered by OSG Analytics Service
            </div>
            <div className="text-sm text-gray-400">
              Data refreshes automatically every 30 seconds
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsPage;

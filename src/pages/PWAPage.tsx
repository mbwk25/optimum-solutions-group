/**
 * PWA Features Page
 * 
 * Comprehensive page showcasing Progressive Web App capabilities,
 * installation instructions, and features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Smartphone, 
  Download,
  Wifi,
  WifiOff,
  Zap,
  Bell,
  Home,
  Layers,
  CheckCircle,
  XCircle,
  Info,
  Gauge,
  Shield,
  RefreshCw,
  Star,
  Globe,
  Monitor,
  Tablet,
  PhoneCall
} from 'lucide-react';
import { useAnalytics } from '@/shared/hooks/useAnalytics';
import PWAInstallPrompt from '@/shared/components/PWAInstallPrompt';
import { usePWAStatus } from '@/shared/hooks/usePWAStatus';
import Navigation from '@/features/navigation/Navigation';
import SEOHead from '@/shared/components/optimized/SEOHead';

// =========================== MAIN PAGE COMPONENT ===========================

const PWAPage: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const pwaStatus = usePWAStatus();
  
  const { trackEvent } = useAnalytics({
    pageTitle: 'PWA Features - Optimum Solutions Group',
    pageCategory: 'pwa',
    trackPageViews: true,
    trackClicks: true,
  });

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(true);
      trackEvent('pwa', 'network_online', 'connectivity_restored');
    };
    
    const handleOffline = () => {
      setNetworkStatus(false);
      trackEvent('pwa', 'network_offline', 'connectivity_lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [trackEvent]);

  // =========================== FEATURE DATA ===========================

  const pwaFeatures = [
    {
      icon: Wifi,
      title: 'Offline Functionality',
      description: 'Access core features even without an internet connection',
      status: pwaStatus.supportsOffline,
      details: 'Our service worker caches essential resources and data, allowing you to browse content, view previously loaded pages, and access key features even when offline.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast Loading',
      description: 'Instant app-like performance with smart caching',
      status: pwaStatus.hasServiceWorker,
      details: 'Pre-cached resources and optimized loading strategies ensure your app starts instantly, even on slow networks.',
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Stay updated with important alerts and news',
      status: pwaStatus.supportsNotifications,
      details: 'Receive timely notifications about project updates, new features, and important announcements, even when the app is closed.',
    },
    {
      icon: Home,
      title: 'Add to Home Screen',
      description: 'Install directly to your device for quick access',
      status: pwaStatus.canInstall || pwaStatus.isInstalled,
      details: 'Add our app to your home screen for native app-like experience with no app store required.',
    },
    {
      icon: Layers,
      title: 'Full Screen Experience',
      description: 'Immersive interface without browser chrome',
      status: pwaStatus.isStandalone,
      details: 'When installed, the app runs in full-screen mode, providing more screen real estate and a native app feel.',
    },
    {
      icon: RefreshCw,
      title: 'Background Sync',
      description: 'Automatically sync data when connection is restored',
      status: pwaStatus.supportsOffline,
      details: 'Forms and data submitted while offline are automatically synced when your connection is restored.',
    },
  ];

  const installationGuides = [
    {
      platform: 'Chrome (Desktop)',
      icon: Monitor,
      steps: [
        'Look for the install icon in the address bar',
        'Click "Install Optimum Solutions Group"',
        'Confirm installation in the popup',
        'App will be added to your desktop and start menu',
      ],
    },
    {
      platform: 'Chrome (Android)',
      icon: Smartphone,
      steps: [
        'Tap the menu (three dots) in Chrome',
        'Select "Add to Home screen"',
        'Confirm the app name and tap "Add"',
        'App icon will appear on your home screen',
      ],
    },
    {
      platform: 'Safari (iOS)',
      icon: PhoneCall,
      steps: [
        'Tap the Share button at the bottom',
        'Scroll down and tap "Add to Home Screen"',
        'Edit the name if desired and tap "Add"',
        'App will appear on your home screen',
      ],
    },
    {
      platform: 'Edge (Desktop)',
      icon: Monitor,
      steps: [
        'Click the app icon in the address bar',
        'Select "Install this site as an app"',
        'Confirm installation',
        'App will be available in your start menu',
      ],
    },
  ];

  // =========================== RENDER HELPERS ===========================

  const renderFeatureCard = (feature: typeof pwaFeatures[0]) => {
    const Icon = feature.icon;
    return (
      <Card key={feature.title} className="h-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${feature.status ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Icon className={`h-6 w-6 ${feature.status ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                {feature.status ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">{feature.details}</p>
          <Badge variant={feature.status ? 'default' : 'outline'}>
            {feature.status ? 'Available' : 'Not Supported'}
          </Badge>
        </CardContent>
      </Card>
    );
  };

  const renderInstallationGuide = (guide: typeof installationGuides[0]) => {
    const Icon = guide.icon;
    return (
      <Card key={guide.platform}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{guide.platform}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {guide.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5">
                  {index + 1}
                </Badge>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    );
  };

  // =========================== MAIN RENDER ===========================

  return (
    <>
      <SEOHead
        title="Progressive Web App Features - Optimum Solutions Group"
        description="Discover the powerful PWA features of Optimum Solutions Group including offline functionality, push notifications, and native app-like experience."
        keywords={['PWA', 'Progressive Web App', 'offline app', 'mobile app', 'web app', 'install app']}
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-100 rounded-full">
                <Smartphone className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Progressive Web App
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Experience the power of modern web technology with our Progressive Web App. 
              Get native app performance with the convenience of the web.
            </p>

            {/* Network Status Indicator */}
            <Alert className={`max-w-md mx-auto mb-8 ${networkStatus ? 'border-green-500' : 'border-orange-500'}`}>
              <div className="flex items-center gap-2">
                {networkStatus ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-orange-600" />
                )}
                <AlertDescription>
                  {networkStatus ? 'Connected to the internet' : 'You are offline - PWA features active'}
                </AlertDescription>
              </div>
            </Alert>

            {/* PWA Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className={`text-2xl font-bold ${pwaStatus.isStandalone ? 'text-green-600' : 'text-gray-400'}`}>
                  {pwaStatus.isStandalone ? 'PWA' : 'Web'}
                </div>
                <div className="text-xs text-muted-foreground">Mode</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className={`text-2xl font-bold ${pwaStatus.hasServiceWorker ? 'text-green-600' : 'text-gray-400'}`}>
                  {pwaStatus.hasServiceWorker ? 'ON' : 'OFF'}
                </div>
                <div className="text-xs text-muted-foreground">Service Worker</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className={`text-2xl font-bold ${pwaStatus.supportsOffline ? 'text-green-600' : 'text-gray-400'}`}>
                  {pwaStatus.supportsOffline ? 'YES' : 'NO'}
                </div>
                <div className="text-xs text-muted-foreground">Offline</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className={`text-2xl font-bold ${pwaStatus.isInstalled ? 'text-green-600' : 'text-orange-600'}`}>
                  {pwaStatus.isInstalled ? 'YES' : 'NO'}
                </div>
                <div className="text-xs text-muted-foreground">Installed</div>
              </div>
            </div>
          </div>
        </section>

        {/* PWA Install Prompts */}
        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Card Install Prompt */}
              <PWAInstallPrompt 
                variant="card"
                autoShow={false}
                hideAfterInstall={false}
                className="mx-auto"
              />
              
              {/* Modal Install Button */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Try Modal Install
                  </CardTitle>
                  <CardDescription>
                    Experience our modal installation prompt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PWAInstallPrompt 
                    variant="modal"
                    autoShow={false}
                    customTrigger={
                      <Button className="w-full">
                        Open Install Modal
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="installation">Installation</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
              </TabsList>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">PWA Features</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Our Progressive Web App includes cutting-edge features that bridge the gap between web and native applications.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pwaFeatures.map(renderFeatureCard)}
                </div>
              </TabsContent>

              {/* Installation Tab */}
              <TabsContent value="installation" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Installation Guide</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Follow these simple steps to install our PWA on your device and enjoy a native app experience.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {installationGuides.map(renderInstallationGuide)}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> PWA installation availability depends on your browser and device. 
                    Some features may not be available on all platforms.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Why Choose Our PWA?</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Progressive Web Apps represent the future of web technology, combining the best of web and mobile apps.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <Gauge className="h-8 w-8 text-blue-500 mb-2" />
                      <CardTitle>Superior Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        PWAs load 2-3x faster than traditional websites and provide smooth, 60fps interactions.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Shield className="h-8 w-8 text-green-500 mb-2" />
                      <CardTitle>Enhanced Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Served over HTTPS with built-in security features and sandboxed environment.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Globe className="h-8 w-8 text-purple-500 mb-2" />
                      <CardTitle>Cross-Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Works seamlessly across all devices and platforms with a single codebase.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Star className="h-8 w-8 text-yellow-500 mb-2" />
                      <CardTitle>Native-like Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Full-screen mode, home screen icon, and smooth animations create an app-like feel.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <WifiOff className="h-8 w-8 text-orange-500 mb-2" />
                      <CardTitle>Offline Capability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Continue using core features even without an internet connection.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Download className="h-8 w-8 text-indigo-500 mb-2" />
                      <CardTitle>No App Store Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Install directly from the web without going through app stores or lengthy download processes.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </>
  );
};

export default PWAPage;

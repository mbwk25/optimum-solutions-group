import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Wifi, Database, Cloud, Smartphone, BarChart3, Zap, Globe, Cpu, Activity, Car, Home } from 'lucide-react';
import useScrollAnimation from '@/shared/hooks/useScrollAnimation';

const IoTSection = () => {
  const headerRef = useScrollAnimation();
  const diagramRef = useScrollAnimation();
  const servicesRef = useScrollAnimation();
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const iotLayers = [
    {
      id: 'devices',
      title: 'Smart Devices',
      description: 'Sensors, actuators, and controllers that collect and act on data',
      icon: Cpu,
      items: ['Temperature Sensors', 'Motion Detectors', 'Smart Actuators'],
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'connectivity',
      title: 'Connectivity',
      description: 'Secure wireless communication protocols',
      icon: Wifi,
      items: ['WiFi', 'Bluetooth', 'LoRaWAN', 'Cellular'],
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'gateway',
      title: 'Gateway',
      description: 'Data processing and protocol translation hub',
      icon: Zap,
      items: ['Edge Computing', 'Protocol Translation', 'Local Processing'],
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 'platform',
      title: 'IoT Platform',
      description: 'Cloud-based management and analytics',
      icon: Cloud,
      items: ['Device Management', 'Data Analytics', 'Real-time Monitoring'],
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'applications',
      title: 'Applications',
      description: 'Custom dashboards and mobile interfaces',
      icon: Smartphone,
      items: ['Web Dashboards', 'Mobile Apps', 'API Integrations'],
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  const iotServices = [
    {
      icon: Activity,
      title: 'Industrial IoT Solutions',
      description: 'Monitor equipment, optimize operations, and predict maintenance needs with industrial-grade IoT systems.',
      features: ['Equipment Monitoring', 'Predictive Maintenance', 'Energy Optimization', 'Safety Systems']
    },
    {
      icon: Home,
      title: 'Smart Building Systems',
      description: 'Create intelligent environments with automated lighting, climate control, and security management.',
      features: ['HVAC Automation', 'Smart Lighting', 'Access Control', 'Energy Management']
    },
    {
      icon: Car,
      title: 'Fleet & Asset Tracking',
      description: 'Track vehicles, equipment, and assets in real-time with comprehensive location and status monitoring.',
      features: ['GPS Tracking', 'Route Optimization', 'Fuel Monitoring', 'Driver Behavior Analytics']
    },
    {
      icon: BarChart3,
      title: 'Environmental Monitoring',
      description: 'Monitor air quality, weather conditions, and environmental parameters for compliance and optimization.',
      features: ['Air Quality Sensors', 'Weather Stations', 'Compliance Reporting', 'Alert Systems']
    }
  ];

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="iot" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header ref={headerRef} className="text-center mb-20 animate-out">
          <h2 className="font-playfair italic text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 leading-tight">
            IoT <span className="text-primary">infrastructure</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
            Connect your physical world to digital intelligence with our comprehensive IoT solutions. 
            From sensors to analytics, we build the complete ecosystem for your smart operations.
          </p>
        </header>

        {/* IoT Architecture Diagram */}
        <div ref={diagramRef} className="mb-20 animate-out">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Complete IoT Ecosystem</h3>
            <p className="text-muted-foreground">Interactive architecture overview - hover to explore each layer</p>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-6 mb-8">
            {iotLayers.map((layer) => (
              <Card 
                key={layer.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                  activeLayer === layer.id ? 'border-primary shadow-primary/20' : 'border-border'
                } ${layer.bgColor}`}
                onMouseEnter={() => setActiveLayer(layer.id)}
                onMouseLeave={() => setActiveLayer(null)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`mx-auto p-3 rounded-xl bg-background ${layer.color}`}>
                    <layer.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg">{layer.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-sm mb-4">
                    {layer.description}
                  </CardDescription>
                  <div className="space-y-1">
                    {layer.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-xs text-center p-2 bg-background/50 rounded">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Data Flow Visualization */}
          <div className="relative">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <Globe className="h-5 w-5" />
                <span>Real-time Data Flow</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span>HTTP, MQTT, WebSocket</span>
                <Database className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* IoT Services */}
        <div ref={servicesRef} className="animate-out">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-4">IoT Solutions We Build</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From concept to deployment, we create IoT systems that transform how you monitor, control, and optimize your operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {iotServices.map((service, index) => (
              <Card key={index} className="service-card group">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary text-primary-foreground rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-subtle p-12 rounded-3xl">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ready to Connect Your Business?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let's discuss how IoT can transform your operations, reduce costs, and unlock new opportunities for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="btn-hero text-lg px-8 py-4 h-auto"
              >
                Start IoT Project
              </Button>
              <Button 
                onClick={() => document.querySelector('#estimator')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 h-auto"
              >
                Get IoT Estimate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IoTSection;
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Calculator, Settings, MessageCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

const ProjectEstimator = () => {
  const { toast } = useToast();
  const [projectType, setProjectType] = useState('');
  const [design, setDesign] = useState('');
  const [environment, setEnvironment] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  const featureOptions = [
    { id: 'accounts', label: 'User accounts', basePrice: 5000 },
    { id: 'payments', label: 'Payments', basePrice: 8000 },
    { id: 'chat', label: 'Chat', basePrice: 6000 },
    { id: 'admin', label: 'Admin panel', basePrice: 7000 },
    { id: 'iot', label: 'IoT Integration', basePrice: 12000 },
    { id: 'analytics', label: 'Analytics Dashboard', basePrice: 9000 },
    { id: 'api', label: 'Advanced API', basePrice: 4000 },
    { id: 'mobile', label: 'Mobile App', basePrice: 15000 },
  ];

  const projectTypes = {
    'web-app': { label: 'Web application', basePrice: 7000 },
    'mobile-app': { label: 'Mobile application', basePrice: 12000 },
    'iot-platform': { label: 'IoT Platform', basePrice: 25000 },
    'ecommerce': { label: 'E-commerce platform', basePrice: 15000 },
    'crm': { label: 'CRM System', basePrice: 18000 },
  };

  const designTypes = {
    'basic': { label: 'Basic', multiplier: 1 },
    'custom': { label: 'Custom Design', multiplier: 1.5 },
    'premium': { label: 'Premium UI/UX', multiplier: 2 },
  };

  const environmentTypes = {
    'frontend': { label: 'Frontend only', multiplier: 1 },
    'fullstack': { label: 'Full-stack', multiplier: 1.8 },
    'enterprise': { label: 'Enterprise solution', multiplier: 2.5 },
  };

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    if (checked) {
      setFeatures([...features, featureId]);
    } else {
      setFeatures(features.filter(f => f !== featureId));
    }
  };

  const calculateEstimate = () => {
    if (!projectType || !design || !environment) return { min: 0, max: 0 };

    const basePrice = projectTypes[projectType as keyof typeof projectTypes]?.basePrice || 0;
    const designMultiplier = designTypes[design as keyof typeof designTypes]?.multiplier || 1;
    const envMultiplier = environmentTypes[environment as keyof typeof environmentTypes]?.multiplier || 1;
    
    const featuresPrice = features.reduce((total, featureId) => {
      const feature = featureOptions.find(f => f.id === featureId);
      return total + (feature?.basePrice || 0);
    }, 0);

    const totalBase = (basePrice + featuresPrice) * designMultiplier * envMultiplier;
    
    return {
      min: Math.round(totalBase * 0.8),
      max: Math.round(totalBase * 1.2)
    };
  };

  const estimate = calculateEstimate();

  const handleSubmit = () => {
    if (!projectType || !design || !environment) {
      toast({
        title: "Please complete all fields",
        description: "All project details are required for an accurate estimate.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Estimate submitted!",
      description: "We'll contact you within 24 hours to discuss your project in detail.",
    });
  };

  return (
    <section id="estimator" className="section-padding bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-playfair italic text-4xl md:text-5xl font-light text-foreground mb-4">
            Estimate your <span className="text-primary">project</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get a quick estimate for your next digital transformation project
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Project Calculator
            </CardTitle>
            <CardDescription>
              Configure your project requirements to get an estimated cost range
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="estimator-project-type" className="text-sm font-medium">Project type</label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger id="estimator-project-type">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(projectTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="estimator-design" className="text-sm font-medium">Design</label>
                <Select value={design} onValueChange={setDesign}>
                  <SelectTrigger id="estimator-design">
                    <SelectValue placeholder="Select design level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(designTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <fieldset>
                <legend className="text-sm font-medium mb-3">Features</legend>
                <div className="grid md:grid-cols-2 gap-3">
                  {featureOptions.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.id}
                        checked={features.includes(feature.id)}
                        onCheckedChange={(checked) => 
                          handleFeatureChange(feature.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={feature.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="space-y-2">
              <label htmlFor="estimator-environment" className="text-sm font-medium">Environment</label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger id="estimator-environment">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(environmentTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {estimate.min > 0 && (
              <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
                <div className="text-3xl font-bold text-foreground mb-2">
                  ${estimate.min.toLocaleString()} - ${estimate.max.toLocaleString()}
                </div>
                <p className="text-muted-foreground">Estimated project cost</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full btn-hero text-lg py-6"
              disabled={!projectType || !design || !environment}
            >
              Submit Estimate Request
            </Button>

            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Track your estimate</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit your project to track it in the dashboard and receive follow-ups
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Get in touch with us</h3>
                  <p className="text-sm text-muted-foreground">
                    Do you have any questions? Contact us to discuss your needs
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProjectEstimator;
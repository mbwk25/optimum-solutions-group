import { Code, Workflow, Users, BarChart, Palette, Headphones, TrendingUp, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServicesSection = () => {
  const services = [
    {
      icon: Code,
      title: "Custom Web & Mobile Apps",
      description: "Tailored applications that solve your specific business challenges and grow with your company.",
      features: ["React & React Native", "Progressive Web Apps", "API Integration", "Real-time Features"],
      cta: "Build Your Platform"
    },
    {
      icon: Workflow,
      title: "Workflow & Process Automation",
      description: "Eliminate manual tasks and streamline operations with intelligent automation solutions.",
      features: ["Task Automation", "Document Processing", "Email Workflows", "Integration APIs"],
      cta: "Automate Workflows"
    },
    {
      icon: Users,
      title: "CRM & Customer Management",
      description: "Centralize customer data and improve relationships with custom CRM solutions.",
      features: ["Contact Management", "Sales Pipeline", "Customer Analytics", "Communication Tools"],
      cta: "Organize Customers"
    },
    {
      icon: BarChart,
      title: "Team & Project Management",
      description: "Keep teams aligned and projects on track with custom management platforms.",
      features: ["Project Tracking", "Resource Planning", "Time Management", "Performance Metrics"],
      cta: "Manage Better"
    },
    {
      icon: Palette,
      title: "UI/UX Design & Prototyping",
      description: "User-centered design that makes your software intuitive and delightful to use.",
      features: ["User Research", "Wireframing", "Interactive Prototypes", "Design Systems"],
      cta: "Design Experience"
    },
    {
      icon: Headphones,
      title: "Technical Coaching & Support",
      description: "Ongoing guidance to help your team make the most of your new digital tools.",
      features: ["Training Programs", "Best Practices", "Technical Support", "Optimization"],
      cta: "Get Support"
    },
    {
      icon: TrendingUp,
      title: "Performance Monitoring",
      description: "Track what matters with real-time analytics and automated performance insights.",
      features: ["Real-time Dashboards", "Custom Metrics", "Automated Reports", "Alerts"],
      cta: "Track Performance"
    },
    {
      icon: Database,
      title: "Business Intelligence",
      description: "Transform your data into actionable insights with custom analytics dashboards.",
      features: ["Data Visualization", "Predictive Analytics", "Custom Reports", "KPI Tracking"],
      cta: "Analyze Data"
    }
  ];

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Digital Solutions That{' '}
            <span className="text-primary">Drive Results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We offer end-to-end digital transformation services designed specifically for small and medium businesses ready to scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {services.map((service, index) => (
            <div key={index} className="service-card group">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
              </div>

              <div className="space-y-2 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={scrollToContact}
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
              >
                {service.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center bg-gradient-subtle p-12 rounded-3xl">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Not Sure Which Service You Need?
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Every business is unique. Let's discuss your challenges and goals to find the perfect solution for your specific needs.
          </p>
          <Button 
            onClick={scrollToContact}
            size="lg"
            className="btn-hero text-lg px-8 py-4 h-auto"
          >
            Schedule Strategy Call
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
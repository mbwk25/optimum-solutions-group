import { Code, Workflow, Users, BarChart, Palette, Headphones, TrendingUp, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useScrollAnimation from '@/hooks/useScrollAnimation';

const ServicesSection = () => {
  const headerRef = useScrollAnimation();
  const gridRef = useScrollAnimation();

  const services = [
    {
      icon: Code,
      title: "Custom Web & Mobile Apps",
      description: "Tailored applications that solve your specific business challenges and grow with your company.",
      features: ["React & React Native", "Progressive Web Apps", "API Integration", "Real-time Features"],
      cta: "Build Your Platform",
      gradient: "from-blue-500/10 to-purple-500/10"
    },
    {
      icon: Workflow,
      title: "Workflow & Process Automation",
      description: "Eliminate manual tasks and streamline operations with intelligent automation solutions.",
      features: ["Task Automation", "Document Processing", "Email Workflows", "Integration APIs"],
      cta: "Automate Workflows",
      gradient: "from-green-500/10 to-emerald-500/10"
    },
    {
      icon: Users,
      title: "CRM & Customer Management",
      description: "Centralize customer data and improve relationships with custom CRM solutions.",
      features: ["Contact Management", "Sales Pipeline", "Customer Analytics", "Communication Tools"],
      cta: "Organize Customers",
      gradient: "from-orange-500/10 to-red-500/10"
    },
    {
      icon: BarChart,
      title: "Team & Project Management",
      description: "Keep teams aligned and projects on track with custom management platforms.",
      features: ["Project Tracking", "Resource Planning", "Time Management", "Performance Metrics"],
      cta: "Manage Better",
      gradient: "from-cyan-500/10 to-blue-500/10"
    },
    {
      icon: Palette,
      title: "UI/UX Design & Prototyping",
      description: "User-centered design that makes your software intuitive and delightful to use.",
      features: ["User Research", "Wireframing", "Interactive Prototypes", "Design Systems"],
      cta: "Design Experience",
      gradient: "from-pink-500/10 to-rose-500/10"
    },
    {
      icon: Headphones,
      title: "Technical Coaching & Support",
      description: "Ongoing guidance to help your team make the most of your new digital tools.",
      features: ["Training Programs", "Best Practices", "Technical Support", "Optimization"],
      cta: "Get Support",
      gradient: "from-indigo-500/10 to-violet-500/10"
    },
    {
      icon: TrendingUp,
      title: "Performance Monitoring",
      description: "Track what matters with real-time analytics and automated performance insights.",
      features: ["Real-time Dashboards", "Custom Metrics", "Automated Reports", "Alerts"],
      cta: "Track Performance",
      gradient: "from-yellow-500/10 to-orange-500/10"
    },
    {
      icon: Database,
      title: "Business Intelligence",
      description: "Transform your data into actionable insights with custom analytics dashboards.",
      features: ["Data Visualization", "Predictive Analytics", "Custom Reports", "KPI Tracking"],
      cta: "Analyze Data",
      gradient: "from-teal-500/10 to-green-500/10"
    }
  ];

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="section-padding bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header ref={headerRef} className="text-center mb-20 animate-out">
          <h2 className="font-playfair italic text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 leading-tight">
            Solutions that{' '}
            <span className="text-primary">scale with you.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
            End-to-end digital transformation services designed specifically for ambitious businesses ready to evolve and thrive in the modern marketplace.
          </p>
        </header>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-out stagger-children">
          {services.map((service, index) => (
            <div key={index} className={`service-card group relative overflow-hidden bg-gradient-to-br ${service.gradient}`}>
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                    <service.icon className="h-8 w-8" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 font-playfair">{service.title}</h3>
                  <p className="text-muted-foreground mb-4 font-light leading-relaxed">{service.description}</p>
                </div>

                <div className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground font-light">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={scrollToContact}
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 font-medium"
                >
                  {service.cta}
                </Button>
              </div>
              
              {/* Enhanced hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
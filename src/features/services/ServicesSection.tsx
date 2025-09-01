import { Code, Workflow, Users, BarChart, Palette, Headphones, TrendingUp, Database, Cpu, Shield } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import useScrollAnimation from '@/shared/hooks/useScrollAnimation';

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
    },
    {
      icon: Cpu,
      title: "IoT & Smart Systems",
      description: "Connect physical devices to digital intelligence with comprehensive IoT solutions.",
      features: ["Device Connectivity", "Real-time Monitoring", "Edge Computing", "Predictive Maintenance"],
      cta: "Build IoT Platform",
      gradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Protect your digital assets with robust security measures and compliance frameworks.",
      features: ["Data Encryption", "Access Control", "Audit Trails", "GDPR Compliance"],
      cta: "Secure Systems",
      gradient: "from-red-500/10 to-pink-500/10"
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

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 animate-out stagger-children">
          {services.slice(0, 6).map((service, index) => (
            <article key={index} className="service-card p-6 rounded-xl border border-border hover:border-primary/20 bg-card transition-all duration-300">
              <service.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed text-sm">{service.description}</p>
              <Button 
                onClick={scrollToContact}
                variant="outline" 
                size="sm"
                className="w-full hover:bg-primary hover:text-primary-foreground"
              >
                {service.cta}
              </Button>
            </article>
          ))}
        </div>
        
        {/* Additional Services - Ultra Simplified */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {services.slice(6).map((service, index) => (
            <article key={index} className="bg-card p-4 rounded-lg border border-border hover:shadow-sm transition-shadow">
              <service.icon className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-foreground mb-2 text-sm">{service.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{service.description}</p>
              <button 
                onClick={scrollToContact}
                className="text-primary text-xs font-medium hover:underline"
              >
                Learn More
              </button>
            </article>
          ))}
        </div>

        <div className="text-center bg-gradient-subtle p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Not Sure Which Service You Need?
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            Every business is unique. Let's discuss your challenges and goals to find the perfect solution for your specific needs.
          </p>
          <Button 
            onClick={scrollToContact}
            className="btn-hero"
          >
            Schedule Strategy Call
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
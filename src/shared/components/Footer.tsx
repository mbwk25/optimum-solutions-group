import { Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: 'Custom Web Apps', href: '#services' },
      { label: 'Mobile Development', href: '#services' },
      { label: 'Workflow Automation', href: '#services' },
      { label: 'CRM Solutions', href: '#services' },
      { label: 'Analytics Dashboards', href: '#services' },
    ],
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Our Process', href: '#contact' },
      { label: 'Case Studies', href: '#portfolio' },
      { label: 'Client Testimonials', href: '#testimonials' },
      { label: 'Contact', href: '#contact' },
    ],
    resources: [
      { label: 'Free Consultation', href: '#contact' },
      { label: 'Project Planning', href: '#contact' },
      { label: 'Technical Support', href: '#contact' },
      { label: 'Success Stories', href: '#testimonials' },
      { label: 'Industry Insights', href: '#contact' },
    ]
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-bold text-sm">
                OSG
              </div>
              <div className="font-bold text-xl tracking-tight">
                <span className="bg-gradient-to-r from-secondary to-primary-foreground bg-clip-text text-transparent">
                  Optimum
                </span>
                <span className="text-primary-foreground ml-1 font-light">
                  Solutions
                </span>
                <div className="text-xs font-medium text-primary-foreground uppercase tracking-widest mt-0.5 opacity-80">
                  GROUP
                </div>
              </div>
            </div>
            <p className="text-primary-foreground mb-6 leading-relaxed opacity-90">
              We help small and medium businesses transform their operations with custom software solutions that drive real results.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary" />
                <span className="text-primary-foreground font-medium">hello@optimumsolutions.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary" />
                <span className="text-primary-foreground font-medium">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-secondary" />
                <span className="text-primary-foreground font-medium">Silicon Valley, CA</span>
              </div>
            </div>

            {/* Enhanced Social Links */}
            <div className="flex gap-3 mt-6">
              <a 
                href="#" 
                className="group relative w-11 h-11 bg-primary-foreground/10 rounded-xl flex items-center justify-center hover:bg-primary transition-all duration-300 overflow-hidden"
                aria-label="Visit our LinkedIn profile"
              >
                <Linkedin className="h-5 w-5 group-hover:text-primary-foreground transition-colors duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a 
                href="#" 
                className="group relative w-11 h-11 bg-primary-foreground/10 rounded-xl flex items-center justify-center hover:bg-primary transition-all duration-300 overflow-hidden"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5 group-hover:text-primary-foreground transition-colors duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a 
                href="#" 
                className="group relative w-11 h-11 bg-primary-foreground/10 rounded-xl flex items-center justify-center hover:bg-primary transition-all duration-300 overflow-hidden"
                aria-label="Check out our GitHub projects"
              >
                <Github className="h-5 w-5 group-hover:text-primary-foreground transition-colors duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-primary-foreground hover:text-primary-foreground transition-colors opacity-90 hover:opacity-100"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-primary-foreground hover:text-primary-foreground transition-colors opacity-90 hover:opacity-100"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & CTA */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3 mb-8">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-primary-foreground hover:text-primary-foreground transition-colors opacity-90 hover:opacity-100"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="bg-secondary/20 p-6 rounded-2xl">
              <h4 className="font-semibold mb-2">Ready to Get Started?</h4>
              <p className="text-primary-foreground text-sm mb-4 opacity-90">
                Book your free consultation today and see how we can transform your business.
              </p>
              <button
                onClick={() => scrollToSection('#contact')}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                Schedule Free Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground text-sm opacity-75">
              © {currentYear} Optimum Solutions Group. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-primary-foreground hover:text-primary-foreground transition-colors opacity-75 hover:opacity-100">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground hover:text-primary-foreground transition-colors opacity-75 hover:opacity-100">
                Terms of Service
              </a>
              <a href="#" className="text-primary-foreground hover:text-primary-foreground transition-colors opacity-75 hover:opacity-100">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import { Mail, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    projectType: '',
    budget: '',
    message: '',
    timeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours with next steps.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        projectType: '',
        budget: '',
        message: '',
        timeline: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "hello@optimumsolutions.com",
      description: "Get a response within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri 9AM-6PM EST"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "123 Tech Street, Silicon Valley",
      description: "Schedule an in-person meeting"
    },
    {
      icon: Calendar,
      title: "Book a Call",
      details: "Schedule instantly",
      description: "Free 30-minute consultation"
    }
  ];

  const processSteps = [
    {
      number: "01",
      title: "Discovery Call",
      description: "We analyze your needs and current processes"
    },
    {
      number: "02", 
      title: "Strategy Design",
      description: "Custom solution proposal with timeline and costs"
    },
    {
      number: "03",
      title: "Development",
      description: "Agile development with weekly progress updates"
    },
    {
      number: "04",
      title: "Launch & Support",
      description: "Deployment, training, and ongoing optimization"
    }
  ];

  return (
    <section id="contact" className="section-padding bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-playfair italic text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 leading-tight">
            Ready to{' '}
            <span className="text-primary">evolve?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
            Let's explore how custom software can accelerate your business transformation. No pressure, just insights and possibilities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          {/* Contact Form */}
          <div className="bg-card p-8 rounded-3xl border border-border">
            <h3 className="text-2xl font-semibold text-foreground mb-6">
              Get Your Free Consultation
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-company" className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <Input
                    id="contact-company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-project-type" className="block text-sm font-medium text-foreground mb-2">
                    Project Type
                  </label>
                  <select
                    id="contact-project-type"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a service</option>
                    <option value="web-app">Custom Web Application</option>
                    <option value="mobile-app">Mobile Application</option>
                    <option value="automation">Workflow Automation</option>
                    <option value="crm">CRM System</option>
                    <option value="analytics">Analytics Dashboard</option>
                    <option value="integration">System Integration</option>
                    <option value="other">Other/Not Sure</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-timeline" className="block text-sm font-medium text-foreground mb-2">
                    Project Timeline
                  </label>
                  <select
                    id="contact-timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP (1-2 months)</option>
                    <option value="quarter">This Quarter (2-3 months)</option>
                    <option value="year">This Year (3-6 months)</option>
                    <option value="planning">Just Planning (6+ months)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">
                  Project Details *
                </label>
                <Textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Tell us about your business challenges, current processes, and what you'd like to achieve..."
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full btn-hero text-lg py-6"
              >
                {isSubmitting ? 'Sending Message...' : 'Get Free Consultation'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                We respect your privacy. Your information will never be shared.
              </p>
            </form>
          </div>

          {/* Contact Info & Process */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                      <info.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{info.title}</h4>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                  <p className="text-foreground font-medium">{info.details}</p>
                </div>
              ))}
            </div>

            {/* Process Steps */}
            <div className="bg-primary p-8 rounded-3xl text-primary-foreground">
              <h3 className="text-2xl font-semibold mb-6">How We Work</h3>
              <div className="space-y-6">
                {processSteps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">{step.number}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{step.title}</h4>
                      <p className="text-primary-foreground font-light text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantees */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h4 className="font-semibold text-foreground mb-4">Our Commitment to You</h4>
              <div className="space-y-3">
                {[
                  "Free consultation with no commitments",
                  "Transparent pricing and timeline estimates", 
                  "Regular progress updates and communication",
                  "Ongoing support and optimization"
                ].map((guarantee, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span className="text-foreground text-sm">{guarantee}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
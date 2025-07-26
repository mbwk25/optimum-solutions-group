import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, Clock, DollarSign, Users, Shield, Zap } from 'lucide-react';

const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', label: 'General', icon: HelpCircle },
    { id: 'process', label: 'Process', icon: Clock },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'support', label: 'Support', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'technical', label: 'Technical', icon: Zap },
  ];

  const faqs = {
    general: [
      {
        question: "What types of businesses do you work with?",
        answer: "We work with businesses of all sizes across various industries including healthcare, finance, retail, manufacturing, and professional services. Our solutions are tailored to each industry's specific needs and compliance requirements."
      },
      {
        question: "How long does a typical project take?",
        answer: "Project timelines vary based on complexity. Simple web applications typically take 4-8 weeks, while comprehensive business platforms can take 3-6 months. We provide detailed timelines during the consultation phase."
      },
      {
        question: "Do you provide ongoing support after launch?",
        answer: "Yes! We offer comprehensive support packages including bug fixes, feature updates, security patches, and performance optimization. Most clients choose our monthly support plans for peace of mind."
      }
    ],
    process: [
      {
        question: "What's your development methodology?",
        answer: "We use Agile development with 2-week sprints, providing regular demos and progress updates. This ensures you're involved throughout the process and can provide feedback early and often."
      },
      {
        question: "How do you ensure quality?",
        answer: "We implement rigorous testing including automated unit tests, integration testing, and user acceptance testing. Every feature goes through code review and quality assurance before deployment."
      },
      {
        question: "Can I see progress during development?",
        answer: "Absolutely! You'll have access to a staging environment where you can test features as they're completed. We also provide weekly progress reports and demos."
      }
    ],
    pricing: [
      {
        question: "How do you price your projects?",
        answer: "We provide fixed-price quotes based on detailed requirements analysis. This gives you budget certainty and eliminates surprise costs. We also offer monthly payment plans for larger projects."
      },
      {
        question: "What's included in the project cost?",
        answer: "Our quotes include design, development, testing, deployment, documentation, and initial training. Hosting and third-party service costs are separate and clearly outlined."
      },
      {
        question: "Do you offer payment plans?",
        answer: "Yes! We offer flexible payment options including milestone-based payments and monthly installments for larger projects. We'll work with you to find a payment structure that fits your budget."
      }
    ],
    support: [
      {
        question: "What kind of training do you provide?",
        answer: "We provide comprehensive training including user manuals, video tutorials, and live training sessions. We ensure your team is confident using the new system before project completion."
      },
      {
        question: "How quickly do you respond to support requests?",
        answer: "Critical issues are addressed within 4 hours, while general support requests receive responses within 24 hours during business days. Emergency support is available for critical systems."
      },
      {
        question: "Can you integrate with our existing systems?",
        answer: "Yes! We specialize in system integration and can connect your new solution with existing CRM, accounting, inventory, and other business systems through APIs and data synchronization."
      }
    ],
    security: [
      {
        question: "How do you ensure data security?",
        answer: "We implement industry-standard security measures including data encryption, secure authentication, regular security audits, and compliance with regulations like GDPR and HIPAA when applicable."
      },
      {
        question: "Where is our data stored?",
        answer: "Data is stored in secure, enterprise-grade cloud infrastructure with automatic backups and disaster recovery. We can also deploy to your preferred cloud provider or on-premise servers."
      },
      {
        question: "What about compliance requirements?",
        answer: "We ensure compliance with relevant regulations including GDPR, HIPAA, SOX, and industry-specific requirements. We conduct compliance audits and provide necessary documentation."
      }
    ],
    technical: [
      {
        question: "What technologies do you use?",
        answer: "We use modern, proven technologies including React, Node.js, Python, cloud platforms (AWS, Azure), and enterprise databases. Technology choices are always aligned with your specific needs and constraints."
      },
      {
        question: "Can you work with our existing tech stack?",
        answer: "Absolutely! We're experienced with a wide range of technologies and can integrate with or extend your existing systems. We'll recommend the best approach based on your current infrastructure."
      },
      {
        question: "How do you handle system scalability?",
        answer: "We design systems with growth in mind, using scalable architectures, cloud infrastructure, and performance optimization techniques. Your solution will grow with your business needs."
      }
    ]
  };

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="faq" className="section-padding bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair italic text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6 leading-tight">
            Frequently asked{' '}
            <span className="text-primary">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get answers to common questions about our development process, pricing, and services.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className="flex items-center gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* FAQ Content */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {categories.find(c => c.id === activeCategory)?.icon && (
                <span className="text-primary">
                  {React.createElement(categories.find(c => c.id === activeCategory)!.icon, { className: "h-5 w-5" })}
                </span>
              )}
              {categories.find(c => c.id === activeCategory)?.label} Questions
            </CardTitle>
            <CardDescription>
              Everything you need to know about {categories.find(c => c.id === activeCategory)?.label.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs[activeCategory as keyof typeof faqs].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-gradient-subtle p-12 rounded-3xl">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Still Have Questions?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're here to help! Schedule a free consultation to discuss your specific needs and get personalized answers to your questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={scrollToContact}
              size="lg"
              className="btn-hero text-lg px-8 py-4 h-auto"
            >
              Schedule Free Consultation
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 h-auto"
              onClick={() => window.open('mailto:hello@optimumsolutions.com', '_blank')}
            >
              Email Us Directly
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
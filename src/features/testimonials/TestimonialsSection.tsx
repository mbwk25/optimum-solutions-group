import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, GreenLeaf Consulting",
      company: "Marketing Agency",
      rating: 5,
      testimonial: "Optimum Solutions Group transformed our entire client management process. What used to take hours now takes minutes, and our team productivity has increased by 60%. The custom CRM they built fits our workflow perfectly.",
      result: "60% increase in productivity"
    },
    {
      name: "Michael Chen",
      role: "Operations Manager, TechStart Inc",
      company: "SaaS Startup", 
      rating: 5,
      testimonial: "The workflow automation platform they created eliminated our biggest bottleneck. We went from manually processing 50 orders per day to automatically handling 500+ without adding staff.",
      result: "10x processing capacity"
    },
    {
      name: "Lisa Rodriguez",
      role: "Founder, Artisan Crafts Co",
      company: "E-commerce Business",
      rating: 5,
      testimonial: "Their team management platform helped us coordinate our remote team across 3 time zones. Project delivery times improved by 40% and client satisfaction scores hit an all-time high.",
      result: "40% faster delivery"
    },
    {
      name: "David Park",
      role: "Director, HealthFirst Clinic",
      company: "Healthcare Practice",
      rating: 5,
      testimonial: "The patient management system streamlined our entire practice. Appointment scheduling, records management, and billing are now seamless. Our staff loves how intuitive it is.",
      result: "50% reduction in admin time"
    },
    {
      name: "Amanda Williams",
      role: "COO, BuildRight Construction",
      company: "Construction Company",
      rating: 5,
      testimonial: "The project tracking dashboard gives us real-time visibility into all our job sites. We can spot issues before they become problems and keep clients informed every step of the way.",
      result: "25% fewer project delays"
    },
    {
      name: "James Thompson",
      role: "Owner, FreshMart Grocery",
      company: "Retail Chain",
      rating: 5,
      testimonial: "Their inventory management system revolutionized our supply chain. We reduced waste by 30% and never run out of popular items. The ROI was clear within 3 months.",
      result: "30% reduction in waste"
    }
  ];

  return (
    <section id="testimonials" className="section-padding bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-playfair italic text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 leading-tight">
            Real businesses.{' '}
            <span className="text-primary">Real results.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
            Discover how forward-thinking companies have transformed their operations and achieved measurable growth with our tailored solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <div className="relative mb-6">
                <Quote className="h-8 w-8 text-primary/20 absolute -top-2 -left-2" />
                <p className="text-foreground leading-relaxed pl-6">
                  "{testimonial.testimonial}"
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-secondary">{testimonial.result}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary p-12 rounded-3xl text-center text-primary-foreground">
          <h4 className="text-3xl font-bold mb-4">
            Ready to Join Our Success Stories?
          </h4>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Every great digital transformation starts with a conversation. Let's discuss how we can help your business achieve similar results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-primary-foreground/20 rounded-full border-2 border-primary-foreground"></div>
                ))}
              </div>
              <span className="text-primary-foreground/90">Join 50+ happy clients</span>
            </div>
            <div className="text-primary-foreground/70">•</div>
            <div className="text-primary-foreground/90">Free consultation</div>
            <div className="text-primary-foreground/70">•</div>
            <div className="text-primary-foreground/90">No commitments</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
import { Button } from '@/shared/ui/button';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Users from 'lucide-react/dist/esm/icons/users';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Clock from 'lucide-react/dist/esm/icons/clock';
import portfolioPreview from '@/assets/portfolio-preview.jpg';
import LazyImage from '@/shared/components/LazyImage';

const PortfolioSection = () => {
  const projects = [
    {
      title: "Marketing Agency Dashboard",
      client: "GreenLeaf Consulting",
      category: "Analytics Platform",
      description: "Custom analytics dashboard that unified client data from multiple sources, automated reporting, and provided real-time campaign insights.",
      results: ["60% faster reporting", "40% more client retention", "$50k annual savings"],
      technologies: ["React", "Node.js", "MongoDB", "Chart.js"],
      timeline: "6 weeks"
    },
    {
      title: "E-commerce Automation Suite",
      client: "Artisan Crafts Co",
      category: "Workflow Automation",
      description: "End-to-end automation platform that handles inventory management, order processing, customer communications, and supplier coordination.",
      results: ["10x order processing", "50% inventory efficiency", "30% cost reduction"],
      technologies: ["React Native", "Python", "PostgreSQL", "Stripe API"],
      timeline: "8 weeks"
    },
    {
      title: "Healthcare Practice Manager",
      client: "HealthFirst Clinic",
      category: "Practice Management",
      description: "Comprehensive patient management system with appointment scheduling, medical records, billing integration, and telehealth capabilities.",
      results: ["50% less admin time", "95% patient satisfaction", "HIPAA compliant"],
      technologies: ["Vue.js", "Laravel", "MySQL", "Twilio"],
      timeline: "12 weeks"
    }
  ];

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="portfolio" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-playfair italic text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 leading-tight">
            Work that{' '}
            <span className="text-primary">drives impact.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
            Explore how we've helped businesses across industries solve complex challenges with elegant, powerful digital solutions.
          </p>
        </div>

        {/* Featured Project Showcase */}
        <div className="mb-16">
          <div className="bg-gradient-subtle rounded-3xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  Featured Case Study
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Complete Digital Transformation
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  See how we helped TechStart Inc. scale from 50 to 500+ daily transactions with a comprehensive automation platform that eliminated bottlenecks and improved efficiency across all departments.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">10x</div>
                    <div className="text-sm text-muted-foreground">Processing Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">75%</div>
                    <div className="text-sm text-muted-foreground">Cost Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">8 weeks</div>
                    <div className="text-sm text-muted-foreground">Implementation</div>
                  </div>
                </div>
                <Button onClick={scrollToContact} className="btn-hero">
                  Get Similar Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <LazyImage 
                  src={portfolioPreview} 
                  alt="Portfolio showcase"
                  className="rounded-2xl shadow-2xl"
                  loading="lazy"
                  width={600}
                  height={400}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {projects.map((project, index) => (
            <div key={index} className="bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {project.timeline}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{project.client}</p>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    Key Results
                  </h4>
                  <div className="space-y-1">
                    {project.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                        <span className="text-muted-foreground">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={scrollToContact}
                variant="outline" 
                className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Discuss Similar Project
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center bg-muted p-12 rounded-3xl">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Want to See More Examples?
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            We have case studies across various industries. Let's discuss your specific needs and show you relevant examples.
          </p>
          <Button onClick={scrollToContact} variant="outline" size="lg">
            View More Case Studies
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
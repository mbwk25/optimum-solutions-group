import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

const HeroSection = () => {
  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const element = document.querySelector('#services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={heroBackground} 
          alt="Digital workspace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 fade-in-up">
              Turn Your Business Into A{' '}
              <span className="hero-text-gradient">Digital Powerhouse</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed fade-in-up stagger-1">
              We build custom software platforms, automate workflows, and create digital tools that help small and medium businesses scale intelligently.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 fade-in-up stagger-2">
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="btn-hero text-lg px-8 py-4 h-auto"
              >
                Book Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                onClick={scrollToServices}
                variant="outline" 
                size="lg"
                className="btn-secondary-outline text-lg px-8 py-4 h-auto border-white/30 text-white hover:bg-white hover:text-primary"
              >
                <Play className="mr-2 h-5 w-5" />
                See How We Work
              </Button>
            </div>

            <div className="flex items-center gap-8 text-white/80 fade-in-up stagger-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">50+</div>
                <div className="text-sm">Successful Projects</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">95%</div>
                <div className="text-sm">Client Satisfaction</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">2x</div>
                <div className="text-sm">Average ROI</div>
              </div>
            </div>
          </div>

          <div className="relative fade-in-up stagger-4">
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">
                Transform Your Workflow Today
              </h3>
              <div className="space-y-3 text-white/90">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Custom Platform Development</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Process Automation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Team Management Tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Performance Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
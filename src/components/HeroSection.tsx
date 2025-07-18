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

      {/* Content - Minimalist centered layout inspired by Amp */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main headline with elegant serif typography */}
            <h1 className="mb-8 fade-in-up">
              <span className="block font-playfair italic text-6xl md:text-8xl lg:text-9xl font-light text-white/95 leading-tight mb-2">
                Everything
              </span>
              <span className="block font-playfair italic text-6xl md:text-8xl lg:text-9xl font-light text-white/95 leading-tight mb-4">
                is changing.
              </span>
              <span className="block font-inter text-xl md:text-2xl lg:text-3xl font-normal text-white/80 mt-8 leading-relaxed">
                Your business needs to evolve.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl mb-12 text-white/70 leading-relaxed fade-in-up stagger-1 max-w-3xl mx-auto font-light">
              We help ambitious businesses transform their operations with custom software solutions that drive real, measurable results in an ever-changing digital landscape.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center fade-in-up stagger-2">
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="btn-hero text-lg px-12 py-6 h-auto font-medium tracking-wide"
              >
                Start Your Transformation
              </Button>
              
              <Button 
                onClick={scrollToServices}
                variant="outline" 
                size="lg"
                className="text-lg px-12 py-6 h-auto border-white/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm font-medium tracking-wide"
              >
                Explore Solutions
              </Button>
            </div>

            {/* Subtle stats section */}
            <div className="flex items-center justify-center gap-12 text-white/60 fade-in-up stagger-3 mt-16 text-sm font-light">
              <div className="text-center">
                <div className="text-2xl font-playfair text-secondary mb-1">50+</div>
                <div>Successful Projects</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-playfair text-secondary mb-1">95%</div>
                <div>Client Satisfaction</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-playfair text-secondary mb-1">2x</div>
                <div>Average ROI</div>
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
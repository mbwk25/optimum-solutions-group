import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Target from 'lucide-react/dist/esm/icons/target';
import Users from 'lucide-react/dist/esm/icons/users';
import Zap from 'lucide-react/dist/esm/icons/zap';

const AboutSection = () => {
  const features = [
    {
      icon: Target,
      title: "Strategic Focus",
      description: "We understand your business goals and build solutions that directly impact your bottom line."
    },
    {
      icon: Users,
      title: "Client-First Approach", 
      description: "Every solution is tailored to your specific needs, industry, and growth objectives."
    },
    {
      icon: Zap,
      title: "Rapid Implementation",
      description: "Fast development cycles that get your digital tools working for you in weeks, not months."
    }
  ];

  const benefits = [
    "Reduce operational costs by up to 40%",
    "Improve team productivity and collaboration",
    "Automate repetitive tasks and workflows",
    "Gain real-time insights into your business",
    "Scale your operations without hiring overhead",
    "Enhance customer experience and retention"
  ];

  return (
    <section id="about" className="section-padding bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="mb-8">
              <h2 className="font-playfair italic text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-4 leading-tight">
                Digital transformation
              </h2>
              <h3 className="font-playfair italic text-4xl md:text-5xl lg:text-6xl font-light text-primary leading-tight">
                made simple.
              </h3>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed font-light">
              Too many businesses struggle with inefficient processes, scattered data, and tools that don't work together. We create integrated digital solutions that transform how you operate.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-lg mb-3">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-foreground mb-6">
                What You Get When Working With Us:
              </h3>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary p-8 rounded-2xl text-primary-foreground">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Ready to Get Started?</h3>
                  <p className="text-primary-foreground font-medium">Free consultation • No commitments</p>
                </div>
              </div>
              <p className="text-primary-foreground font-light">
                Book a 30-minute strategy call where we'll analyze your current processes and show you exactly how custom software can transform your business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
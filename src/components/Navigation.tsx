import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/optimum-logo.png';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'IoT Solutions', href: '#iot' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative overflow-hidden">
              <img 
                src={logo} 
                alt="Optimum Solutions Group"
                className="h-10 w-10 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg"
              />
              {/* Multi-layered glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-0 group-hover:opacity-70 transition-all duration-500 rounded-xl blur-lg scale-150 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-primary to-secondary opacity-0 group-hover:opacity-40 transition-all duration-700 rounded-xl blur-md scale-125"></div>
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-all duration-300 rounded-lg blur-sm"></div>
              {/* Orbiting particles */}
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-ping" style={{ transform: 'translate(-50%, -50%) rotate(0deg) translateX(20px)' }}></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ transform: 'translate(-50%, -50%) rotate(120deg) translateX(25px)', animationDelay: '0.2s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-600" style={{ transform: 'translate(-50%, -50%) rotate(240deg) translateX(22px)', animationDelay: '0.4s' }}></div>
            </div>
            <div className="font-bold text-xl tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Optimum
              </span>
              <span className="text-foreground ml-1 font-light">
                Solutions
              </span>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                GROUP
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.label}
              </button>
            ))}
            <Button 
              onClick={() => scrollToSection('#contact')}
              className="btn-hero"
            >
              Get Free Consultation
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                >
                  {item.label}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection('#contact')}
                className="btn-hero w-full mt-4"
              >
                Get Free Consultation
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
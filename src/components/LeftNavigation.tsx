import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Feather } from "lucide-react";

const LeftNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('about');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const scrollToSection = (sectionId: string) => {
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
    
    // Set as active immediately when user clicks
    setActiveSection(sectionId);
    setIsScrolling(true);
    
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        // Allow observer to take over after scroll completes
        setTimeout(() => setIsScrolling(false), 800);
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Allow observer to take over after scroll completes  
        setTimeout(() => setIsScrolling(false), 800);
      }
    }
  };

  const navItems = [
    { id: 'about', label: 'Om', type: 'scroll' },
    { id: 'writing', label: 'Skrivande', type: 'scroll' },
    { id: 'books', label: 'Böcker', type: 'scroll' },
    { id: 'blog', label: 'Blogg', type: 'scroll' },
    { id: 'media', label: 'Media', type: 'scroll' }
  ];

  useEffect(() => {
    if (location.pathname !== '/') return;

    const updateActiveSection = () => {
      // Don't update while actively scrolling from a click
      if (isScrolling) return;

      const sections = navItems.map(({ id }) => {
        const element = document.getElementById(id);
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        const distanceFromTop = Math.abs(rect.top);
        
        return {
          id,
          distanceFromTop,
          isVisible: rect.top < window.innerHeight && rect.bottom > 0
        };
      }).filter(Boolean);

      // Find the section closest to the top that's actually visible
      const visibleSections = sections.filter(section => section.isVisible);
      if (visibleSections.length > 0) {
        const closestSection = visibleSections.reduce((closest, current) => 
          current.distanceFromTop < closest.distanceFromTop ? current : closest
        );
        
        if (closestSection.distanceFromTop < 200) { // Only if reasonably close to top
          setActiveSection(closestSection.id);
        }
      }
    };

    // Update on scroll with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    updateActiveSection();
    
    // Listen to scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, isScrolling]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-48 bg-background p-8 z-50 flex-col justify-center">
        <ul className="space-y-6">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`text-left font-semibold transition-all duration-300 relative leading-6 ${
                  activeSection === item.id 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:scale-105 hover:translate-x-1'
                }`}
              >
                {activeSection === item.id && (
                  <Feather className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-primary animate-scale-in" />
                )}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 right-4 z-50 p-3 bg-card border border-border rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          aria-label="Öppna meny"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-foreground" />
          ) : (
            <Menu className="w-5 h-5 text-foreground" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <nav className={`fixed top-0 right-0 h-full w-64 bg-card border-l border-border z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 pt-20">
            <h2 className="text-lg font-semibold text-foreground mb-8">Navigation</h2>
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-4 py-3 pl-8 rounded-lg font-medium transition-all duration-300 relative ${
                      activeSection === item.id 
                        ? 'bg-accent text-accent-foreground shadow-lg scale-105' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105 hover:translate-x-1'
                    }`}
                  >
                    {activeSection === item.id && (
                      <Feather className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 text-primary animate-scale-in" />
                    )}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default LeftNavigation;
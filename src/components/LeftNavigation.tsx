import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LeftNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('about');
  
  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { id: 'about', label: 'Om', type: 'scroll' },
    { id: 'writing', label: 'Skrivande', type: 'scroll' },
    { id: 'blog', label: 'Blogg', type: 'scroll' },
    { id: 'media', label: 'Media', type: 'scroll' },
    { id: 'contact', label: 'Kontakt', type: 'scroll' }
  ];

  useEffect(() => {
    if (location.pathname !== '/') return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <nav className="fixed left-0 top-0 h-full w-48 bg-background border-r border-border/30 p-8 z-50 flex flex-col justify-center">
      <ul className="space-y-6">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={`text-left font-medium transition-all duration-300 hover:scale-105 hover:translate-x-1 relative ${
                activeSection === item.id 
                  ? 'text-primary font-semibold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeSection === item.id && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full animate-scale-in"></span>
              )}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LeftNavigation;
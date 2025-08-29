import { useLocation, useNavigate } from "react-router-dom";

const LeftNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  return (
    <nav className="fixed left-0 top-0 h-full w-48 bg-background border-r border-border/30 p-8 z-50 flex flex-col justify-center">
      <ul className="space-y-6">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className="text-muted-foreground hover:text-foreground transition-colors text-left font-medium"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LeftNavigation;
const LeftNavigation = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'about', label: 'Om' },
    { id: 'writing', label: 'Skrivande' },
    { id: 'blog', label: 'Blogg' },
    { id: 'contact', label: 'Kontakt' }
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
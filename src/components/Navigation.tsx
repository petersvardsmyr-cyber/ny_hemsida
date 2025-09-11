import { NavLink } from "react-router-dom";
import { PenTool, BookOpen, Home, ShoppingBag, Mail } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-sans font-semibold hover:text-accent transition-smooth">
            <PenTool className="w-6 h-6" />
            <span>Meny</span>
          </NavLink>
          
          <div className="flex items-center gap-8">
            <NavLink 
              to="/"
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium transition-smooth ${
                  isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <PenTool className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                  Hem
                </>
              )}
            </NavLink>
            
            <NavLink 
              to="/blogg"
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium transition-smooth ${
                  isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <PenTool className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  Blogg
                </>
              )}
            </NavLink>
            
            <NavLink 
              to="/butik"
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium transition-smooth ${
                  isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <PenTool className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  Butik
                </>
              )}
            </NavLink>
            
            <NavLink 
              to="/nyhetsbrev"
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium transition-smooth ${
                  isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <PenTool className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  Nyhetsbrev
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
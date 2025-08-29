import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-muted/30 py-12 px-6 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">
            © 2024 Din Digitala Penna. Skapad med kärlek för språk och berättelser.
          </p>
          <p className="text-sm text-muted-foreground">
            Byggd med modern teknik för optimal läsupplevelse
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
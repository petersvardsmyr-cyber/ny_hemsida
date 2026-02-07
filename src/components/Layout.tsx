import { Link, Outlet } from "react-router-dom";
import LeftNavigation from "./LeftNavigation";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LeftNavigation />
      <main className="ml-0 md:ml-48 transition-all duration-300 flex-1">
        <Link to="/butik" className="block px-4 md:px-12 py-4 md:py-5 hover:bg-muted/50 transition-colors border-b border-border/30">
          <p className="text-base md:text-lg text-muted-foreground max-w-4xl">
            En text för varje vecka på året. Köp min bok <em className="text-foreground">Det ordnar sig</em>. 👉🏼 📚
          </p>
        </Link>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
import { Link, Outlet } from "react-router-dom";
import LeftNavigation from "./LeftNavigation";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LeftNavigation />
      <main className="ml-0 md:ml-48 transition-all duration-300 flex-1">
        <Link to="/butik" className="sticky top-0 z-40 block px-4 pr-16 md:px-12 py-2.5 md:py-3 hover:bg-muted/50 transition-colors shadow-sm bg-background">
          <p className="text-sm md:text-base text-muted-foreground text-center max-w-4xl mx-auto">
            En text för varje vecka på året.<br />Köp min bok <em className="text-foreground">Det ordnar sig</em>. 👉🏼 📚
          </p>
        </Link>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
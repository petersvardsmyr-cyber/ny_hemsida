import { Outlet } from "react-router-dom";
import LeftNavigation from "./LeftNavigation";
import Footer from "./Footer";
import SaleBanner from "./SaleBanner";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SaleBanner />
      <LeftNavigation />
      <main className="ml-0 md:ml-48 transition-all duration-300 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
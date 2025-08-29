import { Outlet } from "react-router-dom";
import LeftNavigation from "./LeftNavigation";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <LeftNavigation />
      <main className="ml-0 md:ml-48 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
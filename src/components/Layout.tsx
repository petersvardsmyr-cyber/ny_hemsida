import { Outlet } from "react-router-dom";
import LeftNavigation from "./LeftNavigation";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <LeftNavigation />
      <main className="ml-48">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
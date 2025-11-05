import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
const SaleBanner = () => {
  return <Link to="/butik" className="block bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 transition-all duration-300">
      <div className="container mx-auto px-4 py-2.5">
        <p className="text-center text-sm md:text-base text-primary-foreground flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">LAGRRENSNING</span>
          <span className="hidden sm:inline">—</span>
          <span className="text-primary-foreground/90">50% på allt i butiken</span>
        </p>
      </div>
    </Link>;
};
export default SaleBanner;
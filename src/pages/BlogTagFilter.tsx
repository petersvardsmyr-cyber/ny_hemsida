import { useParams, Link } from "react-router-dom";
import { BlogList } from "./BlogList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BlogTagFilter = () => {
  const { tag } = useParams<{ tag: string }>();

  return (
    <div className="max-w-4xl mx-auto px-12 py-20">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/blogg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Alla inlägg
        </Link>
      </Button>
      
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-medium mb-3 text-foreground">
          Inlägg taggade med "{tag}"
        </h1>
        <p className="text-muted-foreground">
          Visar alla blogginlägg som innehåller taggen "{tag}"
        </p>
      </div>

      <BlogList filterTag={tag} />
    </div>
  );
};

export default BlogTagFilter;

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, Clock, Tag } from "lucide-react";

// Placeholder data - senare ersätts med riktigt innehåll
const blogPosts = [
  {
    id: "skrivandets-tystnad",
    title: "Skrivandets tystnad och ljudets betydelse",
    excerpt: "Om betydelsen av pausen, tystnaden mellan orden och hur vi som författare kan använda det outtalade för att säga mer än ord någonsin kan.",
    date: "2024-01-15",
    readTime: "8 min",
    tags: ["Skrivprocess", "Kreativitet", "Reflektion"],
    published: true
  },
  {
    id: "fran-wordpress",
    title: "Från WordPress till modern webbutveckling",
    excerpt: "Min resa från en traditionell WordPress-blogg till denna moderna, snabba och vackra lösning. Varför jag valde att byta och vad jag lärt mig på vägen.",
    date: "2024-01-08",
    readTime: "12 min",
    tags: ["Teknik", "Utveckling", "Bloggande"],
    published: true
  },
  {
    id: "vinterstunder",
    title: "Vinterstunder och reflektion",
    excerpt: "De mörka vintermånaderna bjuder på en speciell typ av kreativitet. Om att finna inspiration i det stilla och kontemplativa.",
    date: "2024-01-03",
    readTime: "6 min",
    tags: ["Årstider", "Inspiration", "Reflektion"],
    published: true
  },
  {
    id: "berattandets-kraft",
    title: "Berättandets kraft i en digital värld",
    excerpt: "Hur förändrar digitala medier sättet vi berättar historier? En reflektion över traditionell litteratur möter modern teknik.",
    date: "2023-12-28",
    readTime: "10 min",
    tags: ["Digital litteratur", "Teknik", "Berättande"],
    published: true
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-sans font-bold mb-6">
            Blogg
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Mina tankar, reflektioner och berättelser från skrivandets värld. 
            Här delar jag allt från kreativa processer till tekniska upptäckter.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="transition-smooth hover:shadow-lg group">
              <CardContent className="p-8">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString('sv-SE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                </div>
                
                <h2 className="text-2xl font-sans font-semibold mb-4 group-hover:text-accent transition-smooth">
                  <Link to={`/blogg/${post.id}`}>
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Link 
                    to={`/blogg/${post.id}`}
                    className="text-accent font-medium hover:underline transition-smooth"
                  >
                    Läs hela inlägget →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination placeholder */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Fler inlägg kommer snart...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blog;
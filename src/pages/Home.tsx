import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PenTool, Quote, Mail } from "lucide-react";
import profileImage from "@/assets/peter-profile.jpg";
import { BlogPosts } from "@/components/BlogPosts";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center">
      {/* About Section */}
      <section id="about" className="py-20 px-12">
        <div className="max-w-4xl">
          <div className="mb-16">
            <img 
              src={profileImage} 
              alt="Peter Svärdsmyr - Författare och berättare"
              className="w-32 h-32 rounded-full mb-8 object-cover"
            />
            <h1 className="text-4xl md:text-5xl font-heading font-medium mb-6 text-foreground leading-tight">
              Peter Svärdsmyr
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Jag älskar att skriva. Gärna om stora saker med få ord. Jag skriver också gärna musik. Här kan du läsa min blogg och annat.
            </p>
          </div>
        </div>
      </section>

      {/* Writing Section */}
      <section id="writing" className="py-20 px-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-heading font-medium mb-8 text-foreground">Skrivande</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl">
            Det mesta jag skriver handlar om populärpsykologi, lärande, personlig utveckling och olika former av tro och andlighet. En del dikt och poesi smyger sig in ibland också.
          </p>
          
          <Card className="mb-8 border-0 shadow-none bg-transparent">
            <CardContent className="p-8 pl-0">
              <Quote className="w-6 h-6 text-muted-foreground mb-4" />
              <blockquote className="text-xl leading-relaxed mb-4 font-serif italic">
                Inget i naturen växer<br />
                – med hjälp av kyla.<br />
                Inga relationer blomstrar<br />
                – utan värme.
              </blockquote>
              <cite className="text-sm text-muted-foreground">
                — Ur min kommande bok
              </cite>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 px-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-heading font-medium mb-8 text-foreground">Senaste inläggen</h2>
          
          <BlogPosts />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-heading font-medium mb-8 text-foreground">Kontakt</h2>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="w-5 h-5" />
            <span>Skriv till mig för samarbeten eller bara för att säga hej</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PenTool, Quote, Mail } from "lucide-react";
import profileImage from "@/assets/peter-profile.jpg";

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
            <h1 className="text-4xl md:text-5xl font-sans font-medium mb-6 text-foreground leading-tight">
              Författare och berättare
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Jag utforskar språkets magi och berättandets kraft genom skrivande. 
              Här delar jag mina tankar, berättelser och reflektioner.
            </p>
          </div>
        </div>
      </section>

      {/* Writing Section */}
      <section id="writing" className="py-20 px-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-sans font-medium mb-8 text-foreground">Skrivande</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl">
            Mina tankar om skrivprocessen, litteraturens roll i samhället och 
            de observationer som formar våra berättelser.
          </p>
          
          <Card className="mb-8 border-0 shadow-none bg-transparent">
            <CardContent className="p-8 pl-0">
              <Quote className="w-6 h-6 text-muted-foreground mb-4" />
              <blockquote className="text-xl leading-relaxed mb-4 font-serif italic">
                "Varje ord är en byggsten i den värld vi skapar tillsammans genom berättelser."
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
          <h2 className="text-2xl font-sans font-medium mb-8 text-foreground">Senaste inläggen</h2>
          
          <div className="space-y-12">
            <article className="group cursor-pointer">
              <div className="text-sm text-muted-foreground mb-3">15 januari 2024</div>
              <h3 className="text-xl font-sans font-medium mb-4 group-hover:text-accent transition-colors">
                Skrivandets tystnad och ljudets betydelse
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Om betydelsen av pausen, tystnaden mellan orden och hur vi som författare 
                kan använda det outtalade för att säga mer än det sagda...
              </p>
            </article>
            
            <article className="group cursor-pointer">
              <div className="text-sm text-muted-foreground mb-3">8 januari 2024</div>
              <h3 className="text-xl font-sans font-medium mb-4 group-hover:text-accent transition-colors">
                Från WordPress till modern webbutveckling
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Min resa från en traditionell WordPress-blogg till denna moderna, 
                snabba och eleganta lösning för att dela mina tankar...
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-sans font-medium mb-8 text-foreground">Kontakt</h2>
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
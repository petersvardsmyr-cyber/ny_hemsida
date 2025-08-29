import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PenTool, Quote } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-sans font-bold mb-6 text-foreground">
            Välkommen till min
            <span className="text-accent block mt-2">Digitala Penna</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Här delar jag mina tankar, berättelser och reflektioner genom skrivandets konst. 
            En plats där ord blir till världar och idéer tar form.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/blogg">
              <Button size="lg" className="font-medium">
                <BookOpen className="w-5 h-5 mr-2" />
                Läs mina inlägg
              </Button>
            </Link>
            
            <Button variant="secondary" size="lg" className="font-medium">
              <PenTool className="w-5 h-5 mr-2" />
              Om mig
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-sans font-semibold mb-6">Om författaren</h2>
              <p className="text-lg leading-relaxed mb-6">
                Jag är en författare som brinner för berättandets kraft och språkets magi. 
                Genom åren har jag utforskat olika genrer och stilar, alltid med målet att 
                skapa texter som berör och inspirerar.
              </p>
              <p className="text-lg leading-relaxed">
                Här på min blogg delar jag inte bara mina verk, utan också mina tankar om 
                skrivprocessen, litteraturens roll i samhället och de stora och små 
                observationer som formar våra liv.
              </p>
            </div>
            
            <Card className="transition-smooth hover:shadow-lg">
              <CardContent className="p-8">
                <Quote className="w-8 h-8 text-accent mb-4" />
                <blockquote className="text-lg italic leading-relaxed mb-4">
                  "Varje ord är en byggsten i den värld vi skapar tillsammans genom berättelser."
                </blockquote>
                <cite className="text-sm text-muted-foreground font-medium">
                  — Ur min kommande bok
                </cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Posts Preview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-sans font-semibold mb-4">Senaste inläggen</h2>
            <p className="text-muted-foreground text-lg">
              Mina nyaste tankar och berättelser
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Placeholder posts - these will be replaced with dynamic content */}
            <Card className="transition-smooth hover:shadow-lg group">
              <CardContent className="p-8">
                <div className="text-sm text-muted-foreground mb-3">15 januari 2024</div>
                <h3 className="text-xl font-sans font-semibold mb-4 group-hover:text-accent transition-smooth">
                  Skrivandets tystnad och ljudets betydelse
                </h3>
                <p className="leading-relaxed text-muted-foreground mb-4">
                  Om betydelsen av pausen, tystnaden mellan orden och hur vi som författare 
                  kan använda det outtalade för att säga mer...
                </p>
                <Link to="/blogg/skrivandets-tystnad" className="text-accent font-medium hover:underline">
                  Läs mer →
                </Link>
              </CardContent>
            </Card>
            
            <Card className="transition-smooth hover:shadow-lg group">
              <CardContent className="p-8">
                <div className="text-sm text-muted-foreground mb-3">8 januari 2024</div>
                <h3 className="text-xl font-sans font-semibold mb-4 group-hover:text-accent transition-smooth">
                  Från WordPress till modern webbutveckling
                </h3>
                <p className="leading-relaxed text-muted-foreground mb-4">
                  Min resa från en traditionell WordPress-blogg till denna moderna, 
                  snabba och vackra lösning...
                </p>
                <Link to="/blogg/fran-wordpress" className="text-accent font-medium hover:underline">
                  Läs mer →
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Link to="/blogg">
              <Button variant="secondary" size="lg">
                Visa alla inlägg
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
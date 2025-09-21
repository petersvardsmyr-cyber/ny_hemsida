import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, PenTool, Quote, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPosts } from "@/components/BlogPosts";
import { MediaGrid } from "@/components/MediaGrid";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { BooksPreview } from "@/components/BooksPreview";
// High-resolution product images stored in public directory
const alltDetViDelarImg = "/lovable-uploads/0290e479-7e17-4147-98cf-68745458f273.png";
const detOrdnarSigImg = "/lovable-uploads/764ef977-eac5-4ecb-9a99-886c0a473b5f.png";
const alltDetViDelarAndraAretImg = "/lovable-uploads/d46f78be-5cd0-4056-a65d-0315a8ca0464.png";
const attBlitillImg = "/lovable-uploads/945ace33-dadc-46c4-907c-ab6bb84a1c3b.png";
const Home = () => {
  return <div className="min-h-screen flex flex-col justify-start pt-8 md:pt-20 pb-20 md:pb-8">
      {/* About Section */}
      <section id="about" className="min-h-screen py-12 md:py-20 px-4 md:px-12 flex items-center">
        <div className="max-w-4xl w-full">
          <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0">
                <img src="/lovable-uploads/0c4c081c-c3c9-4531-b9a3-1dcb94c959d7.png" alt="Peter Svärdsmyr - Författare och berättare" className="w-full h-full object-cover transform scale-110" style={{
                objectPosition: '50% 0%'
              }} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium text-foreground leading-tight mb-6 md:mb-8">
                  Peter Svärdsmyr
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 md:mb-8">Det finns en rytm i allt. 
                <br /><br />
                När jag skriver tänker jag på det, ibland mer än på exakt innehåll. Självklart är innehållet viktigt, men om rytmen inte finns där kommer alltid något fattas.
                <br /><br />
                För ord är så mycket mer än ord, eller hur? Hur jag säger eller skriver något är minst lika viktigt som vad. Och det är som det ska, som Thomas Tranströmer skulle sagt.</p>
                
                {/* Social Links */}
                <div className="flex gap-3 md:gap-4 mb-6">
                  <a href="https://www.instagram.com/petersvardsmyr/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Instagram">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  
                  <a href="https://www.facebook.com/peter.svardsmyr/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Facebook">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  
                  <a href="mailto:hej@petersvardsmyr.se" className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Email">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                  
                  <a href="https://www.linkedin.com/in/petersvardsmyr/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="LinkedIn">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Writing Section */}
      <section id="writing" className="py-12 md:py-20 px-4 md:px-12">
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium mb-6 md:mb-8 text-foreground">Skrivande</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 md:mb-12 max-w-2xl">Det mesta jag skriver handlar om populärpsykologi, lärande, personlig utveckling och olika former av tro och andlighet. Ibland i form av dikter och poesi, ibland i form av debattartiklar eller böcker. Att skriva om stora saker med små medel. Så få ord som möjligt, helst. Det har blivit en längtan och den stora utmaningen när jag skriver. </p>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-4 md:p-8 md:pl-0 pl-0">
                <Quote className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground mb-4" />
                <blockquote className="text-lg md:text-xl leading-relaxed mb-4 font-serif italic">
                  Inget i naturen växer<br />
                  – med hjälp av kyla.<br />
                  Inga relationer blomstrar<br />
                  – utan värme.
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Ur Allt det vi delar</cite>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-4 md:p-8 md:pr-0 pr-0">
                <Quote className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground mb-4" />
                <blockquote className="text-lg md:text-xl leading-relaxed mb-4 font-serif italic">
                  Alla som andas kan älska,<br />
                  Alla som älskar kan hjälpa,<br />
                  Alla som hjälper kan rädda<br />
                  – en värld som har<br />
                  svårt att andas.
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Ur Det ordnar sig</cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" className="py-12 md:py-20 px-4 md:px-12">
        <div className="max-w-6xl w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium mb-6 md:mb-8 text-foreground">Böcker</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 md:mb-12 max-w-2xl">Här kan du läsa mer om och beställa mina böcker om personlig utveckling, relationer, kristen tro, kyrkan och en hel del vardagsfilosofi.</p>
          
          <BooksPreview />
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-12 md:py-20 px-4 md:px-12">
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium mb-6 md:mb-8 text-foreground">Senaste inläggen</h2>
          
          <BlogPosts />
        </div>
      </section>

      {/* Media Section */}
      <section id="media" className="py-12 md:py-20 px-4 md:px-12">
        <div className="max-w-6xl w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium mb-6 md:mb-8 text-foreground">Media</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 md:mb-12 max-w-2xl">
            Artiklar, poddar och andra medieframträdanden där jag delar tankar om livet, kreativitet och mänskliga relationer.
          </p>
          
          <MediaGrid />
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="py-12 md:py-20 px-4 md:px-12">
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium mb-6 md:mb-8 text-foreground">Nyhetsbrev</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 md:mb-12 max-w-2xl">
            Få de senaste nyheterna och uppdateringarna om mina böcker, artiklar och tankar direkt i din inkorg.
          </p>
          
          <NewsletterSignup />
        </div>
      </section>

      {/* Clean Modern Transition to Music Studio */}
      <div className="h-16 md:h-20 bg-gradient-to-b from-background to-deep-charcoal"></div>

      {/* Music Section */}
      <section id="music" className="py-12 md:py-20 px-4 md:px-12 bg-deep-charcoal">
        <div className="max-w-4xl w-full">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <Music className="w-6 h-6 md:w-8 md:h-8 text-warm-cream" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-medium text-warm-cream">Musik</h2>
          </div>
          <p className="text-lg md:text-xl text-warm-cream/80 leading-relaxed mb-8 md:mb-12 max-w-2xl">
            Musik är en annan del av min kreativitet. Genom melodier och text utforskar jag samma teman som i mina böcker – relationer, hopp och mänskliga berättelser. Välkommen in i studion.
          </p>
          
          {/* Spotify Embeds */}
          <div className="grid gap-6 md:gap-8">
            {/* First Album */}
            <div className="bg-warm-cream/5 rounded-lg border border-warm-cream/10 p-4 md:p-6">
              <iframe 
                src="https://open.spotify.com/embed/album/5wFcioalJCkED3IcVUrxZF?utm_source=generator&theme=0" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
            
            {/* Second Album */}
            <div className="bg-warm-cream/5 rounded-lg border border-warm-cream/10 p-4 md:p-6">
              <iframe 
                src="https://open.spotify.com/embed/album/3qRtxATRxr9t3XRK5cL92z?utm_source=generator&theme=0" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
            
            {/* Single Track */}
            <div className="bg-warm-cream/5 rounded-lg border border-warm-cream/10 p-4 md:p-6">
              <iframe 
                src="https://open.spotify.com/embed/track/2uaTaPnkjZg6CUDdacdfra?utm_source=generator&theme=0" 
                width="100%" 
                height="152" 
                frameBorder="0" 
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Home;
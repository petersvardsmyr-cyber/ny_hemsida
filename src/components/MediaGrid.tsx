import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaItem {
  id: string;
  title: string;
  description: string;
  url: string;
  domain: string;
  favicon: string;
  type: 'article' | 'podcast' | 'video';
}

const mediaItems: MediaItem[] = [
  {
    id: '1',
    title: 'Peter Svärdsmyr gör succé på Instagram med tänkvärda bilder',
    description: 'Utan att skriva någon på näsan vill musikkommunikatören och pedagogen Peter Svärdsmyr beröra livets stora frågor. Hans Instagram-konto med tänkvärda ord har tusentals följare.',
    url: 'https://www.dagen.se/kultur/peter-svardsmyr-gor-succe-pa-instagram-med-tankvarda-bilder/4153250',
    domain: 'dagen.se',
    favicon: 'https://www.dagen.se/favicon.ico',
    type: 'article'
  },
  {
    id: '2',
    title: 'Kommer AI göra oss mer mänskliga?',
    description: 'Tänk om tekniksprånget denna gång inte blir en källa till fler arbetstimmar utan en källa till mer gemenskap och djupare relationer.',
    url: 'https://www.kyrkanstidning.se/debatt/kommer-ai-gora-oss-mer-manskliga',
    domain: 'kyrkanstidning.se',
    favicon: 'https://www.kyrkanstidning.se/favicon.ico',
    type: 'article'
  },
  {
    id: '3',
    title: 'Kreativitet med Peter Svärdsmyr',
    description: 'Detta samtal om kreativitet började för några veckor sedan på en kurs och har för min del pågått sedan dess. En spännande diskussion om kreativitet, rädsla och perfektionskrav.',
    url: 'https://open.spotify.com/episode/3xNuYgMdjZisVnuPAejWs2?si=nnf8a2XYRiie8DQeCk3wig',
    domain: 'spotify.com',
    favicon: 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
    type: 'podcast'
  },
  {
    id: '4',
    title: 'Ge barnen ett äkta utrymme!',
    description: 'Att ge barnen utrymme men inte lita på dem när de tar plats, det är inte ett äkta utrymme. Om barns särställning inom kyrkan och behovet av autentiskt deltagande.',
    url: 'https://dagensseglora.se/2013/01/25/ge-barnen-ett-akta-utrymme/',
    domain: 'dagensseglora.se',
    favicon: 'https://dagensseglora.se/favicon.ico',
    type: 'article'
  },
  {
    id: '5',
    title: 'Att bli till!',
    description: 'En bokrecension av Peters bok "Att bli till – om människans innersta längtan och kyrkans yttersta uppdrag" i Svenska kyrkans diakoniblogg.',
    url: 'https://blogg.svenskakyrkan.se/diakonibloggen/2015/03/08/att-bli-till/',
    domain: 'svenskakyrkan.se',
    favicon: 'https://blogg.svenskakyrkan.se/favicon.ico',
    type: 'article'
  },
  {
    id: '6',
    title: 'Jag önskar mer resurser till lokala församlingar',
    description: 'Om kyrkoavgiften och målet att tillföra mer resurser för lokala församlingar att sprida evangelium och bygga Guds rike.',
    url: 'https://www.dagen.se/debatt/jag-onskar-mer-resurser-till-lokala-forsamlingar/3049951',
    domain: 'dagen.se',
    favicon: 'https://www.dagen.se/favicon.ico',
    type: 'article'
  },
  {
    id: '7',
    title: 'Ta bort svaret i konfirmationsgudstjänsten',
    description: 'En reflektion kring kyrkans pedagogiska trovärdighet och konfirmationens roll, med utgångspunkt i dopets centrala betydelse.',
    url: 'https://www.kyrkanstidning.se/debatt/ta-bort-svaret-i-konfirmationsgudstjansten',
    domain: 'kyrkanstidning.se',
    favicon: 'https://www.kyrkanstidning.se/favicon.ico',
    type: 'article'
  },
  {
    id: '8',
    title: 'Kyrkan tar inte AI-utvecklingen på allvar',
    description: 'Samtalet om AI måste få legitimitet bortom fikaborden i kyrkan och istället flytta in i rummen för styrning och ledning.',
    url: 'https://www.kyrkanstidning.se/debatt/kyrkan-tar-inte-ai-utvecklingen-pa-allvar/341871',
    domain: 'kyrkanstidning.se',
    favicon: 'https://www.kyrkanstidning.se/favicon.ico',
    type: 'article'
  }
];

export const MediaGrid = () => {
  const [visibleCount, setVisibleCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    setIsLoading(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 3, mediaItems.length));
      setTimeout(() => setIsLoading(false), 100);
    }, 600);
  };

  const hasMore = visibleCount < mediaItems.length;
  const visibleItems = mediaItems.slice(0, visibleCount);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 transition-all duration-500">
        {visibleItems.map((item, index) => {
          const isNewItem = index >= visibleCount - 3 && !isLoading;
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block transition-all duration-500 ${
                isNewItem 
                  ? 'animate-fade-in opacity-0' 
                  : index < 3 
                    ? 'animate-fade-in' 
                    : 'opacity-100'
              }`}
              style={{
                animationDelay: isNewItem 
                  ? `${(index - (visibleCount - 3)) * 150}ms`
                  : index < 3 
                    ? `${index * 100}ms`
                    : '0ms',
                animationFillMode: 'both'
              }}
            >
              <article className="bg-card border border-border rounded-lg p-4 md:p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <img 
                  src={item.favicon} 
                  alt={`${item.domain} favicon`}
                  className="w-5 h-5 md:w-6 md:h-6 rounded-sm flex-shrink-0"
                  onError={(e) => {
                    // Fallback to a generic icon if favicon fails to load
                    e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`;
                  }}
                />
                <span className="text-xs md:text-sm text-muted-foreground font-medium truncate">
                  {item.domain}
                </span>
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground ml-auto flex-shrink-0" />
              </div>
              
              <h3 className="text-base md:text-lg font-heading font-medium mb-2 md:mb-3 group-hover:text-accent transition-colors leading-tight">
                {item.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed flex-1 text-sm">
                {item.description}
              </p>
              
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-1 rounded-full">
                  {item.type}
                </span>
              </div>
            </article>
          </a>
          );
        })}
      </div>
      
      {/* Loading skeleton for new items */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 mt-8 md:mt-12">
          {Array.from({ length: Math.min(3, mediaItems.length - visibleCount) }).map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-muted rounded-sm flex-shrink-0"></div>
                  <div className="h-3 md:h-4 bg-muted rounded w-16 md:w-20"></div>
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-muted rounded ml-auto flex-shrink-0"></div>
                </div>
                <div className="h-4 md:h-5 bg-muted rounded w-3/4 mb-2 md:mb-3"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 md:h-4 bg-muted rounded w-full"></div>
                  <div className="h-3 md:h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-3 md:h-4 bg-muted rounded w-4/6"></div>
                </div>
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
                  <div className="h-4 md:h-5 bg-muted rounded-full w-12 md:w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="flex justify-center mt-12 md:mt-16">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 md:px-8 py-2 text-sm md:text-base transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <span className={`transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              {isLoading ? "Laddar..." : "Visa fler artiklar"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};
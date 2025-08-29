import { ExternalLink } from "lucide-react";

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
  }
];

export const MediaGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {mediaItems.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <article className="bg-card border border-border rounded-lg p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={item.favicon} 
                alt={`${item.domain} favicon`}
                className="w-6 h-6 rounded-sm"
                onError={(e) => {
                  // Fallback to a generic icon if favicon fails to load
                  e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`;
                }}
              />
              <span className="text-sm text-muted-foreground font-medium">
                {item.domain}
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
            </div>
            
            <h3 className="text-lg font-heading font-medium mb-3 group-hover:text-accent transition-colors leading-tight">
              {item.title}
            </h3>
            
            <p className="text-muted-foreground leading-relaxed flex-1 text-sm">
              {item.description}
            </p>
            
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-1 rounded-full">
                {item.type}
              </span>
            </div>
          </article>
        </a>
      ))}
    </div>
  );
};
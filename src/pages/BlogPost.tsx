import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";

// Placeholder data - senare ersätts med riktigt innehåll
const blogPosts = {
  "skrivandets-tystnad": {
    title: "Skrivandets tystnad och ljudets betydelse",
    date: "2024-01-15",
    readTime: "8 min",
    tags: ["Skrivprocess", "Kreativitet", "Reflektion"],
    content: `
      <p>I skrivandets värld finns det något magiskt med tystnaden. Inte bara tystnaden när vi skriver – den koncentrerade stunden när bara tanken och papperet (eller skärmen) existerar – utan tystnaden mellan orden, pauserna som ger berättelsen andrum.</p>

      <p>Som författare har jag ofta funderat över hur viktigt det outtalade är. De pauser vi skapar, de ögonblick då läsaren får tid att reflektera över det som just sagts. Det är i dessa tysta stunder som de djupaste känslorna ofta uppstår.</p>

      <h2>Pausens kraft</h2>

      <p>En välplacerad paus kan vara kraftfullare än tusen ord. Den kan skapa spänning, fördjupa en karaktärs reflektion eller ge läsaren tid att förstå en komplicerad idé. I mitt skrivande har jag lärt mig att respektera dessa stunder av tystnad.</p>

      <p>När jag läser igenom mina texter brukar jag lyssna efter rytmen. Finns det tillräckligt med andrum? Eller rusar texten på utan att ge läsaren chans att andas? Det är en balansgång som kräver både teknik och intuition.</p>

      <h3>Tekniska aspekter</h3>

      <p>Rent tekniskt kan vi skapa tystnad på flera sätt:</p>

      <ul>
        <li>Korta stycken som skapar visuella pauser</li>
        <li>Tankstreck som markerar reflektiva moment</li>
        <li>Dialoger där det osagda säger mer än orden</li>
        <li>Beskrivningar som ger läsaren tid att visualisera</li>
      </ul>

      <p>Men det handlar om mer än teknik. Det handlar om att förstå när en berättelse behöver vila, när en karaktär behöver tid att utvecklas, och när läsaren behöver ett ögonblick att smälta det som hänt.</p>

      <h2>Slutreflektion</h2>

      <p>I vår tid av ständig stimulering och snabba intryck blir tystnaden mer värdefull än någonsin. Som författare har vi möjligheten – och kanske till och med ansvaret – att skapa utrymmen för reflektion och vila.</p>

      <p>Nästa gång du skriver, tänk på tystnaden. Var rädd om den. Använd den medvetet. Låt dina ord få andas.</p>
    `
  },
  "fran-wordpress": {
    title: "Från WordPress till modern webbutveckling",
    date: "2024-01-08", 
    readTime: "12 min",
    tags: ["Teknik", "Utveckling", "Bloggande"],
    content: `
      <p>Under många år körde jag min blogg på WordPress – som så många andra författare och bloggare. Det fungerade bra, men jag började känna mig begränsad av plattformen. Laddningstiderna blev längre, anpassningsmöjligheterna krympte, och jag längtan efter något mer modernt.</p>

      <p>Så började min resa mot en helt ny typ av webbplats.</p>

      <h2>Varför lämna WordPress?</h2>

      <p>WordPress är fantastiskt för många, men för mig som författare med specifika krav på typografi och läsupplevelse började det kännas tungt. Jag ville ha:</p>

      <ul>
        <li>Snabbare laddningstider</li>
        <li>Full kontroll över typografin</li>
        <li>Modern, ren design</li>
        <li>Enkel integration med GitHub för versionshantering</li>
        <li>Möjlighet att skriva inlägg i Markdown</li>
      </ul>

      <h2>Upptäckten av Lovable</h2>

      <p>Genom en tillfällighet stötte jag på Lovable – en plattform som låter dig bygga moderna webbapplikationer med hjälp av AI. Som någon utan djup teknisk bakgrund var jag först skeptisk, men nyfikenheten tog över.</p>

      <p>Det som imponerade mig mest var hur enkelt det var att få exakt den design jag ville ha. Istället för att kämpa med WordPress-teman kunde jag bara beskriva vad jag ville ha, och systemet byggde det åt mig.</p>

      <h3>GitHub-integration</h3>

      <p>En av de största fördelarna är integration med GitHub. All min kod lagras säkert, och jag kan enkelt:
      
      <ul>
        <li>Göra backup av hela webbplatsen</li>
        <li>Spåra ändringar över tid</li>
        <li>Samarbeta med andra utvecklare om det behövs</li>
        <li>Deploiera till olika miljöer</li>
      </ul>

      <h2>Migrationsprocessen</h2>

      <p>Att flytta innehåll från WordPress var enklare än jag trodde. Jag exporterade mina gamla inlägg, konverterade dem till Markdown-format, och importerade dem till det nya systemet.</p>

      <p>Det som tog längst tid var att finslipa designen – men det var den roligaste delen! Att få exakt den typografi och layout jag alltid drömt om var värt varje minut.</p>

      <h2>Framtiden</h2>

      <p>Nu kan jag fokusera på det jag älskar mest – att skriva. Tekniken är inte längre i vägen utan stödjer min kreativa process. Och det bästa av allt: jag äger min plattform helt och hållet.</p>

      <p>Om du överväger en liknande flytt, tveka inte att höra av dig. Jag delar gärna med mig av mina erfarenheter!</p>
    `
  }
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = slug ? blogPosts[slug as keyof typeof blogPosts] : null;

  if (!post) {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-sans font-bold mb-6">Inlägg hittades inte</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Det inlägg du letar efter existerar inte eller har flyttats.
          </p>
          <Link to="/blogg">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka till bloggen
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link to="/blogg">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka till bloggen
            </Button>
          </Link>
        </div>

        {/* Article header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-sans font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('sv-SE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        {/* Article content */}
        <article 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Tyckte du om det här inlägget? Läs gärna fler av mina texter.
            </p>
            <Link to="/blogg">
              <Button variant="secondary">
                Fler blogginlägg
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BlogPost;
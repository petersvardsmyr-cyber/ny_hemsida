-- Create a table for blog posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  featured_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (making posts publicly readable)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Blog posts are publicly viewable" 
ON public.blog_posts 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the first blog post
INSERT INTO public.blog_posts (title, slug, excerpt, content, published_date, featured_image_url)
VALUES (
  'Varför är förlåtelse så svårt?',
  'varfor-ar-forlatelse-sa-svart',
  'När jag skriver något om förlåtelse på Instagram eller Facebook är det alltid fler reaktioner än vanligt. För mig är förlåtelse en grundpelare i hela tillvaron som människa.',
  'När jag skriver något om förlåtelse på Instagram eller Facebook är det alltid fler reaktioner än vanligt. Alltså åt båda håll. Vissa verkar älska ordet förlåtelse och andra verkar känna sig direkt provocerade av det.

För mig är förlåtelse en grundpelare i hela tillvaron som människa. Det är en av de djupa fundament som liksom klämtar på hjärtats klocka och får den att skälva flera gånger varje dag.

**För det mesta handlar nog förlåtelse om det vardagliga. Att inte bry så mycket, helt enkelt. Att inte brusa upp vid minsta oförrätt eller hugga tillbaka vid minsta känsla av att bli förminskad eller förbisedd på något sätt. Det uppstår små märkligheter och obekvämheter (om det nu är ett ord) i relationer dagligen. Att försöka ha en förlåtande attityd till sin omgivning tycker jag hjälper. Det är inte lätt, men jag tror det går att lära sig att vandra den vägen. Den förlåtande attityden.**

## De större perspektiven

Sen har vi de större perspektiven. Det som inte bara handlar om vardag och attityd. De djupa såren och de stora sveken. Lögnerna och bedrägerierna. Går det att förlåta allt? Verkligen?

Det beror ju på vad jag lägger i ordet förlåtelse. Vad lägger du i det ordet? För mig är det ett ord som är så stort och komplext att det nästan är omöjligt att förstå fullt ut. Det är ett ord som har olika innebörd i olika tider av livet. Ett ord som bjuder in till samtal, men också till tystnad och väntan.

Förlåtelse.

För mig är det ett mjukt ord. Det vill väl. Det vill inte krav eller prestation. Det vill bara…väl.

Men det handlar också om tid. Eller hur?

**Och för mig blir det nästan svårt, åt andra hållet. Det blir utmanande att inte förlåta. För när det gått en tid. När vrede och ilska har lagt sig,. När öppna sår har börjat koagulera. Då börjar alltid en annan insikt försiktigt smyga sig på. Den om mig själv. Den som handlar om vem jag är om jag inte förlåter. Vem jag blir. Vem jag vill vara i världen och även om hur jag vill uppfattas.**

För förlåtelse kan aldrig handla om att täcka över och glömma bort. Det handlar inte om att prestera något som skaver i hela ens existens. Det handlar om att släppa en sten.

## Den tunga stenen

Den enda person i hela världen som bär på just den tunga stenen är jag. Även om jag tillskriver en enskild person eller en grupp personer skulden för att jag bär på stenen är det bara jag som bär på den.

Och bara jag som kan släppa den.

Och att vända blicken från den som orsakade stenen till den som nu bär på den är helt nödvändigt, tillslut. För det som hände går inte att göra ogjort. Hur mycket vi än vill spola tillbaka i scenerna på livets filmduk kommer inte historien att skrivas om. Och nu. Nu handlar det bara om det som kommer. Om framtiden.

Vad tänker du om detta? Är förlåtelse möjligt i alla situationer? Varför är förlåtelse ibland så svårt?',
  '2025-06-07',
  'https://i0.wp.com/petersvardsmyr.se/wp-content/uploads/2025/06/Forgive-Picture-scaled.webp?fit=1920%2C1280&ssl=1'
);
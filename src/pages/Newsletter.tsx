import { NewsletterSignup } from '@/components/NewsletterSignup';

const Newsletter = () => {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Nyhetsbrev
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Få inspiration, nyheter och mina senaste texter direkt i din inkorg.
          </p>
        </div>
        
        <div className="flex justify-center">
          <NewsletterSignup />
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
const Footer = () => {
  // Obfuskera e-postadressen för att skydda mot spammare
  const getEmail = () => {
    const user = "hej";
    const domain = "petersvardsmyr.se";
    return `${user}@${domain}`;
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${getEmail()}`;
  };

  return (
    <footer className="bg-background py-8">
      <div className="pl-4 md:pl-48 pr-4 md:pr-12">
        {/* Email */}
        <div className="flex items-center gap-2 mb-4">
          <a 
            href="#" 
            onClick={handleEmailClick}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Email till Peter Svärdsmyr"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm md:text-base">Skriv till mig för samarbeten eller bara för att säga hej</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex gap-3 md:gap-4 mb-4">
          <a href="https://www.instagram.com/petersvardsmyr/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Instagram">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.017 0C8.396 0 7.916.016 6.704.095 5.493.174 4.677.444 3.967.84c-.73.397-1.349.92-1.966 1.537-.617.617-1.14 1.236-1.537 1.966-.396.71-.666 1.526-.745 2.737C.016 7.916 0 8.396 0 12.017c0 3.621.016 4.101.095 5.313.079 1.211.349 2.027.745 2.737.397.73.92 1.349 1.537 1.966.617.617 1.236 1.14 1.966 1.537.71.396 1.526.666 2.737.745 1.212.079 1.692.095 5.313.095 3.621 0 4.101-.016 5.313-.095 1.211-.079 2.027-.349 2.737-.745.73-.397 1.349-.92 1.966-1.537.617-.617 1.14-1.236 1.537-1.966.396-.71.666-1.526.745-2.737C23.984 16.101 24 15.621 24 12.017c0-3.621-.016-4.101-.095-5.313-.079-1.211-.349-2.027-.745-2.737-.397-.73-.92-1.349-1.537-1.966C20.006 1.384 19.387.86 18.657.464c-.71-.396-1.526-.666-2.737-.745C14.708.016 14.228 0 10.607 0h1.41zm0 2.162c3.561 0 3.985.016 5.39.095 1.3.059 2.007.278 2.477.461.622.242 1.066.532 1.532.998.466.466.756.91.998 1.532.183.47.402 1.177.461 2.477.079 1.405.095 1.829.095 5.39 0 3.561-.016 3.985-.095 5.39-.059 1.3-.278 2.007-.461 2.477-.242.622-.532 1.066-.998 1.532-.466.466-.91.756-1.532.998-.47.183-1.177.402-2.477.461-1.405.079-1.829.095-5.39.095-3.561 0-3.985-.016-5.39-.095-1.3-.059-2.007-.278-2.477-.461-.622-.242-1.066-.532-1.532-.998-.466-.466-.756-.91-.998-1.532-.183-.47-.402-1.177-.461-2.477-.079-1.405-.095-1.829-.095-5.39 0-3.561.016-3.985.095-5.39.059-1.3.278-2.007.461-2.477.242-.622.532-1.066.998-1.532.466-.466.91-.756 1.532-.998.47-.183 1.177-.402 2.477-.461 1.405-.079 1.829-.095 5.39-.095zm0 3.678c-2.712 0-4.91 2.198-4.91 4.91s2.198 4.91 4.91 4.91 4.91-2.198 4.91-4.91-2.198-4.91-4.91-4.91zm0 8.088c-1.752 0-3.178-1.426-3.178-3.178s1.426-3.178 3.178-3.178 3.178 1.426 3.178 3.178-1.426 3.178-3.178 3.178zm6.238-8.27c0 .632-.513 1.145-1.145 1.145-.632 0-1.145-.513-1.145-1.145s.513-1.145 1.145-1.145c.632 0 1.145.513 1.145 1.145z" clipRule="evenodd" />
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

        {/* Copyright */}
        <div>
          <p className="text-sm text-muted-foreground">© 2025 Peter Svärdsmyr</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
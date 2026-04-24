import { useEffect } from "react";

const WikiRedirectPage = () => {
  useEffect(() => {
    // Redirect to wiki subdomain
    const domain = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Extract the base domain (remove www or any subdomain)
    let baseDomain = domain;
    if (domain.startsWith("www.")) {
      baseDomain = domain.substring(4);
    }
    
    // Build the wiki URL
    const wikiUrl = `${protocol}//wiki.${baseDomain}`;
    window.location.href = wikiUrl;
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Wiki...</h1>
        <p className="text-gray-600">If you are not redirected automatically, please click the link below.</p>
        <a href="#" id="wiki-link" className="text-blue-600 hover:underline mt-4 inline-block">
          Go to Wiki
        </a>
      </div>
    </div>
  );
};

export default WikiRedirectPage;

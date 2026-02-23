import {useEffect} from 'react';
import {defaultOgImageUrl} from '../../lib/seo';

interface Props {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | null;
}

const SeoMeta = ({title, description, url, image, type = 'website', noindex = false, jsonLd = null}: Props) => {
  const ogImage = image ?? defaultOgImageUrl;
  const robotsValue = noindex ? 'noindex,nofollow' : 'index,follow';
  const jsonLdValue = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const previousTitle = document.title;

    const setMetaByName = (name: string, content: string) => {
      let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setMetaByProperty = (property: string, content: string) => {
      let element = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setCanonicalLink = (href: string) => {
      let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    const setJsonLdScript = (content: string | null) => {
      const selector = 'script[type="application/ld+json"][data-rf-seo="jsonld"]';
      const existing = document.head.querySelector(selector);
      if (!content) {
        existing?.remove();
        return;
      }

      let element = existing as HTMLScriptElement | null;
      if (!element) {
        element = document.createElement('script');
        element.setAttribute('type', 'application/ld+json');
        element.setAttribute('data-rf-seo', 'jsonld');
        document.head.appendChild(element);
      }
      element.textContent = content;
    };

    document.title = title;
    setMetaByName('description', description);
    setMetaByName('robots', robotsValue);
    setCanonicalLink(url);

    setMetaByProperty('og:title', title);
    setMetaByProperty('og:description', description);
    setMetaByProperty('og:url', url);
    setMetaByProperty('og:type', type);
    setMetaByProperty('og:image', ogImage);

    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', title);
    setMetaByName('twitter:description', description);
    setMetaByName('twitter:image', ogImage);
    setJsonLdScript(jsonLdValue);

    return () => {
      document.title = previousTitle;
    };
  }, [description, jsonLdValue, ogImage, robotsValue, title, type, url]);

  return null;
};

export default SeoMeta;

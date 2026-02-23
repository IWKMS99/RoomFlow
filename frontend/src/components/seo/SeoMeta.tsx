import {Helmet} from 'react-helmet-async';
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

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsValue} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
};

export default SeoMeta;

import {render} from '@testing-library/react';
import {beforeEach, describe, expect, it} from 'vitest';
import SeoMeta from '../SeoMeta';

const cleanupSeoNodes = () => {
  const selectors = [
    'meta[name="description"]',
    'meta[name="robots"]',
    'meta[name="twitter:card"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
    'meta[name="twitter:image"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:url"]',
    'meta[property="og:type"]',
    'meta[property="og:image"]',
    'link[rel="canonical"]',
    'script[type="application/ld+json"][data-rf-seo="jsonld"]',
  ];

  selectors.forEach((selector) => {
    document.head.querySelectorAll(selector).forEach((node) => node.remove());
  });
};

describe('SeoMeta', () => {
  beforeEach(() => {
    cleanupSeoNodes();
    document.title = 'Base Title';
  });

  it('sets head tags and restores title on unmount', () => {
    const {unmount} = render(
      <SeoMeta
        title="RoomFlow Schedule"
        description="Find and book rooms."
        url="https://roomflow.local/schedule"
        image="https://roomflow.local/og.png"
        type="website"
        jsonLd={{'@context': 'https://schema.org', '@type': 'WebPage', name: 'RoomFlow'}}
      />
    );

    expect(document.title).toBe('RoomFlow Schedule');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Find and book rooms.');
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://roomflow.local/schedule');
    expect(document.head.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe('https://roomflow.local/og.png');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://roomflow.local/schedule');
    expect(document.head.querySelector('script[data-rf-seo="jsonld"]')?.textContent).toContain('"@type":"WebPage"');

    unmount();
    expect(document.title).toBe('Base Title');
  });

  it('updates existing tags without duplicates and removes json-ld when omitted', () => {
    const {rerender} = render(
      <SeoMeta
        title="A"
        description="First"
        url="https://roomflow.local/a"
        image="https://roomflow.local/a.png"
        type="website"
        jsonLd={{'@type': 'WebPage'}}
      />
    );

    rerender(
      <SeoMeta
        title="B"
        description="Second"
        url="https://roomflow.local/b"
        image="https://roomflow.local/b.png"
        type="article"
        noindex
        jsonLd={null}
      />
    );

    expect(document.title).toBe('B');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Second');
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex,nofollow');
    expect(document.head.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://roomflow.local/b.png');
    expect(document.head.querySelector('script[data-rf-seo="jsonld"]')).toBeNull();

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });
});

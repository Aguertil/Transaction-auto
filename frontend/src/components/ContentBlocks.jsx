import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Texte enrichi minimal : **gras** et [lien](/chemin) ou [lien](https://…).
 */
export function RichText({ text }) {
  const parts = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      parts.push(<strong key={i++}>{m[1]}</strong>);
    } else if (m[3].startsWith('/')) {
      parts.push(<Link key={i++} to={m[3]}>{m[2]}</Link>);
    } else {
      parts.push(
        <a key={i++} href={m[3]} target="_blank" rel="noopener noreferrer">{m[2]}</a>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2 id={block.id}>{block.text}</h2>;
    case 'h3':
      return <h3>{block.text}</h3>;
    case 'p':
      return <p><RichText text={block.text} /></p>;
    case 'note':
      return <p className="seo-note"><RichText text={block.text} /></p>;
    case 'ul':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}><RichText text={item} /></li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}><RichText text={item} /></li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="seo-table-wrap">
          <table className="seo-table">
            <thead>
              <tr>{block.head.map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => <td key={c}><RichText text={cell} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export default function ContentBlocks({ blocks }) {
  return blocks.map((block, i) => <Block key={i} block={block} />);
}

export function FaqList({ faq }) {
  return faq.map((item) => (
    <div key={item.q} className="faq-item">
      <h3>{item.q}</h3>
      <p><RichText text={item.a} /></p>
    </div>
  ));
}

/** JSON-LD FAQPage — texte brut (sans balisage). */
export function faqJsonLd(faq) {
  const strip = (t) => t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[(.+?)\]\((.+?)\)/g, '$1');
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: strip(item.a) }
    }))
  };
}

export function breadcrumbJsonLd(siteUrl, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path}`
    }))
  };
}

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

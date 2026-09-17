# Blog ActeDeVente.fr

## Ajouter un article

1. Ouvrir `frontend/src/content/blogPosts.js`
2. Ajouter un objet dans le tableau `blogPosts` :

```js
{
  slug: 'mon-nouvel-article',          // URL : /blog/mon-nouvel-article
  title: 'Titre visible (H1) + SEO',
  description: 'Meta description ~150 caractères.',
  date: '2026-09-20',                  // YYYY-MM-DD
  keywords: ['mot-clé 1', 'mot-clé 2'],
  content: [
    { type: 'p', text: 'Introduction…' },
    { type: 'h2', text: 'Sous-titre' },
    { type: 'ul', items: ['point A', 'point B'] },
    { type: 'ol', items: ['étape 1', 'étape 2'] }
  ]
}
```

3. Ajouter l’URL dans `frontend/public/sitemap.xml`
4. Commit + push → Render rebuild

Types de blocs : `p`, `h2`, `h3`, `ul`, `ol`.

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND_NAME } from '../brand';
import './SiteChrome.css';

/**
 * Navigation partagée pages contenu / blog (hors hero full-bleed).
 */
export default function SiteHeader({ variant = 'light' }) {
  const { user } = useAuth();
  const cls = `site-header site-header-${variant}`;

  return (
    <header className={cls}>
      <div className="site-header-inner">
        <Link to="/" className="site-logo">{BRAND_NAME}</Link>
        <nav className="site-nav" aria-label="Navigation">
          <Link to="/cerfa-15776">CERFA 15776</Link>
          <Link to="/documents-vente-vehicule">Documents</Link>
          <Link to="/blog">Blog</Link>
          {user ? (
            <Link to="/dashboard" className="site-nav-cta">Mon espace</Link>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register" className="site-nav-cta">Inscription</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/">{BRAND_NAME}</Link>
          <p>Générateur de CERFA et documents de vente automobile.</p>
        </div>
        <div className="site-footer-cols">
          <div>
            <h2 className="site-footer-title">Outils</h2>
            <ul>
              <li><Link to="/#cerfa">Générer le CERFA 15776</Link></li>
              <li><Link to="/cerfa-15776">Guide CERFA 15776</Link></li>
              <li><Link to="/documents-vente-vehicule">Tous les documents</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="site-footer-title">Ressources</h2>
            <ul>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/blog/comment-remplir-cerfa-15776">Remplir le CERFA 15776</Link></li>
              <li><Link to="/blog/documents-vente-pro-particulier">Vente pro / particulier</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="site-footer-title">Compte</h2>
            <ul>
              <li><Link to="/register">Créer un compte</Link></li>
              <li><Link to="/login">Connexion</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <p className="site-footer-legal">
        {BRAND_NAME} facilite la rédaction de formulaires. Vérifiez toujours vos informations avant dépôt administratif.
      </p>
    </footer>
  );
}

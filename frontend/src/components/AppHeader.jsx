import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AppHeader.css';

export function AppHeader({ active, actions }) {
  const { user, signOut } = useAuth();
  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-header-logo">On-Track</span>
        <nav className="app-header-nav">
          <Link to="/dashboard" className={`app-nav-link${active === 'dashboard' ? ' app-nav-active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/applications" className={`app-nav-link${active === 'applications' ? ' app-nav-active' : ''}`}>
            Applications
          </Link>
        </nav>
      </div>
      <div className="app-header-right">
        {actions}
        <span className="app-header-email">{user?.email}</span>
        <button onClick={signOut} className="app-header-signout">Sign out</button>
      </div>
    </header>
  );
}

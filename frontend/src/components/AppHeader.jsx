import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AppHeader.css';

export function AppHeader({ actions }) {
  const { user, signOut } = useAuth();
  return (
    <header className="app-header">
      <Link to="/app" className="app-header-logo">On-Track</Link>
      <div className="app-header-right">
        {actions}
        <span className="app-header-email">{user?.email}</span>
        <button onClick={signOut} className="app-header-signout">Sign out</button>
      </div>
    </header>
  );
}

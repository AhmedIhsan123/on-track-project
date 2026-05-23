import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function Navbar() {
  const { user, signOut } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        on<span className="navbar-logo-dot">·</span>track
      </Link>

      <div className="navbar-right">
        <Link to="/app/new" className="navbar-add-btn">+ Add Application</Link>
        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>
          <span className="navbar-name">{fullName}</span>
          <button
            className="navbar-signout"
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
          >
            <SignOutIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

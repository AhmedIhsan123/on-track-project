import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Applications.css';

export default function Applications() {
  const { signOut } = useAuth();

  return (
    <div className="apps-page">
      <header className="apps-header">
        <h1>On-Track</h1>
        <div className="apps-header-actions">
          <Link to="/applications/new" className="apps-btn-add">+ Add application</Link>
          <button onClick={signOut} className="apps-btn-signout">Sign out</button>
        </div>
      </header>
      <main className="apps-main">
        <p>Your applications will appear here.</p>
      </main>
    </div>
  );
}

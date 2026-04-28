import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>On-Track</h1>
        <div className="dashboard-user">
          <span>{user?.email}</span>
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>
      <main className="dashboard-main">
        <p>Your applications will appear here.</p>
      </main>
    </div>
  );
}

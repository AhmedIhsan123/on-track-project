import './Toast.css';

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <span className="toast-icon">✓</span>}
          {t.type === 'error' && <span className="toast-icon">✕</span>}
          <span className="toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

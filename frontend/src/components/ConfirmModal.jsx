import './ConfirmModal.css';

export function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <p className="modal-title">{title}</p>
        {message && <p className="modal-msg">{message}</p>}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="modal-confirm" onClick={onConfirm} disabled={loading} autoFocus>
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

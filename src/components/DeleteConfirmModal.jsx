import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ itemName, itemType = 'item', onConfirm, onCancel, isDeleting = false }) => {
  return (
    <div className="delete-confirm-modal">
      <div className="delete-confirm-icon">
        <AlertTriangle size={48} color="#EF4444" />
      </div>
      
      <h3 className="delete-confirm-title">Delete {itemType}?</h3>
      
      <p className="delete-confirm-message">
        Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
      </p>

      <div className="delete-confirm-actions">
        <button 
          type="button" 
          onClick={onCancel} 
          className="swiss-button-outline"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button 
          type="button" 
          onClick={onConfirm} 
          className="delete-button"
          disabled={isDeleting}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px',
            minWidth: '120px'
          }}
        >
          {isDeleting ? (
            <>
              <Loader2 size={18} className="spinner" />
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

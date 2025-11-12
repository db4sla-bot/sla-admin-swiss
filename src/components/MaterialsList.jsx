import { Edit2, Trash2, Package } from 'lucide-react';

const MaterialsList = ({ materials, onEdit, onDelete }) => {
  if (materials.length === 0) {
    return (
      <div className="empty-state">
        <Package size={48} className="empty-icon" />
        <h3 className="empty-title">No materials found</h3>
        <p className="empty-description">
          Add your first material to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="materials-grid">
      {materials.map((material) => (
        <div key={material.id} className="material-card">
          <div className="material-card-header">
            <div className="material-icon-wrapper">
              <Package size={20} />
            </div>
            <div className="material-actions">
              <button
                onClick={() => onEdit(material)}
                className="action-button"
                aria-label="Edit material"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(material.id)}
                className="action-button action-delete"
                aria-label="Delete material"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="material-card-body">
            <h3 className="material-name">{material.name}</h3>
            <p className="material-id">ID: {material.id}</p>
            
            <div className="material-details">
              <div className="material-detail-item">
                <span className="detail-label">Price</span>
                <span className="detail-value">₹{material.pricePerUnit.toFixed(2)} / {material.unit}</span>
              </div>
              
              <div className="material-detail-item">
                <span className="detail-label">Buffer Stock</span>
                <span className="detail-value">{material.bufferStock} {material.unit}s</span>
              </div>
            </div>
          </div>

          <div className="material-card-footer">
            <span className="material-date">
              Added: {new Date(material.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialsList;

import { Edit2, Trash2, TrendingUp, User, Calendar, DollarSign } from 'lucide-react';

const AssetsList = ({ assets, onEdit, onDelete }) => {
  if (assets.length === 0) {
    return (
      <div className="empty-state">
        <TrendingUp size={48} className="empty-icon" />
        <h3 className="empty-title">No asset investments found</h3>
        <p className="empty-description">
          Add your first asset investment to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="assets-grid">
      {assets.map((asset) => (
        <div key={asset.id} className="asset-card">
          <div className="asset-card-header">
            <div className="asset-icon-wrapper">
              <TrendingUp size={20} />
            </div>
            <div className="material-actions">
              <button
                onClick={() => onEdit(asset)}
                className="action-button"
                aria-label="Edit asset"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(asset.id)}
                className="action-button action-delete"
                aria-label="Delete asset"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="asset-card-body">
            <h3 className="asset-name">{asset.assetName}</h3>
            <p className="material-id">ID: {asset.id}</p>

            <div className="asset-amount-display">
              <span className="asset-amount-label">Investment Amount</span>
              <span className="asset-amount-value">₹{asset.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="asset-info-grid">
              <div className="asset-info-item">
                <User size={14} className="asset-info-icon" />
                <span className="asset-info-text">{asset.investedBy}</span>
              </div>

              <div className="asset-info-item">
                <Calendar size={14} className="asset-info-icon" />
                <span className="asset-info-text">
                  {new Date(asset.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="asset-card-footer">
            <span className="material-date">
              Added: {new Date(asset.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetsList;

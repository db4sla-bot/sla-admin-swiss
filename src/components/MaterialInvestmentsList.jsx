import { Package, Calendar, IndianRupee, Edit2, Trash2 } from 'lucide-react';
import Pagination from './Pagination';

const MaterialInvestmentsList = ({ 
  investments, 
  onEdit, 
  onDelete, 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (investments.length === 0) {
    return (
      <div className="empty-state">
        <Package className="empty-icon" size={64} />
        <h3 className="empty-title">No Material Investments Found</h3>
        <p className="empty-description">
          Start by adding your first material investment using the button above.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="material-investments-grid">
        {investments.map((investment) => (
          <div key={investment.id} className="material-investment-card">
            <div className="material-investment-card-header">
              <div className="material-investment-icon-wrapper">
                <Package size={20} />
              </div>
              <div className="material-investment-actions">
                <button
                  onClick={() => onEdit(investment)}
                  className="action-button"
                  title="Edit investment"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(investment.id)}
                  className="action-button action-delete"
                  title="Delete investment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="material-investment-card-body">
              <h3 className="material-investment-name">{investment.materialName}</h3>
              <div className="material-investment-id">ID: {investment.materialId}</div>

              <div className="material-investment-amount-display">
                <div className="material-investment-amount-label">Investment Amount</div>
                <div className="material-investment-amount-value">
                  {formatCurrency(investment.amount)}
                </div>
              </div>

              <div className="material-investment-info-grid">
                <div className="material-investment-info-item">
                  <Calendar className="material-investment-info-icon" size={16} />
                  <span className="material-investment-info-text">
                    {formatDate(investment.date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="material-investment-card-footer">
              <span className="material-investment-date">
                Added: {formatDate(investment.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default MaterialInvestmentsList;

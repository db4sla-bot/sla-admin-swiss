import { User, Calendar, IndianRupee, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Pagination from './Pagination';

const PayrollList = ({ payrolls, onEdit, onDelete, onUpdateStatus, currentPage, totalPages, onPageChange }) => {
  if (payrolls.length === 0) {
    return (
      <div className="empty-state">
        <IndianRupee className="empty-icon" size={64} />
        <h3 className="empty-title">No Payroll Records Found</h3>
        <p className="empty-description">
          Start by adding your first payroll record using the button above.
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'status-paid';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="payroll-grid">
        {payrolls.map((payroll) => (
          <div key={payroll.id} className="payroll-card">
            <div className="payroll-card-header">
              <div className="payroll-icon-wrapper">
                <User size={20} />
              </div>
              <div className="payroll-status-wrapper">
                <select
                  value={payroll.status}
                  onChange={(e) => onUpdateStatus(payroll.id, e.target.value)}
                  className={`payroll-status-select ${getStatusColor(payroll.status)}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="payroll-card-body">
              <h3 className="payroll-employee-name">{payroll.employeeName}</h3>
              <div className="payroll-employee-id">ID: {payroll.employeeId}</div>

              <div className="payroll-breakdown">
                <div className="breakdown-row">
                  <span className="breakdown-label">Basic Salary</span>
                  <span className="breakdown-value">{formatCurrency(payroll.basicSalary)}</span>
                </div>
                
                {payroll.bonus > 0 && (
                  <div className="breakdown-row positive">
                    <span className="breakdown-label">
                      <TrendingUp size={14} /> Bonus
                    </span>
                    <span className="breakdown-value">+{formatCurrency(payroll.bonus)}</span>
                  </div>
                )}

                {payroll.miscellaneous > 0 && (
                  <div className="breakdown-row positive">
                    <span className="breakdown-label">
                      <TrendingUp size={14} /> Miscellaneous
                    </span>
                    <span className="breakdown-value">+{formatCurrency(payroll.miscellaneous)}</span>
                  </div>
                )}

                {payroll.deductions > 0 && (
                  <div className="breakdown-row negative">
                    <span className="breakdown-label">
                      <TrendingDown size={14} /> Deductions
                    </span>
                    <span className="breakdown-value">-{formatCurrency(payroll.deductions)}</span>
                  </div>
                )}
              </div>

              <div className="payroll-total">
                <span className="total-label">Total Salary</span>
                <span className="total-value">{formatCurrency(payroll.totalSalary)}</span>
              </div>

              <div className="payroll-info">
                <div className="payroll-info-item">
                  <Calendar size={14} />
                  <span>{formatDate(payroll.paymentDate)}</span>
                </div>
              </div>
            </div>

            <div className="payroll-card-footer">
              <div className="payroll-actions">
                <button
                  onClick={() => onEdit(payroll)}
                  className="action-button"
                  title="Edit payroll"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(payroll.id)}
                  className="action-button action-delete"
                  title="Delete payroll"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <span className="payroll-date">
                Created: {formatDate(payroll.createdAt)}
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

export default PayrollList;

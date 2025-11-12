import { FileText, User, Calendar, Eye, Download, Trash2 } from 'lucide-react';
import Pagination from './Pagination';

const InvoicesList = ({ invoices, onView, onDelete, onStatusChange, currentPage, totalPages, onPageChange }) => {
  if (invoices.length === 0) {
    return (
      <div className="empty-state">
        <FileText className="empty-icon" size={64} strokeWidth={1.5} />
        <h3 className="empty-title">No Invoices Found</h3>
        <p className="empty-description">
          Start by creating your first invoice using the button above.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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
        return 'status-pending';
    }
  };

  return (
    <>
      <div className="invoices-grid">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="invoice-card">
            <div className="invoice-card-header">
              <div className="invoice-number">
                <FileText size={18} />
                <span>{invoice.invoiceNumber}</span>
              </div>
              <select
                value={invoice.status}
                onChange={(e) => onStatusChange(invoice.id, e.target.value)}
                className={`status-select ${getStatusColor(invoice.status)}`}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="invoice-card-body">
              <div className="invoice-customer">
                <User size={16} />
                <div>
                  <p className="customer-name">{invoice.customerName}</p>
                  <p className="customer-mobile">{invoice.customerMobile}</p>
                </div>
              </div>

              <div className="invoice-info">
                <div className="invoice-info-item">
                  <Calendar size={14} />
                  <span>{formatDate(invoice.invoiceDate)}</span>
                </div>
              </div>

              <div className="invoice-amount">
                <span className="amount-label">Total Amount</span>
                <span className="amount-value">{formatCurrency(invoice.grandTotal)}</span>
              </div>

              <div className="invoice-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Items</span>
                  <span className="detail-value">{invoice.workItems.length}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">GST</span>
                  <span className="detail-value">{invoice.gstPercentage}%</span>
                </div>
                {invoice.technician && (
                  <div className="detail-item">
                    <span className="detail-label">Technician</span>
                    <span className="detail-value">{invoice.technician}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="invoice-card-footer">
              <button
                onClick={() => onView(invoice)}
                className="invoice-action-btn"
                title="View invoice"
              >
                <Eye size={16} />
                <span>View</span>
              </button>
              <button
                onClick={() => window.print()}
                className="invoice-action-btn"
                title="Download PDF"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
              <button
                onClick={() => onDelete(invoice.id)}
                className="invoice-action-btn action-delete"
                title="Delete invoice"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
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

export default InvoicesList;

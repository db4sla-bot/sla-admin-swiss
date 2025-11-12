import { User, Phone, MapPin, Edit2, Trash2 } from 'lucide-react';
import Pagination from './Pagination';

const CustomersList = ({ customers, onEdit, onDelete, currentPage, totalPages, onPageChange }) => {
  if (customers.length === 0) {
    return (
      <div className="empty-state">
        <User className="empty-icon" size={64} />
        <h3 className="empty-title">No Customers Found</h3>
        <p className="empty-description">
          Start by adding your first customer using the button above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="customers-grid">
        {customers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <div className="customer-card-header">
              <div className="customer-icon-wrapper">
                <User size={20} />
              </div>
              <div className="customer-status-badge-wrapper">
                <span className={`customer-status-badge status-${customer.status.toLowerCase()}`}>
                  {customer.status}
                </span>
              </div>
            </div>

            <div className="customer-card-body">
              <h3 className="customer-name">{customer.name}</h3>
              
              <div className="customer-info-grid">
                <div className="customer-info-item">
                  <Phone className="customer-info-icon" size={16} />
                  <span className="customer-info-text">{customer.mobile}</span>
                </div>
                
                <div className="customer-info-item">
                  <MapPin className="customer-info-icon" size={16} />
                  <span className="customer-info-text">{customer.address}</span>
                </div>
              </div>

              <div className="customer-services">
                <div className="customer-services-label">Services</div>
                <div className="customer-services-tags">
                  {customer.services.map((service, index) => (
                    <span key={index} className="service-tag">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="customer-card-footer">
              <div className="customer-actions">
                <button
                  onClick={() => onEdit(customer)}
                  className="action-button"
                  title="Edit customer"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(customer.id)}
                  className="action-button action-delete"
                  title="Delete customer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <span className="customer-date">
                Added: {new Date(customer.createdAt).toLocaleDateString()}
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

export default CustomersList;

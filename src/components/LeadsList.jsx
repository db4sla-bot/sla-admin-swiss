import { Edit2, Trash2, User, Phone, MapPin, Calendar, Tag } from 'lucide-react';

const LeadsList = ({ leads, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-700 border-blue-300',
      'Followup': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Sitevisit': 'bg-purple-100 text-purple-700 border-purple-300',
      'Quotation': 'bg-green-100 text-green-700 border-green-300',
      'Customer Declines': 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (leads.length === 0) {
    return (
      <div className="empty-state">
        <User size={48} className="empty-icon" />
        <h3 className="empty-title">No leads found</h3>
        <p className="empty-description">
          Add your first lead to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="leads-grid">
      {leads.map((lead) => (
        <div key={lead.id} className="lead-card">
          <div className="lead-card-header">
            <div className="flex items-center gap-2">
              <div className="lead-icon-wrapper">
                <User size={18} />
              </div>
              <span className={`lead-status-badge ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
            </div>
            <div className="material-actions">
              <button
                onClick={() => onEdit(lead)}
                className="action-button"
                aria-label="Edit lead"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(lead.id)}
                className="action-button action-delete"
                aria-label="Delete lead"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="lead-card-body">
            <h3 className="lead-name">{lead.customerName}</h3>
            <p className="material-id">ID: {lead.id}</p>

            <div className="lead-info-grid">
              <div className="lead-info-item">
                <Phone size={14} className="lead-info-icon" />
                <span className="lead-info-text">{lead.mobileNumber}</span>
              </div>

              {lead.address && (
                <div className="lead-info-item">
                  <MapPin size={14} className="lead-info-icon" />
                  <span className="lead-info-text truncate">{lead.address}</span>
                </div>
              )}

              <div className="lead-info-item">
                <Tag size={14} className="lead-info-icon" />
                <span className="lead-info-text">
                  {lead.source}{lead.subSource ? ` - ${lead.subSource}` : ''}
                </span>
              </div>

              <div className="lead-info-item">
                <Calendar size={14} className="lead-info-icon" />
                <span className="lead-info-text">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {lead.requiredServices.length > 0 && (
              <div className="lead-services">
                <p className="lead-services-label">Required Services:</p>
                <div className="flex flex-wrap gap-1.5">
                  {lead.requiredServices.map(service => (
                    <span key={service} className="service-tag">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {lead.details && (
              <div className="lead-details">
                <p className="lead-details-text">{lead.details}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadsList;

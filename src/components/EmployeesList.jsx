import { User, Phone, Mail, Shield, Edit2, Trash2, FileText } from 'lucide-react';
import Pagination from './Pagination';

const EmployeesList = ({ employees, onEdit, onDelete, currentPage, totalPages, onPageChange }) => {
  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <User className="empty-icon" size={64} />
        <h3 className="empty-title">No Employees Found</h3>
        <p className="empty-description">
          Start by adding your first employee using the button above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="employees-grid">
        {employees.map((employee) => (
          <div key={employee.id} className="employee-card">
            <div className="employee-card-header">
              <div className="employee-icon-wrapper">
                <User size={20} />
              </div>
              <div className="employee-badges">
                {employee.isAdmin && (
                  <span className="employee-badge admin-badge">
                    <Shield size={12} />
                    Admin
                  </span>
                )}
                <span className={`employee-status-badge status-${employee.status.toLowerCase()}`}>
                  {employee.status}
                </span>
              </div>
            </div>

            <div className="employee-card-body">
              <h3 className="employee-name">{employee.name}</h3>
              
              <div className="employee-info-grid">
                <div className="employee-info-item">
                  <Phone className="employee-info-icon" size={16} />
                  <span className="employee-info-text">{employee.mobile}</span>
                </div>
                
                {employee.email && (
                  <div className="employee-info-item">
                    <Mail className="employee-info-icon" size={16} />
                    <span className="employee-info-text">{employee.email}</span>
                  </div>
                )}

                {employee.highestQualification && (
                  <div className="employee-info-item">
                    <FileText className="employee-info-icon" size={16} />
                    <span className="employee-info-text">
                      {employee.highestQualification}
                      {employee.passedOutYear && ` (${employee.passedOutYear})`}
                    </span>
                  </div>
                )}
              </div>

              <div className="employee-permissions">
                <div className="permissions-label">Permissions</div>
                <div className="permissions-tags">
                  {employee.canView && (
                    <span className="permission-tag view">View</span>
                  )}
                  {employee.canEdit && (
                    <span className="permission-tag edit">Edit</span>
                  )}
                  {!employee.canView && !employee.canEdit && (
                    <span className="permission-tag none">No Permissions</span>
                  )}
                </div>
              </div>

              {employee.accessiblePages && employee.accessiblePages.length > 0 && (
                <div className="employee-access">
                  <div className="access-label">Page Access ({employee.accessiblePages.length})</div>
                </div>
              )}
            </div>

            <div className="employee-card-footer">
              <div className="employee-actions">
                <button
                  onClick={() => onEdit(employee)}
                  className="action-button"
                  title="Edit employee"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(employee.id)}
                  className="action-button action-delete"
                  title="Delete employee"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <span className="employee-date">
                Added: {new Date(employee.createdAt).toLocaleDateString()}
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

export default EmployeesList;

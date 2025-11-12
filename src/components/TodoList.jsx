import { Calendar, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import Pagination from './Pagination';

const TodoList = ({ todos, onEdit, onDelete, onStatusChange, currentPage, totalPages, onPageChange }) => {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
          <line x1="9" y1="9" x2="15" y2="9" strokeWidth="2"/>
          <line x1="9" y1="13" x2="15" y2="13" strokeWidth="2"/>
          <line x1="9" y1="17" x2="13" y2="17" strokeWidth="2"/>
        </svg>
        <h3 className="empty-title">No Todos Found</h3>
        <p className="empty-description">
          Start by adding your first todo using the button above.
        </p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'status-new';
      case 'In Progress':
        return 'status-in-progress';
      case 'Done':
        return 'status-done';
      default:
        return 'status-new';
    }
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
      <div className="todos-grid">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-card">
            <div className="todo-card-header">
              <span className={`todo-status-badge ${getStatusColor(todo.status)}`}>
                {todo.status}
              </span>
              <div className="todo-actions">
                <button
                  onClick={() => onEdit(todo)}
                  className="action-button action-edit"
                  title="Edit todo"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="action-button action-delete"
                  title="Delete todo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="todo-card-body">
              <h3 className="todo-title">{todo.title}</h3>
              
              <div className="todo-info">
                <div className="todo-info-item">
                  <Calendar size={14} />
                  <span>{formatDate(todo.date)}</span>
                </div>
              </div>

              {todo.description && (
                <p className="todo-description">{todo.description}</p>
              )}
            </div>

            <div className="todo-card-footer">
              <div className="status-change-wrapper">
                <label className="status-change-label">Update Status:</label>
                <select
                  value={todo.status}
                  onChange={(e) => onStatusChange(todo.id, e.target.value)}
                  className={`status-select ${getStatusColor(todo.status)}`}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
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

export default TodoList;

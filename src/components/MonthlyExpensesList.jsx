import { Edit2, Trash2, DollarSign, Calendar, MessageSquare } from 'lucide-react';

const MonthlyExpensesList = ({ expenses, onEdit, onDelete }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Rent': 'bg-purple-100 text-purple-700 border-purple-300',
      'Utilities': 'bg-blue-100 text-blue-700 border-blue-300',
      'Salaries': 'bg-green-100 text-green-700 border-green-300',
      'Insurance': 'bg-red-100 text-red-700 border-red-300',
      'Maintenance': 'bg-orange-100 text-orange-700 border-orange-300',
      'Marketing': 'bg-pink-100 text-pink-700 border-pink-300',
      'Office Supplies': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'Software Subscriptions': 'bg-cyan-100 text-cyan-700 border-cyan-300',
      'Loan Payments': 'bg-rose-100 text-rose-700 border-rose-300',
      'Taxes': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Professional Services': 'bg-teal-100 text-teal-700 border-teal-300',
      'Miscellaneous': 'bg-slate-100 text-slate-700 border-slate-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <DollarSign size={48} className="empty-icon" />
        <h3 className="empty-title">No monthly expenses found</h3>
        <p className="empty-description">
          Add your first monthly expense to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="expenses-grid">
      {expenses.map((expense) => (
        <div key={expense.id} className="expense-card">
          <div className="expense-card-header">
            <div className="flex items-center gap-2">
              <div className="expense-icon-wrapper">
                <DollarSign size={18} />
              </div>
              <span className={`expense-category-badge ${getCategoryColor(expense.category)}`}>
                {expense.category}
              </span>
            </div>
            <div className="material-actions">
              <button
                onClick={() => onEdit(expense)}
                className="action-button"
                aria-label="Edit expense"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                className="action-button action-delete"
                aria-label="Delete expense"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="expense-card-body">
            <h3 className="expense-name">{expense.expenseName}</h3>
            <p className="material-id">ID: {expense.id}</p>

            <div className="expense-amount-display">
              <span className="expense-amount-label">Amount</span>
              <span className="expense-amount-value">
                ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="expense-info-grid">
              <div className="expense-info-item">
                <Calendar size={14} className="expense-info-icon" />
                <span className="expense-info-text">
                  {expense.month} {expense.year}
                </span>
              </div>

              {expense.comments && (
                <div className="expense-info-item">
                  <MessageSquare size={14} className="expense-info-icon" />
                  <span className="expense-info-text expense-comments">
                    {expense.comments}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MonthlyExpensesList;

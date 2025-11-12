import { useState } from 'react';

const AddMonthlyExpenseForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    expenseName: '',
    category: '',
    amount: '',
    month: '',
    year: new Date().getFullYear().toString(),
    comments: ''
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Rent',
    'Utilities',
    'Salaries',
    'Insurance',
    'Maintenance',
    'Marketing',
    'Office Supplies',
    'Software Subscriptions',
    'Loan Payments',
    'Taxes',
    'Professional Services',
    'Miscellaneous'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.expenseName.trim()) {
      newErrors.expenseName = 'Expense name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const monthlyExpense = {
      id: `MEXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      expenseName: formData.expenseName.trim(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      month: formData.month,
      year: formData.year,
      comments: formData.comments.trim(),
      createdAt: new Date().toISOString()
    };

    onSubmit(monthlyExpense);
  };

  return (
    <form onSubmit={handleSubmit} className="material-form">
      <div className="form-group">
        <label htmlFor="expenseName" className="form-label">
          Expense Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="expenseName"
          name="expenseName"
          value={formData.expenseName}
          onChange={handleChange}
          className={`swiss-input ${errors.expenseName ? 'input-error' : ''}`}
          placeholder="Enter expense name"
        />
        {errors.expenseName && <span className="error-message">{errors.expenseName}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`swiss-input ${errors.category ? 'input-error' : ''}`}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount (₹) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={`swiss-input ${errors.amount ? 'input-error' : ''}`}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {errors.amount && <span className="error-message">{errors.amount}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="month" className="form-label">
            Month <span className="required">*</span>
          </label>
          <select
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            className={`swiss-input ${errors.month ? 'input-error' : ''}`}
          >
            <option value="">Select Month</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          {errors.month && <span className="error-message">{errors.month}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="year" className="form-label">
            Year <span className="required">*</span>
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="2020"
            max="2099"
            className={`swiss-input ${errors.year ? 'input-error' : ''}`}
          />
          {errors.year && <span className="error-message">{errors.year}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="comments" className="form-label">
          Comments
        </label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          className="swiss-input"
          rows="4"
          placeholder="Enter any comments or notes..."
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="swiss-button-outline">
          Cancel
        </button>
        <button type="submit" className="swiss-button">
          Save Expense
        </button>
      </div>
    </form>
  );
};

export default AddMonthlyExpenseForm;

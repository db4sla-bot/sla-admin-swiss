import { useState } from 'react';

const AddDailyExpenseForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    investmentName: '',
    category: '',
    amount: '',
    comments: ''
  });

  const [errors, setErrors] = useState({});

  // Category options from the image
  const categoryOptions = [
    'Cafe',
    'Transportation',
    'Equipment',
    'Kirana',
    'Health',
    'Food',
    'Petrol',
    'Entertainment',
    'Auto',
    'Parties',
    'Advance',
    'Miscellaneous'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.investmentName.trim()) {
      newErrors.investmentName = 'Investment name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const expenseId = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const expense = {
        id: expenseId,
        investmentName: formData.investmentName.trim(),
        category: formData.category,
        amount: parseFloat(formData.amount),
        comments: formData.comments.trim(),
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      onSubmit(expense);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="material-form">
      <div className="form-group">
        <label htmlFor="investmentName" className="form-label">
          Investment Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="investmentName"
          name="investmentName"
          value={formData.investmentName}
          onChange={handleChange}
          className={`swiss-input ${errors.investmentName ? 'input-error' : ''}`}
          placeholder="Enter investment name"
        />
        {errors.investmentName && <span className="error-message">{errors.investmentName}</span>}
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
            {categoryOptions.map(category => (
              <option key={category} value={category}>{category}</option>
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

export default AddDailyExpenseForm;

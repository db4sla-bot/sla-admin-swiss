import { useState } from 'react';
import { Calendar, FileText, CheckCircle } from 'lucide-react';

const AddTodoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    status: 'New'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        date: '',
        status: 'New'
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {/* Title Field */}
      <div className="form-group">
        <label className="form-label">
          <FileText size={16} />
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`swiss-input ${errors.title ? 'error' : ''}`}
          placeholder="Enter todo title"
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      {/* Date Field */}
      <div className="form-group">
        <label className="form-label">
          <Calendar size={16} />
          Date *
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`swiss-input ${errors.date ? 'error' : ''}`}
        />
        {errors.date && <span className="error-message">{errors.date}</span>}
      </div>

      {/* Status Field */}
      <div className="form-group">
        <label className="form-label">
          <CheckCircle size={16} />
          Status *
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="swiss-input"
        >
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="form-actions">
        <button type="submit" className="swiss-button">
          Add Todo
        </button>
      </div>
    </form>
  );
};

export default AddTodoForm;

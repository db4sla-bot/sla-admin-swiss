import { useState } from 'react';

const AddAssetForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    assetName: '',
    amount: '',
    investedBy: '',
    date: new Date().toISOString().split('T')[0] // Today's date
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.assetName.trim()) {
      newErrors.assetName = 'Asset name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.investedBy.trim()) {
      newErrors.investedBy = 'Invested by is required';
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
      const assetId = `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const asset = {
        id: assetId,
        assetName: formData.assetName.trim(),
        amount: parseFloat(formData.amount),
        investedBy: formData.investedBy.trim(),
        date: formData.date,
        createdAt: new Date().toISOString()
      };

      onSubmit(asset);
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
        <label htmlFor="assetName" className="form-label">
          Asset Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="assetName"
          name="assetName"
          value={formData.assetName}
          onChange={handleChange}
          className={`swiss-input ${errors.assetName ? 'input-error' : ''}`}
          placeholder="Enter asset name"
        />
        {errors.assetName && <span className="error-message">{errors.assetName}</span>}
      </div>

      <div className="form-row">
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

        <div className="form-group">
          <label htmlFor="investedBy" className="form-label">
            Invested By <span className="required">*</span>
          </label>
          <input
            type="text"
            id="investedBy"
            name="investedBy"
            value={formData.investedBy}
            onChange={handleChange}
            className={`swiss-input ${errors.investedBy ? 'input-error' : ''}`}
            placeholder="Enter investor name"
          />
          {errors.investedBy && <span className="error-message">{errors.investedBy}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="date" className="form-label">
          Date <span className="required">*</span>
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`swiss-input ${errors.date ? 'input-error' : ''}`}
        />
        {errors.date && <span className="error-message">{errors.date}</span>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="swiss-button-outline">
          Cancel
        </button>
        <button type="submit" className="swiss-button">
          Save Asset
        </button>
      </div>
    </form>
  );
};

export default AddAssetForm;

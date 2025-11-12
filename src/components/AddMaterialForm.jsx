import { useState } from 'react';

const AddMaterialForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    pricePerUnit: '',
    bufferStock: '',
    unit: 'meter' // Default unit
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Material name is required';
    }

    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Valid price is required';
    }

    if (!formData.bufferStock || parseInt(formData.bufferStock) < 0) {
      newErrors.bufferStock = 'Valid buffer stock is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate unique material ID
      const materialId = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const material = {
        id: materialId,
        name: formData.name.trim(),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        bufferStock: parseInt(formData.bufferStock),
        unit: formData.unit,
        createdAt: new Date().toISOString()
      };

      onSubmit(material);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
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
        <label htmlFor="name" className="form-label">
          Material Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`swiss-input ${errors.name ? 'input-error' : ''}`}
          placeholder="Enter material name"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pricePerUnit" className="form-label">
            Price per Unit/Meter <span className="required">*</span>
          </label>
          <input
            type="number"
            id="pricePerUnit"
            name="pricePerUnit"
            value={formData.pricePerUnit}
            onChange={handleChange}
            className={`swiss-input ${errors.pricePerUnit ? 'input-error' : ''}`}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {errors.pricePerUnit && <span className="error-message">{errors.pricePerUnit}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="unit" className="form-label">
            Unit
          </label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="swiss-input"
          >
            <option value="meter">Meter</option>
            <option value="unit">Unit</option>
            <option value="kg">Kilogram</option>
            <option value="piece">Piece</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="bufferStock" className="form-label">
          Buffer Stock Quantity <span className="required">*</span>
        </label>
        <input
          type="number"
          id="bufferStock"
          name="bufferStock"
          value={formData.bufferStock}
          onChange={handleChange}
          className={`swiss-input ${errors.bufferStock ? 'input-error' : ''}`}
          placeholder="0"
          min="0"
        />
        {errors.bufferStock && <span className="error-message">{errors.bufferStock}</span>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="swiss-button-outline">
          Cancel
        </button>
        <button type="submit" className="swiss-button">
          Save Material
        </button>
      </div>
    </form>
  );
};

export default AddMaterialForm;

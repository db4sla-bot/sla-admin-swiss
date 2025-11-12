import { useState } from 'react';
import { X } from 'lucide-react';

const AddCustomerForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    services: []
  });

  const [errors, setErrors] = useState({});

  const availableServices = [
    'Invisible Grills',
    'Mosquito Mesh',
    'Cloth Hangers'
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

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
    // Clear services error when user selects at least one
    if (errors.services) {
      setErrors(prev => ({
        ...prev,
        services: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.services.length === 0) {
      newErrors.services = 'Please select at least one service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const customerData = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        services: formData.services,
        createdAt: new Date().toISOString(),
        status: 'Active'
      };
      
      onSubmit(customerData);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="material-form">
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Customer Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`swiss-input ${errors.name ? 'input-error' : ''}`}
          placeholder="Enter customer name"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="mobile" className="form-label">
          Mobile Number <span className="required">*</span>
        </label>
        <input
          type="tel"
          id="mobile"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          className={`swiss-input ${errors.mobile ? 'input-error' : ''}`}
          placeholder="Enter 10-digit mobile number"
          maxLength="10"
        />
        {errors.mobile && <span className="error-message">{errors.mobile}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="address" className="form-label">
          Address <span className="required">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`swiss-input ${errors.address ? 'input-error' : ''}`}
          placeholder="Enter complete address"
          rows="3"
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">
          Required Services <span className="required">*</span>
        </label>
        <div className="multi-select-container">
          {availableServices.map(service => (
            <div key={service} className="multi-select-item">
              <input
                type="checkbox"
                id={`service-${service}`}
                checked={formData.services.includes(service)}
                onChange={() => handleServiceToggle(service)}
                className="multi-select-checkbox"
              />
              <label 
                htmlFor={`service-${service}`} 
                className="multi-select-label"
              >
                {service}
              </label>
            </div>
          ))}
        </div>
        {errors.services && <span className="error-message">{errors.services}</span>}
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onClose}
          className="swiss-button-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="swiss-button"
        >
          Add Customer
        </button>
      </div>
    </form>
  );
};

export default AddCustomerForm;

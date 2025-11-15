import { useState } from 'react';
import { X } from 'lucide-react';

const AddLeadForm = ({ onSubmit, onCancel }) => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    status: 'New',
    source: '',
    subSource: '',
    details: '',
    requiredServices: [],
    customerName: '',
    mobileNumber: '',
    address: '',
    followUpDate: getTodayDate()
  });

  const [errors, setErrors] = useState({});

  // Lead status options
  const statusOptions = [
    'New',
    'Followup',
    'Sitevisit',
    'Quotation',
    'Customer Declines'
  ];

  // Source options
  const sourceOptions = [
    'Digital Marketing',
    'Online',
    'Offline Marketing',
    'Reference',
    'Marketing',
    'Interior Designers',
    'Builders',
    'Engineers'
  ];

  // Sub-source options based on source
  const subSourceOptions = {
    'Digital Marketing': ['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others'],
    'Online': ['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others'],
    'Offline Marketing': ['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others'],
    'Reference': ['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others'],
    'Marketing': ['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others'],
    'Interior Designers': ['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others'],
    'Builders': ['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others'],
    'Engineers': ['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others']
  };

  // Required services options
  const servicesOptions = [
    'Invisible Grills',
    'Mosquito Mesh',
    'Cloth Hangers'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.status) {
      newErrors.status = 'Lead status is required';
    }

    if (!formData.source) {
      newErrors.source = 'Source is required';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    if (formData.requiredServices.length === 0) {
      newErrors.requiredServices = 'Please select at least one service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const leadId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const lead = {
        id: leadId,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSubmit(lead);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset sub-source if source changes
      ...(name === 'source' && { subSource: '' })
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => {
      const services = prev.requiredServices.includes(service)
        ? prev.requiredServices.filter(s => s !== service)
        : [...prev.requiredServices, service];
      
      return { ...prev, requiredServices: services };
    });

    if (errors.requiredServices) {
      setErrors(prev => ({ ...prev, requiredServices: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="material-form">
      {/* Lead Status */}
      <div className="form-group">
        <label htmlFor="status" className="form-label">
          Lead Status <span className="required">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`swiss-input ${errors.status ? 'input-error' : ''}`}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        {errors.status && <span className="error-message">{errors.status}</span>}
      </div>

      {/* Source and Sub-Source */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="source" className="form-label">
            Source <span className="required">*</span>
          </label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className={`swiss-input ${errors.source ? 'input-error' : ''}`}
          >
            <option value="">Select Source</option>
            {sourceOptions.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          {errors.source && <span className="error-message">{errors.source}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subSource" className="form-label">
            Sub Source
          </label>
          <select
            id="subSource"
            name="subSource"
            value={formData.subSource}
            onChange={handleChange}
            className="swiss-input"
          >
            <option value="">Select Sub Source</option>
            {['Instagram', 'Facebook', 'Google', 'Just Dial', 'Google Listing', 'Existing Customer', 'Friends', 'Marketers', 'Flex', 'Newspapers', 'Bike Stickers', 'Others'].map((subSource) => (
              <option key={subSource} value={subSource}>
                {subSource}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Details */}
      <div className="form-group">
        <label htmlFor="details" className="form-label">
          Details
        </label>
        <textarea
          id="details"
          name="details"
          value={formData.details}
          onChange={handleChange}
          className="swiss-input"
          rows="4"
          placeholder="Enter lead details, requirements, notes..."
        />
      </div>

      {/* Follow Up Date */}
      <div className="form-group">
        <label htmlFor="followUpDate" className="form-label">
          Follow Up Date
        </label>
        <input
          type="date"
          id="followUpDate"
          name="followUpDate"
          value={formData.followUpDate}
          onChange={handleChange}
          min={getTodayDate()}
          className="swiss-input"
        />
      </div>

      {/* Required Services - Multi Select */}
      <div className="form-group">
        <label className="form-label">
          Required Services <span className="required">*</span>
        </label>
        <div className="multi-select-container">
          {servicesOptions.map(service => (
            <label key={service} className="multi-select-item">
              <input
                type="checkbox"
                checked={formData.requiredServices.includes(service)}
                onChange={() => handleServiceToggle(service)}
                className="multi-select-checkbox"
              />
              <span className="multi-select-label">{service}</span>
            </label>
          ))}
        </div>
        {errors.requiredServices && <span className="error-message">{errors.requiredServices}</span>}
      </div>

      {/* Customer Information */}
      <div className="form-group">
        <label htmlFor="customerName" className="form-label">
          Customer Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          className={`swiss-input ${errors.customerName ? 'input-error' : ''}`}
          placeholder="Enter customer name"
        />
        {errors.customerName && <span className="error-message">{errors.customerName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="mobileNumber" className="form-label">
          Mobile Number <span className="required">*</span>
        </label>
        <input
          type="tel"
          id="mobileNumber"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          className={`swiss-input ${errors.mobileNumber ? 'input-error' : ''}`}
          placeholder="Enter 10-digit mobile number"
          maxLength="10"
        />
        {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="address" className="form-label">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="swiss-input"
          rows="3"
          placeholder="Enter customer address"
        />
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="swiss-button-outline">
          Cancel
        </button>
        <button type="submit" className="swiss-button">
          Save Lead
        </button>
      </div>
    </form>
  );
};

export default AddLeadForm;

import { useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';

const AddEmployeeForm = ({ onClose, onSubmit, menuItems }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    isAdmin: false,
    canView: false,
    canEdit: false,
    accessiblePages: [],
    aadharNumber: '',
    aadharFile: null,
    highestQualification: '',
    passedOutYear: '',
    emergencyContact: '',
    address: '',
    maritalStatus: 'single'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [aadharFileName, setAadharFileName] = useState('');

  const qualifications = [
    '10th',
    '12th',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePageAccessToggle = (pageId) => {
    setFormData(prev => ({
      ...prev,
      accessiblePages: prev.accessiblePages.includes(pageId)
        ? prev.accessiblePages.filter(id => id !== pageId)
        : [...prev.accessiblePages, pageId]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (images and PDFs)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, aadharFile: 'Please upload a valid image (JPG, PNG) or PDF file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, aadharFile: 'File size must be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, aadharFile: file }));
      setAadharFileName(file.name);
      setErrors(prev => ({ ...prev, aadharFile: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Employee name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact number is required';
    } else if (!/^[0-9]{10}$/.test(formData.emergencyContact.trim())) {
      newErrors.emergencyContact = 'Emergency contact must be 10 digits';
    }

    if (!formData.aadharFile) {
      newErrors.aadharFile = 'Aadhar card file is required';
    }

    // Optional validations
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.aadharNumber && !/^[0-9]{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits';
    }

    if (formData.passedOutYear && (formData.passedOutYear < 1950 || formData.passedOutYear > new Date().getFullYear())) {
      newErrors.passedOutYear = 'Invalid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const employeeData = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'Active'
      };
      
      onSubmit(employeeData);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="material-form employee-form">
      {/* Basic Information */}
      <div className="form-section">
        <h3 className="form-section-title">Basic Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Employee Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`swiss-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter employee name"
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`swiss-input ${errors.email ? 'input-error' : ''}`}
              placeholder="Enter email address"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="swiss-input"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Access Control Section */}
      <div className="form-section">
        <h3 className="form-section-title">Access Control</h3>
        
        <div className="access-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
              className="checkbox-input"
            />
            <span>Is Admin</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="canView"
              checked={formData.canView}
              onChange={handleChange}
              className="checkbox-input"
            />
            <span>Can View</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="canEdit"
              checked={formData.canEdit}
              onChange={handleChange}
              className="checkbox-input"
            />
            <span>Can Edit</span>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Accessible Pages</label>
          <div className="multi-select-container">
            {menuItems.map(item => (
              <div key={item.id} className="multi-select-item">
                <input
                  type="checkbox"
                  id={`page-${item.id}`}
                  checked={formData.accessiblePages.includes(item.id)}
                  onChange={() => handlePageAccessToggle(item.id)}
                  className="multi-select-checkbox"
                />
                <label htmlFor={`page-${item.id}`} className="multi-select-label">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aadhar Card Section */}
      <div className="form-section">
        <h3 className="form-section-title">Aadhar Card Details</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="aadharNumber" className="form-label">
              Aadhar Card Number
            </label>
            <input
              type="text"
              id="aadharNumber"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              className={`swiss-input ${errors.aadharNumber ? 'input-error' : ''}`}
              placeholder="Enter 12-digit Aadhar number"
              maxLength="12"
            />
            {errors.aadharNumber && <span className="error-message">{errors.aadharNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="aadharFile" className="form-label">
              Upload Aadhar Card <span className="required">*</span>
            </label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="aadharFile"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="aadharFile" className={`file-upload-label ${errors.aadharFile ? 'input-error' : ''}`}>
                <Upload size={18} />
                <span>{aadharFileName || 'Choose file...'}</span>
              </label>
            </div>
            {errors.aadharFile && <span className="error-message">{errors.aadharFile}</span>}
            <span className="help-text">Max size: 5MB (JPG, PNG, PDF)</span>
          </div>
        </div>
      </div>

      {/* Qualification Section */}
      <div className="form-section">
        <h3 className="form-section-title">Qualification</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="highestQualification" className="form-label">
              Highest Qualification
            </label>
            <select
              id="highestQualification"
              name="highestQualification"
              value={formData.highestQualification}
              onChange={handleChange}
              className="swiss-input"
            >
              <option value="">Select qualification</option>
              {qualifications.map(qual => (
                <option key={qual} value={qual}>{qual}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="passedOutYear" className="form-label">
              Passed Out Year
            </label>
            <input
              type="number"
              id="passedOutYear"
              name="passedOutYear"
              value={formData.passedOutYear}
              onChange={handleChange}
              className={`swiss-input ${errors.passedOutYear ? 'input-error' : ''}`}
              placeholder="Enter year (e.g., 2020)"
              min="1950"
              max={new Date().getFullYear()}
            />
            {errors.passedOutYear && <span className="error-message">{errors.passedOutYear}</span>}
          </div>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="form-section">
        <h3 className="form-section-title">Additional Details</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="emergencyContact" className="form-label">
              Emergency Contact Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="emergencyContact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className={`swiss-input ${errors.emergencyContact ? 'input-error' : ''}`}
              placeholder="Enter 10-digit emergency contact"
              maxLength="10"
            />
            {errors.emergencyContact && <span className="error-message">{errors.emergencyContact}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="maritalStatus" className="form-label">
              Marital Status
            </label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="swiss-input"
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>
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
            placeholder="Enter complete address"
            rows="3"
          />
        </div>
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
          Save Employee
        </button>
      </div>
    </form>
  );
};

export default AddEmployeeForm;

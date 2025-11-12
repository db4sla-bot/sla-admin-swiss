import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const AddMaterialInvestmentForm = ({ onClose, onSubmit, materials }) => {
  const [formData, setFormData] = useState({
    materialId: '',
    materialName: '',
    amount: ''
  });

  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMaterialSelect = (material) => {
    setFormData(prev => ({
      ...prev,
      materialId: material.id,
      materialName: material.name
    }));
    setIsDropdownOpen(false);
    setSearchTerm('');
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }));
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, amount: value }));
      if (errors.amount) {
        setErrors(prev => ({ ...prev, amount: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.materialId) {
      newErrors.materialId = 'Please select a material';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const investmentData = {
        id: Date.now().toString(),
        materialId: formData.materialId,
        materialName: formData.materialName,
        amount: parseFloat(formData.amount),
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      onSubmit(investmentData);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="material-form">
      <div className="form-group">
        <label htmlFor="material" className="form-label">
          Select Material <span className="required">*</span>
        </label>
        
        <div className="searchable-dropdown" ref={dropdownRef}>
          <div
            className={`dropdown-trigger ${errors.materialId ? 'input-error' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={formData.materialName ? '' : 'dropdown-placeholder'}>
              {formData.materialName || 'Select a material...'}
            </span>
            <ChevronDown size={18} className={`dropdown-icon ${isDropdownOpen ? 'rotate' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-search">
                <Search size={16} className="dropdown-search-icon" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dropdown-search-input"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="dropdown-list">
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map(material => (
                    <div
                      key={material.id}
                      className={`dropdown-item ${formData.materialId === material.id ? 'selected' : ''}`}
                      onClick={() => handleMaterialSelect(material)}
                    >
                      <div className="dropdown-item-name">{material.name}</div>
                      <div className="dropdown-item-id">ID: {material.id}</div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-empty">No materials found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {errors.materialId && <span className="error-message">{errors.materialId}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="amount" className="form-label">
          Amount (₹) <span className="required">*</span>
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleAmountChange}
          className={`swiss-input ${errors.amount ? 'input-error' : ''}`}
          placeholder="Enter investment amount"
        />
        {errors.amount && <span className="error-message">{errors.amount}</span>}
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
          Save Investment
        </button>
      </div>
    </form>
  );
};

export default AddMaterialInvestmentForm;

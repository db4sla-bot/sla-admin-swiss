import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const AddPayrollForm = ({ onClose, onSubmit, employees }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    basicSalary: '',
    bonus: '',
    miscellaneous: '',
    deductions: ''
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

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.mobile && employee.mobile.includes(searchTerm))
  );

  const handleEmployeeSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      employeeId: employee.id,
      employeeName: employee.name
    }));
    setIsDropdownOpen(false);
    setSearchTerm('');
    if (errors.employeeId) {
      setErrors(prev => ({ ...prev, employeeId: '' }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }

    if (!formData.basicSalary) {
      newErrors.basicSalary = 'Basic salary is required';
    } else if (parseFloat(formData.basicSalary) <= 0) {
      newErrors.basicSalary = 'Basic salary must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const bonusAmt = parseFloat(formData.bonus) || 0;
    const misc = parseFloat(formData.miscellaneous) || 0;
    const deduct = parseFloat(formData.deductions) || 0;
    return basic + bonusAmt + misc - deduct;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const payrollData = {
        id: Date.now().toString(),
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        basicSalary: parseFloat(formData.basicSalary),
        bonus: parseFloat(formData.bonus) || 0,
        miscellaneous: parseFloat(formData.miscellaneous) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        totalSalary: calculateTotalSalary(),
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'Pending'
      };
      
      onSubmit(payrollData);
      onClose();
    }
  };

  const totalSalary = calculateTotalSalary();

  return (
    <form onSubmit={handleSubmit} className="material-form">
      <div className="form-group">
        <label htmlFor="employee" className="form-label">
          Select Employee <span className="required">*</span>
        </label>
        
        <div className="searchable-dropdown" ref={dropdownRef}>
          <div
            className={`dropdown-trigger ${errors.employeeId ? 'input-error' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={formData.employeeName ? '' : 'dropdown-placeholder'}>
              {formData.employeeName || 'Select an employee...'}
            </span>
            <ChevronDown size={18} className={`dropdown-icon ${isDropdownOpen ? 'rotate' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-search">
                <Search size={16} className="dropdown-search-icon" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dropdown-search-input"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="dropdown-list">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => (
                    <div
                      key={employee.id}
                      className={`dropdown-item ${formData.employeeId === employee.id ? 'selected' : ''}`}
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <div className="dropdown-item-name">{employee.name}</div>
                      <div className="dropdown-item-id">
                        {employee.mobile && `${employee.mobile} • `}ID: {employee.id}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-empty">No employees found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="basicSalary" className="form-label">
            Basic Salary (₹) <span className="required">*</span>
          </label>
          <input
            type="text"
            id="basicSalary"
            name="basicSalary"
            value={formData.basicSalary}
            onChange={handleNumberChange}
            className={`swiss-input ${errors.basicSalary ? 'input-error' : ''}`}
            placeholder="Enter basic salary"
          />
          {errors.basicSalary && <span className="error-message">{errors.basicSalary}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="bonus" className="form-label">
            Bonus (₹)
          </label>
          <input
            type="text"
            id="bonus"
            name="bonus"
            value={formData.bonus}
            onChange={handleNumberChange}
            className="swiss-input"
            placeholder="Enter bonus amount"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="miscellaneous" className="form-label">
            Miscellaneous (₹)
          </label>
          <input
            type="text"
            id="miscellaneous"
            name="miscellaneous"
            value={formData.miscellaneous}
            onChange={handleNumberChange}
            className="swiss-input"
            placeholder="Enter miscellaneous amount"
          />
        </div>

        <div className="form-group">
          <label htmlFor="deductions" className="form-label">
            Deductions (₹)
          </label>
          <input
            type="text"
            id="deductions"
            name="deductions"
            value={formData.deductions}
            onChange={handleNumberChange}
            className="swiss-input"
            placeholder="Enter deduction amount"
          />
        </div>
      </div>

      {/* Total Salary Display */}
      {formData.basicSalary && (
        <div className="payroll-summary">
          <div className="summary-row">
            <span>Basic Salary:</span>
            <span>₹{parseFloat(formData.basicSalary || 0).toLocaleString('en-IN')}</span>
          </div>
          {formData.bonus && (
            <div className="summary-row">
              <span>Bonus:</span>
              <span className="positive">+₹{parseFloat(formData.bonus).toLocaleString('en-IN')}</span>
            </div>
          )}
          {formData.miscellaneous && (
            <div className="summary-row">
              <span>Miscellaneous:</span>
              <span className="positive">+₹{parseFloat(formData.miscellaneous).toLocaleString('en-IN')}</span>
            </div>
          )}
          {formData.deductions && (
            <div className="summary-row">
              <span>Deductions:</span>
              <span className="negative">-₹{parseFloat(formData.deductions).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="summary-total">
            <span>Total Salary:</span>
            <span>₹{totalSalary.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

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
          Save Payroll
        </button>
      </div>
    </form>
  );
};

export default AddPayrollForm;

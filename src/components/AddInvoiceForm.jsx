import { useState } from 'react';
import { User, Phone, MapPin, Calendar, FileText, Plus, Trash2, Eye } from 'lucide-react';
import InvoicePreview from './InvoicePreview';

const AddInvoiceForm = ({ onSubmit }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    // Customer Details
    customerName: '',
    customerMobile: '',
    customerAddress: '',
    
    // Invoice Details (auto-generated)
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    
    // Company Details
    companyMobile: '+91 98765 43210',
    referredBy: '',
    technician: '',
    companyAddress: 'SLA Invisible Grills, Hyderabad, Telangana - 500001',
    
    // Work Items
    workItems: [],
    
    // Summary
    gstPercentage: 18,
    
    // Notes
    notes: 'Thank you for your business!',
    termsAndConditions: '1. Payment due within 30 days\n2. Warranty: 1 year on materials\n3. Installation warranty: 6 months'
  });

  const [currentWork, setCurrentWork] = useState({
    description: '',
    squareFeet: '',
    originalPrice: '',
    discountedPrice: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleWorkChange = (e) => {
    const { name, value } = e.target;
    setCurrentWork(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateWorkAmount = () => {
    const sqFt = parseFloat(currentWork.squareFeet) || 0;
    const discPrice = parseFloat(currentWork.discountedPrice) || 0;
    return sqFt * discPrice;
  };

  const addWorkItem = () => {
    if (!currentWork.description || !currentWork.squareFeet || !currentWork.discountedPrice) {
      alert('Please fill all work item fields');
      return;
    }

    const amount = calculateWorkAmount();
    const newWorkItem = {
      id: Date.now(),
      ...currentWork,
      amount
    };

    setFormData(prev => ({
      ...prev,
      workItems: [...prev.workItems, newWorkItem]
    }));

    setCurrentWork({
      description: '',
      squareFeet: '',
      originalPrice: '',
      discountedPrice: ''
    });
  };

  const removeWorkItem = (id) => {
    setFormData(prev => ({
      ...prev,
      workItems: prev.workItems.filter(item => item.id !== id)
    }));
  };

  const calculateSubtotal = () => {
    return formData.workItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateGST = () => {
    return (calculateSubtotal() * formData.gstPercentage) / 100;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateGST();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerMobile.trim()) {
      newErrors.customerMobile = 'Customer mobile is required';
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Customer address is required';
    }

    if (formData.workItems.length === 0) {
      newErrors.workItems = 'Please add at least one work item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const invoiceData = {
        ...formData,
        subtotal: calculateSubtotal(),
        gst: calculateGST(),
        grandTotal: calculateGrandTotal()
      };
      onSubmit(invoiceData);
    }
  };

  const handleSaveFromPreview = () => {
    if (validateForm()) {
      const invoiceData = {
        ...formData,
        subtotal: calculateSubtotal(),
        gst: calculateGST(),
        grandTotal: calculateGrandTotal()
      };
      onSubmit(invoiceData);
      setShowPreview(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="invoice-form">
        {/* Customer Details Section */}
        <div className="form-section">
          <h3 className="form-section-title">Customer Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={`swiss-input ${errors.customerName ? 'error' : ''}`}
                placeholder="Enter customer name"
              />
              {errors.customerName && <span className="error-message">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={16} />
                Mobile Number *
              </label>
              <input
                type="tel"
                name="customerMobile"
                value={formData.customerMobile}
                onChange={handleChange}
                className={`swiss-input ${errors.customerMobile ? 'error' : ''}`}
                placeholder="Enter mobile number"
              />
              {errors.customerMobile && <span className="error-message">{errors.customerMobile}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MapPin size={16} />
              Address *
            </label>
            <textarea
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleChange}
              className={`swiss-input ${errors.customerAddress ? 'error' : ''}`}
              placeholder="Enter customer address"
              rows="2"
            />
            {errors.customerAddress && <span className="error-message">{errors.customerAddress}</span>}
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className="form-section">
          <h3 className="form-section-title">Invoice Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                className="swiss-input"
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Invoice Date
              </label>
              <input
                type="date"
                value={formData.invoiceDate}
                className="swiss-input"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Company Details Section */}
        <div className="form-section">
          <h3 className="form-section-title">Company & Service Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} />
                Company Mobile
              </label>
              <input
                type="tel"
                name="companyMobile"
                value={formData.companyMobile}
                onChange={handleChange}
                className="swiss-input"
                placeholder="Company mobile number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Referred By
              </label>
              <input
                type="text"
                name="referredBy"
                value={formData.referredBy}
                onChange={handleChange}
                className="swiss-input"
                placeholder="Reference name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Technician
              </label>
              <input
                type="text"
                name="technician"
                value={formData.technician}
                onChange={handleChange}
                className="swiss-input"
                placeholder="Technician name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                Company Address
              </label>
              <input
                type="text"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                className="swiss-input"
                placeholder="Company address"
              />
            </div>
          </div>
        </div>

        {/* Work Items Section */}
        <div className="form-section">
          <h3 className="form-section-title">Work Items</h3>
          
          {/* Add Work Item Form */}
          <div className="work-item-form">
            <div className="form-grid work-item-grid">
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  name="description"
                  value={currentWork.description}
                  onChange={handleWorkChange}
                  className="swiss-input"
                  placeholder="Work description"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Square Feet</label>
                <input
                  type="number"
                  name="squareFeet"
                  value={currentWork.squareFeet}
                  onChange={handleWorkChange}
                  className="swiss-input"
                  placeholder="Sq. ft"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Original Price</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={currentWork.originalPrice}
                  onChange={handleWorkChange}
                  className="swiss-input"
                  placeholder="₹"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discounted Price</label>
                <input
                  type="number"
                  name="discountedPrice"
                  value={currentWork.discountedPrice}
                  onChange={handleWorkChange}
                  className="swiss-input"
                  placeholder="₹"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="text"
                  value={`₹${calculateWorkAmount().toFixed(2)}`}
                  className="swiss-input"
                  disabled
                />
              </div>
            </div>

            <button type="button" onClick={addWorkItem} className="swiss-button-outline">
              <Plus size={16} />
              Add Work Item
            </button>
          </div>

          {/* Work Items List */}
          {formData.workItems.length > 0 && (
            <div className="work-items-list">
              <table className="work-items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Sq. Ft</th>
                    <th>Original Price</th>
                    <th>Disc. Price</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.workItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.squareFeet}</td>
                      <td>₹{parseFloat(item.originalPrice).toFixed(2)}</td>
                      <td>₹{parseFloat(item.discountedPrice).toFixed(2)}</td>
                      <td>₹{item.amount.toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeWorkItem(item.id)}
                          className="action-button action-delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {errors.workItems && <span className="error-message">{errors.workItems}</span>}
        </div>

        {/* Summary Section */}
        <div className="form-section">
          <h3 className="form-section-title">Summary</h3>
          <div className="invoice-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span className="summary-value">₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>
                GST 
                <input
                  type="number"
                  name="gstPercentage"
                  value={formData.gstPercentage}
                  onChange={handleChange}
                  className="gst-input"
                  min="0"
                  max="100"
                  step="0.1"
                />
                %:
              </span>
              <span className="summary-value">₹{calculateGST().toFixed(2)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Grand Total:</span>
              <span className="summary-value">₹{calculateGrandTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms Section */}
        <div className="form-section">
          <h3 className="form-section-title">Notes & Terms</h3>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="swiss-input"
              rows="2"
              placeholder="Additional notes"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Terms and Conditions</label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              className="swiss-input"
              rows="4"
              placeholder="Terms and conditions"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => setShowPreview(true)}
            className="swiss-button-outline"
          >
            <Eye size={18} />
            Preview Invoice
          </button>
          <button type="submit" className="swiss-button">
            Save Invoice
          </button>
        </div>
      </form>

      {/* Invoice Preview Modal */}
      {showPreview && (
        <InvoicePreview
          invoiceData={{
            ...formData,
            subtotal: calculateSubtotal(),
            gst: calculateGST(),
            grandTotal: calculateGrandTotal()
          }}
          onClose={() => setShowPreview(false)}
          onSave={handleSaveFromPreview}
        />
      )}
    </>
  );
};

export default AddInvoiceForm;

import { X, Download, Printer } from 'lucide-react';

const InvoicePreview = ({ invoiceData, onClose, onSave }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay invoice-preview-overlay">
      <div className="modal-content invoice-preview-modal">
        <div className="modal-header">
          <h2 className="modal-title">Invoice Preview</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body invoice-preview-body">
          <div className="invoice-preview-content">
            {/* Invoice Header with Logo */}
            <div className="quotation-header">
              <div className="company-logo-box">
                <div className="logo-text">SLA</div>
              </div>
              <h1 className="quotation-title">Invoice</h1>
            </div>

            {/* Invoice Info Grid */}
            <div className="quotation-info-section">
              <div className="quotation-from-to">
                <div className="quotation-column">
                  <h3 className="quotation-label">Invoice by</h3>
                  <p className="quotation-company-name">SLA Invisible Grills</p>
                  <p className="quotation-text">{invoiceData.companyAddress || '56-87, HSR Layout - Bengaluru, Karnataka, India - 560055'}</p>
                </div>
                <div className="quotation-column">
                  <h3 className="quotation-label">Invoice to</h3>
                  <p className="quotation-company-name">{invoiceData.customerName}</p>
                  <p className="quotation-text">{invoiceData.customerAddress || 'Customer Address'}</p>
                </div>
              </div>

              <div className="quotation-meta">
                <div className="meta-row">
                  <span className="meta-label">Invoice No:</span>
                  <span className="meta-value">{invoiceData.invoiceNumber}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Invoice Date:</span>
                  <span className="meta-value">{formatDate(invoiceData.invoiceDate)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Due Date:</span>
                  <span className="meta-value">{formatDate(invoiceData.invoiceDate)}</span>
                </div>
                {invoiceData.referredBy && (
                  <div className="meta-row">
                    <span className="meta-label">Referred By:</span>
                    <span className="meta-value">{invoiceData.referredBy}</span>
                  </div>
                )}
                {invoiceData.technician && (
                  <div className="meta-row">
                    <span className="meta-label">Technician:</span>
                    <span className="meta-value">{invoiceData.technician}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Work Items Table */}
            <div className="quotation-table-wrapper">
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th className="col-item">Item #/Item description</th>
                    <th className="col-quantity">Quantity</th>
                    <th className="col-rate">Rate</th>
                    <th className="col-discount">Discount</th>
                    <th className="col-amount">Amount<br/><span className="amount-subtitle">(After Discount)</span></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.workItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="col-item">
                        <div className="item-title">{item.description}</div>
                        {item.originalPrice !== item.discountedPrice && (
                          <div className="item-note">Create and send unlimited professional invoices for free. Use our unique features to collect payments faster.</div>
                        )}
                      </td>
                      <td className="col-quantity">{parseFloat(item.squareFeet).toFixed(0)}</td>
                      <td className="col-rate">{formatCurrency(item.originalPrice)}</td>
                      <td className="col-discount">
                        {item.originalPrice !== item.discountedPrice 
                          ? `${(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100).toFixed(0)}%`
                          : '0%'}
                      </td>
                      <td className="col-amount">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary and Additional Info Section */}
            <div className="quotation-bottom-section">
              <div className="quotation-left-section">
                {/* Terms and Conditions */}
                <div className="quotation-terms">
                  <h4 className="section-heading">Terms and Conditions</h4>
                  <ol className="terms-list">
                    <li>Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.</li>
                    <li>Please quote invoice number when remitting funds.</li>
                  </ol>
                </div>

                {/* Additional Notes */}
                <div className="quotation-notes">
                  <h4 className="section-heading">Additional Notes</h4>
                  <p className="notes-text">
                    {invoiceData.notes || 
                      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here'."}
                  </p>
                </div>

                {/* Attachments */}
                <div className="quotation-attachments">
                  <h4 className="section-heading">Attachments</h4>
                  <ol className="attachments-list">
                    <li>filename.png</li>
                    <li>invoice3402x.png</li>
                    <li>verified-bank3402x.png</li>
                  </ol>
                </div>
              </div>

              <div className="quotation-right-section">
                {/* Summary Box */}
                <div className="quotation-summary-box">
                  <div className="summary-row">
                    <span className="summary-label">Sub Total</span>
                    <span className="summary-value">{formatCurrency(invoiceData.subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Discount({((invoiceData.subtotal - (invoiceData.grandTotal - invoiceData.gst)) / invoiceData.subtotal * 100).toFixed(0)}%)</span>
                    <span className="summary-value">{formatCurrency(invoiceData.subtotal - (invoiceData.grandTotal - invoiceData.gst))}</span>
                  </div>
                  <div className="summary-row summary-total">
                    <span className="summary-label-total">Total Amount</span>
                    <span className="summary-value-total">{formatCurrency(invoiceData.grandTotal)}</span>
                  </div>
                  <div className="summary-words">
                    <span className="words-label">Invoice Total In Words:</span>
                    <span className="words-value">Nineteen Thousand Rupees Only</span>
                  </div>
                </div>

                {/* Signature */}
                <div className="quotation-signature">
                  <div className="signature-line">
                    <div className="signature-placeholder"></div>
                  </div>
                  <p className="signature-label">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer invoice-preview-actions">
          <button onClick={handlePrint} className="swiss-button-outline">
            <Printer size={18} />
            Print
          </button>
          <button onClick={onSave} className="swiss-button">
            <Download size={18} />
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;

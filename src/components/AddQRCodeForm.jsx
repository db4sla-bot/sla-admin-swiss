import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

const AddQRCodeForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const [errors, setErrors] = useState({});
  const [qrGenerated, setQrGenerated] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setQrGenerated(true);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${formData.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleSave = () => {
    if (!qrGenerated) {
      setErrors({ content: 'Please generate QR code first' });
      return;
    }

    const qrCodeData = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      createdAt: new Date().toISOString(),
      type: detectContentType(formData.content.trim())
    };
    
    onSubmit(qrCodeData);
    onClose();
  };

  const detectContentType = (content) => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return 'URL';
    } else if (content.startsWith('tel:')) {
      return 'Phone';
    } else if (content.startsWith('mailto:')) {
      return 'Email';
    } else if (/^\d+$/.test(content)) {
      return 'Number';
    } else {
      return 'Text';
    }
  };

  return (
    <form onSubmit={handleGenerate} className="material-form qr-code-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`swiss-input ${errors.title ? 'input-error' : ''}`}
          placeholder="Enter QR code title"
          disabled={qrGenerated}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="content" className="form-label">
          Content <span className="required">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          className={`swiss-input ${errors.content ? 'input-error' : ''}`}
          placeholder="Enter content for QR code (URL, text, phone number, etc.)"
          rows="4"
          disabled={qrGenerated}
        />
        {errors.content && <span className="error-message">{errors.content}</span>}
        <span className="help-text">
          Examples: https://example.com, tel:+919876543210, mailto:email@example.com, or any text
        </span>
      </div>

      {!qrGenerated && (
        <button
          type="submit"
          className="swiss-button"
          style={{ width: '100%' }}
        >
          Generate QR Code
        </button>
      )}

      {qrGenerated && (
        <div className="qr-code-display">
          <div className="qr-code-wrapper">
            <QRCodeSVG
              id="qr-code-svg"
              value={formData.content}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="qr-code-info">
            <h4>{formData.title}</h4>
            <p className="qr-content-preview">{formData.content}</p>
            <span className="qr-type-badge">{detectContentType(formData.content)}</span>
          </div>

          <button
            type="button"
            onClick={downloadQRCode}
            className="swiss-button-outline"
            style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
          >
            <Download size={18} style={{ marginRight: '8px' }} />
            Download QR Code
          </button>

          <button
            type="button"
            onClick={() => setQrGenerated(false)}
            className="swiss-button-outline"
            style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
          >
            Regenerate
          </button>
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
          type="button"
          onClick={handleSave}
          className="swiss-button"
          disabled={!qrGenerated}
        >
          Save QR Code
        </button>
      </div>
    </form>
  );
};

export default AddQRCodeForm;

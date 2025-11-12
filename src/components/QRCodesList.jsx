import { QRCodeSVG } from 'qrcode.react';
import { Download, Trash2, Copy, ExternalLink } from 'lucide-react';
import Pagination from './Pagination';

const QRCodesList = ({ qrCodes, onDelete, currentPage, totalPages, onPageChange }) => {
  if (qrCodes.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" strokeWidth="2"/>
        </svg>
        <h3 className="empty-title">No QR Codes Found</h3>
        <p className="empty-description">
          Start by generating your first QR code using the button above.
        </p>
      </div>
    );
  }

  const downloadQRCode = (qrCode) => {
    const svg = document.getElementById(`qr-${qrCode.id}`);
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
      downloadLink.download = `qr-${qrCode.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyContent = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
    alert('Content copied to clipboard!');
  };

  const openContent = (content, type) => {
    if (type === 'URL') {
      window.open(content, '_blank');
    } else if (type === 'Phone') {
      window.location.href = content;
    } else if (type === 'Email') {
      window.location.href = content;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'URL':
        return 'type-url';
      case 'Phone':
        return 'type-phone';
      case 'Email':
        return 'type-email';
      case 'Number':
        return 'type-number';
      default:
        return 'type-text';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="qr-codes-grid">
        {qrCodes.map((qrCode) => (
          <div key={qrCode.id} className="qr-code-card">
            <div className="qr-code-card-header">
              <span className={`qr-type-badge ${getTypeColor(qrCode.type)}`}>
                {qrCode.type}
              </span>
              <button
                onClick={() => onDelete(qrCode.id)}
                className="action-button action-delete"
                title="Delete QR code"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="qr-code-card-body">
              <div className="qr-code-visual">
                <QRCodeSVG
                  id={`qr-${qrCode.id}`}
                  value={qrCode.content}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <h3 className="qr-code-title">{qrCode.title}</h3>
              <p className="qr-code-content">{qrCode.content}</p>

              <div className="qr-code-actions">
                <button
                  onClick={() => downloadQRCode(qrCode)}
                  className="qr-action-btn"
                  title="Download QR code"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => copyContent(qrCode.content)}
                  className="qr-action-btn"
                  title="Copy content"
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>

                {(qrCode.type === 'URL' || qrCode.type === 'Phone' || qrCode.type === 'Email') && (
                  <button
                    onClick={() => openContent(qrCode.content, qrCode.type)}
                    className="qr-action-btn"
                    title="Open content"
                  >
                    <ExternalLink size={16} />
                    <span>Open</span>
                  </button>
                )}
              </div>
            </div>

            <div className="qr-code-card-footer">
              <span className="qr-code-date">
                Created: {formatDate(qrCode.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default QRCodesList;

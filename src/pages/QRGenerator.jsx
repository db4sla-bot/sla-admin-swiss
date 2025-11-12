import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddQRCodeForm from '../components/AddQRCodeForm';
import QRCodeSearchFilter from '../components/QRCodeSearchFilter';
import QRCodesList from '../components/QRCodesList';

const QRGenerator = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodes, setQrCodes] = useState([
    {
      id: 1,
      title: 'Company Website',
      content: 'https://slainvisiblegrills.com',
      type: 'URL',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Customer Support',
      content: 'tel:+919876543210',
      type: 'Phone',
      createdAt: '2024-01-14'
    },
    {
      id: 3,
      title: 'Sales Email',
      content: 'mailto:sales@slainvisiblegrills.com',
      type: 'Email',
      createdAt: '2024-01-13'
    },
    {
      id: 4,
      title: 'WhatsApp Support',
      content: 'https://wa.me/919876543210',
      type: 'URL',
      createdAt: '2024-01-12'
    },
    {
      id: 5,
      title: 'Order Number',
      content: '1234567890',
      type: 'Number',
      createdAt: '2024-01-11'
    },
    {
      id: 6,
      title: 'Installation Instructions',
      content: 'Follow these steps: 1. Measure the area 2. Mark the positions 3. Install the brackets 4. Attach the grills',
      type: 'Text',
      createdAt: '2024-01-10'
    },
    {
      id: 7,
      title: 'Google Maps Location',
      content: 'https://maps.google.com/?q=Hyderabad,India',
      type: 'URL',
      createdAt: '2024-01-09'
    },
    {
      id: 8,
      title: 'Product Catalog',
      content: 'https://slainvisiblegrills.com/catalog',
      type: 'URL',
      createdAt: '2024-01-08'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const handleAddQRCode = (qrData) => {
    const newQRCode = {
      id: qrCodes.length + 1,
      ...qrData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setQrCodes([newQRCode, ...qrCodes]);
    setIsModalOpen(false);
  };

  const handleDeleteQRCode = (id) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      setQrCodes(qrCodes.filter(qr => qr.id !== id));
    }
  };

  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesSearch = 
      qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'All' || qr.type === selectedType;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredQRCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQRCodes = filteredQRCodes.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">QR Code Generator</h1>
          <p className="page-subtitle">
            Generate and manage QR codes for URLs, phone numbers, emails, and more
          </p>
        </div>
        <button className="primary-button" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Add QR Code</span>
        </button>
      </div>

      <div className="page-stats">
        <div className="stat-card">
          <div className="stat-value">{qrCodes.length}</div>
          <div className="stat-label">Total QR Codes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {qrCodes.filter(qr => qr.type === 'URL').length}
          </div>
          <div className="stat-label">URL QR Codes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {qrCodes.filter(qr => qr.createdAt === new Date().toISOString().split('T')[0]).length}
          </div>
          <div className="stat-label">Created Today</div>
        </div>
      </div>

      <QRCodeSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <QRCodesList
        qrCodes={paginatedQRCodes}
        onDelete={handleDeleteQRCode}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate QR Code"
      >
        <AddQRCodeForm onSubmit={handleAddQRCode} />
      </Modal>
    </div>
  );
};

export default QRGenerator;

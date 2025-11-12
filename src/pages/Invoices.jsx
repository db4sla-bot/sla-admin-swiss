import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddInvoiceForm from '../components/AddInvoiceForm';
import InvoiceSearchFilter from '../components/InvoiceSearchFilter';
import InvoicesList from '../components/InvoicesList';
import InvoicePreview from '../components/InvoicePreview';

const Invoices = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      invoiceNumber: 'INV-001234',
      invoiceDate: '2024-01-15',
      customerName: 'Rajesh Kumar',
      customerMobile: '+91 98765 43210',
      customerAddress: '123, MG Road, Bangalore, Karnataka - 560001',
      companyMobile: '+91 98765 43210',
      referredBy: 'John Doe',
      technician: 'Amit Singh',
      companyAddress: 'SLA Invisible Grills, Hyderabad, Telangana - 500001',
      workItems: [
        {
          id: 1,
          description: 'Invisible Grills Installation',
          squareFeet: '150',
          originalPrice: '180',
          discountedPrice: '160',
          amount: 24000
        },
        {
          id: 2,
          description: 'Safety Net Installation',
          squareFeet: '80',
          originalPrice: '120',
          discountedPrice: '100',
          amount: 8000
        }
      ],
      gstPercentage: 18,
      subtotal: 32000,
      gst: 5760,
      grandTotal: 37760,
      notes: 'Thank you for your business!',
      termsAndConditions: '1. Payment due within 30 days\n2. Warranty: 1 year on materials\n3. Installation warranty: 6 months',
      status: 'Paid',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      invoiceNumber: 'INV-001235',
      invoiceDate: '2024-01-18',
      customerName: 'Priya Sharma',
      customerMobile: '+91 98765 43211',
      customerAddress: '456, Park Street, Mumbai, Maharashtra - 400001',
      companyMobile: '+91 98765 43210',
      referredBy: '',
      technician: 'Ravi Patel',
      companyAddress: 'SLA Invisible Grills, Hyderabad, Telangana - 500001',
      workItems: [
        {
          id: 1,
          description: 'Balcony Grills',
          squareFeet: '100',
          originalPrice: '200',
          discountedPrice: '175',
          amount: 17500
        }
      ],
      gstPercentage: 18,
      subtotal: 17500,
      gst: 3150,
      grandTotal: 20650,
      notes: 'Installation scheduled for next week',
      termsAndConditions: '1. Payment due within 30 days\n2. Warranty: 1 year on materials\n3. Installation warranty: 6 months',
      status: 'Pending',
      createdAt: '2024-01-18'
    },
    {
      id: 3,
      invoiceNumber: 'INV-001236',
      invoiceDate: '2024-01-20',
      customerName: 'Suresh Reddy',
      customerMobile: '+91 98765 43212',
      customerAddress: '789, Hitech City, Hyderabad, Telangana - 500081',
      companyMobile: '+91 98765 43210',
      referredBy: 'Reference Name',
      technician: 'Kumar',
      companyAddress: 'SLA Invisible Grills, Hyderabad, Telangana - 500001',
      workItems: [
        {
          id: 1,
          description: 'Window Safety Grills',
          squareFeet: '60',
          originalPrice: '150',
          discountedPrice: '150',
          amount: 9000
        },
        {
          id: 2,
          description: 'Mosquito Mesh',
          squareFeet: '40',
          originalPrice: '80',
          discountedPrice: '70',
          amount: 2800
        }
      ],
      gstPercentage: 18,
      subtotal: 11800,
      gst: 2124,
      grandTotal: 13924,
      notes: '',
      termsAndConditions: '1. Payment due within 30 days\n2. Warranty: 1 year on materials\n3. Installation warranty: 6 months',
      status: 'Paid',
      createdAt: '2024-01-20'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const handleAddInvoice = (invoiceData) => {
    const newInvoice = {
      id: invoices.length + 1,
      ...invoiceData,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setInvoices([newInvoice, ...invoices]);
    setIsModalOpen(false);
  };

  const handleViewInvoice = (invoice) => {
    setViewInvoice(invoice);
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, status: newStatus } : inv
    ));
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    
    // Simple date filter - you can enhance this
    const matchesDate = dateFilter === 'All' || true; // Implement date filtering logic

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate stats
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const paidCount = invoices.filter(inv => inv.status === 'Paid').length;
  const pendingCount = invoices.filter(inv => inv.status === 'Pending').length;
  const paidAmount = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.grandTotal, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-description">
            Create and manage customer invoices.
          </p>
        </div>
        <button 
          className="swiss-button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Invoice
        </button>
      </div>

      <div className="page-content">
        {/* Stats Cards */}
        <div className="invoice-stats">
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(paidAmount)}</div>
            <div className="stat-label">Paid Amount</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{paidCount}</div>
            <div className="stat-label">Paid Invoices</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Invoices</div>
          </div>
        </div>

        <InvoiceSearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        <InvoicesList
          invoices={paginatedInvoices}
          onView={handleViewInvoice}
          onDelete={handleDeleteInvoice}
          onStatusChange={handleStatusChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Invoice"
        maxWidth="900px"
      >
        <AddInvoiceForm onSubmit={handleAddInvoice} />
      </Modal>

      {viewInvoice && (
        <InvoicePreview
          invoiceData={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onSave={() => setViewInvoice(null)}
        />
      )}
    </div>
  );
};

export default Invoices;


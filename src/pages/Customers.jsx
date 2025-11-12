import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddCustomerForm from '../components/AddCustomerForm';
import CustomerSearchFilter from '../components/CustomerSearchFilter';
import CustomersList from '../components/CustomersList';

const Customers = () => {
  const [customers, setCustomers] = useState([
    {
      id: '1',
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      address: '123, MG Road, Bangalore, Karnataka - 560001',
      services: ['Invisible Grills', 'Safety Nets'],
      createdAt: '2024-10-15T10:30:00Z',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      mobile: '9876543211',
      address: '456, Park Street, Mumbai, Maharashtra - 400001',
      services: ['Window Grills', 'Balcony Grills'],
      createdAt: '2024-10-20T14:20:00Z',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Amit Patel',
      mobile: '9876543212',
      address: '789, Ring Road, Ahmedabad, Gujarat - 380001',
      services: ['Pigeon Nets'],
      createdAt: '2024-10-25T09:15:00Z',
      status: 'Inactive'
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      mobile: '9876543213',
      address: '321, Hitech City, Hyderabad, Telangana - 500081',
      services: ['Invisible Grills', 'Staircase Safety', 'Safety Nets'],
      createdAt: '2024-11-01T11:45:00Z',
      status: 'Active'
    },
    {
      id: '5',
      name: 'Vikram Singh',
      mobile: '9876543214',
      address: '654, Connaught Place, New Delhi - 110001',
      services: ['Construction Safety Nets', 'Sports Nets'],
      createdAt: '2024-11-05T16:00:00Z',
      status: 'Active'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('All Services');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const handleAddCustomer = (customerData) => {
    setCustomers(prev => [customerData, ...prev]);
  };

  const handleEditCustomer = (customer) => {
    console.log('Edit customer:', customer);
    // TODO: Implement edit functionality
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    }
  };

  // Filter and search logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.mobile.includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

      // Service filter
      const matchesService = 
        serviceFilter === 'All Services' || 
        customer.services.includes(serviceFilter);

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [customers, searchTerm, statusFilter, serviceFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleServiceFilterChange = (value) => {
    setServiceFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-description">
            Manage your customer relationships and service records.
          </p>
        </div>
        <button 
          className="swiss-button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Customer
        </button>
      </div>

      <div className="page-content">
        <CustomerSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          serviceFilter={serviceFilter}
          onServiceFilterChange={handleServiceFilterChange}
        />

        <CustomersList
          customers={currentCustomers}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Add New Customer"
        onClose={() => setIsModalOpen(false)}
      >
        <AddCustomerForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddCustomer}
        />
      </Modal>
    </div>
  );
};

export default Customers;

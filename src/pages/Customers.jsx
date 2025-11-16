import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { collection, setDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 24;

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    address: '',
    services: []
  });

  const [customers, setCustomers] = useState([]);

  // Fetch customers from Firebase
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const customersCollection = collection(db, 'customers');
      const q = query(customersCollection, orderBy('createdDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const serviceOptions = ['Invisible Grills', 'Mosquito Mesh', 'Cloth Hangers'];

  // Filtered and paginated customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.mobileNumber.includes(searchQuery);
    const matchesFilter = filterService === 'all' || customer.services?.includes(filterService);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const generateUniqueCustomerId = () => {
    // Generate 8-digit unique numeric ID
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const customerId = (timestamp.slice(-5) + random).slice(0, 8);
    return customerId.padStart(8, '0');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const customerId = generateUniqueCustomerId();
      const newCustomer = {
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      // Use setDoc with custom ID so document ID = customer ID
      await setDoc(doc(db, 'customers', customerId), newCustomer);
      await fetchCustomers(); // Refresh the list
      resetForm();
      setIsModalOpen(false);
      toast.success('Customer added successfully!');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      mobileNumber: '',
      address: '',
      services: []
    });
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-2">Manage and track your customers</p>
          </div>
          {canEdit('Customers') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer"
            >
              <Plus size={20} />
              Add Customer
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or mobile number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
              />
            </div>

            {/* Filter by Service */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all cursor-pointer bg-white"
              >
                <option value="all">All Services</option>
                {serviceOptions.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm mb-8">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 size={48} className="animate-spin text-[#0A647D] mb-4" />
            <p className="text-gray-600 text-base font-semibold">Loading customers...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Customer Name</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Mobile Number</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Address</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Services</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Created Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-[#E8F4F8] transition-colors cursor-pointer"
                      onClick={() => handleCustomerClick(customer.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.mobileNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{customer.address}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.services?.join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.createdDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedCustomers.length === 0 && (
              <div className="py-20 text-center bg-white">
                <div className="text-gray-300 mb-3">
                  <Search size={56} className="mx-auto" />
                </div>
                <p className="text-gray-600 text-base font-semibold mb-1">No customers found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-700 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 hover:border-[#0A647D] hover:text-[#0A647D] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700 cursor-pointer"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700 px-4">
            Page <span className="text-[#0A647D] font-bold text-base">{currentPage}</span> of <span className="font-bold text-base">{totalPages}</span>
          </span>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-700 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 hover:border-[#0A647D] hover:text-[#0A647D] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700 cursor-pointer"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">Add New Customer</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none p-2"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6">
              {/* Customer Name */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                />
              </div>

              {/* Mobile Number */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                />
              </div>

              {/* Address */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all resize-y focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                />
              </div>

              {/* Services */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                  Required Services <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {serviceOptions.map(service => (
                    <label key={service} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="w-5 h-5 text-[#0A647D] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#D4EDF5] cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
                <button 
                  type="button" 
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg text-sm font-semibold transition-all hover:bg-gray-200 hover:border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-[#0A647D] text-white border-2 border-[#0A647D] rounded-lg text-sm font-semibold transition-all hover:bg-[#08516A] hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

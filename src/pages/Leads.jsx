import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { collection, setDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Leads = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSubCategory, setFilterSubCategory] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 24;

  // Form state
  const [formData, setFormData] = useState({
    status: 'New',
    category: '',
    subCategory: '',
    details: '',
    services: [],
    customerName: '',
    mobileNumber: '',
    address: '',
    followUpDate: ''
  });

  // Sample data - replace with actual data from API
  const [leads, setLeads] = useState([]);

  // Fetch leads from Firebase
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const leadsCollection = collection(db, 'leads');
      const q = query(leadsCollection, orderBy('createdDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const leadsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    'New',
    'Follow up',
    'Site Visit',
    'Quotation',
    'Awaiting for response',
    'Confirmed',
    'Not interested'
  ];

  const categoryOptions = [
    'Digital Marketing',
    'Online',
    'Offline Marketing',
    'Reference',
    'Marketing',
    'Interior Designers',
    'Builders',
    'Engineers'
  ];

  const subCategoryOptions = [
    'Instagram',
    'Facebook',
    'Google',
    'Just Dial',
    'Google Listing',
    'Existing Customer',
    'Friends',
    'Marketers',
    'Flex',
    'Newspapers',
    'Bike Stickers',
    'Others'
  ];

  const serviceOptions = ['Invisible Grills', 'Mosquito Mesh', 'Cloth Hangers'];

  // Filtered and paginated leads
  const filteredLeads = leads.filter(lead => {
    // Search by customer name, mobile number, or lead ID
    const matchesSearch = searchQuery === '' || 
                         lead.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.mobileNumber?.includes(searchQuery) ||
                         lead.id?.includes(searchQuery);
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || lead.category === filterCategory;
    
    // SubCategory filter
    const matchesSubCategory = filterSubCategory === 'all' || lead.subCategory === filterSubCategory;
    
    // Service filter
    const matchesService = filterService === 'all' || 
                          (lead.services && lead.services.includes(filterService));
    
    // Date range filter
    let matchesDateRange = true;
    if (filterDateRange !== 'all' && lead.createdDate) {
      const leadDate = new Date(lead.createdDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filterDateRange === 'today') {
        const todayStr = today.toISOString().split('T')[0];
        matchesDateRange = lead.createdDate === todayStr;
      } else if (filterDateRange === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        matchesDateRange = lead.createdDate === yesterdayStr;
      } else if (filterDateRange === 'custom') {
        if (filterFromDate && filterToDate) {
          const fromDate = new Date(filterFromDate);
          const toDate = new Date(filterToDate);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = leadDate >= fromDate && leadDate <= toDate;
        } else if (filterFromDate) {
          const fromDate = new Date(filterFromDate);
          matchesDateRange = leadDate >= fromDate;
        } else if (filterToDate) {
          const toDate = new Date(filterToDate);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = leadDate <= toDate;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory && 
           matchesSubCategory && matchesService && matchesDateRange;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

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

  const generateUniqueLeadId = () => {
    // Generate 8-digit unique numeric ID
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const leadId = (timestamp.slice(-5) + random).slice(0, 8);
    return leadId.padStart(8, '0');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const leadId = generateUniqueLeadId();
      const newLead = {
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      // Use setDoc with custom ID so document ID = lead ID
      await setDoc(doc(db, 'leads', leadId), newLead);
      await fetchLeads(); // Refresh the list
      resetForm();
      setIsModalOpen(false);
      toast.success('Lead added successfully!');
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      status: 'New',
      category: '',
      subCategory: '',
      details: '',
      services: [],
      customerName: '',
      mobileNumber: '',
      address: '',
      followUpDate: ''
    });
  };

  const handleLeadClick = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'New': 'bg-[#D4EDF5] text-[#0A647D]',
      'Follow up': 'bg-yellow-100 text-yellow-700',
      'Site Visit': 'bg-green-100 text-green-700',
      'Quotation': 'bg-purple-100 text-purple-700',
      'Awaiting for response': 'bg-orange-100 text-orange-700',
      'Confirmed': 'bg-emerald-100 text-emerald-700',
      'Not interested': 'bg-gray-100 text-gray-600'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          {canEdit('Leads') && (
            <button 
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all shadow-sm hover:shadow-md font-medium text-sm cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              Add Lead
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="flex gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg flex-1 min-w-[320px] focus-within:border-[#0A647D] transition-all shadow-sm">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, mobile, or lead ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none outline-none flex-1 text-sm text-gray-900 bg-transparent placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus-within:border-[#0A647D] transition-all shadow-sm">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-none outline-none bg-transparent text-sm text-gray-900 flex-1 cursor-pointer"
            >
              <option value="all">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus-within:border-[#0A647D] transition-all shadow-sm">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border-none outline-none bg-transparent text-sm text-gray-900 flex-1 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus-within:border-[#0A647D] transition-all shadow-sm">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            <select 
              value={filterSubCategory} 
              onChange={(e) => setFilterSubCategory(e.target.value)}
              className="border-none outline-none bg-transparent text-sm text-gray-900 flex-1 cursor-pointer"
            >
              <option value="all">All Sub-Categories</option>
              {subCategoryOptions.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus-within:border-[#0A647D] transition-all shadow-sm">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            <select 
              value={filterService} 
              onChange={(e) => setFilterService(e.target.value)}
              className="border-none outline-none bg-transparent text-sm text-gray-900 flex-1 cursor-pointer"
            >
              <option value="all">All Services</option>
              {serviceOptions.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus-within:border-[#0A647D] transition-all shadow-sm">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            <select 
              value={filterDateRange} 
              onChange={(e) => {
                setFilterDateRange(e.target.value);
                if (e.target.value !== 'custom') {
                  setFilterFromDate('');
                  setFilterToDate('');
                }
              }}
              className="border-none outline-none bg-transparent text-sm text-gray-900 flex-1 cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {filterDateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                From Date
              </label>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] hover:border-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                To Date
              </label>
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] hover:border-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm mb-8">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 size={48} className="animate-spin text-[#0A647D] mb-4" />
            <p className="text-gray-600 text-base font-semibold">Loading leads...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Customer Name</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Mobile Number</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Services</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Created Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className="hover:bg-[#E8F4F8] transition-colors cursor-pointer"
                      onClick={() => handleLeadClick(lead.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{lead.mobileNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.services.join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{lead.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{lead.createdDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedLeads.length === 0 && (
              <div className="py-20 text-center bg-white">
                <div className="text-gray-300 mb-3">
                  <Search size={56} className="mx-auto" />
                </div>
                <p className="text-gray-600 text-base font-semibold mb-1">No leads found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pb-4">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#E8F4F8] to-white">
              <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer"
                  >
                    <option value="">Select Sub Category</option>
                    {subCategoryOptions.map(subCat => (
                      <option key={subCat} value={subCat}>{subCat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Follow Up Date
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Enter additional details..."
                  rows="4"
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all resize-y focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                />
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Required Services <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3 p-4 bg-gradient-to-br from-gray-50 to-[#E8F4F8] rounded-lg border-2 border-gray-200">
                  {serviceOptions.map(service => (
                    <label key={service} className="flex items-center gap-3 cursor-pointer group p-2 rounded-md hover:bg-white transition-all">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="w-5 h-5 cursor-pointer rounded border-gray-300 text-[#0A647D] focus:ring-2 focus:ring-[#0A647D] focus:ring-offset-0"
                      />
                      <span className="text-sm font-medium text-gray-900 group-hover:text-[#0A647D] transition-colors">{service}</span>
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
                  {isSaving ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;

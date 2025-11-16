import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, X, ChevronLeft, ChevronRight, Loader2, Eye, EyeOff, Upload } from 'lucide-react';
import { collection, setDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase/config';
import { uploadToImageKitDirect } from '../firebase/imagekit';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { allMenuNames } from '../constants/menuItems';

const Employees = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAccess, setFilterAccess] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const itemsPerPage = 24;

  // Form state
  const [formData, setFormData] = useState({
    employeeName: '',
    mobileNumber: '',
    address: '',
    email: '',
    password: '',
    userAccess: 'Can View',
    accessMenus: [],
    aadharNumber: '',
    aadharFile: null,
    qualification: '',
    passedOutYear: '',
    emergencyContact: '',
    maritalStatus: 'Single'
  });

  const [employees, setEmployees] = useState([]);

  // Fetch employees from Firebase
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const employeesCollection = collection(db, 'employees');
      const q = query(employeesCollection, orderBy('createdDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const employeesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const accessOptions = ['Admin', 'Can View', 'Can Edit'];

  // Filtered and paginated employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.mobileNumber?.includes(searchQuery) ||
                         employee.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAccess === 'all' || employee.userAccess === filterAccess;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMenuToggle = (menu) => {
    setFormData(prev => ({
      ...prev,
      accessMenus: prev.accessMenus.includes(menu)
        ? prev.accessMenus.filter(m => m !== menu)
        : [...prev.accessMenus, menu]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        aadharFile: file
      }));
    }
  };

  const generateUniqueEmployeeId = () => {
    // Generate 8-digit unique numeric ID
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const employeeId = (timestamp.slice(-5) + random).slice(0, 8);
    return employeeId.padStart(8, '0');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.userAccess !== 'Admin' && formData.accessMenus.length === 0) {
      toast.error('Please select at least one menu for access');
      return;
    }

    setIsSaving(true);
    
    try {
      const employeeId = generateUniqueEmployeeId();
      
      // Upload Aadhar card to ImageKit first
      let aadharImageUrl = '';
      if (formData.aadharFile) {
        try {
          const fileName = `aadhar_${employeeId}_${Date.now()}_${formData.aadharFile.name}`;
          aadharImageUrl = await uploadToImageKitDirect(formData.aadharFile, fileName, 'employees/aadhar');
          toast.success('Aadhar card uploaded successfully!');
        } catch (uploadError) {
          console.error('Error uploading Aadhar card:', uploadError);
          toast.error('Failed to upload Aadhar card. Please try again.');
          setIsSaving(false);
          return;
        }
      }
      
      // Create user in Firebase Auth
      const auth = getAuth();
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          toast.error('Email already in use. Please use a different email.');
        } else {
          toast.error('Failed to create user account: ' + authError.message);
        }
        setIsSaving(false);
        return;
      }

      // Prepare employee data
      const newEmployee = {
        employeeName: formData.employeeName,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        email: formData.email,
        userAccess: formData.userAccess,
        accessMenus: formData.userAccess === 'Admin' ? allMenuNames : formData.accessMenus,
        aadharNumber: formData.aadharNumber,
        aadharFileName: formData.aadharFile?.name || '',
        aadharImageUrl: aadharImageUrl,
        qualification: formData.qualification,
        passedOutYear: formData.passedOutYear,
        emergencyContact: formData.emergencyContact,
        maritalStatus: formData.maritalStatus,
        uid: userCredential.user.uid,
        createdDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'employees', employeeId), newEmployee);
      await fetchEmployees(); // Refresh the list
      resetForm();
      setIsModalOpen(false);
      toast.success('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeName: '',
      mobileNumber: '',
      address: '',
      email: '',
      password: '',
      userAccess: 'Can View',
      accessMenus: [],
      aadharNumber: '',
      aadharFile: null,
      qualification: '',
      passedOutYear: '',
      emergencyContact: '',
      maritalStatus: 'Single'
    });
  };

  const getAccessBadgeClass = (access) => {
    const accessClasses = {
      'Admin': 'bg-purple-100 text-purple-700',
      'Can View': 'bg-blue-100 text-blue-700',
      'Can Edit': 'bg-green-100 text-green-700'
    };
    return accessClasses[access] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-600 mt-2">Manage your employees and their access</p>
          </div>
          {canEdit('Employees') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer"
            >
              <Plus size={20} />
              Add Employee
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
                placeholder="Search by name, mobile, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
              />
            </div>

            {/* Filter by Access */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterAccess}
                onChange={(e) => setFilterAccess(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all cursor-pointer bg-white"
              >
                <option value="all">All Access Levels</option>
                {accessOptions.map(access => (
                  <option key={access} value={access}>{access}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm mb-8">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 size={48} className="animate-spin text-[#0A647D] mb-4" />
            <p className="text-gray-600 text-base font-semibold">Loading employees...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Employee Name</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Mobile</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Access Level</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Access Menus</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider">Created Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEmployees.map((employee) => (
                    <tr 
                      key={employee.id} 
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      className="hover:bg-[#E8F4F8] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.employeeName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.mobileNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getAccessBadgeClass(employee.userAccess)}`}>
                          {employee.userAccess}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {employee.userAccess === 'Admin' ? 'All Menus' : employee.accessMenus?.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.createdDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedEmployees.length === 0 && (
              <div className="py-20 text-center bg-white">
                <div className="text-gray-300 mb-3">
                  <Search size={56} className="mx-auto" />
                </div>
                <p className="text-gray-600 text-base font-semibold mb-1">No employees found</p>
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

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none p-2"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6">
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Employee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleInputChange}
                      placeholder="Enter employee name"
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                    />
                  </div>

                  <div>
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
                </div>

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
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all resize-y focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Emergency Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Enter emergency contact"
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Marital Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Login Credentials */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Login Credentials</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        required
                        minLength={6}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Access Control</h3>
                
                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                    User Access <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="userAccess"
                    value={formData.userAccess}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer"
                  >
                    {accessOptions.map(access => (
                      <option key={access} value={access}>{access}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Admin:</strong> Full access to all menus. 
                    <strong className="ml-2">Can View:</strong> Read-only access. 
                    <strong className="ml-2">Can Edit:</strong> Full CRUD access to selected menus.
                  </p>
                </div>

                {formData.userAccess !== 'Admin' && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                      Access Menus <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      {allMenuNames.map(menu => (
                        <label key={menu} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.accessMenus.includes(menu)}
                            onChange={() => handleMenuToggle(menu)}
                            className="w-5 h-5 text-[#0A647D] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#D4EDF5] cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700">{menu}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Documents & Qualification</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Aadhar Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      placeholder="Enter Aadhar number"
                      required
                      maxLength={12}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Upload Aadhar Card
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="aadhar-file"
                      />
                      <label
                        htmlFor="aadhar-file"
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-700 transition-all hover:border-[#0A647D] cursor-pointer bg-white"
                      >
                        <Upload size={18} />
                        {formData.aadharFile ? formData.aadharFile.name : 'Choose file'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Highest Qualification <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      placeholder="e.g., B.Tech, MBA, 12th Grade"
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Passed Out Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="passedOutYear"
                      value={formData.passedOutYear}
                      onChange={handleInputChange}
                      placeholder="e.g., 2020"
                      required
                      min="1950"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                    />
                  </div>
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
                  {isSaving ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Phone, Mail, MapPin, CreditCard, Edit2, Save, X, Plus, Trash2, Loader2, DollarSign, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Advance states
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [advanceForm, setAdvanceForm] = useState({
    amount: '',
    reason: ''
  });
  const [installmentForm, setInstallmentForm] = useState({
    returnedAmount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch employee data
  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    setIsLoading(true);
    try {
      const employeeDoc = await getDoc(doc(db, 'employees', id));
      if (employeeDoc.exists()) {
        const employeeData = { id: employeeDoc.id, ...employeeDoc.data() };
        setEmployee(employeeData);
        setEditFormData(employeeData);
      } else {
        console.error('Employee not found');
        toast.error('Employee not found');
        navigate('/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const employeeRef = doc(db, 'employees', id);
      await updateDoc(employeeRef, {
        employeeName: editFormData.employeeName,
        mobileNumber: editFormData.mobileNumber,
        address: editFormData.address,
        email: editFormData.email,
        aadharNumber: editFormData.aadharNumber,
        qualification: editFormData.qualification,
        passedOutYear: editFormData.passedOutYear,
        emergencyContact: editFormData.emergencyContact,
        maritalStatus: editFormData.maritalStatus,
        updatedDate: new Date().toISOString().split('T')[0]
      });

      setEmployee(editFormData);
      setIsEditing(false);
      toast.success('Employee details updated successfully');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData(employee);
    setIsEditing(false);
  };

  // Advance Management
  const handleAddAdvance = async (e) => {
    e.preventDefault();
    if (!advanceForm.amount || !advanceForm.reason) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSaving(true);
    try {
      const newAdvance = {
        id: Date.now().toString(),
        amount: parseFloat(advanceForm.amount),
        reason: advanceForm.reason,
        date: new Date().toISOString().split('T')[0],
        installments: [],
        totalReturned: 0,
        remaining: parseFloat(advanceForm.amount),
        createdBy: user?.displayName || user?.email || 'Unknown',
        createdAt: new Date().toISOString()
      };

      const employeeRef = doc(db, 'employees', id);
      await updateDoc(employeeRef, {
        advances: arrayUnion(newAdvance)
      });

      setEmployee(prev => ({
        ...prev,
        advances: [...(prev.advances || []), newAdvance]
      }));

      setAdvanceForm({ amount: '', reason: '' });
      setIsAdvanceModalOpen(false);
      toast.success('Advance added successfully');
    } catch (error) {
      console.error('Error adding advance:', error);
      toast.error('Failed to add advance');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInstallment = async (e) => {
    e.preventDefault();
    if (!installmentForm.returnedAmount) {
      toast.error('Please enter returned amount');
      return;
    }

    const returnedAmount = parseFloat(installmentForm.returnedAmount);
    if (returnedAmount > selectedAdvance.remaining) {
      toast.error('Returned amount cannot exceed remaining amount');
      return;
    }

    setIsSaving(true);
    try {
      const newInstallment = {
        id: Date.now().toString(),
        amount: returnedAmount,
        date: installmentForm.date,
        addedBy: user?.displayName || user?.email || 'Unknown',
        addedAt: new Date().toISOString()
      };

      const updatedAdvances = (employee.advances || []).map(adv => {
        if (adv.id === selectedAdvance.id) {
          const newTotalReturned = adv.totalReturned + returnedAmount;
          return {
            ...adv,
            installments: [...(adv.installments || []), newInstallment],
            totalReturned: newTotalReturned,
            remaining: adv.amount - newTotalReturned
          };
        }
        return adv;
      });

      const employeeRef = doc(db, 'employees', id);
      await updateDoc(employeeRef, {
        advances: updatedAdvances
      });

      setEmployee(prev => ({
        ...prev,
        advances: updatedAdvances
      }));

      setInstallmentForm({ returnedAmount: '', date: new Date().toISOString().split('T')[0] });
      setIsInstallmentModalOpen(false);
      setSelectedAdvance(null);
      toast.success('Installment added successfully');
    } catch (error) {
      console.error('Error adding installment:', error);
      toast.error('Failed to add installment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdvance = async (advanceId) => {
    if (!window.confirm('Are you sure you want to delete this advance record?')) {
      return;
    }

    setIsSaving(true);
    try {
      const advanceToDelete = employee.advances.find(adv => adv.id === advanceId);
      const employeeRef = doc(db, 'employees', id);
      await updateDoc(employeeRef, {
        advances: arrayRemove(advanceToDelete)
      });

      setEmployee(prev => ({
        ...prev,
        advances: prev.advances.filter(adv => adv.id !== advanceId)
      }));

      toast.success('Advance deleted successfully');
    } catch (error) {
      console.error('Error deleting advance:', error);
      toast.error('Failed to delete advance');
    } finally {
      setIsSaving(false);
    }
  };

  const getAccessBadgeClass = (access) => {
    const accessClasses = {
      'Admin': 'bg-purple-100 text-purple-700',
      'Can View': 'bg-blue-100 text-blue-700',
      'Can Edit': 'bg-green-100 text-green-700'
    };
    return accessClasses[access] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-[#0A647D] mb-4" />
        <p className="text-gray-600 text-base font-semibold">Loading employee details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 text-base">Employee not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0A647D] mb-4 transition-colors cursor-pointer bg-transparent border-none text-base font-medium"
        >
          <ArrowLeft size={20} />
          Back to Employees
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{employee.employeeName}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getAccessBadgeClass(employee.userAccess)}`}>
                {employee.userAccess}
              </span>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span>{employee.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span>{employee.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b-2 border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all border-b-4 ${
              activeTab === 'profile'
                ? 'border-[#0A647D] text-[#0A647D] bg-[#E8F4F8]'
                : 'border-transparent text-gray-600 hover:text-[#0A647D] hover:bg-gray-50'
            }`}
          >
            <User size={18} className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('advance')}
            className={`px-6 py-3 font-semibold transition-all border-b-4 ${
              activeTab === 'advance'
                ? 'border-[#0A647D] text-[#0A647D] bg-[#E8F4F8]'
                : 'border-transparent text-gray-600 hover:text-[#0A647D] hover:bg-gray-50'
            }`}
          >
            <CreditCard size={18} className="inline mr-2" />
            Advance
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Employee Information</h2>
            {canEdit('Employees') && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all cursor-pointer"
              >
                <Edit2 size={18} />
                Edit
              </button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all cursor-pointer"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="employeeName"
                      value={editFormData.employeeName || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium px-4 py-3 bg-gray-50 rounded-lg">{employee.employeeName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={editFormData.mobileNumber || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                      <Phone size={16} className="text-[#0A647D]" />
                      <span className="text-gray-900 font-medium">{employee.mobileNumber}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                      <Mail size={16} className="text-[#0A647D]" />
                      <span className="text-gray-900 font-medium">{employee.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Marital Status
                  </label>
                  {isEditing ? (
                    <select
                      name="maritalStatus"
                      value={editFormData.maritalStatus || 'Single'}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all cursor-pointer"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium px-4 py-3 bg-gray-50 rounded-lg">{employee.maritalStatus || 'Single'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editFormData.address || ''}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all resize-y"
                    />
                  ) : (
                    <div className="flex items-start gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                      <MapPin size={16} className="text-[#0A647D] mt-1 flex-shrink-0" />
                      <span className="text-gray-900 font-medium">{employee.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Aadhar Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="aadharNumber"
                      value={editFormData.aadharNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium px-4 py-3 bg-gray-50 rounded-lg">{employee.aadharNumber || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Emergency Contact
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={editFormData.emergencyContact || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                      <Phone size={16} className="text-[#0A647D]" />
                      <span className="text-gray-900 font-medium">{employee.emergencyContact || 'N/A'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Qualification
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="qualification"
                      value={editFormData.qualification || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium px-4 py-3 bg-gray-50 rounded-lg">{employee.qualification || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Passed Out Year
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="passedOutYear"
                      value={editFormData.passedOutYear || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium px-4 py-3 bg-gray-50 rounded-lg">{employee.passedOutYear || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* System Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    User Access
                  </label>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getAccessBadgeClass(employee.userAccess)}`}>
                    {employee.userAccess}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Access Menus
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {employee.accessMenus && employee.accessMenus.length > 0 ? (
                      employee.accessMenus.map((menu, index) => (
                        <span key={index} className="px-3 py-1 bg-[#E8F4F8] text-[#0A647D] rounded-full text-sm font-medium">
                          {menu}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No menus assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    <Calendar size={14} className="inline mr-1" />
                    Created Date
                  </label>
                  <p className="text-gray-900 font-medium px-4 py-3 bg-gray-50 rounded-lg">{employee.createdDate}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    <Calendar size={14} className="inline mr-1" />
                    Updated Date
                  </label>
                  <p className="text-gray-900 font-medium px-4 py-3 bg-gray-50 rounded-lg">{employee.updatedDate || employee.createdDate}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Advance Tab */}
      {activeTab === 'advance' && (
        <div className="space-y-6">
          {/* Add Advance Button */}
          {canEdit('Employees') && (
            <div className="flex justify-end">
              <button
                onClick={() => setIsAdvanceModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer"
              >
                <Plus size={20} />
                Add Advance
              </button>
            </div>
          )}

          {/* Advances List */}
          <div className="space-y-4">
            {!employee.advances || employee.advances.length === 0 ? (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center shadow-sm">
                <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 text-base font-semibold">No advance records found</p>
                <p className="text-gray-500 text-sm mt-2">Add an advance to start tracking</p>
              </div>
            ) : (
              employee.advances.map((advance) => (
                <div key={advance.id} className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                  {/* Advance Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          ₹{advance.amount.toLocaleString('en-IN')}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          advance.remaining === 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {advance.remaining === 0 ? 'Cleared' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                        <FileText size={16} />
                        <span className="font-medium">{advance.reason}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{advance.date}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span>By {advance.createdBy}</span>
                      </div>
                    </div>
                    {canEdit('Employees') && (
                      <button
                        onClick={() => handleDeleteAdvance(advance.id)}
                        className="text-red-600 hover:text-red-700 cursor-pointer p-2 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  {/* Advance Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-1">Total Amount</p>
                      <p className="text-lg font-bold text-blue-700">₹{advance.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-1">Returned</p>
                      <p className="text-lg font-bold text-green-700">₹{advance.totalReturned.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-1">Remaining</p>
                      <p className="text-lg font-bold text-orange-700">₹{advance.remaining.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Add Installment Button */}
                  {canEdit('Employees') && advance.remaining > 0 && (
                    <button
                      onClick={() => {
                        setSelectedAdvance(advance);
                        setIsInstallmentModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all mb-4 cursor-pointer"
                    >
                      <Plus size={18} />
                      Add Installment
                    </button>
                  )}

                  {/* Installments List */}
                  {advance.installments && advance.installments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Installment History</h4>
                      <div className="space-y-2">
                        {advance.installments.map((installment) => (
                          <div key={installment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign size={16} className="text-green-600" />
                                  <span className="font-bold text-gray-900">₹{installment.amount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar size={14} />
                                  <span>{installment.date}</span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">Added by {installment.addedBy}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Advance Modal */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-[#E8F4F8] to-white px-8 py-6 flex items-center justify-between rounded-t-xl border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Advance</h2>
              <button
                onClick={() => {
                  setIsAdvanceModalOpen(false);
                  setAdvanceForm({ amount: '', reason: '' });
                }}
                className="text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none p-2"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddAdvance} className="px-8 py-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                  Advance Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={advanceForm.amount}
                  onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={advanceForm.reason}
                  onChange={(e) => setAdvanceForm(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  rows="4"
                  placeholder="Enter reason for advance"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdvanceModalOpen(false);
                    setAdvanceForm({ amount: '', reason: '' });
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Add Advance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Installment Modal */}
      {isInstallmentModalOpen && selectedAdvance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-[#E8F4F8] to-white px-8 py-6 flex items-center justify-between rounded-t-xl border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Installment</h2>
              <button
                onClick={() => {
                  setIsInstallmentModalOpen(false);
                  setInstallmentForm({ returnedAmount: '', date: new Date().toISOString().split('T')[0] });
                  setSelectedAdvance(null);
                }}
                className="text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none p-2"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddInstallment} className="px-8 py-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-bold">Remaining Amount:</span> ₹{selectedAdvance.remaining.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-600">
                  Original: ₹{selectedAdvance.amount.toLocaleString('en-IN')} | Returned: ₹{selectedAdvance.totalReturned.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                  Returned Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedAdvance.remaining}
                  value={installmentForm.returnedAmount}
                  onChange={(e) => setInstallmentForm(prev => ({ ...prev, returnedAmount: e.target.value }))}
                  required
                  placeholder="Enter returned amount"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={installmentForm.date}
                  onChange={(e) => setInstallmentForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] transition-all cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsInstallmentModalOpen(false);
                    setInstallmentForm({ returnedAmount: '', date: new Date().toISOString().split('T')[0] });
                    setSelectedAdvance(null);
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Add Installment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;

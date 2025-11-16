import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, MessageSquare, ChevronLeft, ChevronRight, Edit2, Trash2, X, Loader2, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lead, setLead] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch lead data from Firebase
  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    setIsLoading(true);
    try {
      const leadDoc = await getDoc(doc(db, 'leads', id));
      if (leadDoc.exists()) {
        const leadData = { id: leadDoc.id, ...leadDoc.data() };
        setLead(leadData);
        setEditFormData(leadData);
        // Fetch comments if they exist
        if (leadData.comments) {
          setComments(leadData.comments);
        }
        // Fetch activities if they exist
        if (leadData.activities) {
          setActivities(leadData.activities);
        }
      } else {
        console.error('Lead not found');
        navigate('/leads');
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
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

  const addActivity = async (action, beforeValue, afterValue, field) => {
    try {
      const currentDate = new Date();
      const activity = {
        id: Date.now().toString(),
        action,
        field,
        before: beforeValue,
        after: afterValue,
        userName: user?.displayName || user?.email || 'Unknown User',
        timestamp: currentDate.toISOString(),
        date: currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };

      await updateDoc(doc(db, 'leads', id), {
        activities: arrayUnion(activity)
      });

      setActivities(prev => [activity, ...prev]);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === lead.status) return;
    
    setIsUpdatingStatus(true);
    try {
      const oldStatus = lead.status;
      
      await updateDoc(doc(db, 'leads', id), {
        status: newStatus,
        updatedDate: new Date().toISOString().split('T')[0]
      });

      setLead(prev => ({ ...prev, status: newStatus }));
      
      await addActivity('Status Changed', oldStatus, newStatus, 'Status');
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setIsSaving(true);
      try {
        const currentDate = new Date();
        const newCommentObj = {
          id: Date.now(),
          comment: newComment,
          approvedBy: 'Current User', // Replace with actual logged-in user
          updatedDate: currentDate.toISOString().split('T')[0],
          updatedTime: currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          leadId: id,
          leadData: {
            customerName: lead.customerName,
            status: lead.status,
            category: lead.category,
            subCategory: lead.subCategory
          }
        };
        
        const updatedComments = [newCommentObj, ...comments];
        
        // Update Firestore
        await updateDoc(doc(db, 'leads', id), {
          comments: updatedComments
        });
        
        setComments(updatedComments);
        setNewComment('');
        setCurrentPage(1); // Reset to first page when new comment is added
        
        await addActivity('Comment Added', '', newComment.substring(0, 50) + (newComment.length > 50 ? '...' : ''), 'Comment');
        
        toast.success('Comment added successfully!');
      } catch (error) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Track changes
      const changes = [];
      const fieldLabels = {
        customerName: 'Customer Name',
        mobileNumber: 'Mobile Number',
        email: 'Email',
        address: 'Address',
        status: 'Status',
        category: 'Category',
        subCategory: 'Sub-Category',
        services: 'Services',
        details: 'Details',
        followUpDate: 'Follow-up Date'
      };

      Object.keys(editFormData).forEach(key => {
        if (key === 'services') {
          const oldServices = lead[key]?.join(', ') || '';
          const newServices = editFormData[key]?.join(', ') || '';
          if (oldServices !== newServices) {
            changes.push({ field: fieldLabels[key] || key, before: oldServices, after: newServices });
          }
        } else if (lead[key] !== editFormData[key]) {
          changes.push({ field: fieldLabels[key] || key, before: lead[key] || '', after: editFormData[key] || '' });
        }
      });

      await updateDoc(doc(db, 'leads', id), editFormData);
      setLead(editFormData);
      setIsEditModalOpen(false);
      
      // Log all changes
      for (const change of changes) {
        await addActivity('Lead Updated', change.before, change.after, change.field);
      }
      
      toast.success('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'leads', id));
      toast.success('Lead deleted successfully!');
      setTimeout(() => {
        navigate('/leads');
      }, 1500);
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead. Please try again.');
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setEditFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  // Activity pagination - handled inline in the JSX for latest-first sorting

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-[#0A647D] mb-4" />
        <p className="text-gray-600 text-base font-semibold">Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg font-semibold">Lead not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/leads')}
          className="flex items-center gap-2 text-[#0A647D] hover:text-[#08516A] mb-4 font-medium cursor-pointer bg-transparent border-none text-sm"
        >
          <ArrowLeft size={20} />
          Back to Leads
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Details</h1>
            <p className="text-gray-600">Lead ID: #{lead.id}</p>
          </div>
          {canEdit('Leads') ? (
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#0A647D] disabled:opacity-50 disabled:cursor-not-allowed ${getStatusBadgeClass(lead.status)}`}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          ) : (
            <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(lead.status)}`}>
              {lead.status}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {canEdit('Leads') && (
        <div className="mt-6 mb-6 flex gap-4">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-6 py-3 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Edit2 size={18} />
            Edit Lead
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all cursor-pointer flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Lead
          </button>
        </div>
      )}

      {/* Lead Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={24} className="text-[#0A647D]" />
            Customer Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Name</label>
              <p className="text-gray-900 font-medium">{lead.customerName}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Mobile Number</label>
              <div className="flex items-center gap-2 text-gray-900">
                <Phone size={16} className="text-[#0A647D]" />
                <span className="font-medium">{lead.mobileNumber}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Email</label>
              <div className="flex items-center gap-2 text-gray-900">
                <Mail size={16} className="text-[#0A647D]" />
                <span className="font-medium">{lead.email}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Address</label>
              <div className="flex items-start gap-2 text-gray-900">
                <MapPin size={16} className="text-[#0A647D] mt-1 flex-shrink-0" />
                <span className="font-medium">{lead.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lead Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Category</label>
              <p className="text-gray-900 font-medium">{lead.category} - {lead.subCategory}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Required Services</label>
              <div className="flex flex-wrap gap-2">
                {lead.services.map((service, index) => (
                  <span key={index} className="px-3 py-1 bg-[#E8F4F8] text-[#0A647D] rounded-full text-sm font-medium">
                    {service}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Additional Details</label>
              <p className="text-gray-700">{lead.details}</p>
            </div>
            <div className="flex gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                  <Calendar size={14} className="inline mr-1" />
                  Created Date
                </label>
                <p className="text-gray-900 font-medium">{lead.createdDate}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                  <Calendar size={14} className="inline mr-1" />
                  Updated Date
                </label>
                <p className="text-gray-900 font-medium">{lead.updatedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="mt-6 bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={24} className="text-[#0A647D]" />
          Activity
        </h2>

        {/* Add Comment Section */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
            Add Comment
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all resize-y focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
          />
          <div className="flex justify-end mt-3">
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSaving}
              className="px-6 py-2.5 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A647D] flex items-center gap-2"
            >
              {isSaving && <Loader2 size={18} className="animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Comment'}
            </button>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Activity Log</h3>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity size={48} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No activity yet. Changes will appear here.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {activities
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((activity) => (
                    <div 
                      key={activity.id} 
                      className="bg-gradient-to-r from-gray-50 to-white border-l-4 border-[#0A647D] rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity size={16} className="text-[#0A647D]" />
                            <span className="font-bold text-gray-900 text-sm">{activity.action}</span>
                            {activity.field && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs font-semibold text-[#0A647D] bg-[#E8F4F8] px-2 py-1 rounded">
                                  {activity.field}
                                </span>
                              </>
                            )}
                          </div>
                          
                          {activity.before || activity.after ? (
                            <div className="bg-white rounded p-3 border border-gray-200 text-sm">
                              {activity.before && (
                                <div className="mb-1">
                                  <span className="text-xs font-bold text-red-600 uppercase">Before:</span>
                                  <span className="ml-2 text-gray-700">{activity.before}</span>
                                </div>
                              )}
                              {activity.after && (
                                <div>
                                  <span className="text-xs font-bold text-green-600 uppercase">After:</span>
                                  <span className="ml-2 text-gray-900 font-medium">{activity.after}</span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[#0A647D]" />
                          <span className="font-semibold">{activity.userName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-[#0A647D]" />
                            <span>{activity.date}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {Math.ceil(activities.length / itemsPerPage) > 1 && (
                <div className="flex items-center justify-center gap-6 pt-4">
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-700 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 hover:border-[#0A647D] hover:text-[#0A647D] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700 cursor-pointer"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-700 px-4">
                    Page <span className="text-[#0A647D] font-bold text-base">{currentPage}</span> of <span className="font-bold text-base">{Math.ceil(activities.length / itemsPerPage)}</span>
                  </span>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-700 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 hover:border-[#0A647D] hover:text-[#0A647D] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700 cursor-pointer"
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(activities.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(activities.length / itemsPerPage)}
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">Edit Lead</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none p-2"
                disabled={isSaving}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="px-8 py-6">
              {/* Status */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Category and SubCategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subCategory"
                    value={editFormData.subCategory}
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
              </div>

              {/* Services */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                  Services <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {serviceOptions.map(service => (
                    <label key={service} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.services?.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="w-5 h-5 text-[#0A647D] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#D4EDF5] cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={editFormData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={editFormData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    required
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all resize-y focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                />
              </div>

              {/* Details */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Details
                </label>
                <textarea
                  name="details"
                  value={editFormData.details}
                  onChange={handleInputChange}
                  placeholder="Additional details about the lead"
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all resize-y focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] placeholder:text-gray-400 hover:border-gray-400"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
                <button 
                  type="button" 
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg text-sm font-semibold transition-all hover:bg-gray-200 hover:border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setIsEditModalOpen(false)}
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
                  {isSaving ? 'Updating...' : 'Update Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-8 py-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Delete Lead</h2>
            </div>
            
            <div className="px-8 py-6">
              <p className="text-gray-700 mb-2">Are you sure you want to delete this lead?</p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Customer:</strong> {lead.customerName}
              </p>
              <p className="text-red-600 text-sm font-semibold">This action cannot be undone.</p>
            </div>

            <div className="flex justify-end gap-3 px-8 py-6 border-t-2 border-gray-200">
              <button 
                type="button" 
                className="px-6 py-2.5 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg text-sm font-semibold transition-all hover:bg-gray-200 hover:border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-2.5 bg-red-600 text-white border-2 border-red-600 rounded-lg text-sm font-semibold transition-all hover:bg-red-700 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving && <Loader2 size={18} className="animate-spin" />}
                {isSaving ? 'Deleting...' : 'Delete Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default LeadDetails;

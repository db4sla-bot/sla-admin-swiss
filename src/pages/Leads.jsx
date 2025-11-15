import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import Modal from '../components/Modal';
import AddLeadForm from '../components/AddLeadForm';
import EditLeadForm from '../components/EditLeadForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LeadsSearchFilter from '../components/LeadsSearchFilter';
import LeadsList from '../components/LeadsList';
import Pagination from '../components/Pagination';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    subSource: '',
    service: '',
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 24;

  // Fetch leads from Firebase on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const leadsCollection = collection(db, 'leads');
      const q = query(leadsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const leadsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      });
      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
      console.error('Error details:', error.message);
      // Fallback to localStorage
      const savedLeads = localStorage.getItem('leads');
      if (savedLeads) {
        setLeads(JSON.parse(savedLeads));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLead = async (lead) => {
    setIsSubmitting(true);
    try {
      // Add lead to Firebase
      const docRef = await addDoc(collection(db, 'leads'), lead);
      
      // Add to local state with Firebase-generated ID
      const newLead = {
        id: docRef.id,
        ...lead
      };
      
      setLeads(prev => [newLead, ...prev]);
      setIsModalOpen(false);
      setCurrentPage(1);
      toast.success('Lead added successfully!');
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleUpdateLead = async (updatedLead) => {
    setIsSubmitting(true);
    try {
      if (!updatedLead.id) {
        throw new Error('Lead ID is missing');
      }

      const leadId = updatedLead.id;
      const leadRef = doc(db, 'leads', leadId);
      
      // Prepare update data - exclude id field
      const updateData = {
        status: updatedLead.status,
        source: updatedLead.source,
        subSource: updatedLead.subSource,
        details: updatedLead.details,
        requiredServices: updatedLead.requiredServices,
        customerName: updatedLead.customerName,
        mobileNumber: updatedLead.mobileNumber,
        address: updatedLead.address,
        followUpDate: updatedLead.followUpDate,
        createdAt: updatedLead.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      // Use setDoc with merge option as alternative to updateDoc
      await setDoc(leadRef, updateData, { merge: true });
      
      // Update local state
      setLeads(prev => prev.map(l => l.id === leadId ? { id: leadId, ...updateData } : l));
      setIsEditModalOpen(false);
      setSelectedLead(null);
      toast.success('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error(`Failed to update lead: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLead) return;
    
    setIsDeleting(true);
    try {
      if (!selectedLead.id) {
        throw new Error('Lead ID is missing');
      }

      const leadId = selectedLead.id;
      const leadRef = doc(db, 'leads', leadId);
      
      // Delete from Firestore
      await deleteDoc(leadRef);
      
      // Update local state
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setIsDeleteModalOpen(false);
      setSelectedLead(null);
      toast.success('Lead deleted successfully!');
    } catch (error) {
      console.error('Error deleting lead:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error(`Failed to delete lead: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.customerName.toLowerCase().includes(search) ||
        lead.mobileNumber.includes(search) ||
        lead.id.toLowerCase().includes(search) ||
        (lead.address && lead.address.toLowerCase().includes(search))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Source filter
    if (filters.source) {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    // Sub-source filter
    if (filters.subSource) {
      filtered = filtered.filter(lead => lead.subSource === filters.subSource);
    }

    // Service filter
    if (filters.service) {
      filtered = filtered.filter(lead => 
        lead.requiredServices.includes(filters.service)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.customerName.localeCompare(a.customerName));
        break;
      case 'status':
        const statusOrder = ['New', 'Followup', 'Sitevisit', 'Quotation', 'Customer Declines'];
        filtered.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
        break;
      default:
        break;
    }

    return filtered;
  }, [leads, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedLeads, currentPage, itemsPerPage]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-description">
            Track and manage your business leads efficiently.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="swiss-button"
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Lead
        </button>
      </div>

      <div className="page-content">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            Loading leads...
          </div>
        ) : (
          <>
            <LeadsSearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            <LeadsList
              leads={paginatedLeads}
              onEdit={handleEditLead}
              onDelete={handleDeleteClick}
            />

            {filteredAndSortedLeads.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAndSortedLeads.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Lead"
        maxWidth="700px"
      >
        <AddLeadForm
          onSubmit={handleAddLead}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
        title="Edit Lead"
        maxWidth="700px"
      >
        {selectedLead && (
          <EditLeadForm
            lead={selectedLead}
            onSubmit={handleUpdateLead}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedLead(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedLead(null);
        }}
        title=""
        maxWidth="500px"
      >
        {selectedLead && (
          <DeleteConfirmModal
            itemName={selectedLead.customerName}
            itemType="Lead"
            onConfirm={handleConfirmDelete}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setSelectedLead(null);
            }}
            isDeleting={isDeleting}
          />
        )}
      </Modal>
    </div>
  );
};

export default Leads;

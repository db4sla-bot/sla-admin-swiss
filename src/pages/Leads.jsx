import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import Modal from '../components/Modal';
import AddLeadForm from '../components/AddLeadForm';
import LeadsSearchFilter from '../components/LeadsSearchFilter';
import LeadsList from '../components/LeadsList';
import Pagination from '../components/Pagination';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const leadsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
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

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteDoc(doc(db, 'leads', leadId));
        setLeads(prev => prev.filter(l => l.id !== leadId));
        toast.success('Lead deleted successfully!');
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead. Please try again.');
      }
    }
  };

  const handleEditLead = (lead) => {
    // TODO: Implement edit functionality
    console.log('Edit lead:', lead);
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
              onDelete={handleDeleteLead}
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
    </div>
  );
};

export default Leads;

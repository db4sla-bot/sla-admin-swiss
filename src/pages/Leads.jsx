import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
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
  const itemsPerPage = 24;

  // Load leads from localStorage on mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('leads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('leads', JSON.stringify(leads));
    }
  }, [leads]);

  const handleAddLead = (lead) => {
    setLeads(prev => [lead, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1);
  };

  const handleDeleteLead = (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
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
        />
      </Modal>
    </div>
  );
};

export default Leads;

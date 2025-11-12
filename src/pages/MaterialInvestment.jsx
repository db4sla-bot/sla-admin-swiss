import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddMaterialInvestmentForm from '../components/AddMaterialInvestmentForm';
import MaterialInvestmentSearchFilter from '../components/MaterialInvestmentSearchFilter';
import MaterialInvestmentsList from '../components/MaterialInvestmentsList';

const MaterialInvestment = () => {
  // Sample materials data
  const materials = [
    { id: 'MAT001', name: 'Stainless Steel Wire' },
    { id: 'MAT002', name: 'Aluminum Profile' },
    { id: 'MAT003', name: 'Mounting Brackets' },
    { id: 'MAT004', name: 'Screws & Fasteners' },
    { id: 'MAT005', name: 'Nylon Mesh' },
    { id: 'MAT006', name: 'PVC Coating' },
    { id: 'MAT007', name: 'Metal Hangers' },
    { id: 'MAT008', name: 'Cloth Drying Rods' }
  ];

  const [investments, setInvestments] = useState([
    {
      id: '1',
      materialId: 'MAT001',
      materialName: 'Stainless Steel Wire',
      amount: 25000,
      date: '2024-11-01T10:00:00Z',
      createdAt: '2024-11-01T10:00:00Z'
    },
    {
      id: '2',
      materialId: 'MAT002',
      materialName: 'Aluminum Profile',
      amount: 18000,
      date: '2024-11-03T14:30:00Z',
      createdAt: '2024-11-03T14:30:00Z'
    },
    {
      id: '3',
      materialId: 'MAT003',
      materialName: 'Mounting Brackets',
      amount: 12000,
      date: '2024-11-05T09:15:00Z',
      createdAt: '2024-11-05T09:15:00Z'
    },
    {
      id: '4',
      materialId: 'MAT005',
      materialName: 'Nylon Mesh',
      amount: 8500,
      date: '2024-11-07T11:20:00Z',
      createdAt: '2024-11-07T11:20:00Z'
    },
    {
      id: '5',
      materialId: 'MAT007',
      materialName: 'Metal Hangers',
      amount: 15000,
      date: '2024-11-10T16:45:00Z',
      createdAt: '2024-11-10T16:45:00Z'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const handleAddInvestment = (investmentData) => {
    setInvestments(prev => [investmentData, ...prev]);
  };

  const handleEditInvestment = (investment) => {
    console.log('Edit investment:', investment);
    // TODO: Implement edit functionality
  };

  const handleDeleteInvestment = (investmentId) => {
    if (window.confirm('Are you sure you want to delete this investment record?')) {
      setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
    }
  };

  // Filter and search logic
  const filteredInvestments = useMemo(() => {
    return investments.filter(investment => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        investment.materialName.toLowerCase().includes(searchLower) ||
        investment.materialId.toLowerCase().includes(searchLower);

      // Material filter
      const matchesMaterial = 
        materialFilter === 'all' || 
        investment.materialId === materialFilter;

      // Date range filter
      const investmentDate = new Date(investment.date);
      const matchesDateFrom = !dateFrom || investmentDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || investmentDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesMaterial && matchesDateFrom && matchesDateTo;
    });
  }, [investments, searchTerm, materialFilter, dateFrom, dateTo]);

  // Pagination logic
  const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvestments = filteredInvestments.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleMaterialFilterChange = (value) => {
    setMaterialFilter(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (value) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateToChange = (value) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  // Calculate total investment
  const totalInvestment = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Material Investment</h1>
          <p className="page-description">
            Track and manage your material procurement investments.
          </p>
        </div>
        <button 
          className="swiss-button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Material Investment
        </button>
      </div>

      <div className="page-content">
        {/* Total Investment Summary */}
        {filteredInvestments.length > 0 && (
          <div className="investment-summary">
            <div className="summary-label">Total Investment</div>
            <div className="summary-value">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(totalInvestment)}
            </div>
            <div className="summary-count">{filteredInvestments.length} investment{filteredInvestments.length !== 1 ? 's' : ''}</div>
          </div>
        )}

        <MaterialInvestmentSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          materialFilter={materialFilter}
          onMaterialFilterChange={handleMaterialFilterChange}
          dateFrom={dateFrom}
          onDateFromChange={handleDateFromChange}
          dateTo={dateTo}
          onDateToChange={handleDateToChange}
          materials={materials}
        />

        <MaterialInvestmentsList
          investments={currentInvestments}
          onEdit={handleEditInvestment}
          onDelete={handleDeleteInvestment}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Add Material Investment"
        onClose={() => setIsModalOpen(false)}
      >
        <AddMaterialInvestmentForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddInvestment}
          materials={materials}
        />
      </Modal>
    </div>
  );
};

export default MaterialInvestment;


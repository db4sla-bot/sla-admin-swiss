import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddMaterialForm from '../components/AddMaterialForm';
import SearchFilter from '../components/SearchFilter';
import MaterialsList from '../components/MaterialsList';
import Pagination from '../components/Pagination';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    unit: '',
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Load materials from localStorage on mount
  useEffect(() => {
    const savedMaterials = localStorage.getItem('materials');
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    }
  }, []);

  // Save materials to localStorage whenever they change
  useEffect(() => {
    if (materials.length > 0) {
      localStorage.setItem('materials', JSON.stringify(materials));
    }
  }, [materials]);

  const handleAddMaterial = (material) => {
    setMaterials(prev => [material, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1); // Reset to first page
  };

  const handleDeleteMaterial = (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      setMaterials(prev => prev.filter(m => m.id !== materialId));
    }
  };

  const handleEditMaterial = (material) => {
    // TODO: Implement edit functionality
    console.log('Edit material:', material);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Filter and sort materials
  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = [...materials];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Unit filter
    if (filters.unit) {
      filtered = filtered.filter(material => material.unit === filters.unit);
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
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
        break;
      default:
        break;
    }

    return filtered;
  }, [materials, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMaterials.length / itemsPerPage);
  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMaterials.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedMaterials, currentPage, itemsPerPage]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Materials</h1>
          <p className="page-description">
            Manage your materials inventory with ease.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="swiss-button"
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Material
        </button>
      </div>

      <div className="page-content">
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <MaterialsList
          materials={paginatedMaterials}
          onEdit={handleEditMaterial}
          onDelete={handleDeleteMaterial}
        />

        {filteredAndSortedMaterials.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedMaterials.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Material"
        maxWidth="600px"
      >
        <AddMaterialForm
          onSubmit={handleAddMaterial}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Materials;


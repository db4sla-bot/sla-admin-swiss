import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddAssetForm from '../components/AddAssetForm';
import AssetSearchFilter from '../components/AssetSearchFilter';
import AssetsList from '../components/AssetsList';
import Pagination from '../components/Pagination';

const AssetInvestment = () => {
  const [assets, setAssets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Load assets from localStorage on mount
  useEffect(() => {
    const savedAssets = localStorage.getItem('assetInvestments');
    if (savedAssets) {
      setAssets(JSON.parse(savedAssets));
    }
  }, []);

  // Save assets to localStorage whenever they change
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem('assetInvestments', JSON.stringify(assets));
    }
  }, [assets]);

  const handleAddAsset = (asset) => {
    setAssets(prev => [asset, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1);
  };

  const handleDeleteAsset = (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset investment?')) {
      setAssets(prev => prev.filter(a => a.id !== assetId));
    }
  };

  const handleEditAsset = (asset) => {
    // TODO: Implement edit functionality
    console.log('Edit asset:', asset);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = [...assets];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.assetName.toLowerCase().includes(search) ||
        asset.investedBy.toLowerCase().includes(search) ||
        asset.id.toLowerCase().includes(search)
      );
    }

    // Date range filter
    if (filters.fromDate) {
      filtered = filtered.filter(asset => 
        new Date(asset.date) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(asset => 
        new Date(asset.date) <= new Date(filters.toDate)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.assetName.localeCompare(b.assetName));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.assetName.localeCompare(a.assetName));
        break;
      case 'amount-asc':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      default:
        break;
    }

    return filtered;
  }, [assets, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAssets.length / itemsPerPage);
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAssets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAssets, currentPage, itemsPerPage]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Investment</h1>
          <p className="page-description">
            Track and manage your asset investments.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="swiss-button"
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Asset
        </button>
      </div>

      <div className="page-content">
        <AssetSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <AssetsList
          assets={paginatedAssets}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
        />

        {filteredAndSortedAssets.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedAssets.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Asset Investment"
        maxWidth="600px"
      >
        <AddAssetForm
          onSubmit={handleAddAsset}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AssetInvestment;

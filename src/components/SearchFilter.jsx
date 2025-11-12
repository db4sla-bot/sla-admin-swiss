import { Search, Filter } from 'lucide-react';

const SearchFilter = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search materials by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        <select
          value={filters.unit}
          onChange={(e) => onFilterChange('unit', e.target.value)}
          className="filter-select"
        >
          <option value="">All Units</option>
          <option value="meter">Meter</option>
          <option value="unit">Unit</option>
          <option value="kg">Kilogram</option>
          <option value="piece">Piece</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="filter-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low-High)</option>
          <option value="price-desc">Price (High-Low)</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;

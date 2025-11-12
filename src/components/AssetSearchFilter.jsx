import { Search, Filter, Calendar } from 'lucide-react';

const AssetSearchFilter = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search by asset name, investor, or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        
        <div className="date-range-filter">
          <div className="date-input-wrapper">
            <Calendar size={16} className="date-icon" />
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => onFilterChange('fromDate', e.target.value)}
              className="filter-date-input"
              placeholder="From Date"
            />
          </div>
          
          <span className="date-separator">to</span>
          
          <div className="date-input-wrapper">
            <Calendar size={16} className="date-icon" />
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => onFilterChange('toDate', e.target.value)}
              className="filter-date-input"
              placeholder="To Date"
            />
          </div>
        </div>

        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="filter-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="amount-asc">Amount (Low-High)</option>
          <option value="amount-desc">Amount (High-Low)</option>
        </select>
      </div>
    </div>
  );
};

export default AssetSearchFilter;

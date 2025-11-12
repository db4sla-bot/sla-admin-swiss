import { Search, Filter } from 'lucide-react';

const QRCodeSearchFilter = ({ 
  searchTerm, 
  onSearchChange,
  typeFilter,
  onTypeFilterChange
}) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search QR codes by title or content..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="URL">URL</option>
          <option value="Text">Text</option>
          <option value="Phone">Phone</option>
          <option value="Email">Email</option>
          <option value="Number">Number</option>
        </select>
      </div>
    </div>
  );
};

export default QRCodeSearchFilter;

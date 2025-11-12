import { Search, Filter, Calendar } from 'lucide-react';

const MaterialInvestmentSearchFilter = ({ 
  searchTerm, 
  onSearchChange,
  materialFilter,
  onMaterialFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  materials
}) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search by material name or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        <select
          value={materialFilter}
          onChange={(e) => onMaterialFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Materials</option>
          {materials.map(material => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </div>

      <div className="date-range-filter">
        <div className="date-input-wrapper">
          <Calendar className="date-icon" size={16} />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="filter-date-input"
          />
        </div>
        <span className="date-separator">to</span>
        <div className="date-input-wrapper">
          <Calendar className="date-icon" size={16} />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="filter-date-input"
          />
        </div>
      </div>
    </div>
  );
};

export default MaterialInvestmentSearchFilter;

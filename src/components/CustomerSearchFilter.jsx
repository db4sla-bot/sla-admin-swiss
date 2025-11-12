import { Search, Filter } from 'lucide-react';

const CustomerSearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  serviceFilter,
  onServiceFilterChange
}) => {
  const availableServices = [
    'All Services',
    'Invisible Grills',
    'Mosquito Mesh',
    'Cloth Hangers'
  ];

  return (
    <div className="search-filter-container">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search customers by name, mobile, or address..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        <select
          value={serviceFilter}
          onChange={(e) => onServiceFilterChange(e.target.value)}
          className="filter-select"
        >
          {availableServices.map(service => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CustomerSearchFilter;

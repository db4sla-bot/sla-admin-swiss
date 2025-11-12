import { Search, Filter } from 'lucide-react';

const LeadsSearchFilter = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
  const statusOptions = [
    'New',
    'Followup',
    'Sitevisit',
    'Quotation',
    'Customer Declines'
  ];

  const sourceOptions = [
    'Digital Marketing',
    'Online',
    'Offline Marketing',
    'Reference',
    'Marketing',
    'Interior Designers',
    'Builders',
    'Engineers'
  ];

  const subSourceOptions = [
    'Instagram',
    'Facebook',
    'Google',
    'Just Dial',
    'Google Listing',
    'Existing Customer',
    'Friends',
    'Marketers',
    'Flex',
    'Newspapers',
    'Bike Stickers',
    'Others'
  ];

  const servicesOptions = [
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
          placeholder="Search by customer name, mobile, or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={filters.source}
          onChange={(e) => onFilterChange('source', e.target.value)}
          className="filter-select"
        >
          <option value="">All Sources</option>
          {sourceOptions.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>

        <select
          value={filters.subSource}
          onChange={(e) => onFilterChange('subSource', e.target.value)}
          className="filter-select"
        >
          <option value="">All Sub Sources</option>
          {subSourceOptions.map(subSource => (
            <option key={subSource} value={subSource}>{subSource}</option>
          ))}
        </select>

        <select
          value={filters.service}
          onChange={(e) => onFilterChange('service', e.target.value)}
          className="filter-select"
        >
          <option value="">All Services</option>
          {servicesOptions.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
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
          <option value="status">By Status</option>
        </select>
      </div>
    </div>
  );
};

export default LeadsSearchFilter;

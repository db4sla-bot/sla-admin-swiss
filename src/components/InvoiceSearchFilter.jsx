import { Search, Filter, Calendar } from 'lucide-react';

const InvoiceSearchFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter,
  dateFilter,
  setDateFilter 
}) => {
  return (
    <div className="search-filter-container">
      {/* Search Box */}
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by invoice number, customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className="filter-box">
        <Calendar className="filter-icon" size={18} />
        <select
          className="filter-select"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="All">All Dates</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
        </select>
      </div>
    </div>
  );
};

export default InvoiceSearchFilter;

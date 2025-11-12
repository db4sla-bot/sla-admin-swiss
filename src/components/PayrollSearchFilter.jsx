import { Search, Filter, Calendar } from 'lucide-react';

const PayrollSearchFilter = ({ 
  searchTerm, 
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange
}) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search by employee name or ID..."
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
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
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

export default PayrollSearchFilter;

import { Search, Filter, Calendar } from 'lucide-react';

const MonthlyExpenseSearchFilter = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
  const categories = [
    'Rent',
    'Utilities',
    'Salaries',
    'Insurance',
    'Maintenance',
    'Marketing',
    'Office Supplies',
    'Software Subscriptions',
    'Loan Payments',
    'Taxes',
    'Professional Services',
    'Miscellaneous'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="search-filter-container">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search by expense name or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-box">
        <Filter className="filter-icon" size={18} />
        
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filters.month}
          onChange={(e) => onFilterChange('month', e.target.value)}
          className="filter-select"
        >
          <option value="">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={(e) => onFilterChange('year', e.target.value)}
          className="filter-select"
        >
          <option value="">All Years</option>
          {years.map(year => (
            <option key={year} value={year.toString()}>{year}</option>
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
          <option value="amount-asc">Amount (Low to High)</option>
          <option value="amount-desc">Amount (High to Low)</option>
        </select>
      </div>
    </div>
  );
};

export default MonthlyExpenseSearchFilter;

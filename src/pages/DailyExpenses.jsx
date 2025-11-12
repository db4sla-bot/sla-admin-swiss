import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddDailyExpenseForm from '../components/AddDailyExpenseForm';
import DailyExpenseSearchFilter from '../components/DailyExpenseSearchFilter';
import DailyExpensesList from '../components/DailyExpensesList';
import Pagination from '../components/Pagination';

const DailyExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    fromDate: '',
    toDate: '',
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Load expenses from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('dailyExpenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('dailyExpenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleAddExpense = (expense) => {
    setExpenses(prev => [expense, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1);
  };

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
    }
  };

  const handleEditExpense = (expense) => {
    // TODO: Implement edit functionality
    console.log('Edit expense:', expense);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.investmentName.toLowerCase().includes(search) ||
        expense.id.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    // Date range filter
    if (filters.fromDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) <= new Date(filters.toDate)
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
        filtered.sort((a, b) => a.investmentName.localeCompare(b.investmentName));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.investmentName.localeCompare(a.investmentName));
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
  }, [expenses, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedExpenses, currentPage, itemsPerPage]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Expenses</h1>
          <p className="page-description">
            Track and manage your daily expenses.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="swiss-button"
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Daily Expense
        </button>
      </div>

      <div className="page-content">
        <DailyExpenseSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <DailyExpensesList
          expenses={paginatedExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />

        {filteredAndSortedExpenses.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedExpenses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Daily Expense"
        maxWidth="600px"
      >
        <AddDailyExpenseForm
          onSubmit={handleAddExpense}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default DailyExpenses;

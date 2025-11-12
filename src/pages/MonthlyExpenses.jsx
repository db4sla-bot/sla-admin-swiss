import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddMonthlyExpenseForm from '../components/AddMonthlyExpenseForm';
import MonthlyExpenseSearchFilter from '../components/MonthlyExpenseSearchFilter';
import MonthlyExpensesList from '../components/MonthlyExpensesList';
import Pagination from '../components/Pagination';

const MonthlyExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    month: '',
    year: '',
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Load expenses from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('monthlyExpenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('monthlyExpenses', JSON.stringify(expenses));
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
        expense.expenseName.toLowerCase().includes(search) ||
        expense.id.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    // Month filter
    if (filters.month) {
      filtered = filtered.filter(expense => expense.month === filters.month);
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(expense => expense.year === filters.year);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.expenseName.localeCompare(b.expenseName));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.expenseName.localeCompare(a.expenseName));
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
          <h1 className="page-title">Monthly Expenses</h1>
          <p className="page-description">
            Review and manage your monthly expenses.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="swiss-button"
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Monthly Expense
        </button>
      </div>

      <div className="page-content">
        <MonthlyExpenseSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <MonthlyExpensesList
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
        title="Add Monthly Expense"
        maxWidth="600px"
      >
        <AddMonthlyExpenseForm
          onSubmit={handleAddExpense}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default MonthlyExpenses;

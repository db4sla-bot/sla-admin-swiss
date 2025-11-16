import { useState, useEffect } from 'react';
import { Plus, Search, X, Loader2, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
  const { canEdit } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSubCategory, setFilterSubCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    expenseName: '',
    category: '',
    subCategory: '',
    amount: '',
    details: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  // Category and SubCategory mapping
  const categorySubCategoryMap = {
    "Rent": ["Office", "Room", "Go-Down"],
    "Power Bills": ["Office", "Room", "Go-Down"],
    "DTH": ["Office", "Room", "Go-Down"],
    "Internet": ["Office", "Room", "Go-Down"],
    "Mobile Recharge": ["Name", "Number"],
    "Cleaning": ["Office", "Room", "Go-Down"],
    "Maid": ["Office", "Room", "Go-Down"],
    "Expenses": ["D-Mart", "Kirana", "Cafe", "Water Cans", "Rice", "Gas", "Eggs", "NV", "Others"],
    "Party": ["Details"],
    "EMIs": ["ID", "Bike", "Details"],
    "Maintenance": ["Service", "Repairs"],
    "Bonus": ["Name", "Details"],
    "Transportation": ["IG", "CH", "MM Collection", "Installation", "Site Visit - OOS", "Petrol", "Details"],
    "Digi Marketing": ["Google Ads", "Insta", "Way2 News", "others"],
    "Misc": ["Others"]
  };

  const categories = Object.keys(categorySubCategoryMap);
  const subCategories = expenseForm.category ? categorySubCategoryMap[expenseForm.category] : [];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const expensesCollection = collection(db, 'expenses');
      const q = query(expensesCollection, orderBy('expenseDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!canEdit('Expenses')) {
      toast.error("You don't have access to add expenses");
      return;
    }

    if (!expenseForm.expenseName || !expenseForm.category || !expenseForm.subCategory || !expenseForm.amount || !expenseForm.expenseDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const newExpense = {
        expenseName: expenseForm.expenseName,
        category: expenseForm.category,
        subCategory: expenseForm.subCategory,
        amount: parseFloat(expenseForm.amount),
        details: expenseForm.details,
        expenseDate: expenseForm.expenseDate,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'expenses'), newExpense);
      
      setExpenses(prev => [{ id: docRef.id, ...newExpense }, ...prev]);
      resetForm();
      setIsModalOpen(false);
      toast.success('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditExpense = (expense) => {
    setIsEditing(true);
    setEditingId(expense.id);
    setExpenseForm({
      expenseName: expense.expenseName,
      category: expense.category,
      subCategory: expense.subCategory,
      amount: expense.amount.toString(),
      details: expense.details || '',
      expenseDate: expense.expenseDate
    });
    setIsModalOpen(true);
  };

  const handleUpdateExpense = async () => {
    if (!canEdit('Expenses')) {
      toast.error("You don't have access to edit expenses");
      return;
    }

    if (!expenseForm.expenseName || !expenseForm.category || !expenseForm.subCategory || !expenseForm.amount || !expenseForm.expenseDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const expenseRef = doc(db, 'expenses', editingId);
      const updatedData = {
        expenseName: expenseForm.expenseName,
        category: expenseForm.category,
        subCategory: expenseForm.subCategory,
        amount: parseFloat(expenseForm.amount),
        details: expenseForm.details,
        expenseDate: expenseForm.expenseDate,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(expenseRef, updatedData);

      setExpenses(prev => prev.map(expense =>
        expense.id === editingId
          ? { ...expense, ...updatedData }
          : expense
      ));

      resetForm();
      setIsModalOpen(false);
      toast.success('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async (expenseId, expenseName) => {
    if (!canEdit('Expenses')) {
      toast.error("You don't have access to delete expenses");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${expenseName}"?`)) {
      return;
    }

    setDeletingId(expenseId);
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setExpenseForm({
      expenseName: '',
      category: '',
      subCategory: '',
      amount: '',
      details: '',
      expenseDate: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  // Handle category change - reset subcategory
  const handleCategoryChange = (category) => {
    setExpenseForm(prev => ({
      ...prev,
      category: category,
      subCategory: '' // Reset subcategory when category changes
    }));
  };

  // Filter logic
  const filteredExpenses = expenses.filter(expense => {
    // Search filter
    const matchesSearch = expense.expenseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    
    // SubCategory filter
    const matchesSubCategory = filterSubCategory === 'all' || expense.subCategory === filterSubCategory;
    
    // Date range filter
    let matchesDateRange = true;
    if (filterDateRange === 'custom' && filterFromDate && filterToDate) {
      matchesDateRange = expense.expenseDate >= filterFromDate && expense.expenseDate <= filterToDate;
    } else if (filterDateRange === 'today') {
      matchesDateRange = expense.expenseDate === new Date().toISOString().split('T')[0];
    } else if (filterDateRange === 'this-week') {
      const today = new Date();
      const weekAgo = new Date(today.setDate(today.getDate() - 7));
      matchesDateRange = new Date(expense.expenseDate) >= weekAgo;
    } else if (filterDateRange === 'this-month') {
      const today = new Date();
      matchesDateRange = expense.expenseDate.startsWith(today.toISOString().substring(0, 7));
    }
    
    return matchesSearch && matchesCategory && matchesSubCategory && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterSubCategory, filterDateRange, filterFromDate, filterToDate]);

  // Get available subcategories based on selected category filter
  const filterSubCategoryOptions = filterCategory !== 'all' ? categorySubCategoryMap[filterCategory] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#0A647D] mb-4 mx-auto" />
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your business expenses</p>
        </div>
        {canEdit('Expenses') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all shadow-sm cursor-pointer"
          >
            <Plus size={20} />
            Add Expense
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or subcategory..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0A647D]"
            />
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubCategory('all');
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#0A647D]"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterSubCategory}
              onChange={(e) => setFilterSubCategory(e.target.value)}
              disabled={filterCategory === 'all'}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#0A647D] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All Sub-Categories</option>
              {filterSubCategoryOptions.map(subCat => (
                <option key={subCat} value={subCat}>{subCat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#0A647D]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filterDateRange === 'custom' && (
            <>
              <div>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#0A647D]"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-[#0A647D]"
                />
              </div>
            </>
          )}
        </div>

        {(searchQuery || filterCategory !== 'all' || filterSubCategory !== 'all' || filterDateRange !== 'all') && (
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden">
        {paginatedExpenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery || filterCategory !== 'all' || filterSubCategory !== 'all' || filterDateRange !== 'all'
                ? 'No expenses found matching your filters'
                : 'No expenses added yet'}
            </p>
            {!searchQuery && filterCategory === 'all' && canEdit('Expenses') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-6 py-2 bg-[#0A647D] text-white rounded-lg hover:bg-[#08516A] transition-all cursor-pointer"
              >
                Add Your First Expense
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Expense Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sub-Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount (₹)</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
                    {canEdit('Expenses') && (
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{expense.expenseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.subCategory}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">₹{expense.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.expenseDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{expense.details || '-'}</td>
                      {canEdit('Expenses') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditExpense(expense)}
                              disabled={deletingId === expense.id}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit Expense"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id, expense.expenseName)}
                              disabled={deletingId === expense.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Expense"
                            >
                              {deletingId === expense.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                            currentPage === page
                              ? 'bg-[#0A647D] text-white'
                              : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#E8F4F8] to-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Expense Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={expenseForm.expenseName}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, expenseName: e.target.value }))}
                    placeholder="Enter expense name"
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sub-Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={expenseForm.subCategory}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, subCategory: e.target.value }))}
                    disabled={!expenseForm.category}
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Sub-Category</option>
                    {subCategories.map(subCat => (
                      <option key={subCat} value={subCat}>{subCat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Expense Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 cursor-pointer"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Details
                  </label>
                  <textarea
                    value={expenseForm.details}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, details: e.target.value }))}
                    placeholder="Enter additional details (optional)"
                    rows="4"
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:border-[#0A647D] focus:ring-2 focus:ring-[#D4EDF5] bg-white hover:border-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 mt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateExpense}
                      disabled={isSaving}
                      className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving && <Loader2 size={18} className="animate-spin" />}
                      {isSaving ? 'Updating...' : 'Update Expense'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleAddExpense}
                      disabled={isSaving}
                      className="flex-1 px-6 py-2.5 bg-[#0A647D] text-white rounded-lg font-semibold hover:bg-[#08516A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving && <Loader2 size={18} className="animate-spin" />}
                      {isSaving ? 'Saving...' : 'Save Expense'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

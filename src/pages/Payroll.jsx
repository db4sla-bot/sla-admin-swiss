import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddPayrollForm from '../components/AddPayrollForm';
import PayrollSearchFilter from '../components/PayrollSearchFilter';
import PayrollList from '../components/PayrollList';

const Payroll = () => {
  // Sample employees data
  const employees = [
    { id: '1', name: 'Ramesh Kumar', mobile: '9876543210' },
    { id: '2', name: 'Priya Singh', mobile: '9876543220' },
    { id: '3', name: 'Amit Patel', mobile: '9876543230' },
    { id: '4', name: 'Sneha Reddy', mobile: '9876543240' },
    { id: '5', name: 'Vikram Singh', mobile: '9876543250' }
  ];

  const [payrolls, setPayrolls] = useState([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Ramesh Kumar',
      basicSalary: 35000,
      bonus: 5000,
      miscellaneous: 2000,
      deductions: 3000,
      totalSalary: 39000,
      paymentDate: '2024-11-01T10:00:00Z',
      createdAt: '2024-11-01T10:00:00Z',
      status: 'Paid'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Priya Singh',
      basicSalary: 28000,
      bonus: 3000,
      miscellaneous: 1000,
      deductions: 2000,
      totalSalary: 30000,
      paymentDate: '2024-11-05T14:30:00Z',
      createdAt: '2024-11-05T14:30:00Z',
      status: 'Pending'
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Amit Patel',
      basicSalary: 32000,
      bonus: 4000,
      miscellaneous: 1500,
      deductions: 2500,
      totalSalary: 35000,
      paymentDate: '2024-11-08T09:15:00Z',
      createdAt: '2024-11-08T09:15:00Z',
      status: 'Paid'
    },
    {
      id: '4',
      employeeId: '4',
      employeeName: 'Sneha Reddy',
      basicSalary: 25000,
      bonus: 0,
      miscellaneous: 500,
      deductions: 1500,
      totalSalary: 24000,
      paymentDate: '2024-11-10T11:45:00Z',
      createdAt: '2024-11-10T11:45:00Z',
      status: 'Pending'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const handleAddPayroll = (payrollData) => {
    setPayrolls(prev => [payrollData, ...prev]);
  };

  const handleEditPayroll = (payroll) => {
    console.log('Edit payroll:', payroll);
    // TODO: Implement edit functionality
  };

  const handleDeletePayroll = (payrollId) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      setPayrolls(prev => prev.filter(p => p.id !== payrollId));
    }
  };

  const handleUpdateStatus = (payrollId, newStatus) => {
    setPayrolls(prev => prev.map(p => 
      p.id === payrollId ? { ...p, status: newStatus } : p
    ));
  };

  // Filter and search logic
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(payroll => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        payroll.employeeName.toLowerCase().includes(searchLower) ||
        payroll.employeeId.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter;

      // Date range filter
      const paymentDate = new Date(payroll.paymentDate);
      const matchesDateFrom = !dateFrom || paymentDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || paymentDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [payrolls, searchTerm, statusFilter, dateFrom, dateTo]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayrolls = filteredPayrolls.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (value) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateToChange = (value) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  // Calculate totals
  const totalPayable = filteredPayrolls.reduce((sum, p) => sum + p.totalSalary, 0);
  const totalPaid = filteredPayrolls
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.totalSalary, 0);
  const totalPending = filteredPayrolls
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.totalSalary, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll</h1>
          <p className="page-description">
            Manage employee salary, bonuses, and deductions.
          </p>
        </div>
        <button 
          className="swiss-button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Payroll
        </button>
      </div>

      <div className="page-content">
        {/* Payroll Summary */}
        {filteredPayrolls.length > 0 && (
          <div className="payroll-summary-cards">
            <div className="summary-card total">
              <div className="summary-card-label">Total Payable</div>
              <div className="summary-card-value">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0
                }).format(totalPayable)}
              </div>
              <div className="summary-card-count">{filteredPayrolls.length} records</div>
            </div>

            <div className="summary-card paid">
              <div className="summary-card-label">Total Paid</div>
              <div className="summary-card-value">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0
                }).format(totalPaid)}
              </div>
              <div className="summary-card-count">
                {filteredPayrolls.filter(p => p.status === 'Paid').length} paid
              </div>
            </div>

            <div className="summary-card pending">
              <div className="summary-card-label">Total Pending</div>
              <div className="summary-card-value">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0
                }).format(totalPending)}
              </div>
              <div className="summary-card-count">
                {filteredPayrolls.filter(p => p.status === 'Pending').length} pending
              </div>
            </div>
          </div>
        )}

        <PayrollSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          dateFrom={dateFrom}
          onDateFromChange={handleDateFromChange}
          dateTo={dateTo}
          onDateToChange={handleDateToChange}
        />

        <PayrollList
          payrolls={currentPayrolls}
          onEdit={handleEditPayroll}
          onDelete={handleDeletePayroll}
          onUpdateStatus={handleUpdateStatus}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Add Payroll Record"
        onClose={() => setIsModalOpen(false)}
      >
        <AddPayrollForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddPayroll}
          employees={employees}
        />
      </Modal>
    </div>
  );
};

export default Payroll;

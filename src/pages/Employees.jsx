import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddEmployeeForm from '../components/AddEmployeeForm';
import EmployeeSearchFilter from '../components/EmployeeSearchFilter';
import EmployeesList from '../components/EmployeesList';
import { menuItems } from '../config/menuItems';

const Employees = () => {
  const [employees, setEmployees] = useState([
    {
      id: '1',
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      email: 'ramesh.kumar@example.com',
      isAdmin: true,
      canView: true,
      canEdit: true,
      accessiblePages: ['dashboard', 'materials', 'leads', 'customers'],
      aadharNumber: '123456789012',
      aadharFile: null,
      highestQualification: 'Bachelor\'s Degree',
      passedOutYear: '2015',
      emergencyContact: '9876543211',
      address: '123, Main Street, Bangalore, Karnataka - 560001',
      maritalStatus: 'married',
      createdAt: '2024-01-15T10:00:00Z',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Priya Singh',
      mobile: '9876543220',
      email: 'priya.singh@example.com',
      isAdmin: false,
      canView: true,
      canEdit: false,
      accessiblePages: ['leads', 'customers'],
      aadharNumber: '234567890123',
      aadharFile: null,
      highestQualification: '12th',
      passedOutYear: '2018',
      emergencyContact: '9876543221',
      address: '456, Park Road, Mumbai, Maharashtra - 400001',
      maritalStatus: 'single',
      createdAt: '2024-02-20T14:30:00Z',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Amit Patel',
      mobile: '9876543230',
      email: 'amit.patel@example.com',
      isAdmin: false,
      canView: true,
      canEdit: true,
      accessiblePages: ['materials', 'asset-investment', 'material-investment'],
      aadharNumber: '345678901234',
      aadharFile: null,
      highestQualification: 'Diploma',
      passedOutYear: '2017',
      emergencyContact: '9876543231',
      address: '789, Ring Road, Ahmedabad, Gujarat - 380001',
      maritalStatus: 'single',
      createdAt: '2024-03-10T09:15:00Z',
      status: 'Active'
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      mobile: '9876543240',
      email: '',
      isAdmin: false,
      canView: false,
      canEdit: false,
      accessiblePages: [],
      aadharNumber: '456789012345',
      aadharFile: null,
      highestQualification: '10th',
      passedOutYear: '2019',
      emergencyContact: '9876543241',
      address: '321, Hitech City, Hyderabad, Telangana - 500081',
      maritalStatus: 'single',
      createdAt: '2024-04-05T11:45:00Z',
      status: 'Inactive'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const handleAddEmployee = (employeeData) => {
    setEmployees(prev => [employeeData, ...prev]);
  };

  const handleEditEmployee = (employee) => {
    console.log('Edit employee:', employee);
    // TODO: Implement edit functionality
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  // Filter and search logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchLower) ||
        employee.mobile.includes(searchTerm) ||
        (employee.email && employee.email.toLowerCase().includes(searchLower));

      // Status filter
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

      // Role filter
      const matchesRole = 
        roleFilter === 'all' || 
        (roleFilter === 'admin' && employee.isAdmin) ||
        (roleFilter === 'staff' && !employee.isAdmin);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [employees, searchTerm, statusFilter, roleFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-description">
            Manage employee records, access control, and information.
          </p>
        </div>
        <button 
          className="swiss-button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Employee
        </button>
      </div>

      <div className="page-content">
        <EmployeeSearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
        />

        <EmployeesList
          employees={currentEmployees}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteEmployee}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Add New Employee"
        onClose={() => setIsModalOpen(false)}
        maxWidth="800px"
      >
        <AddEmployeeForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddEmployee}
          menuItems={menuItems}
        />
      </Modal>
    </div>
  );
};

export default Employees;

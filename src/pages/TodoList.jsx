import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import AddTodoForm from '../components/AddTodoForm';
import TodoSearchFilter from '../components/TodoSearchFilter';
import TodoListComponent from '../components/TodoList';

const TodoList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todos, setTodos] = useState([
    {
      id: 1,
      title: 'Complete project proposal',
      date: '2024-01-20',
      status: 'In Progress',
      description: 'Prepare and submit the project proposal for SLA Admin',
      createdAt: '2024-01-10'
    },
    {
      id: 2,
      title: 'Team meeting with clients',
      date: '2024-01-22',
      status: 'New',
      description: 'Discuss project requirements and timeline',
      createdAt: '2024-01-12'
    },
    {
      id: 3,
      title: 'Review customer feedback',
      date: '2024-01-18',
      status: 'Done',
      description: 'Analyze customer feedback from last month',
      createdAt: '2024-01-08'
    },
    {
      id: 4,
      title: 'Update inventory records',
      date: '2024-01-25',
      status: 'New',
      description: 'Update all material inventory in the system',
      createdAt: '2024-01-13'
    },
    {
      id: 5,
      title: 'Prepare monthly report',
      date: '2024-01-30',
      status: 'In Progress',
      description: 'Generate monthly business performance report',
      createdAt: '2024-01-14'
    },
    {
      id: 6,
      title: 'Employee training session',
      date: '2024-01-28',
      status: 'New',
      description: 'Conduct safety training for new employees',
      createdAt: '2024-01-15'
    },
    {
      id: 7,
      title: 'Fix website bugs',
      date: '2024-01-19',
      status: 'Done',
      description: 'Resolve reported issues on the website',
      createdAt: '2024-01-09'
    },
    {
      id: 8,
      title: 'Order office supplies',
      date: '2024-01-24',
      status: 'New',
      description: 'Purchase necessary office supplies for the month',
      createdAt: '2024-01-11'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const handleAddTodo = (todoData) => {
    const newTodo = {
      id: todos.length + 1,
      ...todoData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTodos([newTodo, ...todos]);
    setIsModalOpen(false);
  };

  const handleEditTodo = (todo) => {
    console.log('Edit todo:', todo);
    // TODO: Implement edit functionality
  };

  const handleDeleteTodo = (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, status: newStatus } : todo
    ));
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || todo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTodos = filteredTodos.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Count todos by status
  const newCount = todos.filter(t => t.status === 'New').length;
  const inProgressCount = todos.filter(t => t.status === 'In Progress').length;
  const doneCount = todos.filter(t => t.status === 'Done').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">To-Do List</h1>
          <p className="page-description">
            Organize your tasks and manage your daily activities.
          </p>
        </div>
        <button 
          className="swiss-button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Todo
        </button>
      </div>

      <div className="page-content">
        {/* Stats Cards */}
        <div className="todo-stats">
          <div className="stat-card todo-stat-new">
            <div className="stat-value">{newCount}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="stat-card todo-stat-progress">
            <div className="stat-value">{inProgressCount}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card todo-stat-done">
            <div className="stat-value">{doneCount}</div>
            <div className="stat-label">Done</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{todos.length}</div>
            <div className="stat-label">Total Todos</div>
          </div>
        </div>

        <TodoSearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <TodoListComponent
          todos={paginatedTodos}
          onEdit={handleEditTodo}
          onDelete={handleDeleteTodo}
          onStatusChange={handleStatusChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Todo"
      >
        <AddTodoForm onSubmit={handleAddTodo} />
      </Modal>
    </div>
  );
};

export default TodoList;


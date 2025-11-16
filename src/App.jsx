import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Materials from './pages/Materials';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import Quotations from './pages/Quotations';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<ProtectedRoute requiredMenu="Dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="leads" element={<ProtectedRoute requiredMenu="Leads"><Leads /></ProtectedRoute>} />
          <Route path="leads/:id" element={<ProtectedRoute requiredMenu="Leads"><LeadDetails /></ProtectedRoute>} />
          <Route path="customers" element={<ProtectedRoute requiredMenu="Customers"><Customers /></ProtectedRoute>} />
          <Route path="customers/:id" element={<ProtectedRoute requiredMenu="Customers"><CustomerDetails /></ProtectedRoute>} />
          <Route path="materials" element={<ProtectedRoute requiredMenu="Materials"><Materials /></ProtectedRoute>} />
          <Route path="expenses" element={<ProtectedRoute requiredMenu="Expenses"><Expenses /></ProtectedRoute>} />
          <Route path="invoices" element={<ProtectedRoute requiredMenu="Invoices"><Invoices /></ProtectedRoute>} />
          <Route path="quotations" element={<ProtectedRoute requiredMenu="Quotations"><Quotations /></ProtectedRoute>} />
          <Route path="employees" element={<ProtectedRoute requiredMenu="Employees"><Employees /></ProtectedRoute>} />
          <Route path="employees/:id" element={<ProtectedRoute requiredMenu="Employees"><EmployeeDetails /></ProtectedRoute>} />
        </Route>
      </Routes>
      <ToastContainer 
        position="top-right"
        autoClose={1500}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
};

export default App;
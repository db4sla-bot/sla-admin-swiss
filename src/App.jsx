import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import AssetInvestment from './pages/AssetInvestment';
import MaterialInvestment from './pages/MaterialInvestment';
import MonthlyExpenses from './pages/MonthlyExpenses';
import DailyExpenses from './pages/DailyExpenses';
import Payroll from './pages/Payroll';
import Employees from './pages/Employees';
import Invoices from './pages/Invoices';
import Quotations from './pages/Quotations';
import QRGenerator from './pages/QRGenerator';
import TodoList from './pages/TodoList';
import './App.css';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/asset-investment" element={<AssetInvestment />} />
          <Route path="/material-investment" element={<MaterialInvestment />} />
          <Route path="/monthly-expenses" element={<MonthlyExpenses />} />
          <Route path="/daily-expenses" element={<DailyExpenses />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/qr-generator" element={<QRGenerator />} />
          <Route path="/todo" element={<TodoList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App
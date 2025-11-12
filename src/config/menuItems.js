import {
  LayoutDashboard,
  Package,
  Users,
  UserCheck,
  TrendingUp,
  Box,
  Calendar,
  DollarSign,
  Wallet,
  IndianRupee,
  UsersRound,
  FileText,
  FileEdit,
  QrCode,
  ListTodo
} from 'lucide-react';

export const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard
  },
  {
    id: 'materials',
    label: 'Materials',
    path: '/materials',
    icon: Package
  },
  {
    id: 'leads',
    label: 'Leads',
    path: '/leads',
    icon: Users
  },
  {
    id: 'customers',
    label: 'Customers',
    path: '/customers',
    icon: UserCheck
  },
  {
    id: 'asset-investment',
    label: 'Asset Investment',
    path: '/asset-investment',
    icon: TrendingUp
  },
  {
    id: 'material-investment',
    label: 'Material Investment',
    path: '/material-investment',
    icon: Box
  },
  {
    id: 'monthly-expenses',
    label: 'Monthly Expenses',
    path: '/monthly-expenses',
    icon: Calendar
  },
  {
    id: 'daily-expenses',
    label: 'Daily Expenses',
    path: '/daily-expenses',
    icon: IndianRupee
  },
  {
    id: 'payroll',
    label: 'Payroll',
    path: '/payroll',
    icon: Wallet
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/employees',
    icon: UsersRound
  },
  {
    id: 'invoices',
    label: 'Invoices',
    path: '/invoices',
    icon: FileText
  },
  {
    id: 'quotations',
    label: 'Quotations',
    path: '/quotations',
    icon: FileEdit
  },
  {
    id: 'qr-generator',
    label: 'QR Code Generator',
    path: '/qr-generator',
    icon: QrCode
  },
  {
    id: 'todo',
    label: 'To-Do List',
    path: '/todo',
    icon: ListTodo
  }
];

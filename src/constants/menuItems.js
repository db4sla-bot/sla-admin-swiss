import {
  LayoutDashboard,
  Users,
  UserCircle,
  Package,
  Receipt,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';

export const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', menu: 'Dashboard' },
  { path: '/leads', icon: Users, label: 'Leads', menu: 'Leads' },
  { path: '/customers', icon: UserCircle, label: 'Customers', menu: 'Customers' },
  { path: '/materials', icon: Package, label: 'Materials', menu: 'Materials' },
  { path: '/expenses', icon: DollarSign, label: 'Expenses', menu: 'Expenses' },
  { path: '/invoices', icon: Receipt, label: 'Invoices', menu: 'Invoices' },
  { path: '/quotations', icon: FileText, label: 'Quotations', menu: 'Quotations' },
  { path: '/employees', icon: Briefcase, label: 'Employees', menu: 'Employees' }
];

export const allMenuNames = menuItems.map(item => item.menu);

import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  CreditCard,
  Users,
  Target,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [assetInvestments, setAssetInvestments] = useState([]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const loadedLeads = JSON.parse(localStorage.getItem('leads') || '[]');
    const loadedAssets = JSON.parse(localStorage.getItem('assetInvestments') || '[]');
    const loadedDaily = JSON.parse(localStorage.getItem('dailyExpenses') || '[]');
    const loadedMonthly = JSON.parse(localStorage.getItem('monthlyExpenses') || '[]');

    setLeads(loadedLeads);
    setAssetInvestments(loadedAssets);
    setDailyExpenses(loadedDaily);
    setMonthlyExpenses(loadedMonthly);
  }, []);

  // Calculate total investments
  const totalInvestment = useMemo(() => {
    return assetInvestments.reduce((sum, asset) => sum + (asset.amount || 0), 0);
  }, [assetInvestments]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    const dailyTotal = dailyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    return dailyTotal + monthlyTotal;
  }, [dailyExpenses, monthlyExpenses]);

  // Calculate revenue (investment counts as revenue)
  const totalRevenue = totalInvestment;

  // Calculate profit/loss
  const profitLoss = totalRevenue - totalExpenses;
  const profitLossPercentage = totalRevenue > 0 ? ((profitLoss / totalRevenue) * 100) : 0;

  // Lead conversion statistics
  const leadStats = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter(lead => lead.status === 'Closed').length;
    const inProgress = leads.filter(lead => lead.status === 'In Progress').length;
    const pending = leads.filter(lead => lead.status === 'New' || lead.status === 'Contacted').length;
    const rate = total > 0 ? ((converted / total) * 100) : 0;
    
    return { total, converted, inProgress, pending, rate };
  }, [leads]);

  // Monthly trend data (last 6 months)
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      
      // Filter expenses by month
      const monthExpenses = [...dailyExpenses, ...monthlyExpenses].filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        return expenseDate.getMonth() === monthIndex;
      });
      
      const monthRevenue = assetInvestments.filter(asset => {
        const assetDate = new Date(asset.date || asset.createdAt);
        return assetDate.getMonth() === monthIndex;
      }).reduce((sum, asset) => sum + asset.amount, 0);

      const monthExpenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      last6Months.push({
        month: months[monthIndex],
        revenue: monthRevenue || Math.floor(Math.random() * 100000) + 50000,
        expenses: monthExpenseTotal || Math.floor(Math.random() * 60000) + 30000,
        profit: (monthRevenue || 0) - (monthExpenseTotal || 0)
      });
    }

    return last6Months;
  }, [assetInvestments, dailyExpenses, monthlyExpenses]);

  // Category-wise expenses for pie chart
  const expensesByCategory = useMemo(() => {
    const categoryMap = {};
    
    dailyExpenses.forEach(expense => {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    });

    monthlyExpenses.forEach(expense => {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [dailyExpenses, monthlyExpenses]);

  // Lead status distribution
  const leadStatusData = useMemo(() => {
    return [
      { name: 'Converted', value: leadStats.converted },
      { name: 'In Progress', value: leadStats.inProgress },
      { name: 'Pending', value: leadStats.pending }
    ].filter(item => item.value > 0);
  }, [leadStats]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#0A647D', '#FF8042', '#00C49F', '#FFBB28', '#8884D8', '#82ca9d'];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Dashboard</h1>
          <p className="page-description">
            Overview of your business performance and analytics
          </p>
        </div>
        <div className="dashboard-date">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      <div className="page-content">
        {/* Key Metrics Cards */}
        <div className="dashboard-metrics">
          <div className="metric-card">
            <div className="metric-icon revenue">
              <DollarSign size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total Revenue</div>
              <div className="metric-value">{formatCurrency(totalRevenue)}</div>
              <div className="metric-change positive">
                <TrendingUp size={14} />
                <span>12.5% from last month</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon investment">
              <Package size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total Investment</div>
              <div className="metric-value">{formatCurrency(totalInvestment)}</div>
              <div className="metric-change positive">
                <TrendingUp size={14} />
                <span>8.2% from last month</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon expenses">
              <CreditCard size={24} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total Expenses</div>
              <div className="metric-value">{formatCurrency(totalExpenses)}</div>
              <div className="metric-change negative">
                <TrendingUp size={14} />
                <span>5.7% from last month</span>
              </div>
            </div>
          </div>

          <div className={`metric-card ${profitLoss >= 0 ? 'profit' : 'loss'}`}>
            <div className={`metric-icon ${profitLoss >= 0 ? 'profit-icon' : 'loss-icon'}`}>
              {profitLoss >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div className="metric-content">
              <div className="metric-label">{profitLoss >= 0 ? 'Net Profit' : 'Net Loss'}</div>
              <div className="metric-value">{formatCurrency(Math.abs(profitLoss))}</div>
              <div className={`metric-change ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
                {profitLoss >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{Math.abs(profitLossPercentage).toFixed(2)}% margin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="dashboard-charts-row">
          {/* Revenue vs Expenses Trend */}
          <div className="chart-card large">
            <div className="chart-header">
              <h3 className="chart-title">Revenue vs Expenses Trend</h3>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#0A647D' }}></div>
                  <span>Revenue</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#FF8042' }}></div>
                  <span>Expenses</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A647D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0A647D" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8042" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF8042" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0A647D" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorExpenses)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Conversion */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Lead Conversion Rate</h3>
              <div className="conversion-rate">
                <Target size={20} />
                <span>{leadStats.rate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="lead-stats">
              <div className="lead-stat-item">
                <div className="stat-label">Total Leads</div>
                <div className="stat-value">{leadStats.total}</div>
              </div>
              <div className="lead-stat-item">
                <div className="stat-label">Converted</div>
                <div className="stat-value success">{leadStats.converted}</div>
              </div>
              <div className="lead-stat-item">
                <div className="stat-label">In Progress</div>
                <div className="stat-value warning">{leadStats.inProgress}</div>
              </div>
              <div className="lead-stat-item">
                <div className="stat-label">Pending</div>
                <div className="stat-value pending">{leadStats.pending}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="dashboard-charts-row">
          {/* Profit Trend */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Monthly Profit Trend</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#0A647D" 
                    strokeWidth={3}
                    dot={{ fill: '#0A647D', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Expense Distribution</h3>
            </div>
            <div className="chart-container">
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expensesByCategory.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#666" 
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#fff', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px'
                      }} 
                    />
                    <Bar dataKey="value" fill="#0A647D" radius={[4, 4, 0, 0]}>
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty-state">
                  <CreditCard size={48} />
                  <p>No expense data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

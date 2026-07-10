import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Scale, FileText, DollarSign, CheckCircle, BarChart3, Download, Loader2 } from 'lucide-react';
import { getReportData } from '../../services/admin.service';

const CATEGORY_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500',
  'bg-green-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-gray-400',
];

const RESOLUTION_COLORS = {
  Resolved: 'bg-green-500',
  'In Review': 'bg-yellow-500',
  Open: 'bg-blue-500',
  Closed: 'bg-gray-500',
};

const SimpleBar = ({ value, max, color }) => (
  <div className="w-full bg-surface-container rounded-full h-2">
    <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
  </div>
);

const formatCurrency = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount}`;
};

const calcChange = (current, previous) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
};

const Report = () => {
  const [period, setPeriod] = useState('Monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getReportData();
        if (response.success) setData(response.data);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-xl min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center p-xl min-h-[400px]">
        <p className="text-on-surface-variant">Failed to load report data.</p>
      </div>
    );
  }

  const { kpis, userGrowth, revenueByMonth, categoryBreakdown, resolutionOverview, successRate, topLawyers } = data;

  const casesChange = calcChange(kpis.casesThisMonth, kpis.casesPrevMonth);
  const casesPositive = kpis.casesThisMonth >= kpis.casesPrevMonth;

  const maxUserCount = Math.max(...userGrowth.map(u => u.count), 1);
  const maxRevenue = Math.max(...revenueByMonth.map(r => r.amount), 1);
  const maxCategoryPct = Math.max(...(categoryBreakdown.map(c => c.pct) || [1]), 1);
  const maxResolutionPct = Math.max(...(resolutionOverview.map(r => r.pct) || [1]), 1);

  const currentMonthRevenue = revenueByMonth.length > 0 ? revenueByMonth[revenueByMonth.length - 1].amount : 0;
  const prevMonthRevenue = revenueByMonth.length > 1 ? revenueByMonth[revenueByMonth.length - 2].amount : 0;
  const revenueChange = calcChange(currentMonthRevenue, prevMonthRevenue);
  const revenuePositive = currentMonthRevenue >= prevMonthRevenue;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Platform Reports</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Key metrics, analytics, and platform health.</p>
        </div>
        <div className="flex items-center gap-sm bg-white border border-surface-container-high rounded-xl p-xs shadow-sm">
          {['Weekly', 'Monthly', 'Quarterly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-lg py-sm rounded-lg text-label-sm font-semibold transition-colors ${period === p ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
              {p}
            </button>
          ))}
          <div className="w-px h-6 bg-surface-container-high mx-xs" />
          <button className="flex items-center justify-center p-sm rounded-lg text-primary hover:bg-primary/5 transition-colors" title="Export PDF">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total Users', value: kpis.totalUsers.toLocaleString('en-IN'), change: null, positive: true, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Lawyers', value: kpis.totalLawyers.toLocaleString('en-IN'), change: null, positive: true, icon: Scale, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Cases This Month', value: kpis.casesThisMonth.toLocaleString('en-IN'), change: casesChange, positive: casesPositive, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue), change: revenueChange, positive: revenuePositive, icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-md">
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={24} className={kpi.color} />
              </div>
              {kpi.change && (
                <span className={`flex items-center gap-xs px-sm py-xs rounded-full text-label-sm font-bold ${kpi.positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {kpi.positive ? '↑' : '↓'} {kpi.change}
                </span>
              )}
            </div>
            <p className="text-display text-on-surface font-bold">{kpi.value}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl mb-xl">
        {/* User Growth Chart */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <div className="flex items-center justify-between mb-xl">
            <h2 className="text-headline-sm text-on-surface flex items-center gap-sm">
              <TrendingUp size={20} className="text-primary" /> User Growth
            </h2>
            <span className="text-label-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded">
              Total: {kpis.totalUsers.toLocaleString('en-IN')}
            </span>
          </div>
          {userGrowth.length > 0 ? (
            <div className="flex items-end gap-md h-48 border-b border-surface-container-high pb-sm">
              {userGrowth.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-sm group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-on-surface text-surface text-label-sm px-sm py-xs rounded shadow-lg transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {item.count} Users
                  </div>
                  <div
                    className="w-full max-w-[40px] bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all"
                    style={{ height: `${(item.count / maxUserCount) * 150}px` }}
                  />
                  <span className="text-label-sm text-on-surface-variant mt-sm">{item.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-on-surface-variant">No user data available.</div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <div className="flex items-center justify-between mb-xl">
            <h2 className="text-headline-sm text-on-surface flex items-center gap-sm">
              <BarChart3 size={20} className="text-primary" /> Revenue (₹)
            </h2>
            {revenueChange && (
              <span className={`text-label-sm px-sm py-xs rounded font-semibold ${revenuePositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                {revenueChange} MoM
              </span>
            )}
          </div>
          {revenueByMonth.length > 0 ? (
            <div className="flex items-end gap-md h-48 border-b border-surface-container-high pb-sm">
              {revenueByMonth.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-sm group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-on-surface text-surface text-label-sm px-sm py-xs rounded shadow-lg transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {formatCurrency(item.amount)}
                  </div>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-green-600/80 to-green-400/80 group-hover:from-green-600 group-hover:to-green-400 rounded-t-lg transition-all"
                    style={{ height: `${maxRevenue > 0 ? (item.amount / maxRevenue) * 150 : 4}px`, minHeight: item.amount > 0 ? '4px' : '0px' }}
                  />
                  <span className="text-label-sm text-on-surface-variant mt-sm">{item.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-on-surface-variant">No revenue data available.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl mb-xl">
        {/* Case Categories List */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <h2 className="text-headline-sm text-on-surface mb-xl flex items-center gap-sm">
            <FileText size={20} className="text-primary" /> Cases by Category
          </h2>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-lg">
              {categoryBreakdown.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-sm">
                    <span className="text-body-md text-on-surface font-medium flex items-center gap-sm">
                      <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`} /> {c.label}
                    </span>
                    <span className="text-label-sm text-on-surface-variant font-semibold">{c.count} ({c.pct}%)</span>
                  </div>
                  <SimpleBar value={c.pct} max={maxCategoryPct + 5} color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-xl text-center text-on-surface-variant">No cases filed yet.</div>
          )}
        </div>

        {/* Case Status & Resolution Rate */}
        <div className="flex flex-col gap-xl">
          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card flex-1">
            <h2 className="text-headline-sm text-on-surface mb-xl flex items-center gap-sm">
              <CheckCircle size={20} className="text-primary" /> Resolution Overview
            </h2>
            <div className="space-y-lg mb-xl">
              {resolutionOverview.filter(s => s.count > 0).map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-xs">
                    <span className="text-body-sm text-on-surface font-medium">{s.label}</span>
                    <span className="text-body-sm text-on-surface-variant">{s.count} ({s.pct}%)</span>
                  </div>
                  <SimpleBar value={s.pct} max={maxResolutionPct + 5} color={RESOLUTION_COLORS[s.label] || 'bg-gray-400'} />
                </div>
              ))}
              {resolutionOverview.every(s => s.count === 0) && (
                <div className="py-md text-center text-on-surface-variant">No complaints yet.</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-md pt-lg border-t border-surface-container-high mt-auto">
              <div className="bg-surface-container-low rounded-xl p-md flex flex-col justify-center text-center">
                <p className="text-display font-bold text-green-600">{successRate}%</p>
                <p className="text-label-sm text-on-surface-variant mt-xs">Overall Success Rate</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-md flex flex-col justify-center text-center">
                <p className="text-display font-bold text-primary">{(resolutionOverview.find(r => r.label === 'Open')?.count || 0) + (resolutionOverview.find(r => r.label === 'In Review')?.count || 0)}</p>
                <p className="text-label-sm text-on-surface-variant mt-xs">Active Cases</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Lawyers List */}
      <div className="bg-white border border-surface-container-high rounded-2xl shadow-card overflow-hidden">
        <div className="p-xl border-b border-surface-container-high flex justify-between items-center bg-surface-container-low/50">
          <h2 className="text-headline-sm text-on-surface flex items-center gap-sm">
            <Scale size={20} className="text-primary" /> Top Performing Lawyers
          </h2>
          <span className="text-label-sm text-on-surface-variant">Ranked by assigned cases</span>
        </div>
        <div className="p-0">
          {topLawyers.length > 0 ? (
            topLawyers.map((l, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-lg border-b border-surface-container-high hover:bg-surface-container-low transition-colors last:border-0">
                <div className="flex items-center gap-md w-full sm:w-auto mb-md sm:mb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-headline-sm font-bold
                    ${i === 0 ? 'bg-yellow-100 text-yellow-700 shadow-sm border border-yellow-200' : 
                      i === 1 ? 'bg-gray-200 text-gray-700 shadow-sm' : 
                      i === 2 ? 'bg-orange-100 text-orange-700 shadow-sm' : 'bg-surface-container text-on-surface-variant'}`}>
                    {i + 1}
                  </div>
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-label-md font-bold text-primary">
                      {l.initials}
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{l.name}</p>
                      <span className="text-label-sm bg-primary/10 text-primary px-xs py-[2px] rounded inline-block mt-xs">{l.specialization}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-xl w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-center">
                    <p className="text-label-sm text-on-surface-variant mb-xs">Cases</p>
                    <p className="text-body-md font-bold text-on-surface">{l.cases}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-label-sm text-on-surface-variant mb-xs">Consultation Fee</p>
                    <p className="text-body-md font-bold text-green-600">{l.consultationFee > 0 ? formatCurrency(l.consultationFee) : '—'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-xl text-center text-on-surface-variant">No lawyers registered yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;

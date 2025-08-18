import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ from?: string; to?: string; industries?: string; aiStages?: string; teamSizes?: string; budgetMin?: string; budgetMax?: string; search?: string }>({});

  const load = async (f = filters) => {
    setLoading(true);
    try {
      console.log('Fetching analytics stats with filters:', f);
      const data = await api.submissions.getStats(f);
      console.log('Analytics stats received:', data);
      setStats(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
    
    // Cleanup function to destroy charts when component unmounts
    return () => {
      // Destroy all existing Chart.js instances
      ChartJS.getChart('industry-chart')?.destroy();
      ChartJS.getChart('ai-stage-chart')?.destroy();
      ChartJS.getChart('budget-chart')?.destroy();
      ChartJS.getChart('challenges-chart')?.destroy();
      ChartJS.getChart('solutions-chart')?.destroy();
      ChartJS.getChart('monthly-chart')?.destroy();
    };
  }, []);
  
  useEffect(() => {
    const id = setTimeout(() => load(), 400);
    return () => clearTimeout(id);
  }, [filters]);

  const safe = (arr: any[]) => Array.isArray(arr) ? arr : [];

  const kpis = stats ? [
    { label: 'Total Submissions', value: String(stats.total || 0) },
    { label: 'Conversion Rate', value: `${((stats.conversionRate || 0) * 100).toFixed(1)}%` },
    { label: 'Avg. Time to Proposal', value: stats.avgTimeToProposalMs ? `${(stats.avgTimeToProposalMs / (1000*60*60*24)).toFixed(1)} days` : '—' },
    { label: 'Pipeline Value', value: new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(stats.pipelineValue || 0) },
  ] : [];

  if (loading && !stats) {
    return (
      <div className="w-full max-w-screen-xl mx-auto animate-fade-in">
        <div className="glassmorphism rounded-xl p-6">
          <h1 className="text-3xl font-light text-white mb-4">Analytics</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto animate-fade-in space-y-8">
      <div className="glassmorphism rounded-xl p-6">
        <h1 className="text-3xl font-light text-white mb-4">Analytics</h1>
        
        {!stats ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="text-red-400">Failed to load analytics data. Check console for details.</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => (
                <div key={k.label} className="bg-black/30 rounded-lg p-4 border border-gray-800">
                  <div className="text-gray-400 text-sm mb-1">{k.label}</div>
                  <div className="text-2xl text-white font-light">{k.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">From</label>
            <input type="date" value={filters.from || ''} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">To</label>
            <input type="date" value={filters.to || ''} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Industry (comma-separated)</label>
            <input value={filters.industries || ''} onChange={e => setFilters(f => ({ ...f, industries: e.target.value }))} className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">AI Stages</label>
            <input value={filters.aiStages || ''} onChange={e => setFilters(f => ({ ...f, aiStages: e.target.value }))} className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Budget Min (€)</label>
            <input value={filters.budgetMin || ''} onChange={e => setFilters(f => ({ ...f, budgetMin: e.target.value }))} className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Budget Max (€)</label>
            <input value={filters.budgetMax || ''} onChange={e => setFilters(f => ({ ...f, budgetMax: e.target.value }))} className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-400 mb-1">Search (company/contact/email)</label>
            <input value={filters.search || ''} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200" />
          </div>
        </div>
      </div>

      {loading && <div className="text-gray-400">Loading analytics…</div>}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Submissions by Industry">
            <Bar 
              key="industry-chart"
              data={{ labels: safe(stats.byIndustry).filter((x: any) => x._id).map((x: any) => x._id), datasets: [{ label: 'Count', data: safe(stats.byIndustry).filter((x: any) => x._id).map((x: any) => x.count), backgroundColor: 'rgba(99,102,241,0.7)' }] }} 
              options={{ ...axesOptions, responsive: true, maintainAspectRatio: false }} 
            />
          </ChartCard>
          <ChartCard title="AI Stage Distribution">
            <Bar 
              key="ai-stage-chart"
              data={{ labels: safe(stats.byAiStage).map((x: any) => x._id), datasets: [{ label: 'Count', data: safe(stats.byAiStage).map((x: any) => x.count), backgroundColor: 'rgba(147,51,234,0.7)' }] }} 
              options={{ ...axesOptions, responsive: true, maintainAspectRatio: false }} 
            />
          </ChartCard>
          <ChartCard title="Budget Ranges">
            <Bar 
              key="budget-chart"
              data={{ labels: safe(stats.budgetRanges).map((b: any) => String(b._id)), datasets: [{ label: 'Count', data: safe(stats.budgetRanges).map((b: any) => b.count), backgroundColor: 'rgba(59,130,246,0.7)' }] }} 
              options={{ ...axesOptions, responsive: true, maintainAspectRatio: false }} 
            />
          </ChartCard>
          <ChartCard title="Top Challenges">
            <Bar 
              key="challenges-chart"
              data={{ labels: safe(stats.topChallenges).map((x: any) => x._id), datasets: [{ label: 'Count', data: safe(stats.topChallenges).map((x: any) => x.count), backgroundColor: 'rgba(34,197,94,0.7)' }] }} 
              options={{ ...axesOptions, responsive: true, maintainAspectRatio: false }} 
            />
          </ChartCard>
          <ChartCard title="Top Solutions">
            <Bar 
              key="solutions-chart"
              data={{ labels: safe(stats.topSolutions).map((x: any) => x._id), datasets: [{ label: 'Count', data: safe(stats.topSolutions).map((x: any) => x.count), backgroundColor: 'rgba(234,179,8,0.7)' }] }} 
              options={{ ...axesOptions, responsive: true, maintainAspectRatio: false }} 
            />
          </ChartCard>
          <ChartCard title="Monthly Submissions">
            <Line 
              key="monthly-chart"
              data={{ labels: safe(stats.byMonth).map((x: any) => x._id), datasets: [{ label: 'Submissions', data: safe(stats.byMonth).map((x: any) => x.count), borderColor: 'rgba(147,51,234,0.9)', backgroundColor: 'rgba(147,51,234,0.3)', fill: false }] }} 
              options={{ ...axesOptions, responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } } }} 
            />
          </ChartCard>
        </div>
      )}
    </div>
  );
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-black/30 rounded-lg p-6 border border-gray-800">
    <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
    <div className="h-72">{children}</div>
  </div>
);

const axesOptions: any = {
  plugins: { 
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(147, 51, 234, 0.8)',
      borderWidth: 1
    }
  },
  scales: { 
    x: { 
      ticks: { color: 'white' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }
    }, 
    y: { 
      ticks: { color: 'white' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }
    } 
  }
};

export default AdminAnalytics;


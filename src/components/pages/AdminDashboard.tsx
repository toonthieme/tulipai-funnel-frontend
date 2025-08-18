
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Submission, SubmissionStatus } from '../../types';
import StatCard from '../ui/StatCard';
import StatusBarChart from '../ui/StatusBarChart';
import api from '../../services/apiClient';
import { Bar } from 'react-chartjs-2';
import Button from '../ui/Button';
import QuoteModal from './QuoteModal';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import SubmissionCard from '../ui/SubmissionCard';
import Tag from '../ui/Tag';

interface AdminDashboardProps {
  submissions: Submission[];
  onUpdateStatus: (id: string, status: SubmissionStatus) => void;
  onGenerateQuote: (id: string, forceRegenerate?: boolean) => void;
  onSaveQuote: (id: string, quote: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onSendQuote: (id: string) => void;
  onDeleteSubmission: (id: string) => void;
}

type SortKey = 'submittedAt' | 'companyName' | 'status' | 'budget';

const ensureUrlProtocol = (url: string): string => {
  if (!url) return '#';
  if (!/^(?:f|ht)tps?:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
};

const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ submissions, onUpdateStatus, onGenerateQuote, onSaveQuote, onSaveNotes, onSendQuote, onDeleteSubmission }) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [quoteSubmission, setQuoteSubmission] = useState<Submission | null>(null);

  // Keep the open quote modal submission in sync with latest data
  useEffect(() => {
    if (!quoteSubmission) return;
    const latest = submissions.find(s => s.id === quoteSubmission.id);
    if (latest && latest !== quoteSubmission) {
      setQuoteSubmission(latest);
    }
  }, [submissions, quoteSubmission]);

  // New state for dashboard features
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'submittedAt', direction: 'desc' });
  const [stats, setStats] = useState<any | null>(null);
  const [statsFilter, setStatsFilter] = useState<{ industry?: string }>({});

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.submissions.getStats();
        setStats(data);
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    };
    loadStats();
  }, []);

  const safeByIndustry = useMemo(() => {
    return (stats?.byIndustry ?? []).filter((x: any) => x && x._id);
  }, [stats]);

  const safeByMonth = useMemo(() => {
    return stats?.byMonth ?? [];
  }, [stats]);

  const handleToggleRow = (id: string) => {
    setExpandedRowId(currentId => (currentId === id ? null : id));
  };
  
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(s =>
            s.companyName.toLowerCase().includes(lowercasedQuery) ||
            s.name.toLowerCase().includes(lowercasedQuery) ||
            s.email.toLowerCase().includes(lowercasedQuery)
        );
    }

    // Sort
    filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch(sortConfig.key) {
            case 'budget':
                aValue = Number(a.budget.replace(/[^0-9.-]+/g,""));
                bValue = Number(b.budget.replace(/[^0-9.-]+/g,""));
                break;
            case 'submittedAt':
                aValue = new Date(a.submittedAt).getTime();
                bValue = new Date(b.submittedAt).getTime();
                break;
            default:
                aValue = a[sortConfig.key] || '';
                bValue = b[sortConfig.key] || '';
        }
        
        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    return filtered;
  }, [submissions, filterStatus, searchQuery, sortConfig]);

  const analytics = useMemo(() => {
    const totalSubmissions = submissions.length;
    const statusCounts = submissions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {} as Record<SubmissionStatus, number>);

    const proposalsSentOrClosed = submissions.filter(s => s.status === SubmissionStatus.ProposalSent || s.status === SubmissionStatus.Closed);
    const conversionRate = proposalsSentOrClosed.length > 0
        ? ((statusCounts[SubmissionStatus.Closed] || 0) / proposalsSentOrClosed.length) * 100
        : 0;

    const proposalsWithTimestamps = submissions.filter(s => s.status === SubmissionStatus.ProposalSent && s.submittedAt && s.proposalSentAt);
    const totalTimeToProposal = proposalsWithTimestamps.reduce((acc, sub) => {
        const submitted = new Date(sub.submittedAt).getTime();
        const sent = new Date(sub.proposalSentAt!).getTime();
        return acc + (sent - submitted);
    }, 0);
    const avgTimeToProposalMs = proposalsWithTimestamps.length > 0 ? totalTimeToProposal / proposalsWithTimestamps.length : 0;
    const avgTimeToProposalDays = avgTimeToProposalMs / (1000 * 60 * 60 * 24);

    const pipelineSubmissions = submissions.filter(s => [SubmissionStatus.InProgress, SubmissionStatus.ProposalSent].includes(s.status));
    const pipelineValue = pipelineSubmissions.reduce((acc, sub) => acc + Number(sub.budget.replace(/[^0-9.-]+/g,"")), 0);

    return {
      total: totalSubmissions,
      submitted: statusCounts[SubmissionStatus.New] || 0,
      inReview: statusCounts[SubmissionStatus.InProgress] || 0,
      proposalSent: statusCounts[SubmissionStatus.ProposalSent] || 0,
      closed: statusCounts[SubmissionStatus.Closed] || 0,
      conversionRate: conversionRate.toFixed(1) + '%',
      avgTimeToProposal: avgTimeToProposalDays.toFixed(1) + ' days',
      pipelineValue: formatCurrency(pipelineValue)
    };
  }, [submissions]);

  const statusBarData = [
    { status: SubmissionStatus.New, count: analytics.submitted, color: 'bg-blue-500' },
    { status: SubmissionStatus.InProgress, count: analytics.inReview, color: 'bg-yellow-500' },
    { status: SubmissionStatus.ProposalSent, count: analytics.proposalSent, color: 'bg-purple-500' },
    { status: SubmissionStatus.Closed, count: analytics.closed, color: 'bg-green-500' },
  ];

  const getQuoteButton = (sub: Submission) => {
    if (sub.isQuoteLoading) {
      return (
        <Button disabled={true} className="flex items-center justify-center gap-2">
            <Spinner />
            Generating...
        </Button>
      );
    }
    if (sub.generatedQuote) {
      return <Button onClick={() => setQuoteSubmission(sub)}>View Quote</Button>;
    }
    return <Button onClick={() => onGenerateQuote(sub.id)}>Generate Quote</Button>;
  };
  
  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <>
      <div className="w-full max-w-screen-xl mx-auto animate-fade-in space-y-8">
        {/* Analytics Overview Section */}
        <div className="glassmorphism rounded-xl p-8">
          <h1 className="text-4xl font-light text-white mb-6">Dashboard Overview</h1>
          {stats && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-medium tracking-wider text-gray-300 mb-4">Submissions by Industry</h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: safeByIndustry.map((x: any) => x._id),
                      datasets: [{
                        label: 'Count',
                        data: safeByIndustry.map((x: any) => x.count),
                        backgroundColor: 'rgba(99, 102, 241, 0.7)'
                      }]
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } }
                    }}
                  />
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-medium tracking-wider text-gray-300 mb-4">Monthly Submissions</h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: safeByMonth.map((x: any) => x._id),
                      datasets: [{
                        label: 'Count',
                        data: safeByMonth.map((x: any) => x.count),
                        backgroundColor: 'rgba(147, 51, 234, 0.7)'
                      }]
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Submissions" value={analytics.total} />
            <StatCard title="Conversion Rate" value={analytics.conversionRate} />
            <StatCard title="Avg. Time to Proposal" value={analytics.avgTimeToProposal} />
            <StatCard title="Revenue Pipeline" value={analytics.pipelineValue} />
          </div>
          <div className="mt-8">
              <h3 className="text-lg font-medium tracking-wider text-gray-300 mb-4">Status Distribution</h3>
              <StatusBarChart data={statusBarData} total={analytics.total} />
          </div>
        </div>

        {/* Submissions Section */}
        <div className="glassmorphism rounded-xl p-8 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-3xl font-light text-white">All Submissions</h2>
            <div className="flex items-center gap-2">
                <div className="w-48">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="block w-full bg-black/20 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 font-light"
                    />
                </div>
                <div className="flex items-center bg-gray-800/50 rounded-md p-1">
                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-purple-600' : ''}`} aria-label="Table View">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 00-1-1H2a1 1 0 000 2h1a1 1 0 001-1zM16 4a1 1 0 001-1h1a1 1 0 100-2h-1a1 1 0 00-1 1zM2 9a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM18 9a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM4 16a1 1 0 00-1-1H2a1 1 0 100 2h1a1 1 0 001-1zM16 16a1 1 0 001-1h1a1 1 0 100-2h-1a1 1 0 00-1 1zM9 2a1 1 0 00-1 1v1a1 1 0 102 0V3a1 1 0 00-1-1zM9 9a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM9 15a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" /></svg>
                    </button>
                    <button onClick={() => setViewMode('card')} className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-purple-600' : ''}`} aria-label="Card View">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1H3zm12 2v2H5V6h10zm0 4v2H5v-2h10z" /></svg>
                    </button>
                </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-6">
              {(['All', ...Object.values(SubmissionStatus)] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${filterStatus === status ? 'bg-purple-600 text-white font-medium' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'}`}
                >
                    {status}
                </button>
              ))}
          </div>

          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center"></th>
                    <th className="px-4 py-3 text-sm font-medium tracking-widest uppercase text-gray-400 cursor-pointer" onClick={() => handleSort('companyName')}>Company {getSortIndicator('companyName')}</th>
                    <th className="px-4 py-3 text-sm font-medium tracking-widest uppercase text-gray-400">Contact</th>
                    <th className="px-4 py-3 text-sm font-medium tracking-widest uppercase text-gray-400 cursor-pointer" onClick={() => handleSort('submittedAt')}>Submitted {getSortIndicator('submittedAt')}</th>
                    <th className="px-4 py-3 text-sm font-medium tracking-widest uppercase text-gray-400 cursor-pointer" onClick={() => handleSort('status')}>Status {getSortIndicator('status')}</th>
                    <th className="px-4 py-3 text-sm font-medium tracking-widest uppercase text-gray-400">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredAndSortedSubmissions.length > 0 ? filteredAndSortedSubmissions.map(sub => (
                    <React.Fragment key={sub.id}>
                      <tr className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-4 text-center align-top">
                          <button onClick={() => handleToggleRow(sub.id)} className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" aria-expanded={expandedRowId === sub.id} aria-label="Show details">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 transition-transform duration-200" style={{ transform: expandedRowId === sub.id ? 'rotate(180deg)' : '' }} viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-white font-light align-top">{sub.companyName}</td>
                        <td className="px-4 py-4 text-gray-300 font-light align-top">{sub.name}<br/><span className="text-xs text-gray-500">{sub.email}</span></td>
                         <td className="px-4 py-4 text-gray-300 font-light align-top">{new Date(sub.submittedAt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                        <td className="px-4 py-4 align-top">
                          <select value={sub.status} onChange={(e) => onUpdateStatus(sub.id, e.target.value as SubmissionStatus)} className="block w-full bg-black/20 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 font-light" aria-label={`Status for ${sub.companyName}`}>
                            {Object.values(SubmissionStatus).map(status => (<option key={status} value={status}>{status}</option>))}
                          </select>
                        </td>
                        <td className="px-4 py-4 align-top">
                            <div className="flex flex-col gap-1.5">
                                <Tag label={sub.aiStage} icon="🧠" color="purple" />
                                {sub.aiUseCase && <Tag label="Use Case" icon="🎯" color="green" />}
                            </div>
                        </td>
                      </tr>
                      {expandedRowId === sub.id && (
                        <SubmissionCard submission={sub} onUpdateStatus={onUpdateStatus} onGenerateQuote={() => onGenerateQuote(sub.id)} onSaveQuote={onSaveQuote} onSaveNotes={onSaveNotes} onDeleteSubmission={onDeleteSubmission} setQuoteSubmission={setQuoteSubmission} isExpandedView={true} />
                      )}
                    </React.Fragment>
                  )) : (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500 font-light">No submissions match your criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedSubmissions.length > 0 ? filteredAndSortedSubmissions.map(sub => (
                    <SubmissionCard key={sub.id} submission={sub} onUpdateStatus={onUpdateStatus} onGenerateQuote={() => onGenerateQuote(sub.id)} onSaveQuote={onSaveQuote} onSaveNotes={onSaveNotes} onDeleteSubmission={onDeleteSubmission} setQuoteSubmission={setQuoteSubmission} />
                )) : (
                   <p className="col-span-full text-center py-8 text-gray-500 font-light">No submissions match your criteria.</p>
                )}
            </div>
          )}
        </div>
      </div>
      {quoteSubmission && (
        <QuoteModal 
          submission={quoteSubmission}
          onClose={() => setQuoteSubmission(null)}
          onSave={onSaveQuote}
          onGenerateQuote={onGenerateQuote}
          onSendQuote={onSendQuote}
        />
      )}
    </>
  );
};

export default AdminDashboard;
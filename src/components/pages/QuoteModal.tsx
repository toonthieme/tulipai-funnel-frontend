import React, { useState, useEffect } from 'react';
import { Submission } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../../services/apiClient';
import { regenerateProposalFromExecutiveBrief } from '../../services/aiService';
import ReactMarkdown from 'react-markdown';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface QuoteModalProps {
  submission: Submission;
  onClose: () => void;
  onSave: (id: string, quote: string) => void;
  onGenerateQuote: (id: string, forceRegenerate?: boolean) => void;
  onSendQuote: (id: string) => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ submission, onClose, onSave, onGenerateQuote, onSendQuote }) => {
  const [quoteText, setQuoteText] = useState(submission.generatedQuote || '');
  const [subject, setSubject] = useState(`AI Solution Proposal for ${submission.companyName}`);
  const [isSending, setIsSending] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
  const [sendButtonText, setSendButtonText] = useState('Send Quote');
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'email'>('preview');

  useEffect(() => {
    setQuoteText(submission.generatedQuote || '');
  }, [submission.id, submission.generatedQuote]);

  // Helpers to parse sections from the editable markdown (quoteText)
  const getSectionMarkdown = (startHeading: string, nextHeadingPrefix: string) => {
    try {
      if (!quoteText) return '';
      const startIdx = quoteText.indexOf(startHeading);
      if (startIdx === -1) return '';
      const afterStart = quoteText.slice(startIdx + startHeading.length);
      const marker = `\n## ${nextHeadingPrefix}`;
      const nextIdx = afterStart.indexOf(marker);
      const sectionBody = nextIdx === -1 ? afterStart : afterStart.slice(0, nextIdx);
      return sectionBody.trim();
    } catch {
      return '';
    }
  };

  const getExecutiveBrief = () => {
    // Try strict marker first
    let section = getSectionMarkdown('## 1. Executive Brief', '2.');
    if (section) return section;
    // Fallbacks for minor format deviations
    const tryVariants = ['# 1. Executive Brief', '## Executive Brief', '# Executive Brief'];
    for (const variant of tryVariants) {
      section = getSectionMarkdown(variant, '2.');
      if (section) return section;
    }
    // Last resort: take from start until section 2
    try {
      const idx = quoteText.indexOf('\n## 2.');
      return (idx > -1 ? quoteText.slice(0, idx) : quoteText).replace(/^#+\s*1?\.?\s*Executive Brief\s*/i, '').trim();
    } catch {
      return '';
    }
  };
  const getStrategicAnalysis = () => getSectionMarkdown('## 2. Strategic Analysis', '3.');
  const getProposedSolutionsSection = () => getSectionMarkdown('## 3. Proposed Solutions', '4.');

  const extractSolutionNames = () => {
    const proposed = getProposedSolutionsSection();
    if (!proposed) return submission.solutions;
    const names = Array.from(proposed.matchAll(/^###\s+(.+)$/gm)).map(m => m[1].trim());
    return names.length > 0 ? names : submission.solutions;
  };

  // Budget allocation data
  const budgetData = {
    labels: ['Development', 'Discovery', 'Integration', 'Training'],
    datasets: [{
      data: [40, 30, 20, 10],
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(79, 70, 229, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(79, 70, 229, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // Efficiency gains data
  const derivedSolutionNames = extractSolutionNames();
  const efficiencyData = {
    labels: derivedSolutionNames.length > 0 ? derivedSolutionNames : ['No solutions selected'],
    datasets: [{
      label: 'Potential Efficiency Gain (%)',
      data: derivedSolutionNames.length > 0
        ? derivedSolutionNames.map(() => Math.floor(Math.random() * 40) + 20)
        : [0],
      backgroundColor: 'rgba(147, 51, 234, 0.8)',
      borderColor: 'rgba(147, 51, 234, 1)',
      borderWidth: 1,
    }],
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteText);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
  };

  const handleSendQuote = async () => {
    try {
      onSave(submission.id, quoteText);
      setIsSending(true);
      // Optionally generate PDF and attach later
      await api.email.sendQuote({
        companyName: submission.companyName,
        contactName: submission.name,
        contactEmail: submission.email,
        quoteContent: quoteText,
        submissionId: submission.id,
        subjectOverride: subject,
      } as any);
      onSendQuote(submission.id);
      setSendButtonText('Sent ✔');
    } catch (e) {
      console.error('Error sending quote email:', e);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleSaveAndClose = (e?: React.MouseEvent) => {
    if (e?.target === e?.currentTarget) {
      if (activeTab === 'edit' && quoteText !== submission.generatedQuote) {
        onSave(submission.id, quoteText);
      }
      onClose();
    }
  };

  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsPdfLoading(true);
      setPdfError(null);

      // Get PDF from backend using API client
      const blob = await api.pdf.download(submission.id);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${submission.companyName.replace(/[^a-zA-Z0-9]/g, '_')}-AI-Proposal.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      setPdfError(error instanceof Error ? error.message : 'Error generating PDF');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const formatBudget = (budget: string) => {
    const num = parseInt(budget.replace(/[^0-9]/g, ''));
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const renderQuoteContent = () => {
    // Handle loading state
    if (submission.isQuoteLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Spinner />
          <span className="mt-3 text-lg font-light tracking-wider animate-pulse">Generating AI Proposal...</span>
        </div>
      );
    }

    // Handle missing quote
    if (!submission.generatedQuote) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 14h.01M12 16h.01M12 18h.01M12 20h.01M12 22h.01" />
          </svg>
          <h3 className="text-xl text-gray-400 mb-4">Quote not available</h3>
          <p className="text-gray-500 mb-6">Please generate a new quote using the button below.</p>
          <Button onClick={() => onGenerateQuote(submission.id)}>Generate New Quote</Button>
        </div>
      );
    }

    // Calculate dynamic budget allocation based on timeline and solutions
    const timelineMonths = parseInt(submission.timeline.split(' ')[0]) || 12;
    const budgetValue = parseInt(submission.budget.replace(/[^0-9]/g, ''));
    
    const budgetData = {
      labels: ['Discovery & Planning', 'Development', 'Integration', 'Training & Support'],
      datasets: [{
        data: [
          Math.round(budgetValue * 0.25), // 25% for discovery
          Math.round(budgetValue * 0.40), // 40% for development
          Math.round(budgetValue * 0.25), // 25% for integration
          Math.round(budgetValue * 0.10), // 10% for training
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',  // Purple
          'rgba(79, 70, 229, 0.8)',   // Indigo
          'rgba(59, 130, 246, 0.8)',  // Blue
          'rgba(16, 185, 129, 0.8)',  // Green
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      }],
    };

    // Calculate efficiency gains based on solutions and AI stage
    const baseEfficiency = {
      'Beginner': 20,
      'Intermediate': 30,
      'Advanced': 40,
    }[submission.aiStage] || 25;

    // Create a deterministic "random" number based on solution name and submission ID
    const getEfficiencyForSolution = (solution: string, index: number) => {
      const hash = solution.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, submission.id.length);
      return baseEfficiency + (Math.abs(hash) % 15) + (index * 5);
    };

    const efficiencyData = {
      labels: submission.solutions,
      datasets: [{
        label: 'Potential Efficiency Gain (%)',
        data: submission.solutions.map((solution, index) => {
          return getEfficiencyForSolution(solution, index);
        }),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      }],
    };

    // Get the user's requested timeline
    const userRequestedMonths = parseInt(submission.timeline.split(' ')[0]);
    
    // Parse any timeline adjustments from the quote text
    const parseTimelineFromQuote = () => {
      try {
        const timelineSection = quoteText.split('## 4. Project Timeline')[1]?.split('## 5.')[0]
          || quoteText.split('## 4. Implementation Roadmap')[1]?.split('## 5.')[0]
          || '';
        // Look for specific mentions of timeline adjustments
        const adjustmentMatch = timelineSection.match(/recommend(?:ed|ing)?\s+(?:a|an|the)?\s+(\d+)[\s-]*month/i);
        if (adjustmentMatch) {
          const recommendedMonths = parseInt(adjustmentMatch[1]);
          // Only use the recommended timeline if it's significantly different
          if (Math.abs(recommendedMonths - userRequestedMonths) > 1) {
            return recommendedMonths;
          }
        }
        return userRequestedMonths;
      } catch (error) {
        console.error('Error parsing timeline from quote:', error);
        return userRequestedMonths;
      }
    };

    const totalMonths = userRequestedMonths || parseTimelineFromQuote() || 3; // Default to 3 months if no timeline specified

    // Calculate phases based on the total timeline
    const timelinePhases = [
      { 
        name: 'Discovery & Planning', 
        duration: Math.max(1, Math.round(totalMonths * 0.2)),
        description: 'Strategic assessment and solution architecture design.',
        details: [
          'Current state assessment and data landscape mapping',
          'AI solution architecture and technology stack planning',
          'ROI modeling and success metrics definition',
          'Detailed project roadmap and resource allocation',
          'Risk assessment and mitigation strategies'
        ]
      },
      { 
        name: 'Development', 
        duration: Math.max(1, Math.round(totalMonths * 0.4)),
        description: 'AI solution build-out and iterative refinement.',
        details: [
          'Core AI model development and initial training',
          'Prototype deployment and feedback integration',
          'Solution optimization and performance tuning',
          'Security implementation and compliance checks',
          'Quality assurance and testing automation'
        ]
      },
      { 
        name: 'Integration', 
        duration: Math.max(1, Math.round(totalMonths * 0.3)),
        description: 'System integration and deployment preparation.',
        details: [
          'Data pipeline setup and integration testing',
          'System integration with existing infrastructure',
          'Performance monitoring setup and alerts',
          'Staging environment deployment and validation',
          'Production environment preparation'
        ]
      },
      { 
        name: 'Training & Support', 
        duration: Math.max(1, Math.round(totalMonths * 0.1)),
        description: 'Team enablement and transition to operations.',
        details: [
          'User training and documentation delivery',
          'Admin and maintenance team onboarding',
          'Standard operating procedures setup',
          'Support process establishment',
          'Knowledge transfer and handover'
        ]
      },
    ];

    return (
      <div id="quote-content" className="space-y-8 p-6 bg-black/95">
        {/* Header Section */}
        <div className="border-b border-gray-700 pb-6">
          <h1 className="text-3xl font-light text-white mb-4">AI Solution Proposal</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Prepared for:</p>
              <p className="text-white">{submission.companyName}</p>
              <p className="text-gray-300">{submission.name}</p>
              <p className="text-gray-300">{submission.email}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Date:</p>
              <p className="text-white">{new Date(submission.submittedAt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              <p className="text-gray-400 mt-2">Reference:</p>
              <p className="text-white">{submission.id.substring(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* AI Generated Proposal */}
        {submission.isQuoteLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner />
            <p className="text-gray-400 mt-4">Generating AI proposal...</p>
          </div>
        ) : submission.generatedQuote ? (
          <>
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    console.log('Regenerating quote for submission:', submission.id);
                    onGenerateQuote(submission.id, true);
                  }}
                  className="text-sm"
                  disabled={submission.isQuoteLoading}
                >
                  {submission.isQuoteLoading ? 'Generating...' : '↻ Regenerate Proposal'}
                </Button>
                <div className="relative inline-block">
                  <Button 
                    variant="secondary"
                    className="text-sm"
                    onClick={handleDownloadPDF}
                    disabled={isPdfLoading || submission.isQuoteLoading}
                  >
                    {isPdfLoading ? 'Preparing PDF...' : pdfError ? 'Error generating PDF' : '↓ Download PDF'}
                  </Button>
                  {(isPdfLoading || submission.isQuoteLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                      <Spinner />
                    </div>
                  )}
                  {pdfError && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-900/50 text-red-200 text-xs rounded">
                      {pdfError}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleSendQuote}
                  className="text-sm"
                  disabled={submission.isQuoteLoading || isSending}
                >
                  {isSending ? 'Sending...' : 'Send Quote'}
                </Button>
              </div>
            </div>
            <div className="space-y-12">
              {/* Header with Logo */}
              <div className="flex items-center justify-between mb-8">
                <img src="/tulip_logo.svg" alt="TulipAI" className="h-8 w-auto" />
                <div className="text-right">
                  <p className="text-sm text-gray-400">Proposal Date</p>
                  <p className="text-white">{new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Executive Summary Section (driven by editable quoteText) */}
              <section className="bg-gradient-to-br from-purple-900/20 to-black/30 rounded-lg p-8 border border-purple-500/20">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-light text-white mb-2">AI Integration Proposal</h2>
                    <p className="text-purple-300 text-lg">Strategic Implementation Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Prepared for</p>
                    <p className="text-xl text-white font-medium">{submission.companyName}</p>
                    <p className="text-sm text-gray-300 mt-1">{new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-6 border border-purple-500/20">
                  <h3 className="text-2xl font-light text-white mb-4">Executive Brief</h3>
                  <div className="prose prose-lg prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-purple-300">
                    <ReactMarkdown>
                      {getExecutiveBrief()}
                    </ReactMarkdown>
                  </div>
                </div>
              </section>

              {/* Strategic Analysis (driven by editable quoteText) */}
              <section className="bg-black/30 rounded-lg p-8 border border-gray-800">
                <h2 className="text-2xl font-light text-white mb-6">Strategic Analysis</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-purple-900/10 rounded-lg p-6">
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-purple-300 prose-headings:text-white">
                      <ReactMarkdown>
                        {getStrategicAnalysis()}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="bg-purple-900/10 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Efficiency Impact Analysis</h3>
                    <div className="h-64">
                      <Bar 
                        data={efficiencyData}
                        options={{
                          indexAxis: 'y',
                          scales: {
                            y: { ticks: { color: 'white' } },
                            x: { 
                              ticks: { color: 'white' },
                              grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            }
                          },
                          plugins: { legend: { display: false } }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Solutions Section (driven by editable quoteText) */}
              <section className="bg-black/30 rounded-lg p-8 border border-gray-800">
                <h2 className="text-2xl font-light text-white mb-6">Proposed Solutions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-purple-300 prose-headings:text-white">
                      <ReactMarkdown>
                        {getProposedSolutionsSection()}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="bg-purple-900/10 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Budget Allocation</h3>
                    <div className="h-64">
                      <Pie 
                        data={budgetData}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: 'white' }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Timeline Section */}
              <section className="bg-black/30 rounded-lg p-8 border border-gray-800">
                <h2 className="text-2xl font-light text-white mb-6">Implementation Roadmap</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-purple-900/10 rounded-lg p-6 border border-purple-500/20">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-purple-500/20">
                            <th className="py-3 px-4 text-left text-purple-300 font-medium">Phase</th>
                            <th className="py-3 px-4 text-left text-purple-300 font-medium">Duration</th>
                            <th className="py-3 px-4 text-left text-purple-300 font-medium">Key Deliverables</th>
                            <th className="py-3 px-4 text-left text-purple-300 font-medium">Success Criteria</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timelinePhases.map((phase, index) => (
                            <tr key={phase.name} className="border-b border-gray-800/50">
                              <td className="py-4 px-4 text-white font-medium">{phase.name}</td>
                              <td className="py-4 px-4 text-gray-300">{phase.duration} {phase.duration > 1 ? 'months' : 'month'}</td>
                              <td className="py-4 px-4">
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                  {phase.details.slice(0, 2).map((detail, i) => (
                                    <li key={i}>{detail}</li>
                                  ))}
                                </ul>
                              </td>
                              <td className="py-4 px-4 text-gray-300">
                                {index === 0 ? 'Requirements documented' :
                                 index === 1 ? 'MVP ready for testing' :
                                 index === 2 ? 'System integrated' :
                                 'Team fully trained'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <div className="bg-purple-900/10 rounded-lg p-6 border border-purple-500/20">
                      <h3 className="text-lg font-medium text-white mb-4">Timeline Overview</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-purple-300 font-medium mb-2">Total Duration</p>
                          <p className="text-3xl text-white font-light">{totalMonths} months</p>
                          {totalMonths !== userRequestedMonths && userRequestedMonths > 0 && (
                            <p className="text-yellow-500 text-sm mt-2">
                              Adjusted from requested {userRequestedMonths} months
                            </p>
                          )}
                        </div>
                        <div className="pt-4 border-t border-gray-800">
                          <p className="text-purple-300 font-medium mb-2">Key Milestones</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <p className="text-gray-300">Project Kickoff</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <p className="text-gray-300">MVP Release</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <p className="text-gray-300">Full Deployment</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Investment Section */}
              <section className="bg-gradient-to-br from-purple-900/20 to-black/30 rounded-lg p-8 border border-purple-500/20">
                <h2 className="text-2xl font-light text-white mb-6">Investment Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-black/30 rounded-lg p-6 border border-purple-500/20">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-purple-500/20">
                            <th className="py-3 px-4 text-left text-purple-300 font-medium">Component</th>
                            <th className="py-3 px-4 text-left text-purple-300 font-medium">Description</th>
                            <th className="py-3 px-4 text-left text-purple-300 font-medium">Value Delivered</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-800/50">
                            <td className="py-4 px-4 text-white font-medium">AI Development</td>
                            <td className="py-4 px-4 text-gray-300">Core AI model development and training</td>
                            <td className="py-4 px-4 text-gray-300">40% efficiency gain</td>
                          </tr>
                          <tr className="border-b border-gray-800/50">
                            <td className="py-4 px-4 text-white font-medium">Integration</td>
                            <td className="py-4 px-4 text-gray-300">System integration and deployment</td>
                            <td className="py-4 px-4 text-gray-300">Seamless workflow</td>
                          </tr>
                          <tr>
                            <td className="py-4 px-4 text-white font-medium">Training</td>
                            <td className="py-4 px-4 text-gray-300">Team training and support</td>
                            <td className="py-4 px-4 text-gray-300">Full team adoption</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <div className="bg-purple-900/10 rounded-lg p-6 border border-purple-500/20">
                      <h3 className="text-lg font-medium text-white mb-4">Investment Summary</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-purple-300 font-medium mb-2">Total Investment</p>
                          <p className="text-3xl text-white font-light">{formatBudget(submission.budget)}</p>
                          <p className="text-sm text-gray-400 mt-2">Based on {submission.timeline} timeline</p>
                        </div>
                        <div className="pt-4 border-t border-gray-800">
                          <p className="text-purple-300 font-medium mb-2">ROI Highlights</p>
                          <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>40% efficiency improvement</li>
                            <li>20% cost reduction</li>
                            <li>ROI within 6 months</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Next Steps and Call to Action */}
              <section className="bg-gradient-to-br from-purple-900/20 to-black/30 rounded-lg p-8 border border-purple-500/20">
                <h2 className="text-2xl font-light text-white mb-6">Next Steps</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-black/30 rounded-lg p-6 border border-purple-500/20">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-4">Immediate Actions</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-300 font-medium">1</div>
                              <div>
                                <p className="text-white font-medium">Schedule Discovery Call</p>
                                <p className="text-gray-300 text-sm">Initial consultation to align on goals and approach</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-300 font-medium">2</div>
                              <div>
                                <p className="text-white font-medium">Technical Assessment</p>
                                <p className="text-gray-300 text-sm">Review your current systems and data infrastructure</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-300 font-medium">3</div>
                              <div>
                                <p className="text-white font-medium">Project Kickoff</p>
                                <p className="text-gray-300 text-sm">Begin implementation with your dedicated team</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-gray-800">
                          <h3 className="text-lg font-medium text-white mb-4">Our Commitment</h3>
                          <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Dedicated project manager throughout implementation</li>
                            <li>Weekly progress updates and milestone tracking</li>
                            <li>Comprehensive training and support package</li>
                            <li>30-day satisfaction guarantee</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-purple-900/10 rounded-lg p-6 border border-purple-500/20">
                      <h3 className="text-lg font-medium text-white mb-4">Get Started Today</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-purple-300 font-medium mb-2">Contact Us</p>
                          <p className="text-white">contact@tulipai.nl</p>
                          <p className="text-gray-400 text-sm mt-1">Reference: {submission.id.substring(0, 8)}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-800">
                          <p className="text-purple-300 font-medium mb-2">Response Time</p>
                          <p className="text-gray-300">Within 24 hours</p>
                        </div>
                        <div className="pt-4 border-t border-gray-800">
                          <p className="text-purple-300 font-medium mb-2">Next Available Start Date</p>
                          <p className="text-gray-300">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <section className="text-center border-t border-gray-800 pt-8">
                <img src="/tulip_logo.svg" alt="TulipAI" className="h-8 w-auto mx-auto mb-4" />
                <div className="max-w-2xl mx-auto">
                  <p className="text-gray-400 text-sm italic">
                    TulipAI is committed to your success. This proposal is valid for 30 days from {new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}.
                    All implementations are backed by our satisfaction guarantee and comprehensive support package.
                  </p>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-400 mb-4">No AI proposal has been generated yet.</p>
            <Button onClick={() => onGenerateQuote(submission.id)}>Generate AI Proposal</Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={handleSaveAndClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-black/95 backdrop-blur-xl w-full h-full flex flex-col p-6 sm:p-8 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-700/50 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl sm:text-3xl font-light text-white">AI Proposal</h2>
              <div className="flex bg-black/30 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'preview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'edit' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'email' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Email Preview
                </button>
              </div>
            </div>
            <button 
              onClick={handleSaveAndClose} 
              className="p-2 -m-2 text-3xl font-light text-gray-400 hover:text-white transition-colors"
              aria-label="Save and close quote"
            >
              &times;
            </button>
          </div>
          {activeTab === 'edit' && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Email subject"
              />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-grow mt-4">
          <div className="h-full">
            {activeTab === 'preview' ? (
              renderQuoteContent()
            ) : activeTab === 'edit' ? (
              <div className="flex flex-col h-full">
                <textarea
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  className="flex-grow w-full bg-black/30 border border-gray-600 rounded-md p-4 text-gray-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-80 mb-4"
                  aria-label="Email body"
                  placeholder="Write your proposal here..."
                  disabled={submission.isQuoteLoading}
                />
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('preview')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        const brief = getExecutiveBrief() || quoteText;
                        const updated = await regenerateProposalFromExecutiveBrief(submission, brief);
                        onSave(submission.id, updated);
                        setQuoteText(updated);
                        setActiveTab('preview');
                      } catch (err) {
                        onSave(submission.id, quoteText);
                        setActiveTab('preview');
                      }
                    }}
                    disabled={submission.isQuoteLoading || quoteText === submission.generatedQuote}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-black/30 border border-gray-600 rounded-md py-2 px-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="bg-black/30 border border-gray-700 rounded-md p-4">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{quoteText}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
          {submission.isQuoteLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white transition-opacity duration-300 animate-fade-in z-50">
              <Spinner />
              <span className="mt-3 text-lg font-light tracking-wider animate-pulse">Generating AI Proposal...</span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex justify-end items-center mt-6 gap-4">
          <Button onClick={handleCopy} variant="secondary" disabled={submission.isQuoteLoading || isSending}>
            {copyButtonText}
          </Button>
          <Button onClick={handleDownloadPDF} variant="secondary" disabled={submission.isQuoteLoading || isSending}>
            Download PDF
          </Button>
           <Button onClick={handleSendQuote} disabled={submission.isQuoteLoading || isSending || sendButtonText === 'Sent ✔'}>
             {isSending ? 'Sending...' : sendButtonText}
           </Button>
        </div>
      </div>
    </div>
  );
}

export default QuoteModal;
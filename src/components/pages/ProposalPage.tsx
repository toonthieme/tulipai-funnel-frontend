import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Submission } from '../../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../../services/apiClient';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ProposalPage: React.FC = () => {
  // Configure Chart.js defaults
  ChartJS.defaults.color = '#fff';
  ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
  ChartJS.defaults.font.family = 'Inter var, sans-serif';
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        console.log('Fetching submission:', id);
        const response = await api.submissions.getById(id!);
        console.log('Fetched submission:', response);
        
        if (!response) {
          throw new Error('Submission not found');
        }
        
        setSubmission(response);
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError(error instanceof Error ? error.message : 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubmission();
    } else {
      setError('Invalid submission ID');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-400">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-light text-white mb-4">Unable to Load Proposal</h1>
          <p className="text-gray-400 mb-6">{error || 'Submission not found'}</p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

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

  // Calculate efficiency gains based on solutions and AI stage
  const baseEfficiency = {
    'Beginner': 20,
    'Intermediate': 30,
    'Advanced': 40,
  }[submission.aiStage] || 25;

  // Create a deterministic "random" number based on solution name
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
      const timelineSection = submission.generatedQuote.split('## 4. Project Timeline')[1]?.split('## 5.')[0] || '';
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

  const totalMonths = userRequestedMonths || parseTimelineFromQuote() || 3;

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

  const formatBudget = (budget: string) => {
    const num = parseInt(budget.replace(/[^0-9]/g, ''));
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(num);
  };

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

      {/* Executive Summary Section */}
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
            {submission.generatedQuote.split('## 2. Strategic Analysis')[0].replace('# 1. Executive Brief', '')}
          </div>
        </div>
      </section>

      {/* Strategic Analysis */}
      <section className="bg-black/30 rounded-lg p-8 border border-gray-800">
        <h2 className="text-2xl font-light text-white mb-6">Strategic Analysis</h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-purple-900/10 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Current Challenges</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Strategic Opportunity</th>
                    <th className="py-3 px-4 text-left text-purple-300 font-medium">Expected Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {submission.challenges.map((challenge, index) => (
                    <tr key={index} className="border-b border-gray-800/50">
                      <td className="py-4 px-4 text-gray-300">{challenge}</td>
                      <td className="py-4 px-4 text-gray-300">AI-driven automation and optimization</td>
                      <td className="py-4 px-4 text-gray-300">30-50% efficiency improvement</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* AI Solutions Section */}
      <section className="bg-black/30 rounded-lg p-8 border border-gray-800">
        <h2 className="text-2xl font-light text-white mb-6">Proposed Solutions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {submission.solutions.map((solution, index) => (
              <div key={index} className="bg-purple-900/10 rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-medium text-white mb-3">{solution}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-purple-300 font-medium mb-1">Function</p>
                    <p className="text-gray-300">AI-powered automation and optimization</p>
                  </div>
                  <div>
                    <p className="text-purple-300 font-medium mb-1">Relevance</p>
                    <p className="text-gray-300">Streamlines operations and reduces manual effort</p>
                  </div>
                  <div>
                    <p className="text-purple-300 font-medium mb-1">Impact</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>30-40% reduction in processing time</li>
                      <li>50% improvement in accuracy</li>
                      <li>20% cost savings</li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
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
  );
};

export default ProposalPage;
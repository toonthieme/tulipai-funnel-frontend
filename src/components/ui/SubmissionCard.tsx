
import React, { useState } from 'react';
import { Submission, SubmissionStatus } from '../../types';
import Button from './Button';
import Spinner from './Spinner';
import Tag from './Tag';

interface SubmissionCardProps {
  submission: Submission;
  onUpdateStatus: (id: string, status: SubmissionStatus) => void;
  onGenerateQuote: (id: string) => void;
  onSaveQuote: (id: string, quote: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onDeleteSubmission: (id: string) => void;
  setQuoteSubmission: (submission: Submission | null) => void;
  isExpandedView?: boolean;
}

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => (
  <div>
    <h4 className="text-sm font-medium tracking-widest uppercase text-gray-400">{label}</h4>
    <div className="mt-1 text-base text-gray-200 font-light break-words">{value || 'N/A'}</div>
  </div>
);


const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, onUpdateStatus, onGenerateQuote, onSaveQuote, onSaveNotes, onDeleteSubmission, setQuoteSubmission, isExpandedView = false }) => {
    const [notes, setNotes] = useState(submission.internalNotes || '');
    
    const handleSaveNotes = () => {
        onSaveNotes(submission.id, notes);
        // Add visual feedback if desired
    };

    const getQuoteButton = (sub: Submission) => {
        if (sub.isQuoteLoading) {
            return <Button disabled={true} className="flex items-center justify-center gap-2"><Spinner />Generating...</Button>;
        }
        if (sub.generatedQuote) {
            return <Button onClick={() => setQuoteSubmission(sub)}>View Quote</Button>;
        }
        return <Button onClick={() => onGenerateQuote(sub.id)}>Generate Quote</Button>;
    };

    const content = (
        <div className={`p-6 ${isExpandedView ? 'bg-gray-800/30' : ''}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <DetailItem label="Timeline" value={submission.timeline} />
                <DetailItem label="Budget" value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(Number(submission.budget))} />
                <DetailItem label="AI Stage" value={submission.aiStage} />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-4">
                <DetailItem label="Business Domains" value={[...submission.businessDomains, submission.otherBusinessDomain].filter(Boolean).join(', ') || 'N/A'} />
                <DetailItem label="Challenges" value={submission.challenges.join(', ') || 'N/A'} />
                <DetailItem label="Solutions" value={submission.solutions.join(', ') || 'N/A'} />
            </div>
            
             <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">Internal Notes</h4>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={4}
                    className="block w-full bg-black/20 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Add internal comments here..."
                />
                <div className="flex justify-end mt-2">
                    <Button onClick={handleSaveNotes} variant="secondary" size="normal">Save Notes</Button>
                </div>
             </div>

            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                {getQuoteButton(submission)}
            </div>
        </div>
    );

    if (isExpandedView) {
        return <tr><td colSpan={6} className="p-0">{content}</td></tr>;
    }
    
    return (
        <div className="bg-gray-800/50 rounded-xl flex flex-col transition-shadow hover:shadow-lg hover:shadow-purple-900/20">
            <div className="p-4 border-b border-gray-700/50">
                <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg text-white">{submission.companyName}</h3>
                    <select
                        value={submission.status}
                        onChange={(e) => onUpdateStatus(submission.id, e.target.value as SubmissionStatus)}
                        onClick={(e) => e.stopPropagation()}
                        className="block bg-black/20 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        aria-label={`Status for ${submission.companyName}`}
                    >
                        {Object.values(SubmissionStatus).map(status => (<option key={status} value={status}>{status}</option>))}
                    </select>
                </div>
                <p className="text-sm text-gray-400 font-light">{submission.name}</p>
                 <div className="flex flex-wrap gap-2 mt-3">
                    <Tag label={submission.aiStage} icon="🧠" color="purple" />
                    <Tag label={submission.status} icon="📊" color="blue" />
                </div>
            </div>
            <div className="p-4 flex-grow">
                 <dl>
                    <div className="flex justify-between text-sm">
                        <dt className="text-gray-400">Submitted</dt>
                        <dd className="text-gray-200">{new Date(submission.submittedAt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</dd>
                    </div>
                     <div className="flex justify-between text-sm mt-1">
                        <dt className="text-gray-400">Budget</dt>
                        <dd className="text-gray-200">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(Number(submission.budget))}</dd>
                    </div>
                </dl>
            </div>
            <div className="p-4 border-t border-gray-700/50 flex justify-between items-center">
                <Button 
                    variant="secondary" 
                    onClick={() => onDeleteSubmission(submission.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                >
                    Delete Submission
                </Button>
                {getQuoteButton(submission)}
            </div>
        </div>
    );
};

export default SubmissionCard;

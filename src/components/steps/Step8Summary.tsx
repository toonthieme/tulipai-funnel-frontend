
import React from 'react';
import { FormData } from '../../types';

interface Step8Props {
  formData: FormData;
}

const SummaryItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-4">
    <dt className="text-sm font-medium tracking-widest uppercase text-gray-400">{label}</dt>
    <dd className="mt-1 text-base text-white font-light">{value}</dd>
  </div>
);

const Step8Summary: React.FC<Step8Props> = ({ formData }) => {
  const formattedBudget = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(Number(formData.budget));

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">Summary & Confirmation</h2>
      <p className="text-gray-400 mb-8 font-light">Please review your information below. If everything looks correct, proceed to payment to receive your personalized AI proposal.</p>
      
      <dl className="divide-y divide-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <SummaryItem label="Name" value={formData.name} />
            <SummaryItem label="Email" value={formData.email} />
            <SummaryItem label="Company" value={formData.companyName} />
            <SummaryItem label="Website" value={formData.website} />
            <SummaryItem label="Role" value={formData.role} />
            <SummaryItem label="Team Size" value={formData.teamSize} />
        </div>
        <SummaryItem label="Company Summary" value={<p className="whitespace-pre-wrap">{formData.companySummary || 'N/A'}</p>} />
        <SummaryItem label="Industries" value={formData.industries.join(', ') || 'N/A'} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <SummaryItem label="Department Level" value={formData.departmentLevel || 'N/A'} />
          <SummaryItem label="Business Domains" value={formData.businessDomains.join(', ') || 'N/A'} />
        </div>
         {formData.otherBusinessDomain && (
            <SummaryItem label="Other Business Domain" value={formData.otherBusinessDomain} />
        )}
        <SummaryItem label="Challenges" value={formData.challenges.join(', ') || 'N/A'} />
        {formData.challengeClarification && (
            <SummaryItem label="Challenge Clarification" value={<p className="whitespace-pre-wrap">{formData.challengeClarification}</p>} />
        )}
        <SummaryItem label="Current AI Stage" value={formData.aiStage || 'N/A'} />
        {formData.aiUseCase && (
            <SummaryItem label="AI Use Case Idea" value={<p className="whitespace-pre-wrap">{formData.aiUseCase}</p>} />
        )}
        <SummaryItem label="Interested Solutions" value={formData.solutions.join(', ') || 'N/A'} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <SummaryItem label="Timeline" value={formData.timeline} />
            <SummaryItem label="Budget" value={formattedBudget} />
        </div>
      </dl>
    </div>
  );
};

export default Step8Summary;
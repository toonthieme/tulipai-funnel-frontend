
import { FormData } from '../types';

export function generateSummary(formData: FormData): string {
    const allDomains = [...formData.businessDomains, formData.otherBusinessDomain].filter(Boolean);
    return `
Here is a summary of the information you submitted:

- Company Name: ${formData.companyName}
- Contact Name: ${formData.name}
- Email: ${formData.email}
- Website: ${formData.website}
- Team Size: ${formData.teamSize}
- Timeline: ${formData.timeline}
- Budget: ${formData.budget}

- Industries: ${formData.industries.join(', ') || 'N/A'}
- Business Domains: ${allDomains.join(', ') || 'N/A'}
- Challenges: ${formData.challenges.join(', ') || 'N/A'}
- Interested Solutions: ${formData.solutions.join(', ') || 'N/A'}

- Company Summary:
${formData.companySummary}
    `.trim();
}
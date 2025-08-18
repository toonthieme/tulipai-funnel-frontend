import { FormData, Step, FormErrors } from '../types';

export const validateStep = (step: Step, formData: FormData): FormErrors => {
    const errors: FormErrors = {};

    if (step === Step.BusinessInfo) {
        if (!formData.name.trim()) {
            errors.name = 'Your name is required.';
        }
        if (!formData.email.trim()) {
            errors.email = 'Your email is required.';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address.';
        }
        if (!formData.companyName.trim()) {
            errors.companyName = 'Company name is required.';
        }
        if (!formData.website.trim()) {
            errors.website = 'Company website is required.';
        } else {
             try {
                // Ensure protocol is present for valid URL parsing
                const url = formData.website.startsWith('http') ? formData.website : `https://${formData.website}`;
                new URL(url);
             } catch (_) {
                errors.website = 'Please enter a valid URL (e.g., https://example.com).';
             }
        }
        if (!formData.role.trim()) {
            errors.role = 'Your role is required.';
        }
    }

    // Future steps can have their validation logic added here.
    // e.g., if (step === Step.Challenges) { ... }

    return errors;
}
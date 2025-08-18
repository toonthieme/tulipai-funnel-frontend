import { FormData, Step } from '../types';

const DRAFT_KEY = 'tulipai_funnel_draft';

interface Draft {
  formData: FormData;
  currentStep: Step;
}

export const saveDraft = (formData: FormData, currentStep: Step): void => {
  try {
    const draft: Draft = { formData, currentStep };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error("Failed to save draft to localStorage", error);
  }
};

export const loadDraft = (): Draft | null => {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Basic validation to ensure the loaded object is a valid draft
    if (parsed && parsed.formData && typeof parsed.currentStep === 'number') {
      return parsed;
    }
    return null;

  } catch (error) {
    console.error("Failed to parse draft from localStorage", error);
    return null;
  }
};

export const clearDraft = (): void => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear draft from localStorage", error);
  }
};

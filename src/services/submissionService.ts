import { FormData, Submission, SubmissionStatus } from '../types';
import api from './apiClient';

// Temporary storage key for migration
const STORAGE_KEY = 'tulipai_submissions';

// Get submissions from API
export async function getSubmissions(): Promise<Submission[]> {
  try {
    // Check for local submissions that need migration
    const localSubmissions = getLocalSubmissions();
    if (localSubmissions.length > 0) {
      await migrateLocalSubmissions(localSubmissions);
    }

    // Get submissions from API
    return await api.submissions.getAll();
  } catch (error) {
    console.error("Failed to fetch submissions", error);
    return [];
  }
}

// Save submission to API
export async function saveSubmission(submission: Submission): Promise<void> {
  try {
    // Only send allowed fields to the backend
    const updateData = {
      ...(submission.status && { status: submission.status }),
      ...(submission.notes && { notes: submission.notes }),
      ...(submission.generatedQuote && { generatedQuote: submission.generatedQuote }),
      ...(typeof submission.isQuoteLoading !== 'undefined' && { isQuoteLoading: submission.isQuoteLoading }),
      ...(submission.proposalSentAt && { proposalSentAt: submission.proposalSentAt })
    };
    
    console.log('Saving submission with filtered data:', updateData);
    await api.submissions.update(submission.id, updateData);
  } catch (error) {
    console.error("Failed to save submission", error);
    throw error;
  }
}

// Add new submission
export async function addSubmission(formData: FormData): Promise<{ updatedSubmissions: Submission[], newSubmission: Submission }> {
  try {
    console.log('Creating new submission with data:', formData);
    const submissionData = {
      ...formData,
      status: SubmissionStatus.New,
      isQuoteLoading: true,
      generatedQuote: '',
      internalNotes: '',
    };
    console.log('Submission data to send:', submissionData);
    const newSubmission = await api.submissions.create(submissionData);

    const updatedSubmissions = await getSubmissions();
    return { updatedSubmissions, newSubmission };
  } catch (error) {
    console.error("Failed to add submission", error);
    throw error;
  }
}

// Delete submission
export async function deleteSubmission(id: string): Promise<void> {
  try {
    await api.submissions.delete(id);
  } catch (error) {
    console.error("Failed to delete submission", error);
    throw error;
  }
}

// Migration helpers
function getLocalSubmissions(): Submission[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse local submissions", error);
    return [];
  }
}

async function migrateLocalSubmissions(localSubmissions: Submission[]): Promise<void> {
  try {
    console.log('Migrating local submissions to backend...');
    for (const submission of localSubmissions) {
      // Update status to match new enum
      const updatedSubmission = {
        ...submission,
        status: SubmissionStatus.New
      };
      await api.submissions.create(updatedSubmission);
    }
    // Clear local storage after successful migration
    localStorage.removeItem(STORAGE_KEY);
    console.log('Migration complete');
  } catch (error) {
    console.error("Failed to migrate submissions", error);
    throw error;
  }
}

import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FormData, Step, AiGuideResponse, Submission, SubmissionStatus, FormErrors } from './types';
import { getAiGuideContent, generateCompanyInsightsAndSummary, generateAiQuoteStream, getInitialGuideTextForStep } from './services/aiService';
import { getSubmissions, addSubmission, saveSubmission, deleteSubmission } from './services/submissionService';
import api from './services/apiClient';
import authService from './services/authService';
import { saveDraft, loadDraft, clearDraft } from './services/draftService';
import { validateStep } from './services/validationService';

import LandingHeader from './components/layout/LandingHeader';
import LandingPage from './components/pages/LandingPage';
import AboutPage from './components/pages/AboutPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StepLayout from './components/layout/StepLayout';
import AiGuide from './components/layout/AiGuide';
import Step2BusinessInfo from './components/steps/Step2BusinessInfo';
import Step3CompanyProfile from './components/steps/Step3CompanyProfile';
import Step4Industry from './components/steps/Step4Industry';
import StepDepartmentDomain from './components/steps/StepDepartmentDomain';
import Step5Challenges from './components/steps/Step5Challenges';
import StepAiMaturity from './components/steps/StepAiMaturity';
import Step6Solutions from './components/steps/Step6Solutions';
import Step7TimingBudget from './components/steps/Step7TimingBudget';
import Step8Summary from './components/steps/Step8Summary';
import PaymentPage from './components/pages/PaymentPage';
import ConfirmationPage from './components/steps/ConfirmationPage';
import Spinner from './components/ui/Spinner';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminLoginPage from './components/pages/AdminLoginPage';
import AdminAnalytics from './components/pages/AdminAnalytics';
import ProposalPage from './components/pages/ProposalPage';
import { TEAM_SIZE_OPTIONS, TIMELINE_OPTIONS, DEPARTMENT_LEVEL_OPTIONS, AI_STAGE_OPTIONS } from './constants';
import ResumeBanner from './components/ui/ResumeBanner';

const TOTAL_STEPS = 9;

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  website: '',
  role: '',
  teamSize: TEAM_SIZE_OPTIONS[1],
  companySummary: '',
  industries: [],
  departmentLevel: DEPARTMENT_LEVEL_OPTIONS[1],
  businessDomains: [],
  otherBusinessDomain: '',
  challenges: [],
  challengeClarification: '',
  aiStage: AI_STAGE_OPTIONS[0],
  aiUseCase: '',
  solutions: [],
  timeline: TIMELINE_OPTIONS[1],
  budget: '20000',
};

const MainApp: React.FC = () => {
  const [page, setPage] = useState<'landing' | 'about' | 'funnel' | 'login'>('landing');
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>(Step.BusinessInfo);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [aiGuideContent, setAiGuideContent] = useState<AiGuideResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [adminPage, setAdminPage] = useState<'dashboard' | 'analytics'>('dashboard');


  // Load submissions when authenticated
  useEffect(() => {
    const loadSubmissions = async () => {
      if (isAuthenticated) {
        try {
          console.log('Loading submissions for authenticated user...');
          const data = await getSubmissions();
          console.log('Loaded submissions:', data);
          setSubmissions(data);
        } catch (error) {
          console.error('Failed to load submissions:', error);
        }
      }
    };
    loadSubmissions();
  }, [isAuthenticated]);

  // Show resume prompt when on landing page
  useEffect(() => {
    if (page === 'landing') {
        const draft = loadDraft();
        setShowResumePrompt(!!(draft && draft.formData));
    }
  }, [page]);

  // Save draft on form data or step change
  useEffect(() => {
    if (page === 'funnel' && !isAdminView && currentStep < Step.Payment) {
        saveDraft(formData, currentStep);
    }
  }, [formData, currentStep, page, isAdminView]);


  const handleStartFunnel = () => {
    clearDraft();
    setFormData(initialFormData);
    setErrors({});
    setIsAdminView(false);
    setPage('funnel');
    setCurrentStep(Step.BusinessInfo);
    setShowResumePrompt(false);
  };

  const handleResumeFunnel = () => {
    const draft = loadDraft();
    if (draft && draft.formData) {
      setFormData(draft.formData);
      setCurrentStep(draft.currentStep);
      setPage('funnel');
      setShowResumePrompt(false);
    } else {
      // Fallback if draft was cleared in another tab
      handleStartFunnel();
    }
  };


  const handleNavigateAbout = () => {
    setIsAdminView(false);
    setPage('about');
  };
  
  const handleNavigateLanding = () => {
    setIsAdminView(false);
    setPage('landing');
  };
  
  const handleNavigateAdmin = () => {
    setPage('login');
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      await authService.login(email, password);
      console.log('Login successful');
      
      setIsAuthenticated(true);
      setLoginError('');
      setIsAdminView(true);
      setPage('funnel');
      
      // Load submissions after successful login
      try {
        console.log('Loading submissions after login...');
        const data = await getSubmissions();
        console.log('Loaded submissions:', data);
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to load submissions after login:', error);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError(error instanceof Error ? error.message : 'Login failed');
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdminView(false);
    setPage('landing');
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Clear validation error for the updated field
    const fieldName = Object.keys(data)[0] as keyof FormData;
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    if (page !== 'funnel' || isAdminView || currentStep >= Step.Payment) return;

    const fetchGuide = async () => {
        const initialText = getInitialGuideTextForStep(currentStep);
        setAiGuideContent({ guideText: initialText, suggestions: [] });
        setIsLoading(true);
        try {
            const content = await getAiGuideContent(currentStep, formData);
            setAiGuideContent(content);
        } catch (error) {
            console.error(`Error fetching AI guide for step ${currentStep}:`, error);
            setAiGuideContent({
                guideText: "Sorry, there was an issue fetching AI suggestions. Please proceed with the form.",
                suggestions: []
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchGuide();
  }, [page, currentStep, isAdminView]);


  useEffect(() => {
    const generateSummaryIfNeeded = async () => {
      if (currentStep === Step.CompanyProfile && formData.website && !formData.companySummary && !errors.website) {
        setIsGeneratingSummary(true);
        try {
          const { summary, insights } = await generateCompanyInsightsAndSummary(formData.website);
          updateFormData({ companySummary: summary, websiteInsights: insights });
        } catch (error) {
          console.error("Failed to generate summary:", error);
          const errorMessage = "Sorry, I couldn't analyze the website. Please provide a summary manually.";
          updateFormData({ companySummary: errorMessage });
        } finally {
          setIsGeneratingSummary(false);
        }
      }
    };
    generateSummaryIfNeeded();
  }, [currentStep, formData.website, errors.website]);
  

  const handleRegenerateSummary = useCallback(async () => {
    if (!formData.website) return;
    setIsGeneratingSummary(true);
    try {
      const { summary, insights } = await generateCompanyInsightsAndSummary(formData.website);
      updateFormData({ companySummary: summary, websiteInsights: insights });
    } catch (error) {
      console.error("Failed to regenerate summary:", error);
      updateFormData({ companySummary: "Sorry, I couldn't regenerate the summary. Please try again or fill it in manually." });
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [formData.website]);

  const handleSuggestionClick = (suggestion: string) => {
    switch (currentStep) {
      case Step.BusinessInfo: {
        updateFormData({ role: suggestion });
        break;
      }
      case Step.Industry: {
        const newIndustries = formData.industries.includes(suggestion)
          ? formData.industries.filter(i => i !== suggestion)
          : [...formData.industries, suggestion];
        updateFormData({ industries: newIndustries });
        break;
      }
       case Step.DepartmentDomain: {
        // Update otherBusinessDomain instead of businessDomains
        const currentDomains = formData.otherBusinessDomain ? formData.otherBusinessDomain.split(', ') : [];
        const newDomains = currentDomains.includes(suggestion)
          ? currentDomains.filter(d => d !== suggestion)
          : [...currentDomains, suggestion];
        updateFormData({ otherBusinessDomain: newDomains.join(', ') });
        break;
      }
      case Step.Challenges: {
        const newChallenges = formData.challenges.includes(suggestion)
          ? formData.challenges.filter(c => c !== suggestion)
          : [...formData.challenges, suggestion];
        updateFormData({ challenges: newChallenges });
        break;
      }
      case Step.AiMaturity: {
        updateFormData({ aiUseCase: formData.aiUseCase ? `${formData.aiUseCase}\n- ${suggestion}` : suggestion });
        break;
      }
      case Step.Solutions: {
        const newSolutions = formData.solutions.includes(suggestion)
          ? formData.solutions.filter(s => s !== suggestion)
          : [...formData.solutions, suggestion];
        updateFormData({ solutions: newSolutions });
        break;
      }
      case Step.TimingBudget: {
        const isTimeline = ['month', 'asap', 'year'].some(keyword => suggestion.toLowerCase().includes(keyword));
        
        if (isTimeline) {
          updateFormData({ timeline: suggestion });
        } else {
          const budgetValue = suggestion.replace(/[^0-9]/g, '');
          updateFormData({ budget: budgetValue });
        }
        break;
      }
    }
  };


  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
    }

    setErrors({});
    if (currentStep < Step.Payment) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, formData]);

  const handleBack = () => {
    if (currentStep === Step.BusinessInfo) {
      setPage('landing');
      return;
    }
    if (currentStep > Step.BusinessInfo && currentStep <= Step.Confirmation) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleProceedToPayment = () => {
    setCurrentStep(Step.Payment);
  };
  
  const handleGenerateQuote = useCallback(async (submissionId: string, forceRegenerate = false) => {
    console.log('Starting quote generation for submission:', submissionId, 'Force regenerate:', forceRegenerate);
    
    try {
      const allSubmissions = await getSubmissions();
      const submissionToProcess = allSubmissions.find(s => s.id === submissionId);
      if (!submissionToProcess) {
        console.error("Could not find submission to generate quote for.");
        return;
      }

      // If quote exists and not forcing regeneration, just return
      if (submissionToProcess.generatedQuote && !forceRegenerate) {
        console.log('Quote already exists and no regeneration requested');
        return;
      }

      // Set loading state
      const loadingSubmissions = allSubmissions.map(s => 
        s.id === submissionId ? { ...s, isQuoteLoading: true, generatedQuote: '' } : s
      );
      setSubmissions(loadingSubmissions);

      // Update submission in database
      const loadingSubmission = loadingSubmissions.find(s => s.id === submissionId);
      if (loadingSubmission) {
        await saveSubmission(loadingSubmission);
      }

      console.log('Calling AI service for quote generation...');
      const quoteText = await generateAiQuoteStream(submissionToProcess);
      console.log('Quote generated successfully:', quoteText.substring(0, 100) + '...');
      
      // Update with generated quote
      const finalSubmissions = allSubmissions.map(s =>
        s.id === submissionId
          ? { ...s, generatedQuote: quoteText, isQuoteLoading: false }
          : s
      );
      setSubmissions(finalSubmissions);

      // Save to database
      const updatedSubmission = finalSubmissions.find(s => s.id === submissionId);
      if (updatedSubmission) {
        await saveSubmission(updatedSubmission);
      }

    } catch (error) {
      console.error("Error generating quote:", error);
      
      const allSubmissions = await getSubmissions();
      const errorSubmissions = allSubmissions.map(s =>
        s.id === submissionId
          ? { ...s, generatedQuote: 'Error generating quote.', isQuoteLoading: false }
          : s
      );
      setSubmissions(errorSubmissions);

      // Save error state to database
      const errorSubmission = errorSubmissions.find(s => s.id === submissionId);
      if (errorSubmission) {
        await saveSubmission(errorSubmission);
      }
    }
  }, []);


  const handlePaymentSuccess = async () => {
    try {
      const { updatedSubmissions, newSubmission } = await addSubmission(formData);
      setSubmissions(updatedSubmissions);
      setCurrentStep(Step.Confirmation);
      clearDraft();
      if (isAuthenticated) {
        handleGenerateQuote(newSubmission.id);
      }
      // Send confirmation email
      try {
        await api.email.sendConfirmation({ email: formData.email, name: formData.name, companyName: formData.companyName });
      } catch (e) {
        console.error('Failed to send confirmation email:', e);
      }
    } catch (error) {
      console.error('Failed to process submission:', error);
      // TODO: Add proper error handling UI
    }
  };

  const handleUpdateStatus = async (id: string, status: SubmissionStatus) => {
    try {
      console.log('Updating status:', { id, status });
      
      // Only send the status update to the backend
      await saveSubmission({
        id,
        status,
        ...(status === SubmissionStatus.ProposalSent ? { proposalSentAt: new Date().toISOString() } : {})
      } as Submission);
      
      // Update local state
      const updatedSubmissions = submissions.map(sub => {
        if (sub.id === id) {
          return {
            ...sub,
            status,
            ...(status === SubmissionStatus.ProposalSent ? { proposalSentAt: new Date().toISOString() } : {})
          };
        }
        return sub;
      });
      
      setSubmissions(updatedSubmissions);
    } catch (error) {
      console.error('Failed to update status:', error);
      // TODO: Add proper error handling UI
    }
  };

  const handleSaveQuote = async (id: string, quote: string) => {
    try {
      const updatedSubmissions = submissions.map(sub =>
        sub.id === id ? { ...sub, generatedQuote: quote } : sub
      );
      
      const updatedSubmission = updatedSubmissions.find(s => s.id === id);
      if (updatedSubmission) {
        await saveSubmission(updatedSubmission);
      }
      
      setSubmissions(updatedSubmissions);
    } catch (error) {
      console.error('Failed to save quote:', error);
      // TODO: Add proper error handling UI
    }
  }

  const handleSendQuote = async (id: string) => {
    try {
      const updatedSubmissions = submissions.map(sub =>
        sub.id === id ? { 
          ...sub, 
          status: SubmissionStatus.ProposalSent,
          proposalSentAt: new Date().toISOString()
        } : sub
      );
      
      const updatedSubmission = updatedSubmissions.find(s => s.id === id);
      if (updatedSubmission) {
        await saveSubmission(updatedSubmission);
      }
      
      setSubmissions(updatedSubmissions);
    } catch (error) {
      console.error('Failed to send quote:', error);
      // TODO: Add proper error handling UI
    }
  }

  const handleDeleteSubmission = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        await deleteSubmission(id);
        const updatedSubmissions = submissions.filter(sub => sub.id !== id);
        setSubmissions(updatedSubmissions);
      } catch (error) {
        console.error('Failed to delete submission:', error);
        // TODO: Add proper error handling UI
      }
    }
  }

  const handleSaveNotes = async (id: string, notes: string) => {
    try {
      const updatedSubmissions = submissions.map(sub => 
        sub.id === id ? { ...sub, internalNotes: notes } : sub
      );
      
      const updatedSubmission = updatedSubmissions.find(s => s.id === id);
      if (updatedSubmission) {
        await saveSubmission(updatedSubmission);
      }
      
      setSubmissions(updatedSubmissions);
    } catch (error) {
      console.error('Failed to save notes:', error);
      // TODO: Add proper error handling UI
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case Step.BusinessInfo:
        return <Step2BusinessInfo formData={formData} updateFormData={updateFormData} errors={errors} />;
      case Step.CompanyProfile:
        return <Step3CompanyProfile formData={formData} updateFormData={updateFormData} onRegenerate={handleRegenerateSummary} isLoading={isGeneratingSummary} />;
      case Step.Industry:
        return <Step4Industry formData={formData} updateFormData={updateFormData} />;
      case Step.DepartmentDomain:
        return <StepDepartmentDomain formData={formData} updateFormData={updateFormData} />;
      case Step.Challenges:
        return <Step5Challenges formData={formData} updateFormData={updateFormData} />;
      case Step.AiMaturity:
        return <StepAiMaturity formData={formData} updateFormData={updateFormData} />;
      case Step.Solutions:
        return <Step6Solutions formData={formData} updateFormData={updateFormData} />;
      case Step.TimingBudget:
        return <Step7TimingBudget formData={formData} updateFormData={updateFormData} />;
      case Step.Summary:
        return <Step8Summary formData={formData} />;
      case Step.Payment:
        return <PaymentPage formData={formData} onPaymentSuccess={handlePaymentSuccess} onBack={handleBack} />;
      case Step.Confirmation:
        return <ConfirmationPage formData={formData} onHomeClick={handleNavigateLanding} />;
      default:
        return <Step2BusinessInfo formData={formData} updateFormData={updateFormData} errors={errors} />;
    }
  };

  const nextButtonText = currentStep === Step.Summary ? 'Proceed to Payment' : 'Next';

  const mainContent = (
    <div
      className="relative bg-black"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2920&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10 min-h-screen flex flex-col">
        {page === 'landing' && (
          <>
            <LandingHeader onHomeClick={handleNavigateLanding} onAboutClick={handleNavigateAbout} onStartClick={handleStartFunnel} onAdminClick={handleNavigateAdmin} />
            <LandingPage onStartClick={handleStartFunnel} showResumeBanner={showResumePrompt} onResume={handleResumeFunnel} />
          </>
        )}

        {page === 'about' && (
          <>
            <LandingHeader onHomeClick={handleNavigateLanding} onAboutClick={handleNavigateAbout} onStartClick={handleStartFunnel} onAdminClick={handleNavigateAdmin} />
            <AboutPage />
          </>
        )}

        {page === 'login' && (
           <AdminLoginPage onLogin={handleLogin} error={loginError} onBack={handleNavigateLanding} />
        )}

        {page === 'funnel' && (
          <>
            <Header
              onHomeClick={handleNavigateLanding}
              totalSteps={TOTAL_STEPS}
              isAdminView={isAdminView}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
              currentStepEnum={currentStep}
            />
            <main className="flex-grow flex items-start p-4 sm:p-6 lg:p-8">
              {isAdminView && isAuthenticated ? (
                <div className="w-full space-y-8">
                  {/* Admin Navigation Tabs */}
                  <div className="glassmorphism rounded-xl p-6">
                    <div className="flex space-x-1 bg-black/30 rounded-lg p-1">
                      <button
                        onClick={() => setAdminPage('dashboard')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          adminPage === 'dashboard'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-black/20'
                        }`}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => setAdminPage('analytics')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          adminPage === 'analytics'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-black/20'
                        }`}
                      >
                        Analytics
                      </button>
                    </div>
                  </div>

                  {/* Admin Content */}
                  {adminPage === 'dashboard' ? (
                    <AdminDashboard 
                      submissions={submissions} 
                      onUpdateStatus={handleUpdateStatus} 
                      onGenerateQuote={handleGenerateQuote}
                      onSaveQuote={handleSaveQuote}
                      onSaveNotes={handleSaveNotes}
                      onSendQuote={handleSendQuote}
                      onDeleteSubmission={handleDeleteSubmission}
                    />
                  ) : (
                    <AdminAnalytics />
                  )}
                </div>
              ) : !isAdminView && ![Step.Confirmation, Step.Payment].includes(currentStep) ? (
                <StepLayout
                  leftContent={
                    <div className="animate-fade-in">{renderStep()}</div>
                  }
                  rightContent={
                    <AiGuide content={aiGuideContent} isLoading={isLoading} onSuggestionClick={handleSuggestionClick} />
                  }
                />
              ) : (
                  <div className="w-full flex justify-center">
                    {renderStep()}
                  </div>
              )}
            </main>
            {!isAdminView && currentStep < Step.Summary && (
              <Footer
                onBack={handleBack}
                onNext={handleNext}
                isNextDisabled={isLoading || isGeneratingSummary}
                nextButtonText={nextButtonText}
              />
            )}
            {!isAdminView && currentStep === Step.Summary && (
              <Footer
                onBack={handleBack}
                onNext={handleProceedToPayment}
                isNextDisabled={isLoading || isGeneratingSummary}
                nextButtonText={nextButtonText}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/proposal/:id" element={<ProposalPage />} />
        <Route path="*" element={mainContent} />
      </Routes>
    </Router>
  );
}

export default MainApp;

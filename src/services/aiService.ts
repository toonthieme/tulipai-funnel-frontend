import OpenAI from "openai";
import { FormData, Step, AiGuideResponse, Submission } from "../types";
import { fetchWebsiteContent } from "./webService";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only during development
});

const fallbackResponse: AiGuideResponse = {
  guideText: "I'm having a little trouble thinking of guidance right now. Please focus on the questions, and I'll catch up when I can.",
  suggestions: [],
};

export function getInitialGuideTextForStep(step: Step): string {
  const texts: Partial<Record<Step, string>> = {
    [Step.BusinessInfo]: "Let's start with the basics. This information helps us understand your company context.",
    [Step.CompanyProfile]: "We can analyze your website to generate a company summary, which saves you time.",
    [Step.Industry]: "Select your primary industries. This helps us tailor use cases and solutions specific to your field.",
    [Step.DepartmentDomain]: "Help us understand your position and the areas of the business you focus on.",
    [Step.Challenges]: "What are the primary pain points you're looking to solve? This is crucial for matching you with the right AI tools.",
    [Step.AiMaturity]: "Your experience with AI helps us understand the best starting point for our collaboration.",
    [Step.Solutions]: "Based on your challenges, here are some solutions that might be a good fit. Our AI can suggest options tailored to you.",
    [Step.TimingBudget]: "Understanding your timeline and budget helps us propose a realistic and effective project scope.",
    [Step.Summary]: "Please review all your selections before proceeding to the final step.",
    [Step.Payment]: "Finalize your request to receive your tailored proposal.",
    [Step.Confirmation]: "Your request has been submitted successfully.",
  };
  return texts[step] || "Let's continue building your AI proposal.";
}

export async function generateCompanyInsightsAndSummary(website: string): Promise<{ summary: string; insights: string[] }> {
  try {
    // Fetch website content
    const websiteContent = await fetchWebsiteContent(website);

    const prompt = `As a business analyst, please analyze the following website content:

${websiteContent}

Based on this content, provide two things:

1. A comprehensive professional summary (5-7 sentences) that covers:
   - The company's core business and mission
   - Their main products or services in detail
   - Their target audience and market positioning
   - Their unique value proposition or differentiators
   - Any notable technologies, methodologies, or approaches they use
   - Their industry focus and business model (B2B, B2C, etc.)

2. A list of up to five factual keywords or descriptive phrases that capture:
   - Business model (e.g., "B2B SaaS", "Enterprise Solutions")
   - Industry vertical (e.g., "FinTech", "Healthcare Technology")
   - Technology focus (e.g., "AI-Powered Analytics", "Cloud Infrastructure")
   - Market positioning (e.g., "Enterprise-Grade", "Innovation Leader")
   - Target audience (e.g., "Fortune 500 Companies", "SME Focus")

IMPORTANT: Your entire response must follow this structure exactly, with no extra text or markdown:
SUMMARY_START
[The generated summary]
SUMMARY_END
INSIGHTS_START
[First insight on one line]
[Second insight on another line]
[Third insight on a third line]
INSIGHTS_END`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a business analyst who returns structured responses in the exact format requested." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = completion.choices?.[0]?.message?.content || "";

    if (!text.includes('SUMMARY_START') || !text.includes('SUMMARY_END') || !text.includes('INSIGHTS_START') || !text.includes('INSIGHTS_END')) {
      console.error("OpenAI response did not follow the expected format.", text);
      return {
        summary: "I had trouble analyzing the website. Could you please write a brief summary of your company? For example, what does it do, who are the customers, and what do you sell?",
        insights: []
      };
    }
    
    const summary = text.split('SUMMARY_START')[1].split('SUMMARY_END')[0].trim();
    const insightsText = text.split('INSIGHTS_START')[1].split('INSIGHTS_END')[0].trim();

    const insights = insightsText
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    return { summary, insights };

  } catch (error) {
    console.error("Error generating company summary and insights:", error);
    return {
      summary: "I encountered an error while trying to analyze the website. Could you please write a brief summary of your company? For example, what does it do, who are the customers, and what do you sell?",
      insights: []
    };
  }
}

export async function getAiGuideContent(step: Step, formData: FormData): Promise<AiGuideResponse> {
  // Steps that do not require an API call can return static content directly.
  switch (step) {
    case Step.BusinessInfo:
      return { 
        guideText: "Let's start with the basics. This information helps us understand your company context and ensures our proposal reaches the right person.", 
        suggestions: [] 
      };
    case Step.CompanyProfile:
      return { guideText: "Please review the auto-generated summary. Correcting any errors here is important, as we use this to understand your core business. We can always regenerate it if needed.", suggestions: [] };
    case Step.AiMaturity:
      return { 
        guideText: "Your current experience with AI is a key factor. It helps us determine the complexity of the proposed solution and the amount of support you might need, ensuring the project is a success from day one.", 
        suggestions: [] 
      };
    case Step.TimingBudget:
      return { 
        guideText: "Understanding your desired timeline and budget is crucial for scoping a project that delivers maximum value. This allows us to propose a realistic plan that aligns with your financial and strategic goals.", 
        suggestions: [] 
      };
    case Step.Summary:
      return { guideText: "Please review all your selections. This is the final step before payment. Once you submit and complete payment, we'll draft a detailed, personalized AI proposal and send it to your email within 3 business days.", suggestions: [] };
  }

  // For steps that need dynamic AI responses
  if (step === Step.DepartmentDomain) {
    return {
      guideText: "Select the business domains you work with. Your choices help us understand which areas of the business could benefit most from AI implementation. Consider both your direct responsibilities and areas you collaborate with.",
      suggestions: []
    };
  }

  // For all other steps, we construct a dynamic prompt and call the API.
  let prompt = '';
  
  // Handle each step that needs dynamic content
  switch (step) {
    case Step.Industry: {
      const websiteInfo = formData.websiteInsights && formData.websiteInsights.length > 0 
        ? `and website themes like '${formData.websiteInsights.join(', ')}'`
        : '';
      const summaryContext = formData.companySummary 
        ? `For a company with the summary: "${formData.companySummary}" ${websiteInfo}`
        : "The user needs to select their industry.";

      prompt = `${summaryContext}, suggest 4-5 relevant industries. You are an expert business analyst; you MUST generate suggestions based on the user's information. The suggestions should be diverse and insightful. The guide text should encourage the user to select multiple relevant sectors. For example, if the company is a game studio, suggest 'Video Game Development' or 'Interactive Entertainment', not just 'Arts, Entertainment, and Recreation'.`;
      break;
    }
    case Step.Challenges: {
      // Ensure we have the required data
      if (!formData.industries || formData.industries.length === 0) {
        return fallbackResponse;
      }

      const allDomains = [...(formData.businessDomains || []), formData.otherBusinessDomain].filter(Boolean);
      const domainContext = allDomains.length > 0 ? `focusing on the ${allDomains.join(', ')} domains` : '';
      const levelContext = formData.departmentLevel ? `from the perspective of a ${formData.departmentLevel}` : '';
      
      prompt = `You are an AI consultant helping identify business challenges that could be solved with AI.

Company Context:
- Industries: ${formData.industries.join(', ')}
${domainContext ? `- Business Domains: ${domainContext}` : ''}
${levelContext ? `- Position Level: ${levelContext}` : ''}

You MUST return a response in this exact JSON format:
{
  "guideText": "2-3 sentences explaining why identifying these specific pain points is crucial for finding the right AI solutions for their context",
  "suggestions": [
    "Pain point 1 - specific to their industry/role",
    "Pain point 2 - specific to their industry/role",
    "Pain point 3 - specific to their industry/role",
    "Pain point 4 - specific to their industry/role"
  ]
}

Consider pain points related to:
- Time-consuming manual processes that could be automated
- Data analysis and reporting bottlenecks
- Customer service and engagement inefficiencies
- Resource allocation and optimization challenges
- Decision-making delays due to lack of insights
- Quality control and compliance issues
- Market competitiveness gaps

Make each suggestion:
1. Specific to their industry and role
2. Focused on business impact
3. Clear and actionable
4. Relevant to AI implementation`;
      break;
    }
    case Step.Solutions: {
      const challengesContext = `that is facing these challenges: '${formData.challenges.join(', ')}'`;
      const industryContext = formData.industries.length > 0 ? `in the '${formData.industries.join(', ')}' industries` : '';
      const aiStageContext = `Their current AI stage is: '${formData.aiStage}'.`;
      const useCaseContext = formData.aiUseCase ? `They have a specific idea in mind: "${formData.aiUseCase}".` : '';
      prompt = `For a company ${industryContext} ${challengesContext}, ${aiStageContext} ${useCaseContext}, suggest 4-5 potential AI solutions. The guide text should connect these solutions back to their stated challenges and AI readiness. Your suggestions should be realistic given their AI stage.`;
      break;
    }
      
    default:
      return { guideText: "Let's continue building your AI proposal.", suggestions: [] };
  }

  if (!prompt) {
    console.log('No prompt generated for step:', step);
    return fallbackResponse;
  }

  console.log('Sending prompt for step:', step);
  console.log('Prompt:', prompt);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { 
          role: "system", 
          content: `You are a helpful assistant who MUST return a valid JSON object in this exact format, with NO markdown formatting or code block markers:
{
  "guideText": "2-4 sentences (35-60 words) of guidance text",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]
}
Each suggestion should be concise and actionable. Return ONLY the JSON object, no other text or formatting.` 
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const content = completion.choices?.[0]?.message?.content || "";
    console.log('OpenAI Response:', content);
    
    try {
      // Clean up the response by removing markdown code block markers and any whitespace
      const cleanContent = content
        .replace(/```json\n?/g, '')  // Remove ```json
        .replace(/```\n?/g, '')      // Remove closing ```
        .trim();                     // Remove any extra whitespace

      console.log('Cleaned content:', cleanContent);
      
      const parsed = JSON.parse(cleanContent);
      console.log('Parsed Response:', parsed);

      if (parsed && parsed.guideText && Array.isArray(parsed.suggestions)) {
        return {
          guideText: parsed.guideText || fallbackResponse.guideText,
          suggestions: parsed.suggestions
        };
      } else {
        console.error('Invalid response structure:', parsed);
        return fallbackResponse;
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw content:', content);
      return fallbackResponse;
    }

  } catch (error) {
    console.error(`Error fetching AI guide for step ${step}:`, error);
    return fallbackResponse;
  }
}

export async function generateAiQuoteStream(submission: Submission) {
  const { companyName, name, email, teamSize, companySummary, departmentLevel, aiStage, aiUseCase, challengeClarification } = submission;

  // Safely normalize potentially missing arrays (backend schema may not include some frontend-only fields)
  const industriesList = Array.isArray((submission as any).industries) ? (submission as any).industries as string[] : [];
  const businessDomainsList = Array.isArray(submission.businessDomains) ? submission.businessDomains : [];
  const challengesListArr = Array.isArray(submission.challenges) ? submission.challenges : [];
  const solutionsListArr = Array.isArray(submission.solutions) ? submission.solutions : [];
  const otherBusinessDomain = (submission as any).otherBusinessDomain || '';
  const timeline = submission.timeline || '3 months';
  const budget = submission.budget || '€20.000';

  const allDomains = [...businessDomainsList, otherBusinessDomain].filter(Boolean);

  const solutionsList = solutionsListArr.length > 0
    ? solutionsListArr.map(s => `- ${s}`).join('\n')
    : '- Custom AI solution development based on a discovery phase.';

  const challengesList = challengesListArr.length > 0
    ? challengesListArr.join(', ')
    : 'their specified business goals';
  
  const clarificationText = challengeClarification ? `\n- **Client's Clarification:** "${challengeClarification}"` : '';
  const useCaseText = aiUseCase ? `\n- **Client's Use Case Idea:** "${aiUseCase}"` : '';

  const prompt = `
            You are an AI strategist at TulipAI, tasked with preparing a premium, personalized AI proposal. Create a visually clear, professional, and persuasive document that will impress and convince the client.

            # CLIENT PROFILE (for internal use only)
            - Company Name: ${companyName}
            - Team Size: ${teamSize}
            - Industry: ${industriesList.length > 0 ? industriesList.join(', ') : 'Not specified'}
            - Summary: ${companySummary}
            - Department Level: ${departmentLevel}
            - Business Domains: ${allDomains.length > 0 ? allDomains.join(', ') : 'Not specified'}
            - AI Maturity: ${aiStage}
            - Challenges: ${challengesList}
            - Clarification: ${challengeClarification || 'None'}
            - AI Use Case: ${aiUseCase || 'None'}
            - Solutions Interested In: ${solutionsListArr.length > 0 ? solutionsListArr.join(', ') : 'Not specified'}
            - Timeline: ${timeline}
            - Budget: €${budget}

            # PROPOSAL STRUCTURE
            Generate a premium proposal with the following sections, using markdown for formatting:

            ## 1. Executive Brief
            Create a concise, powerful executive summary (max 3 paragraphs) following this structure:

            Paragraph 1: TulipAI Introduction (1-2 sentences)
            - Who we are: Leading AI solutions provider specializing in business transformation
            - Our expertise: Focus on practical, results-driven AI implementation

            Paragraph 2: Client-Specific Value (2-3 sentences)
            - Acknowledge ${companyName}'s position in ${industriesList.length > 0 ? industriesList.join(', ') : 'their market'}
            - Connect their challenges with our capabilities
            - Show understanding of their specific context

            Paragraph 3: Vision & Next Steps (2 sentences)
            - Paint a picture of the transformed future state
            - Lead into the detailed proposal that follows

            Keep it high-level and engaging. Do not include specific solution details or technical specifications here.

            ## 2. Strategic Analysis
            Create a table:
            | Current Challenges | Strategic Opportunity | Expected Impact |
            |-------------------|----------------------|-----------------|
            | [Challenge 1] | [How AI Addresses It] | [Measurable Outcome] |
            | [Challenge 2] | [How AI Addresses It] | [Measurable Outcome] |
            | [Challenge 3] | [How AI Addresses It] | [Measurable Outcome] |

            ## 3. Proposed Solutions
            For each solution, use this format:

            ### [Solution Name]
            **Function:** [One-line description of what it does]
            **Relevance:** [Why it matters for ${companyName}]
            **Impact:** 
            - [Quantifiable KPI 1]
            - [Quantifiable KPI 2]
            - [Quantifiable KPI 3]

            ## 4. Implementation Roadmap
            Create a table:
            | Phase | Duration | Key Deliverables | Success Criteria |
            |-------|----------|------------------|------------------|
            | Discovery | [X] weeks | [List key outputs] | [Measurable goals] |
            | Development | [X] weeks | [List key outputs] | [Measurable goals] |
            | Integration | [X] weeks | [List key outputs] | [Measurable goals] |
            | Launch | [X] weeks | [List key outputs] | [Measurable goals] |

            Total Duration: ${timeline}

            ## 5. Investment Overview
            Create a table:
            | Component | Description | Value Delivered |
            |-----------|-------------|-----------------|
            | [Component 1] | [What it includes] | [Specific value] |
            | [Component 2] | [What it includes] | [Specific value] |
            | [Component 3] | [What it includes] | [Specific value] |

            Total Investment: €${budget}

            ## 6. Partnership Benefits
            - List 3-4 unique advantages of partnering with TulipAI
            - Focus on expertise, track record, and unique capabilities
            - Include relevant case studies or success metrics

            ## 7. Next Steps
            Create a clear timeline:
            1. **Immediate:** [Action within 48 hours]
            2. **Week 1:** [First milestone]
            3. **Week 2:** [Project initiation]

            ## 8. Call to Action
            End with a strong, clear call to action:
            - Direct next step
            - Contact information
            - Guarantee or commitment statement

            ---

            ## FORMATTING GUIDELINES
            1. Use markdown tables for structured information
            2. Use bold for emphasis and headers
            3. Use bullet points for scannable lists
            4. Include white space between sections
            5. Keep paragraphs short (3-4 lines max)
            6. Use action verbs and confident language
            7. Focus on business outcomes and ROI
            8. Make it easy to scan and professional

            Generate the proposal now, ensuring it's formatted for PDF export and maintains a premium, professional appearance.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a senior business consultant who writes professional AI solution proposals." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      stream: false,
    });

    const generatedQuote = completion.choices[0]?.message?.content;
    if (!generatedQuote) {
      throw new Error("No quote content generated");
    }

    console.log("Generated quote:", generatedQuote);
    return generatedQuote;
  } catch (error) {
    console.error("Error generating AI quote:", error);
    throw error;
  }
}

export async function regenerateProposalFromExecutiveBrief(
  submission: Submission,
  executiveBriefMarkdown: string
): Promise<string> {
  const { companyName, aiStage, budget, timeline } = submission;

  const industriesList = Array.isArray((submission as any).industries) ? (submission as any).industries as string[] : [];
  const challengesListArr = Array.isArray(submission.challenges) ? submission.challenges : [];
  const solutionsListArr = Array.isArray(submission.solutions) ? submission.solutions : [];

  const context = `Company: ${companyName}\nIndustries: ${industriesList.join(', ') || 'Not specified'}\nAI Stage: ${aiStage}\nTimeline: ${submission.timeline || timeline || '3 months'}\nBudget: ${submission.budget || budget || '€20.000'}\nKnown Challenges: ${challengesListArr.join(', ') || 'Not specified'}\nPreferred Solutions: ${solutionsListArr.join(', ') || 'Not specified'}`;

  const prompt = `You are a senior AI solutions consultant. Given the executive brief and context, generate ALL remaining proposal sections in Markdown that align with and are logically derived from the executive brief. Keep the tone concise, business-focused, and consistent.

Executive Brief (authoritative source):\n${executiveBriefMarkdown}\n\nContext:\n${context}\n\nReturn ONLY valid JSON with these string fields, no markdown code fences:
{
  "strategicAnalysis": "Markdown for section '## 2. Strategic Analysis' including a clear table",
  "proposedSolutions": "Markdown for section '## 3. Proposed Solutions' with subsections ### [Solution] incl. Function, Relevance, Impact",
  "implementationRoadmap": "Markdown for section '## 4. Implementation Roadmap' with a table and total duration consistent with the context",
  "investmentOverview": "Markdown for section '## 5. Investment Overview' with a table and total investment matching the budget",
  "partnershipBenefits": "Markdown for section '## 6. Partnership Benefits'",
  "nextSteps": "Markdown for section '## 7. Next Steps'",
  "callToAction": "Markdown for section '## 8. Call to Action'"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages: [
      { role: 'system', content: 'You return strictly valid JSON per instructions, without code fences.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
  });

  const raw = completion.choices?.[0]?.message?.content?.trim() || '{}';
  let parsed: any = {};
  try {
    const clean = raw.replace(/^```json\n?|```$/g, '').trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    throw new Error('Failed to parse regenerated sections');
  }

  const sections = {
    strategicAnalysis: parsed.strategicAnalysis || '## 2. Strategic Analysis\n',
    proposedSolutions: parsed.proposedSolutions || '## 3. Proposed Solutions\n',
    implementationRoadmap: parsed.implementationRoadmap || '## 4. Implementation Roadmap\n',
    investmentOverview: parsed.investmentOverview || '## 5. Investment Overview\n',
    partnershipBenefits: parsed.partnershipBenefits || '## 6. Partnership Benefits\n',
    nextSteps: parsed.nextSteps || '## 7. Next Steps\n',
    callToAction: parsed.callToAction || '## 8. Call to Action\n',
  };

  const full = [
    '## 1. Executive Brief',
    executiveBriefMarkdown.trim(),
    sections.strategicAnalysis.trim().startsWith('## 2.') ? sections.strategicAnalysis.trim() : `## 2. Strategic Analysis\n${sections.strategicAnalysis.trim()}`,
    sections.proposedSolutions.trim().startsWith('## 3.') ? sections.proposedSolutions.trim() : `## 3. Proposed Solutions\n${sections.proposedSolutions.trim()}`,
    sections.implementationRoadmap.trim().startsWith('## 4.') ? sections.implementationRoadmap.trim() : `## 4. Implementation Roadmap\n${sections.implementationRoadmap.trim()}`,
    sections.investmentOverview.trim().startsWith('## 5.') ? sections.investmentOverview.trim() : `## 5. Investment Overview\n${sections.investmentOverview.trim()}`,
    sections.partnershipBenefits.trim().startsWith('## 6.') ? sections.partnershipBenefits.trim() : `## 6. Partnership Benefits\n${sections.partnershipBenefits.trim()}`,
    sections.nextSteps.trim().startsWith('## 7.') ? sections.nextSteps.trim() : `## 7. Next Steps\n${sections.nextSteps.trim()}`,
    sections.callToAction.trim().startsWith('## 8.') ? sections.callToAction.trim() : `## 8. Call to Action\n${sections.callToAction.trim()}`,
  ].join('\n\n');

  return full;
}
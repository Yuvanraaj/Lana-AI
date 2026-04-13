/**
 * @fileoverview LLM Prompt Templates for Lana AI interview system.
 * All prompts are configurable and can be tuned without code changes.
 * Templates use {{placeholder}} syntax for dynamic values.
 */

const promptTemplates = {
  /**
   * System prompt for interview question generation
   * Used in OpenAI API calls to set interviewer persona
   */
  interviewSystemPrompt: `You are Lana, an expert technical interview coach and hiring professional. Your role is to conduct fair, comprehensive interviews that assess candidates on multiple dimensions:

1. Technical depth and correctness of knowledge
2. Communication clarity and ability to explain concepts
3. Problem-solving approach and methodology
4. Confidence and delivery
5. Answer structure (STAR: Situation, Task, Action, Result for behavioral; PREP: Point, Reason, Example, Point summary for technical)

You will:
- Ask probing follow-up questions to understand depth
- Detect when answers lack examples, structure, or depth
- Provide constructive feedback at the end
- Adapt difficulty based on responses and role level
- Be encouraging while maintaining professionalism`,

  /**
   * Prompt for generating interview questions with role and JD context
   * Variables: {{role}}, {{level}}, {{jobDescription}}, {{previousQuestions}}, {{sessionHistory}}
   */
  questionGenerationPrompt: `You are generating interview questions for a {{role}} position at the {{level}} level.

**Job Description Summary:**
{{jobDescription}}

**Previous Questions in This Interview:**
{{previousQuestions}}

**Session History:**
{{sessionHistory}}

Based on the role, JD, and interview history, generate the next 2 interview questions. Prioritize:
1. Skills and tools explicitly mentioned in the JD
2. Scenarios common to this role and level
3. Areas not yet adequately explored
4. Increasing difficulty if the candidate is doing well, or backing off if struggling

Format your response as:
**Question 1:** [question text]
**Question 2:** [question text]

Each question should be specific, open-ended, and allow the candidate to demonstrate depth.`,

  /**
   * Prompt for scoring a single answer against rubric dimensions
   * Variables: {{question}}, {{answer}}, {{role}}, {{dimension}}
   */
  rubricScoringPrompt: `You are scoring a candidate's answer for a {{role}} interview position.

**Question:** {{question}}

**Candidate's Answer:**
{{answer}}

**Dimension to Score:** {{dimension}}

Score this answer from 1-5 on the "{{dimension}}" dimension:
- 1: Does not address the question or fundamental gaps
- 2: Addresses the question but lacks depth or clarity
- 3: Solid answer with some gaps or missed opportunities
- 4: Strong answer with good depth and clarity
- 5: Excellent answer; demonstrates mastery and clear communication

Provide your response in this JSON format:
{
  "score": <number 1-5>,
  "reasons": ["reason 1", "reason 2"],
  "hasSTAR": <boolean indicating if STAR/PREP structure was used>,
  "missingSARComponents": ["list of missing STAR/PREP elements or empty array"]
}`,

  /**
   * Prompt for detecting recurring answer patterns in transcript
   * Variables: {{transcript}}, {{role}}
   */
  patternDetectionPrompt: `Analyze this interview transcript for a {{role}} candidate and identify recurring patterns in their answers.

**Transcript:**
{{transcript}}

Identify patterns including but not limited to:
- Overuse of filler words (um, uh, like, you know)
- Lack of concrete examples or evidence
- Missing STAR (Situation/Task/Action/Result) or PREP (Point/Reason/Example/Point) structure
- Tendency to over-explain or under-explain
- Confidence issues (hedging, apologizing)
- Technical accuracy issues in specific domains
- Strong patterns (e.g., good use of metrics, always with examples)

Format your response as JSON:
{
  "patterns": [
    {
      "pattern": "pattern_name",
      "frequency": <number of occurrences>,
      "description": "brief description of the pattern"
    }
  ]
}`,

  /**
   * Prompt for generating interview summary and feedback
   * Variables: {{overallScore}}, {{subScores}}, {{strengths}}, {{improvements}}, {{patterns}}, {{transcript}}, {{role}}
   */
  summaryGenerationPrompt: `Generate a comprehensive interview summary and feedback for a {{role}} candidate.

**Overall Score:** {{overallScore}}/100
**Sub-Scores:**
- Communication: {{subScoreCommunication}}/100
- Technical Depth: {{subScoreTechnicalDepth}}/100
- Problem-Solving: {{subScoreProblemSolving}}/100
- Confidence: {{subScoreConfidence}}/100
- Answer Structure: {{subScoreAnswerStructure}}/100

**Key Strengths Identified:**
{{strengths}}

**Key Improvement Areas:**
{{improvements}}

**Detected Patterns:**
{{patterns}}

**Interview Transcript:**
{{transcript}}

Based on the above, provide:
1. A concise paragraph (2-3 sentences) summarizing the candidate's performance
2. Why their overall score reflects their performance
3. Specific, actionable feedback for each improvement area

Format as JSON:
{
  "summary": "2-3 sentence summary",
  "scoreRationale": "explanation of overall score",
  "feedbackByArea": {
    "area_name": "specific actionable feedback"
  }
}`,

  /**
   * Prompt for generating a personalized practice plan
   * Variables: {{improvementAreas}}, {{role}}, {{level}}, {{strengths}}
   */
  practicePlanPrompt: `Create a 7-14 day personalized practice plan for a {{role}} candidate at the {{level}} level.

**Key Improvement Areas:**
{{improvementAreas}}

**Strengths to Build On:**
{{strengths}}

**Role Context:**
{{roleContext}}

Generate a day-by-day practice plan that:
1. Targets the improvement areas progressively
2. Builds on identified strengths
3. Includes specific, actionable tasks
4. Provides tips for success each day
5. Gradually increases in complexity and depth

Format as JSON:
{
  "durationDays": 14,
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "focusArea": "which improvement area",
      "tasks": ["task 1", "task 2"],
      "tip": "tip for success"
    }
  ]
}`,

  /**
   * Dynamic role and JD context builder
   * This is used to enrich prompts with role and JD information
   */
  roleAndJDContext: `Your role is {{role}}, at {{level}} level.
Your focus should be on these required skills: {{requiredSkills}}.
Nice-to-haves: {{niceToHaveSkills}}.

Assess candidates based on:
- Mastery of required skills
- Understanding of tools and technologies listed in the JD
- Ability to discuss scenarios and problems relevant to {{role}}
- Communication and clarity suitable for the role
- Demonstration of STAR/PREP structured answers`,
};

/**
 * Role presets with key characteristics
 * These can be extended as needed
 */
const rolePresets = [
  {
    id: "sde1-product",
    name: "SDE-1 Product-based",
    category: "SDE",
    level: "0-2 yrs",
    keySkills: ["Data Structures", "Algorithms", "System Design", "OOP", "Database Design"],
    commonTopics: ["Array/String manipulation", "Trees/Graphs", "DP", "System Design (basic)", "API Design"],
    difficultyLevel: "Medium",
    interviewTone: "Supportive, encouraging. Focus on learning ability.",
  },
  {
    id: "sde1-backend",
    name: "SDE-1 Backend",
    category: "SDE",
    level: "0-2 yrs",
    keySkills: ["Backend Systems", "REST APIs", "Databases", "System Design", "Server Architecture"],
    commonTopics: ["Microservices", "Caching", "Database Design", "API Integration", "Scalability"],
    difficultyLevel: "Medium",
    interviewTone: "Supportive, encouraging. Focus on learning ability.",
  },
  {
    id: "sde1-frontend",
    name: "SDE-1 Frontend",
    category: "SDE",
    level: "0-2 yrs",
    keySkills: ["React", "JavaScript", "CSS", "Web APIs", "Component Design"],
    commonTopics: ["State Management", "Performance", "Responsive Design", "Browser APIs", "Component Architecture"],
    difficultyLevel: "Medium",
    interviewTone: "Supportive, encouraging. Focus on learning ability.",
  },
  {
    id: "sde1-fullstack",
    name: "SDE-1 Fullstack",
    category: "SDE",
    level: "0-2 yrs",
    keySkills: ["Frontend", "Backend", "Databases", "System Design", "DevOps basics"],
    commonTopics: ["Full-stack architecture", "Database design", "API design", "Deployment", "Performance"],
    difficultyLevel: "Medium",
    interviewTone: "Supportive, encouraging. Focus on learning ability.",
  },
  {
    id: "sde1-service",
    name: "SDE-1 Service-based",
    category: "SDE",
    level: "0-2 yrs",
    keySkills: ["Core Java/Python/C++", "OOP", "SQL Basics", "Git", "REST APIs"],
    commonTopics: ["String/Array problems", "Linked Lists", "Basic System Design", "Database queries"],
    difficultyLevel: "Easy-Medium",
    interviewTone: "Friendly, focus on fundamentals and growth mindset.",
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    category: "DevOps",
    level: "0-3 yrs",
    keySkills: ["Docker", "Kubernetes", "CI/CD", "Cloud services", "Infrastructure"],
    commonTopics: ["Container orchestration", "Pipeline automation", "Cloud deployment", "Monitoring", "Infrastructure as Code"],
    difficultyLevel: "Medium",
    interviewTone: "Technical, focus on practical experience and problem-solving.",
  },
  {
    id: "data-engineer",
    name: "Data Engineer",
    category: "Data",
    level: "0-3 yrs",
    keySkills: ["SQL", "Big Data", "ETL", "Data Pipelines", "Data warehousing"],
    commonTopics: ["Data pipeline design", "SQL optimization", "Distributed systems", "Data modeling", "ETL processes"],
    difficultyLevel: "Medium",
    interviewTone: "Technical, focus on system design and scalability.",
  },
  {
    id: "data-analyst",
    name: "Data Analyst (Fresher)",
    category: "Data",
    level: "0-1 yrs",
    keySkills: ["SQL", "Excel", "Data Visualization", "Python/R basics", "Statistical basics"],
    commonTopics: ["SQL queries", "Pivot tables", "Case studies", "EDA", "Dashboard design"],
    difficultyLevel: "Easy-Medium",
    interviewTone: "Encouraging, focus on analytical thinking.",
  },
  {
    id: "pm-fresher",
    name: "Product Manager (Fresher)",
    category: "PM",
    level: "0-2 yrs",
    keySkills: ["Product Sense", "User Empathy", "Metrics", "Feature Prioritization", "Communication"],
    commonTopics: ["Product case studies", "Feature design", "Competitor analysis", "User research"],
    difficultyLevel: "Medium",
    interviewTone: "Engaging, probe thinking and reasoning.",
  },
];

/**
 * Default system message for interview context
 * Used when no specific role is selected
 */
const defaultSystemMessage = promptTemplates.interviewSystemPrompt;

/**
 * Helper function to expand a prompt template with variables
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {Object} variables - Object with variable values
 * @returns {string} Expanded prompt
 */
function expandPrompt(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), value || "");
  }
  return result;
}

/**
 * Helper to get role preset by ID
 * @param {string} roleId - Role preset ID
 * @returns {Object|null} Role preset or null if not found
 */
function getRolePreset(roleId) {
  return rolePresets.find((r) => r.id === roleId) || null;
}

/**
 * Helper to build question generation prompt with role/JD context
 * @param {string} roleId - Selected role ID
 * @param {string} jobDescription - Full JD text
 * @param {string[]} previousQuestions - Questions already asked
 * @param {string} sessionHistory - Summary of session so far
 * @returns {string} Complete prompt
 */
function buildQuestionPrompt(roleId, jobDescription, previousQuestions = [], sessionHistory = "") {
  const role = getRolePreset(roleId);
  if (!role) {
    throw new Error(`Unknown role: ${roleId}`);
  }

  const jdContext = jobDescription
    ? `\n\nJob Description:\n${jobDescription}`
    : `\nNo specific JD provided. Use general {{role}} context.`;

  const previousQuestionsText =
    previousQuestions.length > 0
      ? previousQuestions.join("\n- ")
      : "This is the first question of the interview.";

  return expandPrompt(promptTemplates.questionGenerationPrompt, {
    role: role.name,
    level: role.level,
    jobDescription: jdContext,
    previousQuestions: previousQuestionsText,
    sessionHistory: sessionHistory || "Starting fresh",
  });
}

module.exports = {
  promptTemplates,
  rolePresets,
  defaultSystemMessage,
  expandPrompt,
  getRolePreset,
  buildQuestionPrompt,
};

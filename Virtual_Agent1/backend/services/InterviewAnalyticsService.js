/**
 * @fileoverview Interview Analytics Service
 * Handles generation of interview summaries, rubric scoring, pattern detection,
 * and practice plan generation.
 */

const OpenAI = require("openai");
const { expandPrompt, getRolePreset, promptTemplates } = require("../config/llmPrompts");

class InterviewAnalyticsService {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Score a single answer against all rubric dimensions
   * @param {string} question - The interview question
   * @param {string} answer - The candidate's answer
   * @param {string} role - Role preset ID
   * @returns {Promise<Object>} Rubric scores for this answer
   */
  async scoreAnswer(question, answer, role = "sde1-product") {
    const rubricDimensions = [
      "Content correctness",
      "Depth of explanation",
      "Communication clarity",
      "Structure (STAR/PREP)",
      "Confidence & delivery",
    ];

    const rolePreset = getRolePreset(role);
    const roleContext = rolePreset ? `(Role: ${rolePreset.name})` : "";

    const dimensionScores = [];
    let totalScore = 0;

    for (const dimension of rubricDimensions) {
      try {
        const prompt = expandPrompt(promptTemplates.rubricScoringPrompt, {
          question,
          answer,
          role: roleContext,
          dimension,
        });

        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 300,
        });

        const content = response.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(content);

        dimensionScores.push({
          dimension,
          score: parsed.score || 3,
          reasons: parsed.reasons || [],
          hasSTAR: parsed.hasSTAR || false,
          missingSARComponents: parsed.missingSARComponents || [],
        });

        totalScore += parsed.score || 3;
      } catch (e) {
        console.error(`Error scoring dimension "${dimension}":`, e.message);
        dimensionScores.push({
          dimension,
          score: 3,
          reasons: ["Unable to evaluate this dimension"],
          hasSTAR: false,
          missingSARComponents: [],
        });
        totalScore += 3;
      }
    }

    return {
      questionId: this._generateId(),
      question,
      answer,
      dimensionScores,
      overallAnswerScore: Math.round((totalScore / rubricDimensions.length) * 20), // Convert 1-5 scale to 0-100
    };
  }

  /**
   * Detect patterns in the full interview transcript
   * @param {string} transcript - Full interview transcript
   * @param {string} role - Role preset ID
   * @returns {Promise<Array>} Array of detected patterns
   */
  async detectPatterns(transcript, role = "sde1-product") {
    try {
      const rolePreset = getRolePreset(role);
      const roleContext = rolePreset ? `(Role: ${rolePreset.name})` : "";

      const prompt = expandPrompt(promptTemplates.patternDetectionPrompt, {
        transcript,
        role: roleContext,
      });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      return parsed.patterns || [];
    } catch (e) {
      console.error("Error detecting patterns:", e.message);
      return [];
    }
  }

  /**
   * Generate interview summary with strengths and improvement areas
   * @param {Object} sessionData - Session data including answers, scores, and transcript
   * @returns {Promise<Object>} Interview summary
   */
  async generateInterviewSummary(sessionData) {
    const {
      sessionId,
      userId,
      role = "sde1-product",
      answerRubrics = [],
      transcript = "",
      detectedPatterns = [],
    } = sessionData;

    // Calculate sub-scores based on rubrics
    const subScores = this._calculateSubScores(answerRubrics);
    const overallScore = Math.round(
      (subScores.communication +
        subScores.technicalDepth +
        subScores.problemSolving +
        subScores.confidence +
        subScores.answerStructure) /
        5
    );

    // Extract strengths and improvements
    const { strengths, improvements } = this._extractStrengthsAndImprovements(
      answerRubrics,
      detectedPatterns,
      subScores
    );

    // Build summary with LLM
    let summary = { text: "", scoreRationale: "", feedbackByArea: {} };
    try {
      const rolePreset = getRolePreset(role);
      const summaryPrompt = expandPrompt(promptTemplates.summaryGenerationPrompt, {
        overallScore,
        subScoreCommunication: subScores.communication,
        subScoreTechnicalDepth: subScores.technicalDepth,
        subScoreProblemSolving: subScores.problemSolving,
        subScoreConfidence: subScores.confidence,
        subScoreAnswerStructure: subScores.answerStructure,
        strengths: strengths.join(", "),
        improvements: improvements.join(", "),
        patterns: detectedPatterns.map((p) => `${p.pattern} (${p.frequency}x)`).join(", "),
        transcript: transcript.substring(0, 2000), // Limit to 2000 chars to avoid token overflow
        role: rolePreset?.name || "General",
      });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: summaryPrompt }],
        temperature: 0.7,
        max_tokens: 600,
      });

      const content = response.choices[0]?.message?.content || "{}";
      summary = JSON.parse(content);
    } catch (e) {
      console.error("Error generating summary text:", e.message);
      summary = { text: "Unable to generate detailed summary", scoreRationale: "", feedbackByArea: {} };
    }

    return {
      sessionId,
      userId,
      role,
      jdSummary: sessionData.jdSummary || "",
      overallScore,
      subScores,
      answerRubrics,
      detectedPatterns,
      strengths: strengths.slice(0, 3),
      improvementAreas: improvements.slice(0, 3),
      transcript,
      duration: sessionData.duration || 0,
      createdAt: sessionData.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      summaryText: summary.text || "",
      scoreRationale: summary.scoreRationale || "",
      feedbackByArea: summary.feedbackByArea || {},
    };
  }

  /**
   * Generate a personalized practice plan based on improvement areas
   * @param {Object} summary - Interview summary
   * @param {string} role - Role preset ID
   * @returns {Promise<Object>} Practice plan
   */
  async generatePracticePlan(summary, role = "sde1-product") {
    const { improvements = [], strengths = [] } = summary;
    const rolePreset = getRolePreset(role);

    try {
      const prompt = expandPrompt(promptTemplates.practicePlanPrompt, {
        improvementAreas: improvements.join(", "),
        role: rolePreset?.name || "Software Engineer",
        level: rolePreset?.level || "General",
        strengths: strengths.join(", "),
        roleContext: rolePreset?.commonTopics?.join(", ") || "General technical skills",
      });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1200,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);

      return {
        sessionId: summary.sessionId,
        durationDays: parsed.durationDays || 14,
        days: parsed.days || [],
        createdAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error("Error generating practice plan:", e.message);
      return {
        sessionId: summary.sessionId,
        durationDays: 7,
        days: this._generateDefaultPracticePlan(summary),
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Calculate sub-scores from answer rubrics
   * @private
   */
  _calculateSubScores(answerRubrics) {
    const dimensionMap = {
      "Content correctness": "technicalDepth",
      "Depth of explanation": "technicalDepth",
      "Communication clarity": "communication",
      "Structure (STAR/PREP)": "answerStructure",
      "Confidence & delivery": "confidence",
    };

    const scores = {
      communication: 0,
      technicalDepth: 0,
      problemSolving: 0,
      confidence: 0,
      answerStructure: 0,
    };

    let counts = { ...scores };

    for (const rubric of answerRubrics) {
      for (const dimScore of rubric.dimensionScores || []) {
        const key = dimensionMap[dimScore.dimension] || "problemSolving";
        scores[key] += dimScore.score || 3;
        counts[key]++;
      }
    }

    // Normalize to 0-100 scale
    for (const key of Object.keys(scores)) {
      scores[key] = counts[key] > 0 ? Math.round((scores[key] / counts[key]) * 20) : 60;
    }

    return scores;
  }

  /**
   * Extract strengths and improvements from rubrics and patterns
   * @private
   */
  _extractStrengthsAndImprovements(answerRubrics, patterns, subScores) {
    const strengths = [];
    const improvements = [];

    // Based on high sub-scores
    if (subScores.communication > 75) strengths.push("Clear and articulate communication");
    if (subScores.technicalDepth > 75) strengths.push("Strong technical knowledge");
    if (subScores.answerStructure > 75) strengths.push("Well-structured answers with examples");
    if (subScores.confidence > 75) strengths.push("Confident delivery and composure");
    if (subScores.problemSolving > 75) strengths.push("Sound problem-solving approach");

    // Based on low sub-scores
    if (subScores.communication < 60) improvements.push("Improve clarity and avoid jargon overload");
    if (subScores.technicalDepth < 60) improvements.push("Deepen technical knowledge in core areas");
    if (subScores.answerStructure < 60) improvements.push("Use STAR/PREP structure to organize answers");
    if (subScores.confidence < 60) improvements.push("Build confidence through more practice");
    if (subScores.problemSolving < 60) improvements.push("Develop a more structured problem-solving approach");

    // Based on detected patterns
    for (const pattern of patterns) {
      if (pattern.pattern === "filler_words" && pattern.frequency > 3) {
        improvements.push("Reduce filler words (um, uh, like) – breathe and pause instead");
      }
      if (pattern.pattern === "lack_of_examples" && pattern.frequency > 2) {
        improvements.push("Include concrete examples in every technical answer");
      }
      if (pattern.pattern === "missing_star" && pattern.frequency > 1) {
        improvements.push("Follow STAR structure for behavioral and situational questions");
      }
    }

    // Pad to ensure we have at least 3 of each
    while (strengths.length < 3) {
      strengths.push("Good effort and willingness to improve");
    }
    while (improvements.length < 3) {
      improvements.push("Continue practicing and refining your approach");
    }

    return {
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
    };
  }

  /**
   * Generate a default practice plan when LLM fails
   * @private
   */
  _generateDefaultPracticePlan(summary) {
    const improvements = summary.improvementAreas || [];
    const days = [];

    const defaultActivities = {
      "Improve clarity and avoid jargon overload": [
        "Record yourself answering 3 interview questions",
        "Watch and identify where you could simplify language",
      ],
      "Deepen technical knowledge in core areas": [
        "Study 2-3 key algorithms/concepts for your role",
        "Implement a small project using these concepts",
      ],
      "Use STAR/PREP structure to organize answers": [
        "Learn the STAR and PREP frameworks",
        "Practice 5 questions using these structures",
      ],
      "Build confidence through more practice": [
        "Do 2 mock interviews with feedback",
        "Review and analyze your performance",
      ],
      "Develop a more structured problem-solving approach": [
        "Break down problems into clear steps",
        "Practice thinking aloud while solving",
      ],
    };

    for (let i = 1; i <= 7; i++) {
      const focusArea = improvements[(i - 1) % improvements.length] || "General Improvement";
      const tasks = defaultActivities[focusArea] || ["Practice interview questions", "Record yourself"];

      days.push({
        day: i,
        title: `Day ${i}: ${focusArea}`,
        focusArea,
        tasks:tasks.slice(0, 2),
        tip: "Focus on quality over quantity. Record yourself for feedback.",
      });
    }

    return days;
  }

  /**
   * Generate a simple unique ID
   * @private
   */
  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

module.exports = InterviewAnalyticsService;

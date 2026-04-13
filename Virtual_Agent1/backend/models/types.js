/**
 * @fileoverview TypeScript-like interfaces for Lana AI interview system.
 * These interfaces define the shape of data structures used throughout the backend.
 */

/**
 * Rubric dimension score for a single answer
 * @typedef {Object} RubricDimensionScore
 * @property {string} dimension - Name of the dimension (e.g., "Content correctness", "Communication clarity")
 * @property {number} score - Score from 1-5
 * @property {string[]} reasons - 1-2 bullet reasons for the score
 * @property {boolean} hasSTAR - Whether the answer followed STAR structure
 * @property {string[]} missingSARComponents - Components of STAR/PREP that were missing
 */

/**
 * Per-answer rubric scores
 * @typedef {Object} AnswerRubric
 * @property {string} questionId - Unique question identifier
 * @property {string} question - The question asked
 * @property {string} answer - The candidate's answer
 * @property {RubricDimensionScore[]} dimensionScores - Array of dimension scores
 * @property {number} overallAnswerScore - Average score for this answer (0-100)
 */

/**
 * Detected answer pattern from transcript
 * @typedef {Object} AnswerPattern
 * @property {string} pattern - Name of the pattern (e.g., "filler_words", "lack_of_examples", "missing_star")
 * @property {number} frequency - How many times detected
 * @property {string} description - Short description of the pattern
 */

/**
 * Interview summary generated after session completion
 * @typedef {Object} InterviewSummary
 * @property {string} sessionId - Unique session identifier
 * @property {string} userId - User identifier (if available)
 * @property {string} role - Selected role preset (e.g., "SDE-1 Product-based")
 * @property {string} jdSummary - Short summary of the JD if provided
 * @property {number} overallScore - Overall score from 0-100
 * @property {Object} subScores - Score breakdown
 * @property {number} subScores.communication - Communication score (0-100)
 * @property {number} subScores.technicalDepth - Technical depth score (0-100)
 * @property {number} subScores.problemSolving - Problem-solving score (0-100)
 * @property {number} subScores.confidence - Confidence score (0-100)
 * @property {number} subScores.answerStructure - Answer structure score (0-100)
 * @property {AnswerRubric[]} answerRubrics - Rubrics for each answer
 * @property {AnswerPattern[]} detectedPatterns - Patterns detected in answers
 * @property {string[]} strengths - 3 key strengths
 * @property {string[]} improvementAreas - 3 key improvement areas
 * @property {string} transcript - Full interview transcript
 * @property {number} duration - Duration in seconds
 * @property {string} createdAt - ISO timestamp
 * @property {string} completedAt - ISO timestamp
 */

/**
 * Practice plan for improvement
 * @typedef {Object} PracticePlanItem
 * @property {number} day - Day number (1-14)
 * @property {string} title - Title of the day's practice
 * @property {string} focusArea - Which improvement area this targets
 * @property {string[]} tasks - Tasks for this day
 * @property {string} tip - Tip for success
 */

/**
 * @typedef {Object} PracticePlan
 * @property {string} sessionId - Reference to the interview session
 * @property {number} durationDays - 7 or 14 day plan
 * @property {PracticePlanItem[]} days - Day-by-day breakdown
 * @property {string} createdAt - ISO timestamp
 */

/**
 * Role preset configuration
 * @typedef {Object} RolePreset
 * @property {string} id - Unique identifier
 * @property {string} name - Display name (e.g., "SDE-1 Product-based")
 * @property {string} category - Category (e.g., "SDE", "Data Analyst", "PM")
 * @property {string} level - Level (e.g., "Fresher", "1-3 yrs", "3+ yrs")
 * @property {string[]} keySkills - Key skills expected
 * @property {string[]} commonTopics - Common topics to expect
 * @property {string} difficultyLevel - "Easy", "Medium", "Hard"
 * @property {string} interviewTone - Tone for the interviewer
 */

/**
 * Interview session context with role and JD
 * @typedef {Object} InterviewSession
 * @property {string} sessionId - Unique session identifier
 * @property {string} userId - User identifier
 * @property {RolePreset|null} rolePreset - Selected role or null
 * @property {string} jobDescription - Full JD text if provided
 * @property {Object} jdParsed - Parsed JD fields
 * @property {string[]} jdParsed.requiredSkills - Extracted required skills
 * @property {string[]} jdParsed.niceToHaveSkills - Extracted nice-to-have skills
 * @property {string} jdParsed.summary - Short summary of the JD
 * @property {string} status - "in_progress", "completed", "abandoned"
 * @property {Object[]} questions - Questions asked in this session
 * @property {Object[]} answers - Answers provided in this session
 * @property {string} createdAt - ISO timestamp
 * @property {string|null} completedAt - ISO timestamp or null
 * @property {InterviewSummary|null} summary - Interview summary (when completed)
 * @property {PracticePlan|null} practicePlan - Generated practice plan
 */

module.exports = {
  // These are interface definitions, used as documentation
  // Actual instantiation will use plain JavaScript objects
};

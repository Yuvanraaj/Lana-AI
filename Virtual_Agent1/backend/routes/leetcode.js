const express = require('express');
const router = express.Router();
const axios = require('axios');

// Popular LeetCode problems to choose from
const LEETCODE_PROBLEMS = [
  'two-sum',
  'add-two-numbers',
  'longest-substring-without-repeating-characters',
  'median-of-two-sorted-arrays',
  'longest-palindromic-substring',
  'zigzag-conversion',
  'reverse-integer',
  'string-to-integer-atoi',
  'palindrome-number',
  'container-with-most-water',
  'regular-expression-matching',
  'merge-k-sorted-lists',
  'merge-intervals',
  'insert-interval',
  'search-in-rotated-sorted-array',
  'search-for-a-range',
  'find-first-and-last-position-of-element-in-sorted-array',
  'search-insert-position',
  'valid-sudoku',
  'sudoku-solver',
  'count-and-say',
  'combination-sum',
  'combination-sum-ii',
  'permutations',
  'permutations-ii',
  'rotate-image',
  'group-anagrams',
  'pow-x-n',
  'n-queens',
  'n-queens-ii',
  'maximum-subarray',
  'spiral-matrix',
  'merge-sorted-array',
  'merge-two-sorted-lists',
  'reverse-nodes-in-k-group',
  'remove-duplicates-from-sorted-array',
  'remove-element',
  'implement-strstr',
  'divide-two-integers',
  'substring-with-concatenation-of-all-words',
  'next-permutation',
  'longest-valid-parentheses',
  'search-in-rotated-sorted-array-ii',
  'remove-duplicates-from-sorted-array-ii',
];

// GraphQL query to fetch full question details
const getQuestionQuery = (titleSlug) => ({
  query: `
    query getQuestion($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        content
        exampleTestcases
        topicTags {
          name
        }
        stats
      }
    }
  `,
  variables: { titleSlug }
});

/**
 * GET /api/leetcode/random
 * Fetch a random LeetCode problem with full details
 */
router.get('/random', async (req, res) => {
  try {
    // Pick a random problem
    const randomProblem = LEETCODE_PROBLEMS[
      Math.floor(Math.random() * LEETCODE_PROBLEMS.length)
    ];

    console.log(`[LeetCode] Fetching random problem: ${randomProblem}`);

    // Try to fetch from LeetCode API with timeout
    try {
      const response = await axios.post('https://leetcode.com/graphql', 
        getQuestionQuery(randomProblem),
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://leetcode.com'
          },
          timeout: 8000
        }
      );

      const data = response.data;

      if (data.errors) {
        console.error('[LeetCode] GraphQL Errors:', data.errors);
        throw new Error('GraphQL Error');
      }

      if (!data.data?.question) {
        console.error('[LeetCode] No question in response');
        throw new Error('No question data');
      }

      const question = data.data.question;
      const formattedQuestion = formatQuestion(question);

      console.log(`[LeetCode] Successfully fetched: ${formattedQuestion.title}`);
      return res.json(formattedQuestion);
    } catch (apiError) {
      console.error(`[LeetCode] API failed for ${randomProblem}:`, apiError.message);
      throw apiError;
    }
  } catch (error) {
    console.error('[LeetCode] Error fetching question:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch question',
      message: error.message 
    });
  }
});

/**
 * GET /api/leetcode/question/:slug
 * Fetch a specific LeetCode problem by slug
 */
router.get('/question/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    console.log(`[LeetCode] Fetching problem: ${slug}`);

    // Try to fetch from LeetCode API with timeout
    try {
      const response = await axios.post('https://leetcode.com/graphql',
        getQuestionQuery(slug),
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://leetcode.com'
          },
          timeout: 8000
        }
      );

      const data = response.data;

      if (data.errors) {
        console.error('[LeetCode] GraphQL Errors:', data.errors);
        throw new Error('GraphQL Error');
      }

      if (!data.data?.question) {
        console.error('[LeetCode] No question in response');
        throw new Error('No question data');
      }

      const question = data.data.question;
      const formattedQuestion = formatQuestion(question);

      console.log(`[LeetCode] Successfully fetched: ${formattedQuestion.title}`);
      return res.json(formattedQuestion);
    } catch (apiError) {
      console.error(`[LeetCode] API failed for ${slug}:`, apiError.message);
      throw apiError;
    }
  } catch (error) {
    console.error('[LeetCode] Error fetching question:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch question',
      message: error.message 
    });
  }
});

/**
 * GET /api/leetcode/problems
 * List available problems
 */
router.get('/problems', (req, res) => {
  res.json({
    total: LEETCODE_PROBLEMS.length,
    problems: LEETCODE_PROBLEMS
  });
});

/**
 * Helper function to format LeetCode question response
 */
function formatQuestion(question) {
  const content = question.content || '';
  
  // Extract description, constraints, input format, output format from HTML content
  const description = extractSection(content, ['<p>', '</p>']);
  const constraints = extractSection(content, ['Constraints:', '<li>']);
  const examples = extractSection(content, ['Example', '<pre>']);
  const inputFormat = extractSection(content, ['Input:', '<p>']);
  const outputFormat = extractSection(content, ['Output:', '<p>']);

  return {
    id: question.questionId,
    title: question.title,
    titleSlug: question.titleSlug,
    difficulty: question.difficulty,
    description: cleanHtml(content),
    examples: question.exampleTestcases || '',
    tags: question.topicTags?.map(tag => tag.name) || [],
    stats: question.stats ? JSON.parse(question.stats) : {}
  };
}

/**
 * Helper function to extract sections from HTML content
 */
function extractSection(content, markers) {
  try {
    if (!content) return '';
    
    const start = content.indexOf(markers[0]);
    if (start === -1) return '';
    
    const end = content.indexOf(markers[1], start);
    if (end === -1) return content.substring(start);
    
    return content.substring(start, end + markers[1].length);
  } catch (e) {
    return '';
  }
}

/**
 * Helper function to clean HTML tags
 */
function cleanHtml(html) {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

module.exports = router;

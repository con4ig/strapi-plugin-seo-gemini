import type { Core } from '@strapi/strapi';
import { GoogleGenerativeAI } from '@google/generative-ai';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Analyzes text content and generates optimized SEO metadata using Google Gemini AI.
   * 
   * This service enforces strict JSON response formatting to ensure integration stability.
   * It implements a fallback mechanism, sequentially attempting to use 'gemini-2.5-flash',
   * 'gemini-2.0-flash', and 'gemini-1.5-flash' to mitigate potential 503 or 429 API errors.
   * The API key must be securely configured via Strapi config (`config/plugins.ts`) or 
   * via the `GEMINI_API_KEY` environment variable.
   * 
   * @param {string} content - The raw text content (e.g., an article body) to be analyzed.
   * @returns {Promise<Record<string, unknown>>} A Promise that resolves to a parsed JSON object containing:
   *   - {string} title - Optimized SEO Title (max 60 chars).
   *   - {string} description - Optimized Meta Description (max 160 chars).
   *   - {string|string[]} keywords - Relevant SEO keywords.
   *   - {string} metaRobots - Indexing instructions (e.g., "index, follow").
   *   - {Record<string, unknown>} structuredData - A JSON-LD object for schema.org markup.
   * @throws {Error} If `content` is empty.
   * @throws {Error} If all configured Gemini models fail to generate a response.
   */
  async generateSeo(content: string) {
    if (!content) {
      throw new Error('Content is required to generate SEO');
    }

    // @ts-ignore - strapi config typing is incomplete
    const config = strapi.config.get('plugin::strapi-plugin-seo-gemini') as { apiKey?: string };
    const apiKey = config?.apiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      strapi.log.warn('SEO Gemini: GEMINI_API_KEY or plugin config is missing');
      return {
        title: 'SEO Gemini | Key Missing',
        description: 'Please configure the API Key in config/plugins.ts or .env to enable AI generation.',
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        strapi.log.info(`SEO Gemini: Generating with ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          }
        });

        const prompt = `
          You are an expert SEO copywriter.
          Analyze the following content and generate concise, highly optimized SEO metadata.
          
          Requirements:
          1. "title": Compelling title (max 60 chars).
          2. "description": Compelling summary (max 160 chars).
          3. "keywords": Relevant keywords, comma-separated.
          4. "metaRobots": "index, follow".
          5. "structuredData": Valid JSON-LD Article/WebPage schema. Return as object.
          
          Return ONLY valid JSON in this exact format:
          {
            "title": "Optimized Title",
            "description": "Optimized Description",
            "keywords": "k1, k2, k3",
            "metaRobots": "index, follow",
            "structuredData": {}
          }
          
          Content:
          ${content}
        `;

        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());

        strapi.log.info(`SEO Gemini: Success with ${modelName}`);
        return parsed;
      } catch (err: unknown) {
        lastError = err;
        const errorMessage = err instanceof Error ? err.message : String(err);
        strapi.log.warn(`SEO Gemini: ${modelName} failed: ${errorMessage}`);
        // If it's a quote or service error, try next model.
        continue;
      }
    }

    const finalErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`All Gemini models failed. Last error: ${finalErrorMessage}`);
  },
});

export default service;

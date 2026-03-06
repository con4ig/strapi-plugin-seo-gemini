import type { Core } from '@strapi/strapi';
import { GoogleGenerativeAI } from '@google/generative-ai';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Analyzes text content and generates optimized SEO metadata using Google Gemini AI.
   *
   * This service enforces strict JSON response formatting to ensure integration stability.
   * It implements a fallback mechanism, sequentially attempting to use 'gemini-2.5-flash',
   * 'gemini-2.0-flash', and 'gemini-1.5-flash' to mitigate potential 503 or 429 API errors.
   *
   * @param {string} content - Raw text content for analysis.
   * @returns {Promise<Record<string, unknown>>} Parsed JSON metadata.
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
        description:
          'Please configure the API Key in config/plugins.ts or .env to enable AI generation.',
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
            responseMimeType: 'application/json',
          },
        });

        const prompt = `
          You are an expert SEO copywriter.
          Analyze the following content and generate concise, highly optimized SEO metadata.
          
          CRITICAL REQUIREMENTS:
          1. "title": Compelling title < 60 chars.
          2. "description": Compelling summary < 160 chars.
          3. "keywords": Comma-separated keywords.
          4. "metaRobots": "index, follow".
          5. "structuredData": Valid JSON-LD object.
          
          Return ONLY valid JSON in this exact format:
          {
            "title": "...",
            "description": "...",
            "keywords": "...",
            "metaRobots": "index, follow",
            "structuredData": {}
          }
          
          Content: ${content}
        `;

        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());

        strapi.log.info(`SEO Gemini: Success with ${modelName}`);
        return parsed;
      } catch (err: unknown) {
        lastError = err;
        strapi.log.warn(`SEO Gemini: ${modelName} failed`);
        continue;
      }
    }

    const finalErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`All Gemini models failed. Last error: ${finalErrorMessage}`);
  },
});

export default service;

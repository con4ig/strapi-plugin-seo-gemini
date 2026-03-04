import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Generates AI-powered SEO metadata based on provided content.
   * 
   * This controller endpoint accepts a POST request with the text content,
   * validates its presence, and delegates the generation process to the
   * underlying Gemini AI service.
   * 
   * @param {object} ctx - The Koa context object containing the request and response.
   * @param {object} ctx.request.body - The request body.
   * @param {string} ctx.request.body.content - The text content to analyze for SEO.
   * @returns {Promise<void>} Resolves when the response is sent back to the client.
   * @throws {400} If the 'content' field is missing from the request body.
   * @throws {500} If an internal error occurs during generation.
   */
  async generate(ctx) {
    const { content } = ctx.request.body;

    if (!content) {
      return ctx.badRequest('Content is required');
    }

    try {
      const result = await strapi
        .plugin('strapi-plugin-seo-gemini')
        .service('service')
        .generateSeo(content);

      ctx.body = { data: result };
    } catch (error: any) {
      ctx.internalServerError(error.message);
    }
  },
});

export default controller;

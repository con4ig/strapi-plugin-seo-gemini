import type { Core } from '@strapi/strapi';

export interface GenerateRequestCtx {
  request: {
    body: {
      content?: string;
    };
  };
  badRequest: (message: string) => void;
  internalServerError: (message: string) => void;
  body: unknown;
}

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Generates AI-powered SEO metadata based on provided content.
   *
   * @param {GenerateRequestCtx} ctx - The Koa context object.
   * @returns {Promise<void>}
   * @throws {400} If 'content' is missing from the request body.
   * @throws {500} If an internal error occurs during generation.
   */
  async generate(ctx: GenerateRequestCtx) {
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
    } catch (error: unknown) {
      ctx.internalServerError(error instanceof Error ? error.message : String(error));
    }
  },
});

export default controller;

export default {
  default: {
    apiKey: '',
  },
  validator(config: Record<string, unknown>) {
    if (typeof config.apiKey !== 'string' && config.apiKey !== undefined) {
      throw new Error('SEO Gemini: apiKey must be a string');
    }
  },
};
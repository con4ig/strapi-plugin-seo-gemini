# Strapi SEO Gemini Plugin

A premium, AI-powered Strapi plugin that seamlessly generates highly optimized SEO metadata (Title, Description, Keywords, Robots, and JSON-LD Structured Data) using Google's Gemini Flash models.

## Features

- **Automated Metadata**: Generates Title, Description, Keywords, Meta Robots, and Structured Data (JSON-LD) from any text.
- **Strict Architecture**: Built with TypeScript, enforcing strict types (`unknown` over `any`), and adhering to the Clean Code Controller-Service pattern.
- **Seamless UI**: A highly polished, customized Strapi admin interface featuring asymmetric grid layouts, sophisticated typography, and smooth skeleton loaders.
- **Enterprise Reliability**: Implements an automatic model fallback system (`gemini-2.5-flash` -> `2.0` -> `1.5`) to handle high API demand (503) or rate limits (429) invisibly to the user.
- **Frontend Optimized**: The React UI uses `useMemo`, `useCallback`, and `useRef` to guarantee 60fps rendering, eliminating unneeded re-renders and memory leaks.

## Requirements

- Strapi v5.x
- Node.js >= 18.x
- A Google Gemini API Key

## Installation

To install the plugin in your Strapi project, run:

```bash
npm install strapi-plugin-seo-gemini
# or
yarn add strapi-plugin-seo-gemini
```

After installation, you will need to build your Strapi admin panel:

```bash
npm run build
npm run develop
```

## Configuration

For security and standard Marketplace compliance, the API key is configured via Strapi's plugin configuration system, separating secrets from the codebase.

Add the configuration in your Strapi project's `config/plugins.ts` (or `.js`):

```typescript
export default ({ env }) => ({
  // ... other plugins
  'strapi-plugin-seo-gemini': {
    enabled: true,
    config: {
      // Securely fetch the API key from your environment variables
      apiKey: env('GEMINI_API_KEY'),
    },
  },
});
```

Ensure you have `GEMINI_API_KEY=your_api_key_here` set in your project's `.env` file.

## Usage

1. Restart your Strapi backend.
2. In the Strapi Admin Sidebar, click on **SEO Gemini**.
3. Paste the content of your article, page, or product into the prominent text area.
4. Click **Generate Metadata**.
5. Once the AI finishes generating (indicated by the skeleton loaders), use the convenient **Copy** buttons to transfer the optimized metadata directly into your Content Manager fields.

## Development

This plugin was rigorously audited for performance and architecture.
- Frontend modifications (React): Check `admin/src/pages/HomePage.tsx`.
- Backend AI Logic: Check `server/src/services/service.ts`.

To recompile during development:
```bash
npm run build
```
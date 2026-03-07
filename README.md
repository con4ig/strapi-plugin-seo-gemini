# Strapi SEO Gemini Plugin

An enterprise-grade Strapi 5 plugin that leverages Google's Gemini Flash AI models to automate SEO metadata generation. This project demonstrates high-quality software engineering practices, including strict TypeScript typing, deep Strapi admin integration, and optimized architectural patterns.

## Technical Highlights

- **Native Strapi 5 Integration**: Deeply integrated into the Strapi Content Manager using the `editView.right-links` injection zone, providing a seamless sidebar workflow.
- **Strict TypeScript Architecture**: 100% type-safe codebase. Zero usage of `any`. Implements specific interfaces for Strapi application contexts, Koa request/response cycles, and AI data schemas.
- **Architectural Patterns**: Adheres to the **Controller-Service** pattern, ensuring a clean separation of concerns between API endpoints and business logic/AI orchestration.
- **AI Orchestration & Fallbacks**: Features a robust Multi-Model Fallback mechanism (`gemini-2.5-flash` -> `2.0` -> `1.5`) to ensure high availability and resistance to API rate-limiting or outages.
- **Intelligent Schema-Agnostic Extraction**: Implements a robust content analysis utility that detects and prioritizes common fields (`title`, `body`, `category`, `tags`, etc.) across diverse Strapi schemas. It gracefully falls back to a global field scan if specific matches are not found, ensuring functionality regardless of the Content-Type structure.
- **Strapi 5 Blocks Support**: Native handling of the new 'Blocks' JSON format alongside legacy rich text and plain string fields.
- **One-Way Form Population**: Uses Strapi's internal `useForm` hook to programmatically populate form fields across various naming conventions (`SEO`, `seo`, `Seo`) using dynamic prefix detection.

## Requirements

- **Strapi v5.x** (Standard and Enterprise)
- **Node.js >= 18.x**
- **Google Gemini API Key**

## Features

- **Automated Metadata Generation**: Analyzes content to generate Meta Titles (conforming to 60-char limits), Meta Descriptions (conforming to 160-char limits), Keywords, Meta Robots, and JSON-LD Structured Data.
- **Zero-Click Workflow**: Clicking "Generate with AI" automatically synchronizes the generated data with the entry's SEO component.
- **Optimized UI**: Built with the official `@strapi/design-system`, featuring responsive layouts, consistent typography, and native Strapi styling (`filterShadow`).

## Installation

```bash
npm install strapi-plugin-seo-gemini
# or
yarn add strapi-plugin-seo-gemini
```

After installation, rebuild the Strapi admin panel:

```bash
npm run build
npm run develop
```

## Configuration

The plugin must be enabled in the Strapi configuration. 

### 1. Update `config/plugins.ts` (or `.js`)

Add the following configuration. If you already have other plugins, simply add `strapi-plugin-seo-gemini` to the object:

```typescript
export default ({ env }) => ({
  // ... other plugins
  'strapi-plugin-seo-gemini': {
    enabled: true,
    config: {
      apiKey: env('GEMINI_API_KEY'),
    },
  },
});
```

### 2. Update `.env`

Add your Google Gemini API key to your environment variables:

```bash
GEMINI_API_KEY=your_api_key_here
```

## Usage

### 1. Create the SEO Component

The plugin expects a component named `SEO` (or `seo`/`Seo`) with specific fields. Create a file at `src/components/shared/seo.json`:

```json
{
  "collectionName": "components_shared_seos",
  "info": {
    "displayName": "SEO",
    "icon": "search"
  },
  "attributes": {
    "metaTitle": { "type": "string" },
    "metaDescription": { "type": "string" },
    "keywords": { "type": "string" },
    "metaRobots": { "type": "string" },
    "structuredData": { "type": "text" }
  }
}
```

### 2. Add to Content-Type

In the **Content-Type Builder**, add the `SEO` component to your Content-Types. Use `seo` as the field name.

### 3. Generate Metadata

1. Open an entry in the **Content Manager**.
2. Click **"Generate with AI"** in the sidebar.
3. Review and **Save**.

## Troubleshooting

- **Widget not appearing?** Rebuild the admin panel (`npm run build`).
- **Generation failing?** Check `GEMINI_API_KEY` and field names.

## Developer & Architectural Notes

This plugin was built with a focus on maintainability and performance:

- **Scalability**: The modular service architecture allows for easy swapping of AI providers or generation logic.
- **Performance**: Minimized re-renders in the Admin UI via efficient hook usage and optimized state management.
- **Quality Assurance**: Scanned and verified for Clean Code principles, ensuring semantically meaningful naming and logical object structures.

---

_Developed as a demonstration of technical proficiency in Strapi Plugin Development and AI Integration._

## Support

If this plugin saved your time, please give it a ⭐ on [GitHub](https://github.com/con4ig/strapi-plugin-seo-gemini)! It helps me stay motivated to add more AI features.

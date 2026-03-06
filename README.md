# Strapi SEO Gemini Plugin

An enterprise-grade Strapi 5 plugin that leverages Google's Gemini Flash AI models to automate SEO metadata generation. This project demonstrates high-quality software engineering practices, including strict TypeScript typing, deep Strapi admin integration, and optimized architectural patterns.

## Technical Highlights

- **Native Strapi 5 Integration**: Deeply integrated into the Strapi Content Manager using the `editView.right-links` injection zone, providing a seamless sidebar workflow.
- **Strict TypeScript Architecture**: 100% type-safe codebase. Zero usage of `any`. Implements specific interfaces for Strapi application contexts, Koa request/response cycles, and AI data schemas.
- **Architectural Patterns**: Adheres to the **Controller-Service** pattern, ensuring a clean separation of concerns between API endpoints and business logic/AI orchestration.
- **AI Orchestration & Fallbacks**: Features a robust Multi-Model Fallback mechanism (`gemini-2.5-flash` -> `2.0` -> `1.5`) to ensure high availability and resistance to API rate-limiting or outages.
- **Intelligent Data Extraction**: Implements a dedicated content analysis utility that handles Strapi 5's new 'Blocks' JSON format and legacy text fields with intelligent context prioritization.
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

The plugin uses Strapi's configuration system for secure secret management.

Add the following to `config/plugins.ts` (or `.js`):

```typescript
export default ({ env }) => ({
  'strapi-plugin-seo-gemini': {
    enabled: true,
    config: {
      apiKey: env('GEMINI_API_KEY'),
    },
  },
});
```

Ensure `GEMINI_API_KEY` is present in your `.env` file.

## Usage

1. **Prerequisites**: Ensure you have a component named `SEO` (or `seo`/`Seo`) in your Content-Type schema. The component should include fields for `metaTitle`, `metaDescription`, `keywords`, `metaRobots`, and `structuredData`.
2. **Content Generation**: Navigate to the **Content Manager** and open an entry (e.g., an Article) that contains the SEO component.
3. **Sidebar Interaction**: In the right sidebar, locate the **SEO Gemini AI** widget.
4. **AI Generation**: Click **"Generate with AI"**. The plugin will automatically extract content from the main entry fields, send it for analysis, and populate the SEO component fields instantly.
5. **Review and Save**: Review the generated metadata in the SEO component at the bottom of the page and save the entry.

## Developer & Architectural Notes

This plugin was built with a focus on maintainability and performance:

- **Scalability**: The modular service architecture allows for easy swapping of AI providers or generation logic.
- **Performance**: Minimized re-renders in the Admin UI via efficient hook usage and optimized state management.
- **Quality Assurance**: Scanned and verified for Clean Code principles, ensuring semantically meaningful naming and logical object structures.

---

_Developed as a demonstration of technical proficiency in Strapi Plugin Development and AI Integration._

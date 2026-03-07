import { useState } from 'react';
import { Button, Box, Typography, Flex, Divider } from '@strapi/design-system';
import { Magic, Check } from '@strapi/icons';
import {
  useForm,
  useFetchClient,
  useNotification,
  unstable_useContentManagerContext as useContentManagerContext,
} from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';
import styled from 'styled-components';

const WidgetContainer = styled(Box)`
  width: 100%;
`;

interface GeneratedSeoData {
  title?: string;
  description?: string;
  keywords?: string | string[];
  metaRobots?: string;
  structuredData?: Record<string, unknown> | string;
}

const SeoSidebarWidget = () => {
  const { formatMessage } = useIntl();
  const { values, onChange } = useForm('SeoSidebarWidget', (state) => state);
  const cmContext = useContentManagerContext();
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedSeoData | null>(null);

  /**
   * Intelligently extracts readable text content from the current Strapi form state.
   *
   * It prioritizes standard content fields (like 'content', 'body', 'description')
   * and handles both plain strings and Strapi 5 Blocks (arrays of JSON).
   * If priority fields are empty, it falls back to parsing all large string fields
   * in the entry to gather maximum context for the AI, while explicitly ignoring
   * existing SEO metadata to avoid recursive analysis loops.
   *
   * @param {Record<string, unknown>} vals - The current state values from Strapi's useForm hook.
   * @returns {string} The aggregated text content ready to be sent to the Gemini API.
   */
  const extractContentFromValues = (vals: Record<string, unknown>): string => {
    let text = '';
    const fieldsToTry = [
      'title',
      'name',
      'headline',
      'subject', // Main identifiers
      'content',
      'body',
      'description',
      'text',
      'article',
      'summary', // Main text
      'category',
      'tags',
      'keywords',
      'slug', // Taxonomy/Metadata
    ];

    for (const field of fieldsToTry) {
      if (vals[field]) {
        if (typeof vals[field] === 'string') {
          text += `${field.toUpperCase()}: ${vals[field]}\n\n`;
        } else if (Array.isArray(vals[field]) || typeof vals[field] === 'object') {
          try {
            // Strapi 5 Blocks are arrays of objects, or it could be a relation object
            const stringified =
              typeof vals[field] === 'string' ? vals[field] : JSON.stringify(vals[field]);
            text += `${field.toUpperCase()}: ${stringified}\n\n`;
          } catch (e) {}
        }
      }
    }

    if (!text.trim()) {
      Object.entries(vals).forEach(([key, val]) => {
        if (key === 'seo' || key === 'SEO' || key.startsWith('meta')) return;

        if (typeof val === 'string' && val.length > 50) {
          text += val + '\n\n';
        } else if (Array.isArray(val) || (val !== null && typeof val === 'object')) {
          try {
            const str = JSON.stringify(val);
            if (str.length > 50) text += str + '\n\n';
          } catch (e) {}
        }
      });
    }
    return text.trim();
  };

  const handleGenerateClick = async () => {
    try {
      const contentToAnalyze = extractContentFromValues(values);

      if (!contentToAnalyze || contentToAnalyze.length < 20) {
        toggleNotification({
          type: 'warning',
          message: formatMessage({
            id: 'seo-gemini.warning.no-content',
            defaultMessage: 'Not enough content to generate SEO metadata.',
          }),
        });
        return;
      }

      setIsLoading(true);

      const { data } = await post('/strapi-plugin-seo-gemini/generate', {
        content: contentToAnalyze,
      });

      if (data?.data) {
        const generated = data.data;
        setGeneratedData(generated);

        // Auto-apply to form
        let seoPrefix = 'seo.';
        if (values.SEO !== undefined) seoPrefix = 'SEO.';
        else if (values.Seo !== undefined) seoPrefix = 'Seo.';

        if (generated.title) {
          onChange({
            target: { name: seoPrefix + 'metaTitle', value: generated.title, type: 'string' },
          } as any);
        }
        if (generated.description) {
          // Double check length on frontend side to ensure it fits before saving
          const safeDesc = generated.description.substring(0, 160);
          onChange({
            target: { name: seoPrefix + 'metaDescription', value: safeDesc, type: 'string' },
          } as any);
        }
        if (generated.keywords) {
          const kw = Array.isArray(generated.keywords)
            ? generated.keywords.join(', ')
            : generated.keywords;
          onChange({ target: { name: seoPrefix + 'keywords', value: kw, type: 'string' } } as any);
        }
        if (generated.metaRobots) {
          onChange({
            target: { name: seoPrefix + 'metaRobots', value: generated.metaRobots, type: 'string' },
          } as any);
        }
        if (generated.structuredData) {
          // Format as beautiful JSON string for Strapi text field
          const sdData =
            typeof generated.structuredData === 'string'
              ? generated.structuredData
              : JSON.stringify(generated.structuredData, null, 2);
          onChange({
            target: { name: seoPrefix + 'structuredData', value: sdData, type: 'string' },
          } as any);
        }

        toggleNotification({
          type: 'success',
          message: formatMessage({
            id: 'seo-gemini.success.generated-applied',
            defaultMessage: 'SEO metadata generated and applied!',
          }),
        });
      }
    } catch (err: unknown) {
      console.error('Error generating SEO:', err);
      toggleNotification({
        type: 'danger',
        message: 'Failed to generate SEO metadata.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WidgetContainer
      background="neutral0"
      padding={4}
      hasRadius
      shadow="filterShadow"
      marginBottom={4}
      borderWidth="1px"
      borderStyle="solid"
      borderColor="neutral150"
    >
      <Flex direction="column" alignItems="stretch" gap={3}>
        <Typography variant="sigma" textColor="neutral600" textTransform="uppercase">
          SEO Gemini AI
        </Typography>

        <Divider />

        <Button
          fullWidth
          variant="secondary"
          size="S"
          startIcon={<Magic />}
          onClick={handleGenerateClick}
          loading={isLoading}
        >
          {formatMessage({ id: 'seo-gemini.button.generate', defaultMessage: 'Generate with AI' })}
        </Button>

        {generatedData && (
          <Box
            background="success100"
            padding={3}
            hasRadius
            borderStyle="dashed"
            borderWidth="1px"
            borderColor="success200"
          >
            <Flex direction="column" gap={2} alignItems="stretch">
              <Flex gap={2}>
                <Check width={12} height={12} fill="success600" />
                <Typography variant="pi" fontWeight="bold" textColor="success600">
                  Applied to form
                </Typography>
              </Flex>
              <Box>
                <Typography variant="pi" textColor="neutral700" fontWeight="bold">
                  T:
                </Typography>{' '}
                <Typography variant="pi" textColor="neutral700">
                  {generatedData.title}
                </Typography>
              </Box>
              <Box>
                <Typography variant="pi" textColor="neutral700" fontWeight="bold">
                  D:
                </Typography>{' '}
                <Typography variant="pi" textColor="neutral700" ellipsis>
                  {generatedData.description?.substring(0, 60)}...
                </Typography>
              </Box>
            </Flex>
          </Box>
        )}
      </Flex>
    </WidgetContainer>
  );
};

export default SeoSidebarWidget;

import { useState, useCallback, useRef, useMemo } from 'react';
import { Main, Box, Typography, Textarea, Button, Flex, Field } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import styled, { keyframes } from 'styled-components';

// --- ANGIELSKI TEKST I BRAK IKON ---
// Używamy wyłącznie typografii do zaprezentowania premium SaaS UI.

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;

interface SkeletonProps {
  $height?: string;
  $width?: string;
}

const SkeletonBox = styled(Box)<SkeletonProps>`
  animation: ${pulse} 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: ${({ theme }) => theme.colors.neutral200};
  border-radius: ${({ theme }) => theme.borderRadius};
  height: ${(props) => props.$height || '20px'};
  width: ${(props) => props.$width || '100%'};
`;

const CustomGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: ${({ theme }) => theme.spaces[8]};
  
  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
  }
`;

const CustomGridItem = styled.div`
  min-width: 0;
  width: 100%;
`;

const PremiumCard = styled(Box)`
  transition: all 0.2s ease-in-out;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.tableShadow};
    border-color: ${({ theme }) => theme.colors.neutral300};
  }
`;

const PremiumButton = styled(Button)`
  padding-left: ${({ theme }) => theme.spaces[6]};
  padding-right: ${({ theme }) => theme.spaces[6]};
  padding-top: ${({ theme }) => theme.spaces[3]};
  padding-bottom: ${({ theme }) => theme.spaces[3]};
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.neutral500};
  font-size: ${({ theme }) => theme.fontSizes[1]};
  font-weight: 600;
  cursor: pointer;
  padding: ${({ theme }) => `${theme.spaces[1]} ${theme.spaces[2]}`};
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: all 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.neutral800};
    background-color: ${({ theme }) => theme.colors.neutral150};
  }
`;

const MetaLabel = styled(Typography)`
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.neutral600};
`;

interface SeoResult {
  title: string;
  description: string;
  keywords: string | string[];
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
}

const HomePage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});
  
  const { post } = useFetchClient();

  const handleGenerate = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setCopiedState({});

    try {
      // useFetchClient automatically prepends /admin
      const { data } = await post('/strapi-plugin-seo-gemini/generate', {
        content
      });

      setResult(data.data);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } }, message?: string };
      setError(errorObj.response?.data?.error?.message || errorObj.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const copyTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    
    // Clear existing timeout for this specific key to prevent race conditions
    if (copyTimeouts.current[key]) {
      clearTimeout(copyTimeouts.current[key]);
    }

    copyTimeouts.current[key] = setTimeout(() => {
      setCopiedState((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  }, []);

  const resultsColumn = useMemo(() => {
    return (
      <CustomGridItem>
        <Box paddingLeft={4}>
          {loading && (
            <Flex direction="column" gap={8}>
              <Box>
                <SkeletonBox $width="120px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="60px" />
              </Box>
              <Box>
                <SkeletonBox $width="140px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="80px" />
              </Box>
              <Box>
                <SkeletonBox $width="100px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="40px" />
              </Box>
              <Box>
                <SkeletonBox $width="110px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="30px" />
              </Box>
              <Box>
                <SkeletonBox $width="150px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="100px" />
              </Box>
            </Flex>
          )}

          {!loading && !result && (
            <Flex 
              justifyContent="center" 
              alignItems="center" 
              style={{ height: '300px', border: '1px dashed #eaeaef', borderRadius: '8px' }}
            >
              <Typography textColor="neutral500">
                Metadata will appear here.
              </Typography>
            </Flex>
          )}

          {result && !loading && (
            <Flex direction="column" alignItems="stretch" gap={6}>
              
              <PremiumCard background="neutral0" padding={5} hasRadius>
                <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                  <MetaLabel variant="pi" fontWeight="bold">Meta Title</MetaLabel>
                  <CopyButton onClick={() => handleCopy(result.title, 'title')}>
                    {copiedState['title'] ? 'Copied!' : 'Copy'}
                  </CopyButton>
                </Flex>
                <Typography variant="epsilon" style={{ lineHeight: '1.5' }}>
                  {result.title || 'No data generated'}
                </Typography>
              </PremiumCard>

              <PremiumCard background="neutral0" padding={5} hasRadius>
                <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                  <MetaLabel variant="pi" fontWeight="bold">Meta Description</MetaLabel>
                  <CopyButton onClick={() => handleCopy(result.description, 'description')}>
                    {copiedState['description'] ? 'Copied!' : 'Copy'}
                  </CopyButton>
                </Flex>
                <Typography variant="epsilon" style={{ lineHeight: '1.5' }}>
                  {result.description || 'No data generated'}
                </Typography>
              </PremiumCard>

              <PremiumCard background="neutral0" padding={5} hasRadius>
                <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                  <MetaLabel variant="pi" fontWeight="bold">Keywords</MetaLabel>
                  <CopyButton 
                    onClick={() => handleCopy(
                      Array.isArray(result.keywords) ? result.keywords.join(', ') : result.keywords, 
                      'keywords'
                    )}
                  >
                    {copiedState['keywords'] ? 'Copied!' : 'Copy'}
                  </CopyButton>
                </Flex>
                <Typography variant="epsilon" style={{ lineHeight: '1.5' }}>
                  {Array.isArray(result.keywords) ? result.keywords.join(', ') : (result.keywords || 'No data generated')}
                </Typography>
              </PremiumCard>

              {result.metaRobots && (
                <PremiumCard background="neutral0" padding={5} hasRadius>
                  <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                    <MetaLabel variant="pi" fontWeight="bold">Meta Robots</MetaLabel>
                    <CopyButton onClick={() => handleCopy(result.metaRobots || '', 'metaRobots')}>
                      {copiedState['metaRobots'] ? 'Copied!' : 'Copy'}
                    </CopyButton>
                  </Flex>
                  <Typography variant="epsilon" style={{ lineHeight: '1.5' }}>
                    {result.metaRobots}
                  </Typography>
                </PremiumCard>
              )}

              {result.structuredData && (
                <PremiumCard background="neutral0" padding={5} hasRadius>
                  <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                    <MetaLabel variant="pi" fontWeight="bold">Structured Data (JSON-LD)</MetaLabel>
                    <CopyButton onClick={() => handleCopy(JSON.stringify(result.structuredData, null, 2), 'structuredData')}>
                      {copiedState['structuredData'] ? 'Copied!' : 'Copy'}
                    </CopyButton>
                  </Flex>
                  <Box background="neutral100" padding={3} hasRadius style={{ overflowX: 'auto', maxHeight: '200px', fontSize: '12px' }}>
                    <pre style={{ margin: 0, fontFamily: 'monospace' }}>
                      {JSON.stringify(result.structuredData, null, 2)}
                    </pre>
                  </Box>
                </PremiumCard>
              )}

            </Flex>
          )}
        </Box>
      </CustomGridItem>
    );
  }, [loading, result, copiedState, handleCopy]);

  return (
    <Main>
      <Box padding={10} background="neutral0" minHeight="100vh">
        <Box maxWidth="1200px" margin="0 auto">
          
          <Box marginBottom={10}>
            <Typography variant="alpha" tag="h1" fontWeight="bold" style={{ letterSpacing: '-0.5px' }}>
              SEO Metadata Generator
            </Typography>
            <Box marginTop={3}>
              <Typography variant="epsilon" textColor="neutral600">
                Paste your content here to magically generate optimized metadata.
              </Typography>
            </Box>
          </Box>

          <CustomGrid>
            <CustomGridItem>
              <Flex direction="column" alignItems="stretch" gap={6}>
                <Field.Root error={error || undefined}>
                  <Textarea 
                    placeholder="Enter your article or page content..."
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                    rows={16}
                    style={{ fontSize: '15px', lineHeight: '1.6', padding: '16px' }}
                  />
                  <Field.Error />
                </Field.Root>

                <Box>
                  <PremiumButton 
                    onClick={handleGenerate} 
                    loading={loading} 
                    disabled={!content.trim()}
                    size="L"
                  >
                    Generate Metadata
                  </PremiumButton>
                </Box>
              </Flex>
            </CustomGridItem>

            {resultsColumn}
          </CustomGrid>

        </Box>
      </Box>
    </Main>
  );
};

export { HomePage };

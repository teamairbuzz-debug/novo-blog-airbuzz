// src/pages/[[...slug]].tsx
// VERSÃO COMPLETA COM SEO + AEO OTIMIZADOS
// Substitua o conteúdo do seu arquivo src/pages/[[...slug]].tsx por este.

import Head from 'next/head';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps } from '@/types';
import { allContent } from '@/utils/content';
import { seoGenerateMetaDescription, seoGenerateMetaTags, seoGenerateTitle } from '@/utils/seo-utils';
import { resolveStaticProps } from '@/utils/static-props-resolvers';

// ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────
// Altere apenas se mudar o domínio do blog.
const SITE_URL = 'https://blog.airbuzz.co';
const SITE_NAME = 'Blog Airbuzz';
const SITE_LOCALE = 'pt_BR';
const TWITTER_HANDLE = '@airbuzz_co'; // ajuste se tiver Twitter/X
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gera o JSON-LD Schema.org para posts (BlogPosting) e para
 * listagens de blog (Blog). Alimenta AEO / AI Overviews / featured snippets.
 */
function buildJsonLd(page: any, site: any, canonicalUrl: string): string | null {
    const modelName = page.__metadata?.modelName;

    if (modelName === 'PostLayout') {
        const authorName =
            page.author
                ? `${page.author.firstName ?? ''} ${page.author.lastName ?? ''}`.trim()
                : SITE_NAME;

        const imageUrl =
            page.featuredImage?.url
                ? page.featuredImage.url.startsWith('http')
                    ? page.featuredImage.url
                    : `${SITE_URL}${page.featuredImage.url}`
                : `${SITE_URL}/images/og-default.jpg`;

        const datePublished = page.date
            ? new Date(page.date).toISOString()
            : new Date().toISOString();

        const schema: Record<string, any> = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: page.title,
            description: page.excerpt || page.metaDescription || '',
            image: imageUrl,
            url: canonicalUrl,
            datePublished,
            dateModified: datePublished,
            inLanguage: 'pt-BR',
            author: {
                '@type': 'Person',
                name: authorName,
                url: `${SITE_URL}/`
            },
            publisher: {
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_URL,
                logo: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/images/favicon_airbuzz.png`
                }
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': canonicalUrl
            }
        };

        // Adiciona breadcrumb para melhorar navegação nos resultados de busca
        schema['breadcrumb'] = {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: SITE_URL
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Blog',
                    item: `${SITE_URL}/blog/`
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: page.title,
                    item: canonicalUrl
                }
            ]
        };

        return JSON.stringify(schema);
    }

    if (modelName === 'PostFeedLayout') {
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: SITE_NAME,
            url: canonicalUrl,
            description: page.metaDescription || 'Blog da Airbuzz — dicas sobre imóveis para locação, day use, gravações e eventos.',
            inLanguage: 'pt-BR',
            publisher: {
                '@type': 'Organization',
                name: 'Airbuzz',
                url: 'https://airbuzz.co/'
            }
        };
        return JSON.stringify(schema);
    }

    // Página genérica
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        url: canonicalUrl,
        description: page.metaDescription || page.excerpt || ''
    };
    return JSON.stringify(schema);
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

type PagePostFields = {
    featuredImage?: { url?: string } | null;
    date?: string;
    title?: string;
    excerpt?: string;
    metaDescription?: string;
};

const Page: React.FC<PageComponentProps> = (props) => {
    const { global, ...rest } = props;
    const page = rest as typeof rest & PagePostFields;
    const { site } = global;

    const title = seoGenerateTitle(page, site);
    const metaTags = seoGenerateMetaTags(page, site);
    const metaDescription = seoGenerateMetaDescription(page, site);

    // URL canônica sempre absoluta
    const urlPath = page.__metadata?.urlPath ?? '/';
    const canonicalUrl = `${SITE_URL}${urlPath.endsWith('/') ? urlPath : urlPath + '/'}`;

    // og:image — prioriza featuredImage do post, depois defaultSocialImage do site
    const ogImage = (() => {
        if (page.__metadata?.modelName === 'PostLayout' && page.featuredImage?.url) {
            const img = page.featuredImage.url;
            return img.startsWith('http') ? img : `${SITE_URL}${img}`;
        }
        if (site.defaultSocialImage) {
            const img = site.defaultSocialImage;
            return img.startsWith('http') ? img : `${SITE_URL}${img}`;
        }
        return `${SITE_URL}/images/og-default.jpg`;
    })();

    // JSON-LD para AEO
    const jsonLd = buildJsonLd(page, site, canonicalUrl);

    return (
        <>
            <Head>
                {/* ── BÁSICOS ── */}
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{title}</title>
                {metaDescription && (
                    <meta name="description" content={metaDescription} />
                )}
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

                {/* ── CANONICAL ── */}
                <link rel="canonical" href={canonicalUrl} />

                {/* ── OPEN GRAPH (Facebook, LinkedIn, WhatsApp) ── */}
                <meta property="og:type" content={page.__metadata?.modelName === 'PostLayout' ? 'article' : 'website'} />
                <meta property="og:site_name" content={SITE_NAME} />
                <meta property="og:title" content={title} />
                {metaDescription && (
                    <meta property="og:description" content={metaDescription} />
                )}
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:locale" content={SITE_LOCALE} />

                {/* Datas para artigos (Open Graph article) */}
                {page.__metadata?.modelName === 'PostLayout' && page.date && (
                    <>
                        <meta property="article:published_time" content={new Date(page.date).toISOString()} />
                        <meta property="article:modified_time" content={new Date(page.date).toISOString()} />
                        <meta property="article:author" content={SITE_NAME} />
                        <meta property="article:section" content="Blog" />
                    </>
                )}

                {/* ── TWITTER CARD ── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={TWITTER_HANDLE} />
                <meta name="twitter:title" content={title} />
                {metaDescription && (
                    <meta name="twitter:description" content={metaDescription} />
                )}
                <meta name="twitter:image" content={ogImage} />

                {/* ── METATAGS EXTRAS VINDAS DO CONTEÚDO (config.json / front matter) ── */}
                {metaTags
                    .filter((mt) => !['og:title', 'og:image', 'og:description'].includes(mt.property))
                    .map((metaTag) =>
                        metaTag.format === 'property' ? (
                            <meta key={metaTag.property} property={metaTag.property} content={metaTag.content} />
                        ) : (
                            <meta key={metaTag.property} name={metaTag.property} content={metaTag.content} />
                        )
                    )}

                {/* ── FAVICON ── */}
                {site.favicon && <link rel="icon" href={site.favicon} />}

                {/* ── JSON-LD SCHEMA.ORG (AEO) ── */}
                {jsonLd && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: jsonLd }}
                    />
                )}
            </Head>

            <DynamicComponent {...props} />
        </>
    );
};

// ─── NEXT.JS SSG ─────────────────────────────────────────────────────────────

export function getStaticPaths() {
    const allData = allContent();
    const paths = allData.map((obj) => obj.__metadata.urlPath).filter(Boolean);
    return { paths, fallback: false };
}

export function getStaticProps({ params }) {
    const allData = allContent();
    const urlPath = '/' + (params.slug || []).join('/');
    const props = resolveStaticProps(urlPath, allData);
    return { props };
}

export default Page;

import Head from 'next/head';

import { DynamicComponent } from '@/components/components-registry';
import { PageComponentProps } from '@/types';
import { allContent } from '@/utils/content';
import { seoGenerateMetaDescription, seoGenerateMetaTags, seoGenerateTitle } from '@/utils/seo-utils';
import { resolveStaticProps } from '@/utils/static-props-resolvers';

// ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────
const SITE_URL = 'https://blog.airbuzz.co';
const SITE_NAME = 'Blog Airbuzz';
const SITE_LOCALE = 'pt_BR';
const TWITTER_HANDLE = '@airbuzz_co';
// ─────────────────────────────────────────────────────────────────────────────

function getSafeImageUrl(imageValue: unknown, fallback: string) {
    if (!imageValue) return fallback;

    if (typeof imageValue === 'string') {
        return imageValue.startsWith('http') ? imageValue : `${SITE_URL}${imageValue}`;
    }

    if (
        typeof imageValue === 'object' &&
        imageValue !== null &&
        'url' in imageValue &&
        typeof (imageValue as { url?: unknown }).url === 'string'
    ) {
        const img = (imageValue as { url: string }).url;
        return img.startsWith('http') ? img : `${SITE_URL}${img}`;
    }

    return fallback;
}

function getAuthorName(page: any) {
    if (!page?.author || typeof page.author !== 'object') return SITE_NAME;

    const firstName = typeof page.author.firstName === 'string' ? page.author.firstName : '';
    const lastName = typeof page.author.lastName === 'string' ? page.author.lastName : '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || SITE_NAME;
}

/**
 * Gera o JSON-LD Schema.org para posts (BlogPosting) e para
 * listagens de blog (Blog). Alimenta AEO / AI Overviews / featured snippets.
 */
function buildJsonLd(page: any, site: any, canonicalUrl: string): string | null {
    const modelName = page?.__metadata?.modelName;
    const defaultOgImage = getSafeImageUrl(site?.defaultSocialImage, `${SITE_URL}/images/og-default.jpg`);

    if (modelName === 'PostLayout') {
        const authorName = getAuthorName(page);
        const imageUrl = getSafeImageUrl(page?.featuredImage, defaultOgImage);

        const datePublished = page?.date
            ? new Date(page.date).toISOString()
            : new Date().toISOString();

        const schema: Record<string, any> = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: page?.title || SITE_NAME,
            description: page?.excerpt || page?.metaDescription || '',
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
            },
            breadcrumb: {
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
                        name: page?.title || 'Post',
                        item: canonicalUrl
                    }
                ]
            }
        };

        return JSON.stringify(schema);
    }

    if (modelName === 'PostFeedLayout') {
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: SITE_NAME,
            url: canonicalUrl,
            description:
                page?.metaDescription ||
                'Blog da Airbuzz — dicas sobre imóveis para locação, day use, gravações e eventos.',
            inLanguage: 'pt-BR',
            publisher: {
                '@type': 'Organization',
                name: 'Airbuzz',
                url: 'https://airbuzz.co/'
            }
        };
        return JSON.stringify(schema);
    }

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page?.title || SITE_NAME,
        url: canonicalUrl,
        description: page?.metaDescription || page?.excerpt || ''
    };

    return JSON.stringify(schema);
}

const Page: React.FC<PageComponentProps> = (props) => {
    const { global, ...page } = props;
    const { site } = global;

    const title = seoGenerateTitle(page, site);
    const metaTags = seoGenerateMetaTags(page, site);
    const metaDescription = seoGenerateMetaDescription(page, site);

    const urlPath = page?.__metadata?.urlPath ?? '/';
    const canonicalUrl = `${SITE_URL}${urlPath.endsWith('/') ? urlPath : `${urlPath}/`}`;

    const ogImage = getSafeImageUrl(
        page?.__metadata?.modelName === 'PostLayout' ? page?.featuredImage : site?.defaultSocialImage,
        `${SITE_URL}/images/og-default.jpg`
    );

    const jsonLd = buildJsonLd(page, site, canonicalUrl);

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{title}</title>
                {metaDescription && <meta name="description" content={metaDescription} />}
                <meta
                    name="robots"
                    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
                />

                <link rel="canonical" href={canonicalUrl} />

                <meta property="og:type" content={page?.__metadata?.modelName === 'PostLayout' ? 'article' : 'website'} />
                <meta property="og:site_name" content={SITE_NAME} />
                <meta property="og:title" content={title} />
                {metaDescription && <meta property="og:description" content={metaDescription} />}
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:locale" content={SITE_LOCALE} />

                {page?.__metadata?.modelName === 'PostLayout' && page?.date && (
                    <>
                        <meta property="article:published_time" content={new Date(page.date).toISOString()} />
                        <meta property="article:modified_time" content={new Date(page.date).toISOString()} />
                        <meta property="article:author" content={SITE_NAME} />
                        <meta property="article:section" content="Blog" />
                    </>
                )}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={TWITTER_HANDLE} />
                <meta name="twitter:title" content={title} />
                {metaDescription && <meta name="twitter:description" content={metaDescription} />}
                <meta name="twitter:image" content={ogImage} />

                {metaTags
                    .filter((mt) => !['og:title', 'og:image', 'og:description'].includes(mt.property))
                    .map((metaTag) =>
                        metaTag.format === 'property' ? (
                            <meta key={metaTag.property} property={metaTag.property} content={metaTag.content} />
                        ) : (
                            <meta key={metaTag.property} name={metaTag.property} content={metaTag.content} />
                        )
                    )}

                {site?.favicon && <link rel="icon" href={site.favicon} />}

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

export function getStaticPaths() {
    const allData = allContent();
    const paths = allData.map((obj) => obj.__metadata?.urlPath).filter(Boolean);
    return { paths, fallback: false };
}

export function getStaticProps({ params }) {
    const allData = allContent();
    const urlPath = '/' + (params?.slug || []).join('/');
    const props = resolveStaticProps(urlPath, allData);
    return { props };
}

export default Page;

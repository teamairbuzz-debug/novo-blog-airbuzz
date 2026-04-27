const SITE_URL = 'https://blog.airbuzz.co';
const DEFAULT_TITLE = 'Blog Airbuzz';
const DEFAULT_DESCRIPTION =
    'Casas para eventos, filmagens e hospedagem em grupo. Dicas práticas e inspirações para encontrar o espaço ideal com a Airbuzz.';
const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

export function seoGenerateMetaTags(page, site) {
    let pageMetaTags = {};

    if (site.defaultMetaTags?.length) {
        site.defaultMetaTags.forEach((metaTag) => {
            pageMetaTags[metaTag.property] = metaTag.content;
        });
    }

    pageMetaTags = {
        ...pageMetaTags,
        ...(seoGenerateTitle(page, site) && { 'og:title': seoGenerateTitle(page, site) }),
        ...(seoGenerateMetaDescription(page, site) && {
            'og:description': seoGenerateMetaDescription(page, site)
        }),
        ...(seoGenerateOgImage(page, site) && { 'og:image': seoGenerateOgImage(page, site) })
    };

    if (page.metaTags?.length) {
        page.metaTags.forEach((metaTag) => {
            pageMetaTags[metaTag.property] = metaTag.content;
        });
    }

    let metaTags = [];
    Object.keys(pageMetaTags).forEach((key) => {
        if (pageMetaTags[key] !== null) {
            metaTags.push({
                property: key,
                content: pageMetaTags[key],
                format: key.startsWith('og') ? 'property' : 'name'
            });
        }
    });

    return metaTags;
}

export function seoGenerateTitle(page, site) {
    const baseTitle = page.metaTitle || page.title || DEFAULT_TITLE;
    const suffix = site?.titleSuffix || '';

    if (!baseTitle) return DEFAULT_TITLE;

    const urlPath = page.__metadata?.urlPath || '';
    const isHome = urlPath === '/' || urlPath === '';

    const normalizedBase = baseTitle.toLowerCase().trim();
    const normalizedSuffix = suffix.replace('|', '').toLowerCase().trim();

    if (isHome) {
        return baseTitle;
    }

    if (!suffix || !normalizedSuffix) {
        return baseTitle;
    }

    if (normalizedBase.includes(normalizedSuffix)) {
        return baseTitle;
    }

    const safeSuffix = suffix.startsWith(' ') ? suffix : ` ${suffix}`;

    return `${baseTitle}${safeSuffix}`;
}

export function seoGenerateMetaDescription(page, site) {
    if (page.metaDescription) {
        return page.metaDescription;
    }

    if (page.__metadata?.modelName === 'PostLayout' && page.excerpt) {
        return page.excerpt;
    }

    if (page.subtitle) {
        return page.subtitle;
    }

    return DEFAULT_DESCRIPTION;
}

export function seoGenerateOgImage(page, site) {
    let ogImage = null;

    if (site.defaultSocialImage) {
        ogImage = site.defaultSocialImage;
    }

    if (page.__metadata?.modelName === 'PostLayout' && page.featuredImage?.url) {
        ogImage = page.featuredImage.url;
    }

    if (page.socialImage) {
        ogImage = page.socialImage;
    }

    if (!ogImage) {
        ogImage = DEFAULT_OG_IMAGE;
    }

    const absoluteUrlRegex = new RegExp('^(?:[a-z+]+:)?//', 'i');

    if (absoluteUrlRegex.test(ogImage)) {
        return ogImage;
    }

    return `${SITE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;
}

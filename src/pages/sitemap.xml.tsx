// src/pages/sitemap.xml.tsx
// Coloque este arquivo em: src/pages/sitemap.xml.tsx
// O Next.js vai gerar automaticamente a rota /sitemap.xml

import { GetServerSideProps } from 'next';
import { allContent } from '@/utils/content';

const BASE_URL = 'https://blog.airbuzz.co';

function generateSiteMap(urls: { path: string; lastMod?: string; priority?: string; changeFreq?: string }[]) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
    .map(({ path, lastMod, priority, changeFreq }) => {
        return `  <url>
    <loc>${BASE_URL}${path}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ''}
    <changefreq>${changeFreq || 'monthly'}</changefreq>
    <priority>${priority || '0.7'}</priority>
  </url>`;
    })
    .join('\n')}
</urlset>`;
}

function SiteMap() {
    // Este componente não renderiza nada — o XML é gerado no servidor
    return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    const allData = allContent();

    const urls = allData
        .filter((obj) => obj.__metadata?.urlPath)
        .map((obj) => {
            const isPost = obj.__metadata.modelName === 'PostLayout';
            const date = (obj as { date?: string }).date;
            return {
                path: obj.__metadata.urlPath as string,
                lastMod: date ? new Date(date).toISOString().split('T')[0] : undefined,
                priority: isPost ? '0.8' : obj.__metadata.urlPath === '/' ? '1.0' : '0.6',
                changeFreq: isPost ? 'weekly' : 'monthly'
            };
        })
        // Garante que a homepage está sempre presente
        .sort((a, b) => (b.priority || '0').localeCompare(a.priority || '0'));

    const sitemap = generateSiteMap(urls);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.write(sitemap);
    res.end();

    return { props: {} };
};

export default SiteMap;

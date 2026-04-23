// scripts/generate-sitemap.js
// Executado antes do next build para gerar public/sitemap.xml estático.
// Compatível com trailingSlash: true do Next.js.

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const frontmatter = require('front-matter');

const BASE_URL = 'https://blog.airbuzz.co';
const PAGES_DIR = path.join(process.cwd(), 'content/pages');

function slugFromFile(filePath) {
    let url = filePath
        .replace(PAGES_DIR, '')
        .replace(/\\/g, '/')
        .replace(/\.md$/, '');

    if (url.endsWith('/index')) {
        url = url.slice(0, -6) || '/';
    }

    if (url !== '/' && !url.endsWith('/')) {
        url = url + '/';
    }

    return url;
}

function generateSitemap(urls) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(({ loc, lastmod, priority, changefreq }) => `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
    .join('\n')}
</urlset>`;
}

function safeGenerate() {
    try {
        // 🔥 1. Verificar se pasta existe
        if (!fs.existsSync(PAGES_DIR)) {
            console.warn('⚠️ content/pages não encontrado. Gerando sitemap vazio.');
            return [];
        }

        const files = glob.sync('**/*.md', { cwd: PAGES_DIR });

        const urls = files
            .map((file) => {
                try {
                    const filePath = path.join(PAGES_DIR, file);
                    const raw = fs.readFileSync(filePath, 'utf8');
                    const { attributes } = frontmatter(raw);
                    const slug = slugFromFile(filePath);

                    const isPost = attributes.type === 'PostLayout';
                    const isHome = slug === '/';

                    return {
                        loc: `${BASE_URL}${slug}`,
                        lastmod: attributes.date
                            ? new Date(attributes.date).toISOString().split('T')[0]
                            : undefined,
                        priority: isHome ? '1.0' : isPost ? '0.8' : '0.6',
                        changefreq: isPost ? 'weekly' : 'monthly'
                    };
                } catch (err) {
                    console.warn('⚠️ Erro ao processar arquivo:', file);
                    return null;
                }
            })
            .filter(Boolean)
            .sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

        return urls;
    } catch (err) {
        console.error('❌ Erro geral no sitemap:', err);
        return [];
    }
}

const urls = safeGenerate();
const sitemap = generateSitemap(urls);

const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');

// 🔥 2. Garantir pasta public
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log(`✅ sitemap.xml gerado com ${urls.length} URLs`);

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');
const frontmatter = require('front-matter');

const BASE_URL = 'https://blog.airbuzz.co';
const PAGES_DIR = path.join(process.cwd(), 'content/pages');

function today() {
    return new Date().toISOString().split('T')[0];
}

function slugFromFile(filePath) {
    let url = filePath
        .replace(PAGES_DIR, '')
        .replace(/\\/g, '/')
        .replace(/\.md$/, '');

    if (url.endsWith('/index')) {
        url = url.slice(0, -6) || '/';
    }

    if (url !== '/' && !url.endsWith('/')) {
        url += '/';
    }

    return url;
}

function generateSitemap(urls) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(({ loc, lastmod, priority, changefreq }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
    .join('\n')}
</urlset>`;
}

function safeGenerate() {
    try {
        if (!fs.existsSync(PAGES_DIR)) {
            console.warn('⚠️ content/pages não encontrado.');
            return [];
        }

        const files = globSync(path.join(PAGES_DIR, '**/*.md').replace(/\\/g, '/'));

        const urls = files
            .map((filePath) => {
                try {
                    const raw = fs.readFileSync(filePath, 'utf8');
                    const { attributes } = frontmatter(raw);
                    const slug = slugFromFile(filePath);

                    // 🚫 Remover páginas irrelevantes do sitemap
                    if (slug === '/info/') return null;

                    const isPost = attributes.type === 'PostLayout';
                    const isHome = slug === '/';

                    let lastmod = today();

                    if (attributes.date) {
                        const date = new Date(attributes.date);
                        if (!isNaN(date)) {
                            lastmod = date.toISOString().split('T')[0];
                        }
                    }

                    return {
                        loc: `${BASE_URL}${slug}`,
                        lastmod,
                        priority: isHome ? '1.0' : isPost ? '0.8' : '0.6',
                        changefreq: isPost ? 'weekly' : 'monthly'
                    };
                } catch (err) {
                    console.warn(`⚠️ Erro ao processar: ${filePath}`);
                    return null;
                }
            })
            .filter(Boolean)
            .sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

        // ✅ Garantir home sempre presente
        const hasHome = urls.find((u) => u.loc === `${BASE_URL}/`);

        if (!hasHome) {
            urls.unshift({
                loc: `${BASE_URL}/`,
                lastmod: today(),
                priority: '1.0',
                changefreq: 'monthly'
            });
        }

        return urls;
    } catch (err) {
        console.error('❌ Erro geral no sitemap:', err);
        return [];
    }
}

const urls = safeGenerate();
const sitemap = generateSitemap(urls);

const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log(`✅ sitemap.xml atualizado com ${urls.length} URLs`);

import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Annotated } from '@/components/Annotated';
import { BackgroundImage } from '@/components/atoms';
import Footer from '@/components/sections/Footer';
import Header from '@/components/sections/Header';
import { PageComponentProps } from '@/types';
import { PageModelType } from '@/types/generated';

type BaseLayoutProps = React.PropsWithChildren & PageComponentProps & PageModelType;

const BaseLayout: React.FC<BaseLayoutProps> = (props) => {
    const { global, ...page } = props;
    const { site } = global;
    const router = useRouter();

    // SEO fallback logic
    const title = page.metaTitle || page.title || 'Blog Airbuzz';

    const description =
        page.metaDescription ||
        'Casas para eventos, filmagens e hospedagem em grupo. Encontre o espaço ideal com a Airbuzz.';

    const canonical = `https://blog.airbuzz.co${router.asPath}`;

    return (
        <>
            <Head>
                {/* Primary SEO */}
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonical} />

                {/* Open Graph */}
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonical} />
                <meta property="og:type" content="website" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Head>

            <div className="flex flex-col grow">
                {page?.backgroundImage && <BackgroundImage {...page?.backgroundImage} />}

                {site.header && (
                    <Annotated content={site}>
                        <Annotated content={site.header}>
                            <Header {...site.header} />
                        </Annotated>
                    </Annotated>
                )}

                <Annotated content={page}>
                    <main id="main" className="relative grow">
                        {props.children}
                    </main>
                </Annotated>

                {site.footer && (
                    <Annotated content={site}>
                        <Annotated content={site.footer}>
                            <Footer {...site.footer} />
                        </Annotated>
                    </Annotated>
                )}
            </div>
        </>
    );
};

export default BaseLayout;

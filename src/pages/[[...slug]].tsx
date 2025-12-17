import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// Importe aqui todos os seus outros componentes (Layout, Header, PostContent, etc.)
// Ex: import Layout from '../../components/Layout'; 
// Ex: import { getPostData, getAllPostSlugs } from '../../lib/posts'; 

// Defina a interface (tipo) para as props que a sua página recebe
interface PostPageProps {
  postData: {
    title: string;
    slug: string;
    // Adicione aqui outros campos do seu post (content, date, etc.)
  };
  // Adicione outras props se houver
}

// O componente principal da sua página
const BlogPage: React.FC<PostPageProps> = ({ postData }) => {
  const router = useRouter();
  
  // ⚠️ AJUSTE AQUI: Como obter o slug (o caminho da URL)
  // ----------------------------------------------------
  // Opção 1: Se o slug já vem diretamente nas props:
  const postSlug = postData.slug; 
  
  // Opção 2: Se você precisa construir o caminho baseado no router (menos ideal para SSG/SSR):
  // const postPath = router.asPath; 
  // const postSlug = postPath.split('/').pop() || postData.slug;
  // ----------------------------------------------------

  // Construção da URL Canônica (OBRIGATÓRIA)
  // Garante que o domínio seja o oficial (blog.airbuzz.co) e que inclua o /blog/
  const canonicalUrl = `https://blog.airbuzz.co/blog/${postSlug}`;

  // Se você tiver dados de post insuficientes (por exemplo, página 404), lide com isso primeiro
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }
  if (!postData) {
    // Isso deve retornar sua página 404 customizada
    return <h1>Página não encontrada</h1>; 
  }

  return (
    // O seu componente de layout principal
    // Ex: <Layout> 
    <>
      {/* 🟢 INJEÇÃO DA TAG CANÔNICA (CRÍTICO PARA SEO) */}
      <Head>
        <title>{postData.title} | Blog Airbuzz</title>
        
        {/* A TAG CANÔNICA */}
        <link rel="canonical" href={canonicalUrl} key="canonical" />
        
        {/* Outras meta tags de descrição, redes sociais, etc. */}
        {/* <meta name="description" content={postData.excerpt} /> */}
      </Head>

      {/* Seu conteúdo principal do post */}
      <article>
        <h1>{postData.title}</h1>
        {/* Renderize o conteúdo do postData aqui */}
        <div>Conteúdo do Post...</div>
      </article>
      
    </>
    // Ex: </Layout>
  );
};


// ⚠️ FUNÇÕES DE FETCH DE DADOS (getStaticProps e getStaticPaths)
// -------------------------------------------------------------
// Estas funções são CRUCIAIS no Next.js para buscar os dados no momento da compilação (SSG)
/*
export const getStaticProps: GetStaticProps = async ({ params }) => {
    // Exemplo: Buscar dados do post baseado no slug
    const slug = params.slug?.join('/') || '';
    const postData = await getPostData(slug); 

    if (!postData) {
        return { notFound: true };
    }

    return {
        props: {
            postData,
        },
        revalidate: 60, // Opcional: Revalidação para atualizar o post
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    // Exemplo: Obter todos os slugs para que o Next.js saiba quais páginas buildar
    const slugs = await getAllPostSlugs(); 
    const paths = slugs.map((slug) => ({
        params: { slug: slug.split('/') },
    }));

    return {
        paths,
        fallback: true, 
    };
};
*/
// -------------------------------------------------------------

export default BlogPage;

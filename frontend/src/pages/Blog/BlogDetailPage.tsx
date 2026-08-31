import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { useBlog, useBlogs } from '@/api/hooks';
import { SEOHead } from '@/components/common/SEOHead';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { NewsletterSignup } from '@/components/common/NewsletterSignup';
import { BlogShareButtons } from '@/components/blog/BlogShareButtons';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardTitle } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { estimateReadTime } from '@/utils/readTime';
import { resolveMediaUrl } from '@/utils/media';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, isError } = useBlog(slug || '');
  const { data: allBlogs } = useBlogs();
  const { name: companyName } = useCompanyBrand();

  if (isLoading) return <PageLoader />;
  if (isError || !blog) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-accent-600">Back to blog</Link>
      </Container>
    );
  }

  const readMinutes = estimateReadTime(blog.content);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const related = (allBlogs ?? [])
    .filter((b) => b.id !== blog.id && b.isPublished)
    .filter((b) => !blog.categoryId || b.categoryId === blog.categoryId)
    .slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt,
    datePublished: blog.publishedAt ?? blog.createdAt,
    dateModified: blog.updatedAt,
    author: { '@type': 'Organization', name: companyName || undefined },
  };

  return (
    <>
      <SEOHead
        title={blog.seoTitle || blog.title}
        description={blog.seoDescription || blog.excerpt}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <PageHero title={blog.title} subtitle={blog.excerpt} />
      <Container className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {blog.category && <Badge>{blog.category.name}</Badge>}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readMinutes} min read
              </span>
              {(blog.publishedAt || blog.createdAt) && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>

            {blog.featuredImageUrl && (
              <img
                src={resolveMediaUrl(blog.featuredImageUrl)}
                alt=""
                className="mb-8 w-full rounded-2xl border border-slate-200 object-cover shadow-sm"
              />
            )}

            <div
              className="prose prose-slate max-w-none prose-headings:text-primary-900 prose-p:text-slate-700 prose-a:text-primary-700"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            <div className="mt-10 border-t border-slate-200 pt-8">
              <BlogShareButtons title={blog.title} url={pageUrl} />
            </div>

            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-semibold text-primary-900">Related articles</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {related.map((item) => (
                    <Link key={item.id} to={`/blog/${item.slug}`} className="group">
                      <Card className="h-full transition-shadow hover:shadow-md">
                        <CardBody>
                          <CardTitle className="line-clamp-2 text-base group-hover:text-primary-700">
                            {item.title}
                          </CardTitle>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.excerpt}</p>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="space-y-6">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Newsletter</h2>
              <p className="mt-2 text-sm text-slate-600">
                Get product updates and insights from our team.
              </p>
              <div className="mt-4">
                <NewsletterSignup variant="light" />
              </div>
            </div>

            {(allBlogs ?? []).length > 1 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">More to read</h2>
                <ul className="mt-4 space-y-3">
                  {(allBlogs ?? [])
                    .filter((b) => b.id !== blog.id)
                    .slice(0, 5)
                    .map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/blog/${item.slug}`}
                          className="text-sm font-medium text-primary-800 hover:text-brand-gold-600"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}

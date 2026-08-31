import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useBlogs } from '@/api/hooks';
import { SEOHead } from '@/components/common/SEOHead';
import { PageHero } from '@/components/common/PageHero';
import { Container } from '@/components/common/Container';
import { NewsletterSignup } from '@/components/common/NewsletterSignup';
import { Card, CardBody, CardTitle } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { usePageHeroContent } from '@/hooks/useSectionContent';
import { estimateReadTime } from '@/utils/readTime';
import { resolveMediaUrl } from '@/utils/media';

export default function BlogPage() {
  const { data: blogs, isLoading } = useBlogs();
  const hero = usePageHeroContent('blog_page', {
    title: 'Blog',
    subtitle: 'Insights, trends, and best practices.',
  });

  if (isLoading) return <PageLoader />;

  return (
    <>
      <SEOHead title="Blog" description="Latest articles and insights." />
      <PageHero title={hero.title} subtitle={hero.subtitle} />
      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-8 md:grid-cols-2">
              {(blogs || []).map((blog) => {
                const readMinutes = estimateReadTime(blog.content || blog.excerpt);
                return (
                  <Card key={blog.id} className="overflow-hidden transition-shadow hover:shadow-md">
                    {blog.featuredImageUrl ? (
                      <img
                        src={resolveMediaUrl(blog.featuredImageUrl)}
                        alt=""
                        className="aspect-video w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-primary-100 to-slate-200" />
                    )}
                    <CardBody>
                      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                        {blog.category && (
                          <span className="rounded-full bg-primary-50 px-2 py-0.5 font-medium text-primary-700">
                            {blog.category.name}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {readMinutes} min
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{blog.excerpt}</p>
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="mt-4 inline-block text-sm font-medium text-accent-600"
                      >
                        Read more →
                      </Link>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <NewsletterSignup variant="light" />
          </aside>
        </div>
      </Container>
    </>
  );
}

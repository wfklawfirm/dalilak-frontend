import type { Metadata } from 'next'
import { FORMS_DATA } from '@/lib/procedures'
import FormDetailClient from './FormDetailClient'
import { notFound } from 'next/navigation'
import { buildBreadcrumbJsonLd, SITE_URL } from '@/lib/breadcrumbJsonLd'

// ── Static params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return FORMS_DATA.map(f => ({ slug: f.slug }))
}

// ── SEO metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const form = FORMS_DATA.find(f => f.slug === params.slug)
  if (!form) return { title: 'نموذج — دليلك' }

  const title = `${form.title_ar} — دليلك`
  const desc = `تنزيل نموذج ${form.title_ar} من ${form.authority_ar}. ${form.category_ar}. دليلك للمعاملات الحكومية اللبنانية.`
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      siteName: 'دليلك',
      locale: 'ar_LB',
    },
    alternates: {
      canonical: `/forms/${params.slug}`,
    },
  }
}

// ── Structured data (JSON-LD) ────────────────────────────────────────────────
function buildBreadcrumbs(form: (typeof FORMS_DATA)[number]) {
  return buildBreadcrumbJsonLd([
    { name: 'الرئيسية', url: SITE_URL },
    { name: 'النماذج', url: `${SITE_URL}/forms` },
    { name: form.title_ar, url: `${SITE_URL}/forms/${form.slug}` },
  ])
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FormDetailPage({ params }: { params: { slug: string } }) {
  const form = FORMS_DATA.find(f => f.slug === params.slug)
  if (!form) notFound()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbs(form!)) }}
      />
      <FormDetailClient form={form!} />
    </>
  )
}

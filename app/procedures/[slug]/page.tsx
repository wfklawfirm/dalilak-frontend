import { Metadata } from 'next'
import { getProcedureBySlug } from '@/lib/procedures'
import ProcedureDetailClient from './ProcedureDetailClient'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const proc = getProcedureBySlug(params.slug)
  if (!proc) {
    return {
      title: 'المعاملة غير موجودة | دليلك AI',
      description: 'تعذّر العثور على هذه المعاملة في دليلك AI.',
    }
  }
  const title = `${proc.title_ar} | دليلك AI`
  const description = proc.description_ar.slice(0, 160)
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'دليلك AI',
      locale: 'ar_LB',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/procedures/${params.slug}`,
    },
  }
}

export default function ProcedureDetailPage({ params }: Props) {
  return <ProcedureDetailClient />
}

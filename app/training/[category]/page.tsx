import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/auth'
import { trainingCategories, type TrainingCategory } from '@/lib/training/catalog/types'
import { categoryDescriptions, categoryLabels } from '@/lib/training/workouts'
import { TrainingShell } from '@/components/training/training-shell'
import { TrainingCategoryView } from '@/components/training/category-view'

interface Props {
  params: Promise<{ category: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TrainingCategoryPage({ params, searchParams }: Props) {
  const [user, route, query] = await Promise.all([getCurrentUser(), params, searchParams])
  if (!user?.id) redirect('/auth/login')
  if (!trainingCategories.includes(route.category as TrainingCategory)) notFound()
  const category = route.category as TrainingCategory
  const option = (key: string) => {
    const value = query[key]
    return typeof value === 'string' ? value : undefined
  }

  return (
    <TrainingShell title={categoryLabels[category]} description={categoryDescriptions[category]}>
      <TrainingCategoryView
        key={[route.category, option('activityId'), option('plannedActivityId'), option('template'), option('templateId'), option('programme'), option('day'), option('deload'), option('substitutions')].join('|')}
        category={category}
        userId={user.id}
        plannedActivityId={option('activityId') ?? option('plannedActivityId')}
        initialTemplateSlug={option('template')}
        initialTemplateId={option('templateId')}
        programmeSlug={option('programme')}
        programmeDay={Number(option('day'))}
        deload={option('deload') === '1'}
        substitutions={option('substitutions')}
      />
    </TrainingShell>
  )
}

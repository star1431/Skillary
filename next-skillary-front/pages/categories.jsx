import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { CategoriesPage } from '@/creatorhub/pages/CategoriesPage'

export default function Categories({ initialCategory }) {
  return (
    <AppShell>
      {(navigate) => <CategoriesPage onNavigate={navigate} initialCategory={initialCategory} />}
    </AppShell>
  )
}

export async function getServerSideProps({ query }) {
  return { props: { initialCategory: query.category ?? null } }
}



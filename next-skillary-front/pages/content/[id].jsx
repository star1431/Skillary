import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { ContentDetailPage } from '@/creatorhub/pages/ContentDetailPage'

export default function ContentDetail({ id }) {
  return <AppShell>{(navigate) => <ContentDetailPage contentId={id} onNavigate={navigate} />}</AppShell>
}

export async function getServerSideProps({ params }) {
  return { props: { id: params.id } }
}



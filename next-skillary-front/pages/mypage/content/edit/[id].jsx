import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { ContentEditorPage } from '@/creatorhub/pages/ContentEditorPage'

export default function ContentEdit({ id }) {
  return <AppShell>{(navigate) => <ContentEditorPage contentId={id} onNavigate={navigate} />}</AppShell>
}

export async function getServerSideProps({ params }) {
  return { props: { id: params.id } }
}



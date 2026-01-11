import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { CreatorProfilePage } from '@/creatorhub/pages/CreatorProfilePage'

export default function CreatorProfile({ id }) {
  return (
    <AppShell>{(navigate) => <CreatorProfilePage creatorId={id} onNavigate={navigate} />}</AppShell>
  )
}

export async function getServerSideProps({ params }) {
  return { props: { id: params.id } }
}



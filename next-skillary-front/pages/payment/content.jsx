import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { PaymentPage } from '@/creatorhub/pages/PaymentPage'

export default function ContentPayment({ contentId }) {
  return (
    <AppShell>
      {(navigate) => <PaymentPage type="content" contentId={contentId} onNavigate={navigate} />}
    </AppShell>
  )
}

export async function getServerSideProps({ query }) {
  return { props: { contentId: query.contentId ?? null } }
}



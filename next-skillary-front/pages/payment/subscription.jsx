import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { PaymentPage } from '@/creatorhub/pages/PaymentPage'

export default function SubscriptionPayment({ planId }) {
  return (
    <AppShell>
      {(navigate) => <PaymentPage type="subscription" planId={planId} onNavigate={navigate} />}
    </AppShell>
  )
}

export async function getServerSideProps({ query }) {
  return { props: { planId: query.planId ?? null } }
}



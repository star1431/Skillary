import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { ContentEditorPage } from '@/creatorhub/pages/ContentEditorPage'

export default function ContentNew() {
  return <AppShell>{(navigate) => <ContentEditorPage onNavigate={navigate} />}</AppShell>
}



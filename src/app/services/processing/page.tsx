import { createPageMetadata } from '@/lib/seo/metadata';
import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';

export const metadata = createPageMetadata({
  title: 'Processing Hubs',
  description:
    'Milling, drying, cold chain, and packaging facilities near farming clusters. Shared-use processing hubs that multiply crop value and reduce waste.',
  path: '/services/processing',
});

export default function Page() {
  return (
    <EditableServicePage
      slug="processing"
      fallback={SERVICE_DEFAULTS.processing}
      disclaimerType="general"
    />
  );
}

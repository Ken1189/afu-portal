import { createPageMetadata } from '@/lib/seo/metadata';
import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';

export const metadata = createPageMetadata({
  title: 'Guaranteed Offtake',
  description:
    'Pre-arranged buyer contracts before planting season. AFU connects farmers to exporters, retailers, and processors with price-floor guarantees.',
  path: '/services/offtake',
});

export default function Page() {
  return (
    <EditableServicePage
      slug="offtake"
      fallback={SERVICE_DEFAULTS.offtake}
      disclaimerType="general"
    />
  );
}

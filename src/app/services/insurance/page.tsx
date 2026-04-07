import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Insurance Products',
  description:
    'Protect your farm, crops, livestock, and family with AFU Insurance. Comprehensive agricultural insurance with fast claims and affordable premiums.',
  path: '/services/insurance',
});

export default function InsuranceServicePage() {
  return (
    <EditableServicePage slug="insurance" fallback={SERVICE_DEFAULTS.insurance} />
  );
}

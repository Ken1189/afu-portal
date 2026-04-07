import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Veterinary Services',
  description:
    'On-call veterinarians, vaccination programmes and digital herd-health records for African livestock farmers.',
  path: '/services/veterinary',
});

export default function VeterinaryServicePage() {
  return (
    <EditableServicePage slug="veterinary" fallback={SERVICE_DEFAULTS.veterinary} disclaimerType="medical" />
  );
}

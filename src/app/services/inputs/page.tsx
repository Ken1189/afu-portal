import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Farm Inputs',
  description:
    'Verified seed, fertiliser, agro-chem and equipment from approved suppliers — delivered to your gate.',
  path: '/services/inputs',
});

export default function InputsServicePage() {
  return (
    <EditableServicePage slug="inputs" fallback={SERVICE_DEFAULTS.inputs} disclaimerType="general" />
  );
}

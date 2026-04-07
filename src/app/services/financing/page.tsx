import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';

export const metadata = { title: 'Financing - AFU Services' };

export default function FinancingServicePage() {
  return (
    <EditableServicePage slug="financing" fallback={SERVICE_DEFAULTS.financing} />
  );
}

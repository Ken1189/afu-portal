import { createPageMetadata } from '@/lib/seo/metadata';
import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';

export const metadata = createPageMetadata({
  title: 'Trade Finance',
  description:
    'Letters of credit, export guarantees, forex management, and pre-export financing for cross-border agricultural trade across Africa.',
  path: '/services/trade-finance',
});

export default function Page() {
  return (
    <EditableServicePage
      slug="trade-finance"
      fallback={SERVICE_DEFAULTS['trade-finance']}
      disclaimerType="finance"
    />
  );
}

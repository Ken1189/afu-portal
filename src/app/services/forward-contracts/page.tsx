import { createPageMetadata } from '@/lib/seo/metadata';
import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';

export const metadata = createPageMetadata({
  title: 'Forward Growing Contracts & Off-takers',
  description:
    'Secure guaranteed buyers and prices before you plant. AFU connects farmers with verified off-takers through legally binding forward contracts, eliminating market uncertainty.',
  path: '/services/forward-contracts',
});

export default function Page() {
  return (
    <EditableServicePage
      slug="forward-contracts"
      fallback={SERVICE_DEFAULTS['forward-contracts']}
      disclaimerType="general"
    />
  );
}

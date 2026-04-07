import { createPageMetadata } from '@/lib/seo/metadata';
import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';

export const metadata = createPageMetadata({
  title: 'Legal Assistance',
  description:
    'Professional legal support for African farmers. Land rights, contract review, dispute resolution, and regulatory compliance services.',
  path: '/services/legal-assistance',
});

export default function Page() {
  return (
    <EditableServicePage
      slug="legal-assistance"
      fallback={SERVICE_DEFAULTS['legal-assistance']}
      disclaimerType="legal"
    />
  );
}

import EditableServicePage from '@/components/services/EditableServicePage';
import { SERVICE_DEFAULTS } from '@/components/services/defaults';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Training & Extension',
  description:
    'GAP, GlobalGAP and post-harvest training delivered by AFU agronomists and certified trainers.',
  path: '/services/training',
});

export default function TrainingServicePage() {
  return (
    <EditableServicePage slug="training" fallback={SERVICE_DEFAULTS.training} disclaimerType="general" />
  );
}

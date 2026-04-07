import { redirect } from 'next/navigation';

// /farm/loans is an alias for /farm/financing — the canonical loans page.
// Financing already has loan stats, application flow, schedules, and history.
export default function FarmLoansRedirect() {
  redirect('/farm/financing');
}

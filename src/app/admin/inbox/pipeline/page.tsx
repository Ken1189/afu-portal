import { redirect } from 'next/navigation';
export default function Page() {
  redirect('/admin/inbox?view=pipeline');
}

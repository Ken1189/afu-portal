import { redirect } from 'next/navigation';
export default function Page() {
  redirect('/admin/loans?tab=collections');
}

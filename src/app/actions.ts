
'use server';

import { redirect } from 'next/navigation';

export async function search(formData: FormData) {
  const query = formData.get('query');
  if (query) {
    redirect(`/search?q=${encodeURIComponent(query as string)}`);
  } else {
    redirect('/');
  }
}

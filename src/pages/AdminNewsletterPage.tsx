import React from 'react';
import { AdminNewsletter } from '@/components/AdminNewsletter';

export default function AdminNewsletterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Nyhetsbrev</h1>
      </div>

      <AdminNewsletter />
    </div>
  );
}
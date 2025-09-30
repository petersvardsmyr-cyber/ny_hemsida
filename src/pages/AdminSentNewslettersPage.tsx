import React from 'react';
import { AdminSentNewsletters } from '@/components/AdminSentNewsletters';

export default function AdminSentNewslettersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Skickade nyhetsbrev</h1>
      </div>

      <AdminSentNewsletters />
    </div>
  );
}

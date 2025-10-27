import React from 'react';
import { AdminNewsletterSubscribers } from '@/components/AdminNewsletterSubscribers';
import { AdminImportSubscribers } from '@/components/AdminImportSubscribers';

export default function AdminNewsletterSubscribersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Prenumeranter</h1>
      </div>

      <AdminImportSubscribers />

      <AdminNewsletterSubscribers />
    </div>
  );
}

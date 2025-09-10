import React from 'react';
import { AdminEmailTemplates } from '@/components/AdminEmailTemplates';
import { TestOrderEmail } from '@/components/TestOrderEmail';

export default function AdminEmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">E-postmallar</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminEmailTemplates />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Testa e-post</h2>
          <TestOrderEmail />
        </div>
      </div>
    </div>
  );
}
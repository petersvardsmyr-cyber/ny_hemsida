import React from 'react';
import { AdminEmailTemplates } from '@/components/AdminEmailTemplates';

export default function AdminEmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">E-postmallar (Legacy)</h1>
        <p className="text-muted-foreground">
          Denna sida har ersatts av de nya E-postnotiser-sektionerna i menyn
        </p>
      </div>
      
      <AdminEmailTemplates />
    </div>
  );
}
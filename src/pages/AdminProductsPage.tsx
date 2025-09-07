import React from 'react';
import { AdminProducts } from '@/components/AdminProducts';

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Produkter</h1>
      </div>

      <AdminProducts />
    </div>
  );
}
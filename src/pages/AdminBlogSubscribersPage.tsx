import { AdminNewsletterSubscribers } from '@/components/AdminNewsletterSubscribers';

export default function AdminBlogSubscribersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Bloggprenumeranter</h1>
      <AdminNewsletterSubscribers />
    </div>
  );
}

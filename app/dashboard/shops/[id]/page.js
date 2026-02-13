import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import EditShopForm from '@/components/shop/EditShopForm';

async function getShop(shopId, userId) {
  console.log(shopId);
  
  await connectDB();
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId: userId,
  }).lean();

  return shop ? JSON.parse(JSON.stringify(shop)) : null;
}

export default async function EditShopPage({ params }) {
  const { id } = await params; 

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const shop = await getShop(id, session.user.id); // ✅ use id

  if (!shop) {
    redirect('/dashboard/shops');
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <EditShopForm shop={shop} />
      </div>
    </div>
  );
}

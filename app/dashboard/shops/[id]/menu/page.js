import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import MenuCategory from '@/models/MenuCategory';
import MenuItem from '@/models/MenuItem';
import MenuManager from '@/components/shop/MenuManager';

async function getShopData(shopId, userId) {
  await connectDB();
  
  const shop = await Shop.findOne({ _id: shopId, ownerId: userId }).lean();
  if (!shop) return null;

  const categories = await MenuCategory.find({ shopId }).sort({ order: 1 }).lean();
  const items = await MenuItem.find({ shopId }).populate('categoryId').lean();

  return {
    shop: JSON.parse(JSON.stringify(shop)),
    categories: JSON.parse(JSON.stringify(categories)),
    items: JSON.parse(JSON.stringify(items)),
  };
}

export default async function MenuPage({ params }) {
  const { id } = await params; 
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getShopData(id, session.user.id);

  if (!data) {
    redirect('/dashboard/shops');
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <MenuManager 
          shop={data.shop} 
          categories={data.categories} 
          items={data.items} 
        />
      </div>
    </div>
  );
}

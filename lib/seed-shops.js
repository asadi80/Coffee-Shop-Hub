// scripts/seed.js

const API_URL = process.env.API_URL || "http://localhost:3000";

async function seedDatabase() {
  console.log("🌱 Starting database seed...\n");

  try {
    const response = await fetch(`${API_URL}/api/admin/seed/seed-shops`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to seed database");
    }

    console.log("✅ " + data.message);
    console.log("\n📊 Summary:");
    console.log(`   - Shops created: ${data.stats.shops.total}`);
    console.log(`   - Cities covered: ${data.stats.shops.cities}`);
    console.log(`   - Countries covered: ${data.stats.shops.countries}`);
    console.log(
      `   - Menu categories per shop: ${data.stats.menu.categoriesPerShop}`
    );
    console.log(
      `   - Average items per shop: ~${data.stats.menu.avgItemsPerShop}`
    );

    console.log(`\n🔑 Test Credentials:`);
    console.log(`   Email: ${data.stats.credentials.email}`);
    console.log(`   Password: ${data.stats.credentials.password}`);

    console.log("\n✨ You can now login and view all shops!");

    if (data.stats.shopsCreated?.length > 0) {
      console.log("\n🏪 Shops created:");

      data.stats.shopsCreated.slice(0, 5).forEach((shop, index) => {
        console.log(
          `   ${index + 1}. ${shop.name} - ${shop.city}, ${shop.country}`
        );
      });

      if (data.stats.shopsCreated.length > 5) {
        console.log(
          `   ... and ${data.stats.shopsCreated.length - 5} more`
        );
      }
    }
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    console.log(
      "\n💡 Make sure your Next.js server is running on http://localhost:3000"
    );
    process.exit(1);
  }
}

seedDatabase();

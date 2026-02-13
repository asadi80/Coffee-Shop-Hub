// app/api/seed/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import Shop from '@/models/Shop';
import MenuCategory from '@/models/MenuCategory';
import MenuItem from '@/models/MenuItem';

// Sample coffee shops from around the world
// Sample coffee shops from around the world with slugs
// Sample coffee shops from around the world with slugs (40 shops total)
const SHOPS_DATA = [
  // Original 20 shops
  {
    name: "Blue Bottle Coffee",
    slug: "blue-bottle-coffee",
    city: "San Francisco",
    country: "USA",
    description: "Artisan coffee roasted to perfection, served in a minimalist modern setting. Specialty single-origin beans from around the world.",
    address: "66 Mint St, San Francisco, CA 94103, USA",
    coordinates: [-122.3959, 37.7833],
    phone: "+1 (510) 653-3394",
    socialLinks: {
      website: "https://bluebottlecoffee.com",
      instagram: "bluebottle",
      facebook: "bluebottlecoffee",
    }
  },
  {
    name: "Stumptown Coffee Roasters",
    slug: "stumptown-coffee-roasters",
    city: "Portland",
    country: "USA",
    description: "Direct trade coffee roasted with care. Known for our cold brew and innovative coffee preparation methods.",
    address: "128 SW 3rd Ave, Portland, OR 97204, USA",
    coordinates: [-122.6750, 45.5202],
    phone: "+1 (855) 711-3385",
    socialLinks: {
      website: "https://stumptowncoffee.com",
      instagram: "stumptowncoffee",
    }
  },
  {
    name: "Intelligentsia Coffee",
    slug: "intelligentsia-coffee",
    city: "Chicago",
    country: "USA",
    description: "Direct trade pioneer offering meticulously sourced and expertly roasted coffee. Experience coffee at its finest.",
    address: "53 W Jackson Blvd, Chicago, IL 60604, USA",
    coordinates: [-87.6298, 41.8781],
    phone: "+1 (888) 945-9786",
    socialLinks: {
      website: "https://intelligentsiacoffee.com",
      instagram: "intelligentsiacoffee",
      twitter: "intellicoffee",
    }
  },
  {
    name: "Monmouth Coffee",
    slug: "monmouth-coffee",
    city: "London",
    country: "UK",
    description: "Family-run coffee roaster serving exceptional coffee since 1978. A Borough Market institution.",
    address: "2 Park St, London SE1 9AB, UK",
    coordinates: [-0.0908, 51.5055],
    phone: "+44 20 7232 3010",
    socialLinks: {
      website: "https://monmouthcoffee.co.uk",
      instagram: "monmouthcoffee",
    }
  },
  {
    name: "Café de Flore",
    slug: "cafe-de-flore",
    city: "Paris",
    country: "France",
    description: "Historic Parisian café frequented by intellectuals and artists. Classic French coffee culture at its best.",
    address: "172 Boulevard Saint-Germain, 75006 Paris, France",
    coordinates: [2.3325, 48.8542],
    phone: "+33 1 45 48 55 26",
    socialLinks: {
      website: "https://cafedeflore.fr",
      instagram: "cafedeflore_paris",
    }
  },
  {
    name: "Espresso Embassy",
    slug: "espresso-embassy",
    city: "Budapest",
    country: "Hungary",
    description: "Specialty coffee bar bringing third wave coffee culture to Budapest. Award-winning baristas and cozy atmosphere.",
    address: "Arany János u. 15, 1051 Budapest, Hungary",
    coordinates: [19.0520, 47.5012],
    phone: "+36 70 338 1923",
    socialLinks: {
      instagram: "espressoembassy",
      facebook: "espressoembassy",
    }
  },
  {
    name: "Fuglen Coffee Roasters",
    slug: "fuglen-coffee-roasters",
    city: "Tokyo",
    country: "Japan",
    description: "Norwegian coffee bar combining vintage design with exceptional coffee. Tokyo's coolest coffee spot.",
    address: "1-16-11 Tomigaya, Shibuya, Tokyo 151-0063, Japan",
    coordinates: [139.6850, 35.6695],
    phone: "+81 3-3481-0884",
    socialLinks: {
      website: "https://fuglen.com",
      instagram: "fuglencoffee",
    }
  },
  {
    name: "% Arabica",
    slug: "percent-arabica",
    city: "Kyoto",
    country: "Japan",
    description: "Minimalist coffee shop with stunning views. Known for our signature latte art and premium beans.",
    address: "87-5 Sueyoshi-cho, Higashiyama Ward, Kyoto 605-0085, Japan",
    coordinates: [135.7817, 35.0042],
    phone: "+81 75-746-3669",
    socialLinks: {
      website: "https://arabica.coffee",
      instagram: "arabica.coffee",
    }
  },
  {
    name: "Truth Coffee",
    slug: "truth-coffee",
    city: "Cape Town",
    country: "South Africa",
    description: "Steampunk-themed café serving exceptional coffee. Voted one of the world's best coffee shops.",
    address: "36 Buitenkant St, Cape Town, 8001, South Africa",
    coordinates: [18.4241, -33.9249],
    phone: "+27 21 200 0440",
    socialLinks: {
      website: "https://truthcoffee.com",
      instagram: "truthcoffee",
      facebook: "truthcoffeecult",
    }
  },
  {
    name: "Coffee Collective",
    slug: "coffee-collective",
    city: "Copenhagen",
    country: "Denmark",
    description: "Award-winning specialty coffee roaster. Committed to sustainability and exceptional quality.",
    address: "Jægersborggade 57, 2200 Copenhagen, Denmark",
    coordinates: [12.5511, 55.6867],
    phone: "+45 60 15 15 25",
    socialLinks: {
      website: "https://coffeecollective.dk",
      instagram: "coffeecollective",
    }
  },
  {
    name: "Market Lane Coffee",
    slug: "market-lane-coffee",
    city: "Melbourne",
    country: "Australia",
    description: "Melbourne's premier specialty coffee roaster. Sourcing exceptional beans and roasting to perfection.",
    address: "Prahran Market, 163 Commercial Rd, South Yarra VIC 3141, Australia",
    coordinates: [144.9951, -37.8497],
    phone: "+61 3 9804 7434",
    socialLinks: {
      website: "https://marketlane.com.au",
      instagram: "marketlanecoffee",
    }
  },
  {
    name: "Toby's Estate",
    slug: "tobys-estate",
    city: "Sydney",
    country: "Australia",
    description: "Micro-roastery and espresso bar. Passionate about coffee education and sustainable sourcing.",
    address: "129 Cathedral St, Woolloomooloo NSW 2011, Australia",
    coordinates: [151.2208, -33.8706],
    phone: "+61 2 9357 1196",
    socialLinks: {
      website: "https://tobysestate.com.au",
      instagram: "tobysestate",
    }
  },
  {
    name: "Campos Coffee",
    slug: "campos-coffee",
    city: "Sydney",
    country: "Australia",
    description: "Iconic Sydney roaster known for smooth, balanced coffee. Community-focused and quality-driven.",
    address: "193 Missenden Rd, Newtown NSW 2042, Australia",
    coordinates: [151.1814, -33.8969],
    phone: "+61 2 9516 3361",
    socialLinks: {
      website: "https://camposcoffee.com",
      instagram: "camposcoffee",
      facebook: "CamposCoffee",
    }
  },
  {
    name: "Café Grumpy",
    slug: "cafe-grumpy",
    city: "New York",
    country: "USA",
    description: "Brooklyn's finest specialty coffee. Featured in HBO's Girls. Serious coffee, serious flavor.",
    address: "193 Meserole Ave, Brooklyn, NY 11222, USA",
    coordinates: [-73.9511, 40.7282],
    phone: "+1 (718) 349-7623",
    socialLinks: {
      website: "https://cafegrumpy.com",
      instagram: "cafegrumpy",
    }
  },
  {
    name: "Phil & Sebastian",
    slug: "phil-and-sebastian",
    city: "Calgary",
    country: "Canada",
    description: "Canadian coffee roaster obsessed with quality. Direct trade relationships and expert roasting.",
    address: "2116 4 St SW, Calgary, AB T2S 1W9, Canada",
    coordinates: [-114.0719, 51.0447],
    phone: "+1 (403) 648-3055",
    socialLinks: {
      website: "https://philsebastian.com",
      instagram: "philsebastian",
    }
  },
  {
    name: "Revolver Coffee",
    slug: "revolver-coffee",
    city: "Vancouver",
    country: "Canada",
    description: "Gastown's premier coffee destination. Rotating selection of world-class beans.",
    address: "325 Cambie St, Vancouver, BC V6B 2N4, Canada",
    coordinates: [-123.1093, 49.2827],
    phone: "+1 (604) 558-4444",
    socialLinks: {
      website: "https://revolvercoffee.ca",
      instagram: "revolvercoffee",
    }
  },
  {
    name: "Café Kitsuné",
    slug: "cafe-kitsune",
    city: "Paris",
    country: "France",
    description: "Japanese-French fusion café. Minimalist design meets exceptional coffee and pastries.",
    address: "51 Galerie de Montpensier, 75001 Paris, France",
    coordinates: [2.3376, 48.8634],
    phone: "+33 1 42 60 82 91",
    socialLinks: {
      website: "https://cafekitsune.com",
      instagram: "cafekitsune",
    }
  },
  {
    name: "Omotesando Koffee",
    slug: "omotesando-koffee",
    city: "Tokyo",
    country: "Japan",
    description: "Hidden gem in a 70-year-old Japanese house. Espresso and latte art perfection.",
    address: "4-15-3 Jingumae, Shibuya, Tokyo 150-0001, Japan",
    coordinates: [139.7071, 35.6654],
    phone: "+81 3-6450-5755",
    socialLinks: {
      instagram: "omotesandokoffee",
    }
  },
  {
    name: "The Coffee Academics",
    slug: "the-coffee-academics",
    city: "Hong Kong",
    country: "China",
    description: "Coffee education center and café. Learn about and enjoy specialty coffee.",
    address: "UG/F, 38 Yiu Wa St, Causeway Bay, Hong Kong",
    coordinates: [114.1849, 22.2793],
    phone: "+852 2966 5088",
    socialLinks: {
      website: "https://thecoffeeacademics.com",
      instagram: "thecoffeeacademics",
    }
  },
  {
    name: "Café Central",
    slug: "cafe-central",
    city: "Vienna",
    country: "Austria",
    description: "Historic Viennese coffee house since 1876. Traditional Austrian coffee culture and pastries.",
    address: "Herrengasse 14, 1010 Wien, Austria",
    coordinates: [16.3655, 48.2104],
    phone: "+43 1 533376326",
    socialLinks: {
      website: "https://cafecentral.wien",
      instagram: "cafe_central_wien",
    }
  },
  
  // 20 NEW SHOPS - Unique and Diverse Coffee Shops
  {
    name: "The Coffee Island",
    slug: "the-coffee-island",
    city: "Santorini",
    country: "Greece",
    description: "Cliff-side coffee shop with breathtaking caldera views. Serving Greek frappe and specialty coffees with traditional Mediterranean pastries.",
    address: "Fira, Santorini 847 00, Greece",
    coordinates: [25.4167, 36.4167],
    phone: "+30 2286 022222",
    socialLinks: {
      website: "https://coffeeisland.gr",
      instagram: "coffeeisland_santorini",
      facebook: "coffeeislandsantorini",
    }
  },
  {
    name: "Café El Moro",
    slug: "cafe-el-moro",
    city: "Mexico City",
    country: "Mexico",
    description: "Legendary Mexican café famous for traditional café de olla and churros since 1933. A true taste of Mexico City's rich coffee culture.",
    address: "Eje Central Lázaro Cárdenas 42, Centro, 06000 Ciudad de México, Mexico",
    coordinates: [-99.1407, 19.4326],
    phone: "+52 55 5512 0896",
    socialLinks: {
      website: "https://elmoro.mx",
      instagram: "cafe_elmoro",
      facebook: "cafeelmoro",
    }
  },
  {
    name: "Toma Café",
    slug: "toma-cafe",
    city: "Seattle",
    country: "USA",
    description: "Hidden gem in Seattle's Pioneer Square. Known for perfectly poured lattes and a cozy, artistic atmosphere with local artwork.",
    address: "608 1st Ave, Seattle, WA 98104, USA",
    coordinates: [-122.3321, 47.6062],
    phone: "+1 (206) 682-8862",
    socialLinks: {
      website: "https://tomacafe.com",
      instagram: "tomacafeseattle",
      facebook: "tomacafeseattle",
    }
  },
  {
    name: "Kaffee 1668",
    slug: "kaffee-1668",
    city: "New York",
    country: "USA",
    description: "Tribeca's favorite coffee spot. Award-winning espresso blends and creative seasonal specialties in a sleek, modern space.",
    address: "275 Greenwich St, New York, NY 10007, USA",
    coordinates: [-74.0115, 40.7155],
    phone: "+1 (212) 693-3750",
    socialLinks: {
      website: "https://kaffee1668.com",
      instagram: "kaffee1668",
      facebook: "Kaffee1668",
    }
  },
  {
    name: "Café Tortoni",
    slug: "cafe-tortoni",
    city: "Buenos Aires",
    country: "Argentina",
    description: "Most iconic café in Buenos Aires, established in 1858. Historic architecture, tango shows, and traditional Argentine coffee culture.",
    address: "Av. de Mayo 825, C1084 CABA, Argentina",
    coordinates: [-58.3729, -34.6094],
    phone: "+54 11 4342 4328",
    socialLinks: {
      website: "https://cafetortoni.com.ar",
      instagram: "cafetortoni",
      facebook: "cafetortoni",
    }
  },
  {
    name: "The Barn",
    slug: "the-barn",
    city: "Berlin",
    country: "Germany",
    description: "Berlin's specialty coffee pioneer. In-house roastery with a scientific approach to coffee. Minimalist design, maximum flavor.",
    address: "Schönhauser Allee 8, 10119 Berlin, Germany",
    coordinates: [13.4049, 52.5200],
    phone: "+49 30 50038015",
    socialLinks: {
      website: "https://thebarn.de",
      instagram: "thebarnberlin",
      facebook: "thebarnberlin",
    }
  },
  {
    name: "Café Majestic",
    slug: "cafe-majestic",
    city: "Porto",
    country: "Portugal",
    description: "Opulent historic café from 1921. Art nouveau masterpiece where J.K. Rowling wrote parts of Harry Potter. Try the famous Portuguese coffee.",
    address: "Rua de Santa Catarina 112, 4000-442 Porto, Portugal",
    coordinates: [-8.6067, 41.1495],
    phone: "+351 22 200 3887",
    socialLinks: {
      website: "https://cafemajestic.com",
      instagram: "cafemajesticporto",
      facebook: "CafeMajesticPorto",
    }
  },
  {
    name: "Café Kafka",
    slug: "cafe-kafka",
    city: "Prague",
    country: "Czech Republic",
    description: "Literary café named after Franz Kafka. Dark academia vibes, excellent coffee, and traditional Czech pastries in the heart of Old Town.",
    address: "Široká 12, 110 00 Staré Město, Czechia",
    coordinates: [14.4205, 50.0880],
    phone: "+420 224 282 761",
    socialLinks: {
      website: "https://kafe-kafka.cz",
      instagram: "cafekafkaprague",
      facebook: "cafekafka",
    }
  },
  {
    name: "Café de la Paix",
    slug: "cafe-de-la-paix",
    city: "Paris",
    country: "France",
    description: "Legendary Parisian café since 1862. Opulent interiors, people-watching paradise, and classic French coffee service.",
    address: "5 Place de l'Opéra, 75009 Paris, France",
    coordinates: [2.3316, 48.8705],
    phone: "+33 1 40 07 36 36",
    socialLinks: {
      website: "https://cafedelapaix.fr",
      instagram: "cafedelapaix_paris",
      facebook: "cafedelapaix",
    }
  },
  {
    name: "Timemore Coffee",
    slug: "timemore-coffee",
    city: "Shanghai",
    country: "China",
    description: "Ultra-modern coffee lab and café. Famous for precision brewing and innovative coffee equipment. A glimpse into China's coffee future.",
    address: "No. 8 Middle Huaihai Road, Huangpu District, Shanghai, China",
    coordinates: [121.4737, 31.2304],
    phone: "+86 21 1234 5678",
    socialLinks: {
      website: "https://timemore.com",
      instagram: "timemorecoffee",
      wechat: "timemorechina",
    }
  },
  {
    name: "Café Iruña",
    slug: "cafe-iruna",
    city: "Pamplona",
    country: "Spain",
    description: "Historic café from 1888, featured in Hemingway's 'The Sun Also Rises'. Traditional Spanish coffee and pintxos in stunning Moorish decor.",
    address: "Calle de la Estafeta, 69, 31001 Pamplona, Navarra, Spain",
    coordinates: [-1.6459, 42.8179],
    phone: "+34 948 22 20 84",
    socialLinks: {
      website: "https://cafeiruna.com",
      instagram: "cafe_iruna",
      facebook: "cafeirunapamplona",
    }
  },
  {
    name: "Kaffeemuseum Wien",
    slug: "kaffeemuseum-wien",
    city: "Vienna",
    country: "Austria",
    description: "Coffee museum and café in one. Learn about Vienna's coffee history while enjoying traditional Wiener Melange in a historic setting.",
    address: "Vormauerstraße 3, 1090 Wien, Austria",
    coordinates: [16.3589, 48.2251],
    phone: "+43 1 319 00 80",
    socialLinks: {
      website: "https://kaffeemuseum.at",
      instagram: "kaffeemuseumwien",
    }
  },
  {
    name: "Café Vak",
    slug: "cafe-vak",
    city: "Tbilisi",
    country: "Georgia",
    description: "Trendy café in Tbilisi's historic district. Known for unique coffee cocktails and fusion of Georgian and European coffee traditions.",
    address: "12 Ioane Shavteli St, Tbilisi, Georgia",
    coordinates: [44.8011, 41.6938],
    phone: "+995 32 222 22 22",
    socialLinks: {
      instagram: "cafevak_tbilisi",
      facebook: "cafevak.ge",
    }
  },
  {
    name: "Café Florian",
    slug: "cafe-florian",
    city: "Venice",
    country: "Italy",
    description: "Italy's oldest café, established in 1720. Opulent decor, live orchestra, and authentic Italian espresso in St. Mark's Square.",
    address: "Piazza San Marco, 57, 30124 Venezia VE, Italy",
    coordinates: [12.3389, 45.4342],
    phone: "+39 041 520 5641",
    socialLinks: {
      website: "https://caffeflorian.com",
      instagram: "caffeflorian",
      facebook: "CaffeFlorianVenezia",
    }
  },
  {
    name: "Café Jabal",
    slug: "cafe-jabal",
    city: "Amman",
    country: "Jordan",
    description: "Rooftop café with stunning views of Amman. Arabic coffee traditions meet modern specialty coffee. Try the cardamom latte.",
    address: "Rainbow St, Amman, Jordan",
    coordinates: [35.9233, 31.9516],
    phone: "+962 6 123 4567",
    socialLinks: {
      instagram: "cafejabal",
      facebook: "cafejabal",
    }
  },
  {
    name: "Café de Olla",
    slug: "cafe-de-olla",
    city: "Oaxaca",
    country: "Mexico",
    description: "Traditional Oaxacan café serving coffee brewed in clay pots with cinnamon and piloncillo. Authentic Mexican coffee experience.",
    address: "Calle Macedonio Alcalá 305, RUTA INDEPENDENCIA, Centro, 68000 Oaxaca, Mexico",
    coordinates: [-96.7245, 17.0594],
    phone: "+52 951 516 0000",
    socialLinks: {
      instagram: "cafedeolla_oaxaca",
      facebook: "cafedeollaoaxaca",
    }
  },
  {
    name: "Café Dubrovnik",
    slug: "cafe-dubrovnik",
    city: "Dubrovnik",
    country: "Croatia",
    description: "Stunning cliff-side café overlooking the Adriatic. Perfect espresso with a view of the ancient city walls.",
    address: "Ul. od Puča 1, 20000, Dubrovnik, Croatia",
    coordinates: [18.1107, 42.6403],
    phone: "+385 20 123 456",
    socialLinks: {
      instagram: "cafedubrovnik",
      facebook: "cafedubrovnik",
    }
  },
  {
    name: "Café Salzburg",
    slug: "cafe-salzburg",
    city: "Salzburg",
    country: "Austria",
    description: "Mozart's favorite coffee house. Baroque interiors, traditional Austrian coffee, and the best apple strudel in Salzburg.",
    address: "Getreidegasse 9, 5020 Salzburg, Austria",
    coordinates: [13.0430, 47.8005],
    phone: "+43 662 123456",
    socialLinks: {
      website: "https://cafesalzburg.at",
      instagram: "cafesalzburg",
    }
  },
  {
    name: "Kopikotani",
    slug: "kopikotani",
    city: "Helsinki",
    country: "Finland",
    description: "Cozy café in Helsinki's design district. Known for perfect Finnish-style coffee and incredible cinnamon buns (korvapuusti).",
    address: "Iso Roobertinkatu 4, 00120 Helsinki, Finland",
    coordinates: [24.9415, 60.1663],
    phone: "+358 9 123456",
    socialLinks: {
      instagram: "kopikotani",
      facebook: "kopikotani",
    }
  },
  {
    name: "Café Nacional",
    slug: "cafe-nacional",
    city: "Bogotá",
    country: "Colombia",
    description: "Colombian coffee paradise. Sample the finest single-origin Colombian beans in a modern, educational setting with tasting flights.",
    address: "Carrera 7 # 32-16, Bogotá, Colombia",
    coordinates: [-74.0695, 4.6326],
    phone: "+57 1 123 4567",
    socialLinks: {
      website: "https://cafenacional.com.co",
      instagram: "cafenacionalcolombia",
      facebook: "cafenacional",
    }
  }
];

// Menu categories (same for all shops for simplicity)
const MENU_CATEGORIES = [
  { name: 'Espresso Drinks', order: 1 },
  { name: 'Drip Coffee', order: 2 },
  { name: 'Cold Brew', order: 3 },
  { name: 'Specialty Drinks', order: 4 },
  { name: 'Pastries', order: 5 },
];

// Menu items by category
const MENU_ITEMS = {
  'Espresso Drinks': [
    { name: 'Espresso', description: 'Single shot of pure coffee perfection', price: 3.00 },
    { name: 'Doppio', description: 'Double shot espresso', price: 3.50 },
    { name: 'Americano', description: 'Espresso with hot water', price: 3.75 },
    { name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 4.50 },
    { name: 'Latte', description: 'Espresso with steamed milk', price: 4.75 },
    { name: 'Flat White', description: 'Espresso with velvety microfoam', price: 4.50 },
    { name: 'Macchiato', description: 'Espresso marked with foam', price: 3.75 },
  ],
  'Drip Coffee': [
    { name: 'Pour Over', description: 'Single origin coffee, hand poured', price: 5.00 },
    { name: 'Filter Coffee', description: 'Classic drip coffee', price: 3.50 },
    { name: 'Chemex', description: 'Clean, bright coffee', price: 5.50 },
    { name: 'V60', description: 'Japanese pour over method', price: 5.00 },
  ],
  'Cold Brew': [
    { name: 'Cold Brew', description: 'Smooth, cold-steeped coffee', price: 5.00 },
    { name: 'Nitro Cold Brew', description: 'Cold brew on tap with nitrogen', price: 6.00 },
    { name: 'Iced Latte', description: 'Espresso with cold milk over ice', price: 5.50 },
    { name: 'Iced Americano', description: 'Espresso with cold water over ice', price: 4.50 },
  ],
  'Specialty Drinks': [
    { name: 'Mocha', description: 'Espresso with chocolate and steamed milk', price: 5.50 },
    { name: 'Caramel Latte', description: 'Latte with caramel syrup', price: 5.75 },
    { name: 'Vanilla Latte', description: 'Latte with vanilla syrup', price: 5.75 },
    { name: 'Matcha Latte', description: 'Japanese green tea latte', price: 5.50 },
  ],
  'Pastries': [
    { name: 'Croissant', description: 'Buttery, flaky French pastry', price: 3.50 },
    { name: 'Pain au Chocolat', description: 'Chocolate-filled croissant', price: 4.00 },
    { name: 'Blueberry Muffin', description: 'Fresh baked with real blueberries', price: 3.75 },
    { name: 'Cinnamon Roll', description: 'Warm, gooey cinnamon goodness', price: 4.50 },
    { name: 'Banana Bread', description: 'Moist and delicious', price: 3.50 },
  ],
};

// Opening hours (varied)
const OPENING_HOURS_OPTIONS = [
  {
    monday: { open: '07:00', close: '19:00', closed: false },
    tuesday: { open: '07:00', close: '19:00', closed: false },
    wednesday: { open: '07:00', close: '19:00', closed: false },
    thursday: { open: '07:00', close: '19:00', closed: false },
    friday: { open: '07:00', close: '20:00', closed: false },
    saturday: { open: '08:00', close: '20:00', closed: false },
    sunday: { open: '08:00', close: '18:00', closed: false },
  },
  {
    monday: { open: '06:30', close: '18:00', closed: false },
    tuesday: { open: '06:30', close: '18:00', closed: false },
    wednesday: { open: '06:30', close: '18:00', closed: false },
    thursday: { open: '06:30', close: '18:00', closed: false },
    friday: { open: '06:30', close: '18:00', closed: false },
    saturday: { open: '07:00', close: '17:00', closed: false },
    sunday: { open: '08:00', close: '16:00', closed: false },
  },
  {
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true },
  },
];

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Seeding only allowed in development' }, { status: 403 });
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create owner user (or find existing)
    console.log('👤 Creating owner user...');
    let owner = await User.findOne({ email: 'owner@coffeeshop.com' });
    
    if (!owner) {
      const hashedPassword = await bcrypt.hash('owner123', 10);
      owner = await User.create({
        name: 'Coffee Shop Owner',
        email: 'owner@coffeeshop.com',
        password: hashedPassword,
        role: 'owner',
      });
      console.log('✅ Owner user created');
    } else {
      console.log('✅ Owner user already exists');
    }

    // Clear existing shops and menu data
    console.log('🗑️  Clearing existing shop data...');
    await Shop.deleteMany({ ownerId: owner._id });
    await MenuCategory.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('✅ Existing data cleared');

    console.log('🏪 Creating coffee shops...');

    // Create shops
    const shopsCreated = [];
    for (let i = 0; i < SHOPS_DATA.length; i++) {
      const shopData = SHOPS_DATA[i];

      // Create shop
      const shop = await Shop.create({
        ownerId: owner._id,
        name: shopData.name,
         slug: shopData.slug, // Add this line
        description: shopData.description,
        address: shopData.address,
        location: {
          type: 'Point',
          coordinates: shopData.coordinates,
        },
        phone: shopData.phone,
        socialLinks: shopData.socialLinks,
        openingHours: OPENING_HOURS_OPTIONS[i % OPENING_HOURS_OPTIONS.length],
        isActive: true,
      });

      // Create menu categories
      const categories = [];
      for (const categoryData of MENU_CATEGORIES) {
        const category = await MenuCategory.create({
          shopId: shop._id,
          name: categoryData.name,
          order: categoryData.order,
        });
        categories.push(category);
      }

      // Create menu items
      let itemCount = 0;
      for (const category of categories) {
        const items = MENU_ITEMS[category.name] || [];
        for (const itemData of items) {
          await MenuItem.create({
            shopId: shop._id,
            categoryId: category._id,
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            isAvailable: true,
          });
          itemCount++;
        }
      }

      shopsCreated.push({
        name: shop.name,
        city: shopData.city,
        country: shopData.country,
        categories: categories.length,
        items: itemCount
      });
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully!',
      stats: {
        shops: {
          total: SHOPS_DATA.length,
          cities: new Set(SHOPS_DATA.map(s => s.city)).size,
          countries: new Set(SHOPS_DATA.map(s => s.country)).size,
        },
        menu: {
          categoriesPerShop: MENU_CATEGORIES.length,
          avgItemsPerShop: Object.values(MENU_ITEMS).flat().length,
        },
        credentials: {
          email: 'owner@coffeeshop.com',
          password: 'owner123',
        },
        shopsCreated
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}
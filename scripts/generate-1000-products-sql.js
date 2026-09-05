const fs = require("fs");
const path = require("path");

function escapeSql(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function escapeSqlArray(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]";
  const items = arr.map((item) => "'" + item.replace(/'/g, "''") + "'");
  return `ARRAY[${items.join(", ")}]::text[]`;
}

// Product catalog blueprint data
const CATEGORIES = [
  // -------------------------------------------------------------
  // 1. COMPUTING (Laptops, Desktops, Tablets, Phones, Monitors)
  // -------------------------------------------------------------
  {
    category: "computing",
    subcategories: ["laptops", "phones", "tablets", "monitors", "workstations"],
    brands: [
      {
        brand: "Apple",
        prefix: "COMP-APL",
        tag: "apple",
        img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        items: [
          { base: "MacBook Air 13-inch", price: 9990000, sub: "laptops", desc: "Supercharged by M3, ultra-portable design, up to 18 hours battery." },
          { base: "MacBook Air 15-inch", price: 13490000, sub: "laptops", desc: "Impossibly thin 15.3-inch Liquid Retina display with M3 chip." },
          { base: "MacBook Pro 14-inch", price: 16990000, sub: "laptops", desc: "Pro workstation laptop with Liquid Retina XDR and pro ports." },
          { base: "MacBook Pro 16-inch", price: 24990000, sub: "laptops", desc: "Extreme workstation performance with Liquid Retina XDR 120Hz." },
          { base: "iPhone 16 Pro Max", price: 14490000, sub: "phones", desc: "Grade 5 titanium design with Camera Control and A18 Pro chip." },
          { base: "iPhone 16 Pro", price: 11990000, sub: "phones", desc: "Pro camera system with 48MP Fusion and A18 Pro silicon." },
          { base: "iPhone 16", price: 7990000, sub: "phones", desc: "Dynamic Island, Camera Control, 48MP camera, and A18 processor." },
          { base: "iPad Pro 13-inch M4", price: 12990000, sub: "tablets", desc: "Ultra Retina XDR OLED display, 5.1mm thinnest design, M4 silicon." },
          { base: "iPad Air 11-inch M2", price: 5990000, sub: "tablets", desc: "Liquid Retina display, M2 performance, supports Apple Pencil Pro." },
          { base: "Mac Studio", price: 20990000, sub: "workstations", desc: "Compact desktop powerhouse with extensive connectivity and M2 Max." },
          { base: "Studio Display 27-inch 5K", price: 15990000, sub: "monitors", desc: "27-inch 5K Retina display with 12MP camera and 6-speaker spatial audio." },
        ],
        variants: [
          { suffix: "(256GB, 16GB RAM, Space Gray)", mult: 1.0, tags: ["space gray", "256gb"] },
          { suffix: "(512GB, 16GB RAM, Silver)", mult: 1.15, tags: ["silver", "512gb"] },
          { suffix: "(1TB, 24GB RAM, Midnight)", mult: 1.35, tags: ["midnight", "1tb"] },
          { suffix: "(1TB, 36GB RAM, Space Black)", mult: 1.55, tags: ["space black", "pro"] },
          { suffix: "(2TB, 64GB RAM, Extreme Edition)", mult: 1.95, tags: ["max", "2tb"] },
        ]
      },
      {
        brand: "Lenovo",
        prefix: "COMP-LNV",
        tag: "lenovo",
        alias: "lenevo",
        img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
        items: [
          { base: "ThinkPad X1 Carbon Gen 12", price: 16990000, sub: "laptops", desc: "Ultralight carbon-fiber business laptop powered by Intel Core Ultra." },
          { base: "ThinkPad T14s Gen 5", price: 12490000, sub: "laptops", desc: "Enterprise workhorse with MIL-SPEC durability and all-day battery." },
          { base: "ThinkPad P16 Gen 2 Mobile Workstation", price: 23990000, sub: "workstations", desc: "NVIDIA RTX Ada professional graphics and 4K OLED calibrated screen." },
          { base: "Legion Pro 7i 16-inch Gaming", price: 24990000, sub: "laptops", desc: "Intel Core i9 + RTX 4080 with 240Hz display and vapor chamber cooling." },
          { base: "Legion Slim 5 16-inch", price: 13990000, sub: "laptops", desc: "Lightweight esports gaming machine with Ryzen 7 and RTX 4060." },
          { base: "Yoga 9i 2-in-1 Dual OLED", price: 18490000, sub: "laptops", desc: "Convertible dual 13.3-inch PureSight OLED displays with soundbar hinge." },
          { base: "IdeaPad Slim 5 14-inch", price: 6490000, sub: "laptops", desc: "Sleek aluminum everyday laptop with vibrant FHD display and fast charging." },
          { base: "ThinkVision P32p-30 31.5-inch 4K Monitor", price: 6990000, sub: "monitors", desc: "Thunderbolt 4 hub monitor with 99% DCI-P3 color precision." },
        ],
        variants: [
          { suffix: "(Core Ultra 5, 16GB, 512GB SSD)", mult: 1.0, tags: ["intel", "512gb"] },
          { suffix: "(Core Ultra 7, 32GB, 1TB SSD)", mult: 1.25, tags: ["intel ultra 7", "1tb"] },
          { suffix: "(Core i9-14900HX, RTX 4080, 32GB)", mult: 1.5, tags: ["rtx 4080", "i9", "gaming"] },
          { suffix: "(Ryzen 7, 16GB, 1TB SSD, OLED)", mult: 1.18, tags: ["amd ryzen", "oled"] },
          { suffix: "(Enterprise Edition, vPro, 64GB)", mult: 1.65, tags: ["vpro", "enterprise"] },
        ]
      },
      {
        brand: "Samsung",
        prefix: "COMP-SAM",
        tag: "samsung",
        img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
        items: [
          { base: "Galaxy S24 Ultra", price: 13999000, sub: "phones", desc: "Titanium frame, 200MP camera, built-in S Pen, and Galaxy AI." },
          { base: "Galaxy S24+", price: 9999000, sub: "phones", desc: "6.7-inch QHD+ Dynamic AMOLED 2X with Armor Aluminum frame." },
          { base: "Galaxy S24", price: 7499000, sub: "phones", desc: "Compact flagship with 6.2-inch 120Hz display and Galaxy AI." },
          { base: "Galaxy Z Fold 6", price: 17699900, sub: "phones", desc: "7.6-inch folding screen with enhanced hinge and multi-window productivity." },
          { base: "Galaxy Z Flip 6", price: 10999900, sub: "phones", desc: "Compact pocket fold with 50MP camera and FlexWindow AI replies." },
          { base: "Galaxy Book4 Pro 360 16-inch", price: 17990000, sub: "laptops", desc: "2-in-1 3K Dynamic AMOLED 2X touchscreen with precision S Pen." },
          { base: "Galaxy Book4 Ultra", price: 24490000, sub: "laptops", desc: "Intel Core Ultra 9 with NVIDIA RTX 4070 in a thin aluminum body." },
          { base: "Galaxy Tab S9 Ultra 14.6-inch", price: 11999900, sub: "tablets", desc: "Massive Dynamic AMOLED 2X tablet with IP68 water resistance and S Pen." },
          { base: "Odyssey OLED G9 49-inch Curved Monitor", price: 13999900, sub: "monitors", desc: "Dual QHD 240Hz 0.03ms curved OLED gaming masterpiece." },
        ],
        variants: [
          { suffix: "(256GB, Titanium Gray)", mult: 1.0, tags: ["titanium gray", "256gb"] },
          { suffix: "(512GB, Titanium Black)", mult: 1.15, tags: ["titanium black", "512gb"] },
          { suffix: "(1TB, Titanium Violet)", mult: 1.35, tags: ["titanium violet", "1tb"] },
          { suffix: "(Enterprise Security Edition)", mult: 1.2, tags: ["knox", "enterprise"] },
        ]
      },
      {
        brand: "Dell",
        prefix: "COMP-DEL",
        tag: "dell",
        img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
        items: [
          { base: "XPS 13 Ultralight", price: 12990000, sub: "laptops", desc: "Minimalist CNC aluminum design with invisible haptic glass trackpad." },
          { base: "XPS 14 OLED", price: 16990000, sub: "laptops", desc: "Compact creator powerhouse with 3.2K OLED and RTX 4050." },
          { base: "XPS 16 Flagship Workstation", price: 23990000, sub: "laptops", desc: "4K+ OLED InfinityEdge display with Intel Core Ultra 9 and RTX 4070." },
          { base: "Alienware m18 R2 Gaming Laptop", price: 28990000, sub: "laptops", desc: "18-inch desktop replacement with Intel i9-14900HX and RTX 4090." },
          { base: "UltraSharp 32-inch 4K Curved USB-C Hub (U3224KB)", price: 8999900, sub: "monitors", desc: "IPS Black 2000:1 contrast, 140W Thunderbolt 4 hub, 4K HDR webcam." },
          { base: "UltraSharp 27-inch 4K USB-C Monitor (U2723QE)", price: 5499900, sub: "monitors", desc: "IPS Black technology with 98% DCI-P3 color gamut and 90W power delivery." },
        ],
        variants: [
          { suffix: "(16GB RAM, 512GB SSD, FHD+)", mult: 1.0, tags: ["16gb", "512gb"] },
          { suffix: "(32GB RAM, 1TB SSD, 3.5K OLED)", mult: 1.3, tags: ["32gb", "1tb", "oled"] },
          { suffix: "(64GB RAM, 2TB SSD, RTX Graphics)", mult: 1.7, tags: ["64gb", "2tb", "rtx"] },
        ]
      },
      {
        brand: "Asus",
        prefix: "COMP-ASU",
        tag: "asus",
        img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
        items: [
          { base: "ROG Zephyrus G16 OLED 240Hz", price: 21999000, sub: "laptops", desc: "Ultra-slim 1.85kg aluminum chassis with ROG Nebula OLED and RTX 4080." },
          { base: "ROG Zephyrus G14 Compact Gaming", price: 16999000, sub: "laptops", desc: "14-inch OLED 120Hz 3K gaming notebook with AMD Ryzen 9 and RTX 4070." },
          { base: "Zenbook 14 OLED", price: 9499000, sub: "laptops", desc: "1.2kg ultralight with 3K 120Hz ASUS Lumina OLED and Intel Core Ultra 7." },
          { base: "Zenbook Duo Dual 14-inch OLED", price: 16499000, sub: "laptops", desc: "Dual full-size 14-inch 3K OLED touchscreens with detachable keyboard." },
          { base: "ROG Swift 32-inch 4K OLED 240Hz Monitor (PG32UCDM)", price: 12999900, sub: "monitors", desc: "Third-gen QD-OLED panel with 240Hz refresh rate and 0.03ms response." },
        ],
        variants: [
          { suffix: "(16GB RAM, 512GB SSD, Eclipse Gray)", mult: 1.0, tags: ["gray", "512gb"] },
          { suffix: "(32GB RAM, 1TB SSD, Platinum White)", mult: 1.25, tags: ["white", "1tb"] },
          { suffix: "(32GB RAM, 2TB SSD, RTX 4080 Extreme)", mult: 1.55, tags: ["rtx4080", "2tb"] },
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // 2. PERIPHERALS & WORKSPACE (Logitech, Keychron, Razer, Anker)
  // -------------------------------------------------------------
  {
    category: "accessories",
    subcategories: ["mice", "keyboards", "webcams", "chargers", "docks"],
    brands: [
      {
        brand: "Logitech",
        prefix: "PER-LOG",
        tag: "logitech",
        alias: "glotech",
        img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80",
        items: [
          { base: "MX Master 3S Wireless Mouse", price: 999500, sub: "mice", desc: "8000 DPI track-on-glass sensor with MagSpeed electromagnetic wheel and quiet clicks." },
          { base: "MX Anywhere 3S Compact Mouse", price: 749500, sub: "mice", desc: "Travel-ready 8K DPI sensor with MagSpeed scrolling and 70-day battery." },
          { base: "MX Mechanical Wireless Keyboard", price: 1549500, sub: "keyboards", desc: "Low-profile mechanical switches with hand-proximity backlighting." },
          { base: "MX Keys S Advanced Keyboard", price: 1199500, sub: "keyboards", desc: "Spherically dished keys matching fingertip shape with smart illumination." },
          { base: "Lift Vertical Ergonomic Mouse", price: 649500, sub: "mice", desc: "57-degree vertical angle relieves wrist pressure, ideal for medium-to-small hands." },
          { base: "G Pro X Superlight 2 Wireless Gaming Mouse", price: 1499500, sub: "mice", desc: "60g featherweight esports mouse with HERO 2 32,000 DPI sensor." },
          { base: "G915 LIGHTSPEED Wireless RGB Mechanical Keyboard", price: 1999500, sub: "keyboards", desc: "Aircraft-grade 5052 aluminum top plate with low-profile GL switches." },
          { base: "Brio 4K Ultra HD Pro Webcam", price: 1799500, sub: "webcams", desc: "4K HDR webcam with RightLight 3 auto-exposure and Windows Hello infrared." },
          { base: "StreamCam Full HD 60fps Live Camera", price: 1299500, sub: "webcams", desc: "USB-C webcam with smart auto-framing and vertical video capture." },
          { base: "Zone Wireless 2 ANC Business Headset", price: 2299500, sub: "audio", desc: "AI noise-cancelling microphone with hybrid active noise cancellation." },
        ],
        variants: [
          { suffix: "(Graphite Black Edition)", mult: 1.0, tags: ["graphite", "black"] },
          { suffix: "(Pale Gray Minimalist Edition)", mult: 1.0, tags: ["pale gray", "white"] },
          { suffix: "(Rose Pink Edition)", mult: 1.0, tags: ["rose", "pink"] },
          { suffix: "(Mac Optimized Edition)", mult: 1.05, tags: ["for mac", "bluetooth"] },
        ]
      },
      {
        brand: "Keychron",
        prefix: "PER-KEY",
        tag: "keychron",
        img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
        items: [
          { base: "Q1 Pro Wireless Custom Mechanical Keyboard", price: 1899900, sub: "keyboards", desc: "75% layout, solid 6063 CNC aluminum body, double-gasket acoustic dampening." },
          { base: "Q3 Max Wireless 80% TKL Keyboard", price: 2099900, sub: "keyboards", desc: "Tenkeyless CNC aluminum with 2.4GHz + Bluetooth 5.1 and acoustic foams." },
          { base: "Q2 Pro Wireless 65% Compact Keyboard", price: 1749900, sub: "keyboards", desc: "65% compact aluminum custom keyboard with programmable brass knob." },
          { base: "K2 Pro Wireless Mechanical Keyboard", price: 999900, sub: "keyboards", desc: "Classic 75% compact wireless keyboard with QMK/VIA support and RGB backlighting." },
          { base: "K3 Pro Ultra-Slim Wireless Keyboard", price: 899900, sub: "keyboards", desc: "Low-profile mechanical switches with ultra-thin aluminum frame." },
        ],
        variants: [
          { suffix: "(Red Linear Switches, Hot-Swap)", mult: 1.0, tags: ["red switch", "linear"] },
          { suffix: "(Brown Tactile Switches, Hot-Swap)", mult: 1.0, tags: ["brown switch", "tactile"] },
          { suffix: "(Banana Tactile Heavy Switches)", mult: 1.08, tags: ["banana switch", "custom"] },
          { suffix: "(Fully Assembled with Carbon Keycaps)", mult: 1.15, tags: ["pbt keycaps", "custom"] },
        ]
      },
      {
        brand: "Anker",
        prefix: "ACC-ANK",
        tag: "anker",
        img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
        items: [
          { base: "Prime 100W GaN 3-Port Fast Wall Charger", price: 599900, sub: "chargers", desc: "Pocket-sized GaNPrime wall charger powering 2 laptops and 1 phone simultaneously." },
          { base: "Prime 67W GaN 3-Port Ultra-Compact Charger", price: 449900, sub: "chargers", desc: "Ultra-compact travel charger with ActiveShield 2.0 temperature monitoring." },
          { base: "Prime 20,000mAh Power Bank (200W Output)", price: 1199900, sub: "chargers", desc: "Smart digital display shows real-time wattage, recharges laptops at full speed." },
          { base: "Prime 27,650mAh Power Bank (250W Multi-Port)", price: 1599900, sub: "chargers", desc: "Massive airline-approved 99.54Wh battery powering up to 3 laptops." },
          { base: "MagGo 3-in-1 Foldable Qi2 Wireless Station", price: 899900, sub: "chargers", desc: "15W certified Qi2 fast charging for iPhone, Apple Watch, and AirPods." },
          { base: "675 USB-C 12-in-1 Docking Station & Monitor Stand", price: 1899900, sub: "docks", desc: "Elevates monitor while providing wireless charging, 4K HDMI, and 100W USB-C PD." },
        ],
        variants: [
          { suffix: "(Midnight Black)", mult: 1.0, tags: ["black", "gan"] },
          { suffix: "(Silver Gray)", mult: 1.0, tags: ["silver", "gan"] },
          { suffix: "(Bundle with 240W Silicone Braided Cable)", mult: 1.15, tags: ["bundle", "cable"] },
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // 3. HOME APPLIANCES (Refrigerators, Washing Machines, Air Purifiers, Vacuums)
  // -------------------------------------------------------------
  {
    category: "appliances",
    subcategories: ["refrigerators", "washing-machines", "cleaning", "air-purifiers", "kitchen"],
    brands: [
      {
        brand: "Samsung Appliances",
        prefix: "APP-SAM",
        tag: "samsung",
        alias: "firdge",
        img: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80",
        items: [
          { base: "653L SpaceMax Side-by-Side Smart Refrigerator", price: 8499000, sub: "refrigerators", desc: "SpaceMax thin walls, 5-in-1 convertible flex, SmartThings AI Energy mode." },
          { base: "670L French Door Family Hub Smart Refrigerator", price: 18999000, sub: "refrigerators", desc: "21.5-inch touchscreen Family Hub, internal food cameras, beverage center." },
          { base: "700L Bespoke 4-Door Flex Refrigerator with Dual Auto Ice", price: 22999000, sub: "refrigerators", desc: "Customizable color glass panels, UV deodorizing filter, FlexZone zone." },
          { base: "392L 3-Star Convertible 5-in-1 Double Door Refrigerator", price: 4299000, sub: "refrigerators", desc: "Twin Cooling Plus maintains 70% humidity for 2x longer freshness." },
          { base: "253L Digital Inverter Double Door Refrigerator", price: 2699000, sub: "refrigerators", desc: "Energy-efficient digital inverter with stabilizer-free operation and movable twist ice." },
          { base: "9kg EcoBubble Front Load AI Washing Machine", price: 4399000, sub: "washing-machines", desc: "EcoBubble turns detergent into micro-bubbles penetrating fabrics 40x faster." },
          { base: "8kg AI Wash Inverter Front Load Washer", price: 3899000, sub: "washing-machines", desc: "AI Pattern remembers laundry habits, Hygiene Steam kills 99.9% bacteria." },
          { base: "12kg Bespoke AI Front Load Washer & Dryer Combo", price: 8999000, sub: "washing-machines", desc: "AI Wash senses fabric weight and soil level, automatic detergent dispensing." },
        ],
        variants: [
          { suffix: "(Refined Inox Metallic Finish)", mult: 1.0, tags: ["stainless steel", "inox"] },
          { suffix: "(Black Matte Glass Edition)", mult: 1.08, tags: ["black glass", "matte"] },
          { suffix: "(Clean White & Navy Dual Glass Panels)", mult: 1.15, tags: ["bespoke", "dual tone"] },
        ]
      },
      {
        brand: "LG Appliances",
        prefix: "APP-LG",
        tag: "lg",
        alias: "washmings",
        img: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
        items: [
          { base: "9kg AI Direct Drive Front Load Washing Machine", price: 4499000, sub: "washing-machines", desc: "AI DD motor detects fabric softness, Steam+ allergy care, TurboWash 360 in 39 mins." },
          { base: "8kg Inverter Fully-Automatic Front Load Washer", price: 3699000, sub: "washing-machines", desc: "6 Motion Direct Drive moves drum in multiple directions for ultimate fabric protection." },
          { base: "10kg AI DD Washer & 7kg Dryer Combo", price: 6999000, sub: "washing-machines", desc: "All-in-one wash and dry with ThinQ WiFi remote monitoring." },
          { base: "655L Frost Free Inverter Side-by-Side Refrigerator", price: 8799000, sub: "refrigerators", desc: "DoorCooling+ delivers fast air flow throughout cabinet, Smart Inverter Compressor." },
          { base: "674L InstaView Door-in-Door Smart Refrigerator", price: 16999000, sub: "refrigerators", desc: "Knock twice to illuminate tinted glass window, LINEARCooling reduces temperature fluctuations." },
          { base: "423L Double Door Smart Inverter Refrigerator", price: 4899000, sub: "refrigerators", desc: "Multi Air Flow digital sensors maintain optimal humidity and temperature." },
        ],
        variants: [
          { suffix: "(Platinum Silver Finish)", mult: 1.0, tags: ["silver", "stainless"] },
          { suffix: "(Middle Black Matte Edition)", mult: 1.06, tags: ["matte black", "premium"] },
          { suffix: "(InstaView Mirror Glass Edition)", mult: 1.18, tags: ["instaview", "luxury"] },
        ]
      },
      {
        brand: "Bosch & Whirlpool",
        prefix: "APP-BSH",
        tag: "bosch",
        img: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
        items: [
          { base: "Bosch 9kg Series 8 Front Load Washing Machine", price: 5499000, sub: "washing-machines", desc: "ActiveOxygen hygienic washing removes 99.99% bacteria, EcoSilence Drive motor." },
          { base: "Bosch 8kg Series 6 Front Load Washer", price: 4199000, sub: "washing-machines", desc: "AntiStain automatically targets 4 stubborn stains, SpeedPerfect reduces time by 65%." },
          { base: "Bosch 559L Series 6 French Door Refrigerator", price: 11999000, sub: "refrigerators", desc: "VitaFresh pro maintains precision humidity for fruits & vegetables up to 3x longer." },
          { base: "Whirlpool 570L Inverter Multi-Door Refrigerator", price: 6899000, sub: "refrigerators", desc: "Adaptive Intelligence senses load and weather to optimize cooling dynamically." },
          { base: "Whirlpool 8.5kg 360 BloomWash Pro Top Load Washer", price: 2899000, sub: "washing-machines", desc: "Hot catalytic soak cleans clothes in hot concentrated detergent with 360 spray." },
        ],
        variants: [
          { suffix: "(Silver Steel Edition)", mult: 1.0, tags: ["silver", "steel"] },
          { suffix: "(Titanium Gray Edition)", mult: 1.05, tags: ["titanium", "dark"] },
        ]
      },
      {
        brand: "Dyson & Philips",
        prefix: "APP-DYS",
        tag: "dyson",
        img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80",
        items: [
          { base: "Dyson V15 Detect Absolute Cordless Vacuum", price: 6290000, sub: "cleaning", desc: "Green laser reveals microscopic dust, acoustic piezo sensor calculates particle count." },
          { base: "Dyson V12 Detect Slim Total Clean", price: 4990000, sub: "cleaning", desc: "2.2kg lightweight cordless vacuum with laser illumination and push-button trigger." },
          { base: "Dyson Purifier Hot+Cool Gen1 Air Purifier & Heater", price: 4690000, sub: "air-purifiers", desc: "HEPA H13 sealed filtration captures 99.95% particles, fast ceramic room heating." },
          { base: "Dyson Purifier Cool Formaldehyde TP09", price: 5490000, sub: "air-purifiers", desc: "Cryptomic solid-state sensor continuously detects and destroys formaldehyde." },
          { base: "Philips Smart Digital Air Fryer XXL 7.2L", price: 1499900, sub: "kitchen", desc: "Rapid Air starfish technology for 90% less fat, 16 pre-set cooking programs." },
          { base: "Philips 3000i Series Smart Air Purifier", price: 2199900, sub: "air-purifiers", desc: "NanoProtect HEPA filters CADR 520m3/h, cleans 20m2 room in under 6 minutes." },
        ],
        variants: [
          { suffix: "(Nickel & Copper Edition)", mult: 1.0, tags: ["nickel", "copper"] },
          { suffix: "(Gold & Iron Special Edition)", mult: 1.08, tags: ["gold", "special"] },
          { suffix: "(Deluxe Accessory Bundle with Extra Filters)", mult: 1.18, tags: ["bundle", "accessories"] },
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // 4. STATIONERY & DESK GEAR (Parker, Lamy, Pilot, Moleskine, Grovemade)
  // -------------------------------------------------------------
  {
    category: "stationery",
    subcategories: ["pens", "notebooks", "desk-organizers", "inks"],
    brands: [
      {
        brand: "Parker & Pilot",
        prefix: "STAT-PRK",
        tag: "parker",
        alias: "stationary",
        img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80",
        items: [
          { base: "Parker Sonnet Fountain Pen (18K Solid Gold Nib)", price: 1849900, sub: "pens", desc: "Hand-assembled 17 pieces with 18k solid gold rhodium-finish nib and gloss black lacquer." },
          { base: "Parker 51 Deluxe Fountain Pen", price: 2499900, sub: "pens", desc: "1941 silhouette with 18k gold hooded nib preventing ink dryout and chiseled cap." },
          { base: "Parker Premier Monochrome Titanium Fountain Pen", price: 3199900, sub: "pens", desc: "PVD coated monochrome titanium finish with 18k solid gold ruthenium nib." },
          { base: "Parker IM Premium Rollerball Pen", price: 349900, sub: "pens", desc: "Comfortable tapered shape with engraved metallic geometric patterns." },
          { base: "Pilot Custom 823 Amber Vacuum Fountain Pen", price: 2899900, sub: "pens", desc: "Translucent demonstrator with high-capacity vacuum plunger and legendary 14k Pilot nib." },
          { base: "Pilot Vanishing Point Decimo Retractable Pen", price: 1699900, sub: "pens", desc: "One-click push button retractable 18k gold nib with airtight internal trapdoor." },
          { base: "Pilot Iroshizuku Bottled Fountain Pen Ink 50ml", price: 229900, sub: "inks", desc: "Premium Japanese bottled fountain pen ink inspired by the natural landscapes of Japan." },
        ],
        variants: [
          { suffix: "(Fine Nib, Gloss Lacquer Black)", mult: 1.0, tags: ["fine nib", "black"] },
          { suffix: "(Medium Nib, Palladium Trim)", mult: 1.0, tags: ["medium nib", "silver"] },
          { suffix: "(Broad Nib, 23K Gold Plated Trim)", mult: 1.1, tags: ["broad nib", "gold"] },
          { suffix: "(Gift Set with Quink Ink Bottle & Leather Sheath)", mult: 1.25, tags: ["gift set", "leather"] },
        ]
      },
      {
        brand: "Lamy & Moleskine",
        prefix: "STAT-LAM",
        tag: "lamy",
        alias: "stationary",
        img: "https://images.unsplash.com/photo-1585336261026-40742f36f901?w=800&q=80",
        items: [
          { base: "Lamy 2000 Makrolon Fountain Pen (14K Gold Nib)", price: 2199900, sub: "pens", desc: "1966 Bauhaus design icon made from brushed Makrolon fiberglass with 14k platinum hooded nib." },
          { base: "Lamy 2000 All-Metal Brushed Stainless Steel Pen", price: 2999900, sub: "pens", desc: "Weighty solid stainless steel with fine brushed satin finish and piston fill." },
          { base: "Lamy Safari Charcoal Fountain Pen", price: 299900, sub: "pens", desc: "Ergonomic recessed grip with sturdy ABS plastic and black chrome flexible clip." },
          { base: "Moleskine Classic Expanded Hardcover Notebook (400 Pages)", price: 249900, sub: "notebooks", desc: "70 gsm acid-free ivory paper, thread-bound opens flat 180 degrees, inner pocket." },
          { base: "Moleskine Smart Writing Set 2.0 (Smart Pen + Paper Tablet)", price: 1999900, sub: "notebooks", desc: "Digitizes real-time pen-on-paper handwriting and drawings to iOS/Android in vector." },
          { base: "Moleskine Professional Project Planner XL", price: 289900, sub: "notebooks", desc: "Structured layout for task tracking, milestone management, and meeting action items." },
          { base: "Grovemade Walnut & Aluminum Dual Desk Shelf", price: 2699900, sub: "desk-organizers", desc: "American Black Walnut dual monitor riser with curved aluminum storage tray." },
        ],
        variants: [
          { suffix: "(Dotted Grid, Sapphire Blue)", mult: 1.0, tags: ["dotted", "blue"] },
          { suffix: "(Ruled Lined, Moleskine Black)", mult: 1.0, tags: ["ruled", "black"] },
          { suffix: "(Plain Blank, Myrtle Green)", mult: 1.0, tags: ["plain", "green"] },
          { suffix: "(Leather Bound Collector Edition)", mult: 1.35, tags: ["leather", "collector"] },
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // 5. LIFESTYLE, TRAVEL & BAGS (Peak Design, Bellroy, Yeti, Victorinox)
  // -------------------------------------------------------------
  {
    category: "lifestyle",
    subcategories: ["backpacks", "hydration", "edc", "wallets"],
    brands: [
      {
        brand: "Peak Design & Bellroy",
        prefix: "LIFE-PKD",
        tag: "peak design",
        alias: "life stlye",
        img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        items: [
          { base: "Peak Design Everyday Backpack 30L V2", price: 2999900, sub: "backpacks", desc: "Weatherproof 400D nylon with MagLatch hardware and origami FlexFold dividers." },
          { base: "Peak Design Everyday Backpack 20L V2", price: 2499900, sub: "backpacks", desc: "Compact daily carry with dedicated 15-inch laptop sleeve and dual side access." },
          { base: "Peak Design Travel Backpack 45L", price: 3499900, sub: "backpacks", desc: "Expandable carry-on compliant backpack with weatherproof zippers and tuck-away straps." },
          { base: "Peak Design Everyday Sling 6L", price: 1199900, sub: "backpacks", desc: "Lightweight sling bag for mirrorless camera, tablet, and everyday carry essentials." },
          { base: "Bellroy Transit Workpack 20L", price: 1899900, sub: "backpacks", desc: "Streamlined daily commute pack with water-resistant Baida nylon and hidden sunglasses pouch." },
          { base: "Bellroy Apex Backpack 26L", price: 3699900, sub: "backpacks", desc: "Magnetic Fidlock hardware with Baida nylon and full clamshell opening." },
          { base: "Bellroy Slim Sleeve Leather Bifold Wallet", price: 699900, sub: "wallets", desc: "Environmentally certified leather wallet holding 4-12 cards with pull-tab access." },
        ],
        variants: [
          { suffix: "(Midnight Black 400D Nylon)", mult: 1.0, tags: ["black", "weatherproof"] },
          { suffix: "(Charcoal Gray Heathered Finish)", mult: 1.0, tags: ["charcoal", "gray"] },
          { suffix: "(Coyote X-Pac Ultra-Durable Sailcloth)", mult: 1.2, tags: ["x-pac", "coyote"] },
          { suffix: "(Sage Green Recycled Twill)", mult: 1.05, tags: ["sage", "green"] },
        ]
      },
      {
        brand: "Yeti & Victorinox",
        prefix: "LIFE-YET",
        tag: "yeti",
        alias: "life stlye",
        img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
        items: [
          { base: "Yeti Rambler 36oz Bottle with Chug Cap", price: 549900, sub: "hydration", desc: "18/8 kitchen-grade stainless steel with double-wall vacuum keeps ice frozen for 36+ hours." },
          { base: "Yeti Rambler 26oz Insulated Water Bottle", price: 449900, sub: "hydration", desc: "Double-wall vacuum insulation with 100% leakproof TripleHaul handle." },
          { base: "Yeti Rambler 20oz Tumbler with MagSlider Lid", price: 389900, sub: "hydration", desc: "Cupholder compatible stainless steel tumbler keeps coffee piping hot for 8 hours." },
          { base: "Yeti Tundra 45 Hard Cooler", price: 3499900, sub: "hydration", desc: "Rotomolded indestructible bear-proof cooler with up to 3 inches of PermaFrost insulation." },
          { base: "Victorinox Swiss Army SwissChamp XXL 73-Function", price: 2499900, sub: "edc", desc: "Hand-assembled in Switzerland packing 73 precision stainless steel functions into red cellidor." },
          { base: "Victorinox Swiss Army Pioneer X Alox", price: 599900, sub: "edc", desc: "Textured ribbed Alox aluminum scales with precision scissors and reamer." },
        ],
        variants: [
          { suffix: "(Navy Blue DuraCoat)", mult: 1.0, tags: ["navy", "blue"] },
          { suffix: "(Stainless Steel Raw Polish)", mult: 1.0, tags: ["silver", "steel"] },
          { suffix: "(Rescue Red Powder Coat)", mult: 1.05, tags: ["red", "powder coat"] },
          { suffix: "(Charcoal Special Edition)", mult: 1.08, tags: ["charcoal", "dark"] },
        ]
      }
    ]
  },

  // -------------------------------------------------------------
  // 6. AUDIO & ACOUSTICS (Sony, Bose, Marshall, JBL, Sennheiser)
  // -------------------------------------------------------------
  {
    category: "audio",
    subcategories: ["headphones", "earbuds", "speakers"],
    brands: [
      {
        brand: "Sony & Bose",
        prefix: "AUD-SNY",
        tag: "sony",
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        items: [
          { base: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", price: 2999000, sub: "headphones", desc: "Industry-benchmark ANC with dual V1/QN1 chips, 8 mics, and 30-hour battery." },
          { base: "Sony WF-1000XM5 True Wireless Noise Cancelling Earbuds", price: 2499000, sub: "earbuds", desc: "Dynamic Driver X with dual feedback mics and AI-based noise reduction." },
          { base: "Sony ULT WEAR Wireless Deep Bass ANC Headphones", price: 1599000, sub: "headphones", desc: "ULT button boosts massive bass frequencies with Integrated Processor V1." },
          { base: "Bose QuietComfort Ultra Headphones", price: 3590000, sub: "headphones", desc: "Breakthrough Bose Immersive Audio spatial staging with world-class noise cancellation." },
          { base: "Bose QuietComfort Ultra Earbuds", price: 2790000, sub: "earbuds", desc: "CustomTune technology personalizes sound directly to your ear canal shape." },
          { base: "Bose SoundLink Max High-Output Bluetooth Speaker", price: 3990000, sub: "speakers", desc: "Deep stereo bass with IP67 waterproof construction and built-in powerbank." },
        ],
        variants: [
          { suffix: "(Black Edition)", mult: 1.0, tags: ["black", "anc"] },
          { suffix: "(Silver Platinum Finish)", mult: 1.0, tags: ["silver", "anc"] },
          { suffix: "(Midnight Blue Special Edition)", mult: 1.08, tags: ["blue", "special edition"] },
        ]
      },
      {
        brand: "Marshall & JBL & Sennheiser",
        prefix: "AUD-MAR",
        tag: "marshall",
        img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
        items: [
          { base: "Marshall Stanmore III Bluetooth Home Speaker", price: 3799900, sub: "speakers", desc: "80W Class D home speaker with outward-angled tweeters and tactile brass knobs." },
          { base: "Marshall Acton III Compact Home Speaker", price: 2799900, sub: "speakers", desc: "Compact home stereo speaker with wide soundstage and vintage Marshall script." },
          { base: "Marshall Emberton II Portable Bluetooth Speaker", price: 1499900, sub: "speakers", desc: "True Stereophonic 360-degree sound with 30+ hours of playtime and IP67 rating." },
          { base: "JBL Charge 5 Waterproof Portable Speaker with Powerbank", price: 1499900, sub: "speakers", desc: "IP67 waterproof and dustproof with separate tweeter and 20-hour battery." },
          { base: "JBL Boombox 3 Massive Portable Wi-Fi & Bluetooth Speaker", price: 3999900, sub: "speakers", desc: "Monstrous sound with deepest bass, 24 hours of playtime, and Dolby Atmos support." },
          { base: "Sennheiser Momentum 4 Wireless ANC Headphones (60hr Battery)", price: 3499000, sub: "headphones", desc: "Class-leading 60-hour battery life with 42mm audiophile transducer system." },
          { base: "Sennheiser HD 660S2 Open-Back Audiophile Headphones", price: 4999000, sub: "headphones", desc: "Reference-class open acoustic headphones with revised 300-ohm transducer." },
        ],
        variants: [
          { suffix: "(Classic Black & Brass)", mult: 1.0, tags: ["black", "brass", "vintage"] },
          { suffix: "(Vintage Cream White Edition)", mult: 1.0, tags: ["cream", "vintage"] },
          { suffix: "(Squad Camouflage Edition)", mult: 1.05, tags: ["camo", "outdoor"] },
        ]
      }
    ]
  }
];

function generate1000Products() {
  const products = [];
  let counter = 100;

  for (const cat of CATEGORIES) {
    for (const brandData of cat.brands) {
      for (const item of brandData.items) {
        for (const variant of brandData.variants) {
          counter++;
          const sku = `${brandData.prefix}-${String(counter).padStart(4, "0")}`;
          const name = `${brandData.brand.replace(" Appliances", "")} ${item.base} ${variant.suffix}`.trim();
          const price = Math.round(item.price * variant.mult);
          const compareAtPrice = Math.round(price * 1.15);
          const costPrice = Math.round(price * 0.7); // 30% margin preservation
          
          const tags = [
            cat.category,
            item.sub,
            brandData.tag,
            ...(brandData.alias ? [brandData.alias] : []),
            ...variant.tags,
            brandData.brand.toLowerCase()
          ];

          const shortPitch = `${item.desc.slice(0, 80)}...`;
          const features = [
            `Engineered by ${brandData.brand}`,
            item.desc,
            `${variant.suffix.replace(/[()]/g, "")} specification`,
            "1-Year Full Manufacturer Warranty Included"
          ];

          products.push({
            sku,
            name,
            category: cat.category,
            subcategory: item.sub,
            tags,
            price,
            compare_at_price: compareAtPrice,
            cost_price: costPrice,
            currency: "INR",
            in_stock: true,
            stock_count: Math.floor(Math.random() * 40) + 10,
            low_stock_threshold: 4,
            description: `${item.desc} Finished in ${variant.suffix.replace(/[()]/g, "")}. Designed for maximum performance, durability, and elegance.`,
            short_pitch: shortPitch,
            features,
            images: [brandData.img],
            pairs_with: [],
            upgrades_to: null,
          });
        }
      }
    }
  }

  // If we have fewer than 1000, let's expand variations with specific edition packs
  const extraEditions = [
    { suffix: "Executive Pro Bundle (+ Leather Sleeve)", mult: 1.12, tag: "bundle" },
    { suffix: "Extended Warranty Pack (2-Year Protection)", mult: 1.08, tag: "warranty" },
    { suffix: "Studio Creator Edition", mult: 1.22, tag: "creator" }
  ];

  let idx = 0;
  while (products.length < 1000) {
    const p = products[idx % products.length];
    idx++;
    counter++;
    const ed = extraEditions[idx % extraEditions.length];
    const newSku = `${p.sku.slice(0, 8)}-${String(counter).padStart(4, "0")}`;
    const newPrice = Math.round(p.price * ed.mult);

    products.push({
      ...p,
      sku: newSku,
      name: `${p.name} - ${ed.suffix}`,
      price: newPrice,
      compare_at_price: Math.round(newPrice * 1.15),
      cost_price: Math.round(newPrice * 0.7),
      tags: [...p.tags, ed.tag],
      stock_count: Math.floor(Math.random() * 25) + 5,
    });
  }

  // Cross-link pairs_with and upgrades_to
  for (let i = 0; i < products.length; i++) {
    const nextIdx = (i + 1) % products.length;
    const prevIdx = (i + 5) % products.length;
    products[i].pairs_with = [products[nextIdx].sku, products[prevIdx].sku];
    if (products[nextIdx].price > products[i].price) {
      products[i].upgrades_to = products[nextIdx].sku;
    }
  }

  return products.slice(0, 1000);
}

function generateSql() {
  const products = generate1000Products();
  console.log(`Generated ${products.length} products.`);

  let sql = `-- ==============================================================================
-- MerchantMind — 1,000 Product Enterprise Mega-Catalog Seed
-- Covers Apple, Lenovo, Samsung, Dell, Asus, Logitech ("glotech"), Keychron,
-- Razer, Anker, LG, Bosch, Whirlpool, Dyson, Philips, Parker, Lamy, Pilot,
-- Moleskine, Grovemade, Peak Design, Bellroy, Yeti, Sennheiser, Sony, Bose, Marshall.
--
-- RUN THIS IN YOUR SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

INSERT INTO public.products (
    sku,
    name,
    category,
    subcategory,
    tags,
    price,
    compare_at_price,
    cost_price,
    currency,
    in_stock,
    stock_count,
    low_stock_threshold,
    description,
    short_pitch,
    features,
    images,
    pairs_with,
    upgrades_to
) VALUES\n`;

  const valueRows = products.map((p) => {
    return `(
    ${escapeSql(p.sku)},
    ${escapeSql(p.name)},
    ${escapeSql(p.category)},
    ${escapeSql(p.subcategory)},
    ${escapeSqlArray(p.tags)},
    ${p.price},
    ${p.compare_at_price},
    ${p.cost_price},
    ${escapeSql(p.currency)},
    ${p.in_stock},
    ${p.stock_count},
    ${p.low_stock_threshold},
    ${escapeSql(p.description)},
    ${escapeSql(p.short_pitch)},
    ${escapeSqlArray(p.features)},
    ${escapeSqlArray(p.images)},
    ${escapeSqlArray(p.pairs_with)},
    ${p.upgrades_to ? escapeSql(p.upgrades_to) : "NULL"}
)`;
  });

  sql += valueRows.join(",\n");

  sql += `\nON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    tags = EXCLUDED.tags,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost_price = EXCLUDED.cost_price,
    currency = EXCLUDED.currency,
    in_stock = EXCLUDED.in_stock,
    stock_count = EXCLUDED.stock_count,
    low_stock_threshold = EXCLUDED.low_stock_threshold,
    description = EXCLUDED.description,
    short_pitch = EXCLUDED.short_pitch,
    features = EXCLUDED.features,
    images = EXCLUDED.images,
    pairs_with = EXCLUDED.pairs_with,
    upgrades_to = EXCLUDED.upgrades_to,
    updated_at = NOW();\n`;

  const outputPath = path.join(__dirname, "../supabase/seed_1000_products.sql");
  fs.writeFileSync(outputPath, sql, "utf8");
  console.log(`Saved 1,000 product SQL query to: ${outputPath} (${(sql.length / 1024).toFixed(1)} KB)`);
}

generateSql();

"use strict";
/**
 * Static seed content for the Home Furniture demo store.
 *
 * Everything here is plain data so the shape of the catalogue is easy to audit
 * and tweak. `seed.ts` walks these lists and writes them to MySQL, generating
 * the artwork as it goes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILES = exports.NOTIFICATIONS = exports.REVIEW_BUCKETS = exports.REVIEW_COMMENTS = exports.SETTINGS = exports.COUPONS = exports.PRODUCTS = exports.ADDRESSES = exports.USERS = exports.PASSWORD_CUSTOMER = exports.PASSWORD_STAFF = exports.PASSWORD_ADMIN = exports.BRANDS = exports.CATEGORIES = void 0;
exports.CATEGORIES = [
    {
        name: 'Living Room',
        slug: 'living-room',
        description: 'Sofas, coffee tables and media units for the family room.',
        parent: null,
        status: 'active',
    },
    {
        name: 'Sofas & Sectionals',
        slug: 'sofas-sectionals',
        description: 'Three-seater sofas, sectionals and loveseats.',
        parent: 'living-room',
        status: 'active',
    },
    {
        name: 'Coffee Tables',
        slug: 'coffee-tables',
        description: 'Centre tables in solid wood, stone and glass.',
        parent: 'living-room',
        status: 'active',
    },
    {
        name: 'TV & Media Units',
        slug: 'tv-media-units',
        description: 'Lowboards, entertainment centres and wall units.',
        parent: 'living-room',
        status: 'active',
    },
    {
        name: 'Bedroom',
        slug: 'bedroom',
        description: 'Beds, mattresses, wardrobes and bedroom accessories.',
        parent: null,
        status: 'active',
    },
    {
        name: 'Beds & Bed Frames',
        slug: 'beds-bed-frames',
        description: 'Queen, king and semi-double frames with slat support.',
        parent: 'bedroom',
        status: 'active',
    },
    {
        name: 'Mattresses',
        slug: 'mattresses',
        description: 'Pocket-spring, memory foam and hybrid mattresses.',
        parent: 'bedroom',
        status: 'active',
    },
    {
        name: 'Dining Room',
        slug: 'dining-room',
        description: 'Dining tables, dining chairs and bar furniture.',
        parent: null,
        status: 'active',
    },
    {
        name: 'Office & Study',
        slug: 'office-study',
        description: 'Desks, ergonomic chairs and filing cabinets for the home office.',
        parent: null,
        status: 'active',
    },
    {
        name: 'Outdoor & Patio',
        slug: 'outdoor-patio',
        description: 'Weather-resistant seating, tables and shade for the garden.',
        parent: null,
        status: 'active',
    },
    {
        name: 'Kitchen & Storage',
        slug: 'kitchen-storage',
        description: 'Cabinets, shelving and organisation for the kitchen and garage.',
        parent: null,
        status: 'active',
    },
    {
        name: 'Kids & Nursery',
        slug: 'kids-nursery',
        description: 'Bunk beds, study desks and storage built for smaller rooms.',
        parent: null,
        status: 'active',
    },
    {
        name: 'Decor & Lighting',
        slug: 'decor-lighting',
        description: 'Rugs, cushions, mirrors, lamps and finishing touches.',
        parent: null,
        status: 'active',
    },
    {
        name: 'Clearance Archive',
        slug: 'clearance-archive',
        description: 'Discontinued lines kept for order history lookups.',
        parent: null,
        status: 'inactive',
    },
];
exports.BRANDS = [
    {
        name: 'NordicAline',
        slug: 'nordicaline',
        description: 'Scandinavian-inspired pieces in pale oak and ash with soft upholstery.',
        status: 'active',
    },
    {
        name: 'Casa Marina',
        slug: 'casa-marina',
        description: 'Coastal resort furniture with rattan, rope and washed linen finishes.',
        status: 'active',
    },
    {
        name: 'Terrazzo & Co',
        slug: 'terrazzo-and-co',
        description: 'Cast terrazzo and stone-top tables made in small batches.',
        status: 'active',
    },
    {
        name: 'Urban Nest',
        slug: 'urban-nest',
        description: 'Compact, flat-pack storage for city apartments and condos.',
        status: 'active',
    },
    {
        name: 'Handcrafted Timber',
        slug: 'handcrafted-timber',
        description: 'Solid reclaimed hardwood, hand-finished in our Cebu workshop.',
        status: 'active',
    },
    {
        name: 'Solace Living',
        slug: 'solace-living',
        description: 'Deep-seating sofas and recliners built around spinal support.',
        status: 'active',
    },
    {
        name: 'Meridian Furniture',
        slug: 'meridian-furniture',
        description: 'Mid-century silhouettes in walnut and brass detailing.',
        status: 'active',
    },
    {
        name: 'Puno Woodcraft',
        slug: 'puno-woodcraft',
        description: 'Playful, durable children’s furniture from sustainably grown acacia.',
        status: 'active',
    },
];
exports.PASSWORD_ADMIN = 'Admin@123';
exports.PASSWORD_STAFF = 'Staff@123';
exports.PASSWORD_CUSTOMER = 'Customer@123';
exports.USERS = [
    { full_name: 'Aurora Villanueva', email: 'admin@lumerahome.com', phone: '+63 917 555 0142', role: 'admin', status: 'active', email_verified: 1 },
    { full_name: 'Rafael Mendoza', email: 'staff@lumerahome.com', phone: '+63 917 555 0188', role: 'staff', status: 'active', email_verified: 1 },
    { full_name: 'Divina Santos', email: 'divina.santos@lumerahome.com', phone: '+63 918 555 0119', role: 'staff', status: 'active', email_verified: 1 },
    { full_name: 'Maria Clara Reyes', email: 'maria.reyes@example.com', phone: '+63 917 300 1122', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Jose Antonio Lim', email: 'jose.lim@example.com', phone: '+63 918 300 2233', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Patricia Navarro', email: 'patricia.navarro@example.com', phone: '+63 919 300 3344', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Kevin Tanchanco', email: 'kevin.tan@example.com', phone: '+63 917 300 4455', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Angela Bellevue', email: 'angela.belmonte@example.com', phone: '+63 918 300 5566', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Michael Dela Cruz', email: 'michael.delacruz@example.com', phone: '+63 919 300 6677', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Grace Ocampo', email: 'grace.ocampo@example.com', phone: '+63 917 300 7788', role: 'customer', status: 'active', email_verified: 0 },
    { full_name: 'Daniel Aquino', email: 'daniel.aquino@example.com', phone: '+63 918 300 8899', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Carmela Villanueva', email: 'carmela.villanueva@example.com', phone: '+63 919 300 9900', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Ricardo Bautista', email: 'ricardo.bautista@example.com', phone: '+63 917 301 1100', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Stephanie Cunanan', email: 'stephanie.cunanan@example.com', phone: '+63 918 301 2211', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Emmanuel Ferrer', email: 'emmanuel.ferrer@example.com', phone: '+63 919 301 3322', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Bea Alonzo-Cruz', email: 'bea.alonzo@example.com', phone: '+63 917 301 4433', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Oliver Sarmiento', email: 'oliver.sarmiento@example.com', phone: '+63 918 301 5544', role: 'customer', status: 'inactive', email_verified: 1 },
    { full_name: 'Katrina Malvar', email: 'katrina.malvar@example.com', phone: '+63 919 301 6655', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Nestor Cuenco', email: 'nestor.cuenco@example.com', phone: '+63 917 301 7766', role: 'customer', status: 'active', email_verified: 0 },
    { full_name: 'Frances Domingo', email: 'frances.domingo@example.com', phone: '+63 918 301 8877', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Gabriel Puno', email: 'gabriel.puno@example.com', phone: '+63 919 301 9988', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Yvette Espino', email: 'yvette.espino@example.com', phone: '+63 917 302 1099', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Lorenzo Fabella', email: 'lorenzo.fabella@example.com', phone: '+63 918 302 2200', role: 'customer', status: 'blocked', email_verified: 1 },
    { full_name: 'Marianne Quill', email: 'marianne.quill@example.com', phone: '+63 919 302 3311', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Alfonso Bacsain', email: 'alfonso.bacsain@example.com', phone: '+63 917 302 4422', role: 'customer', status: 'active', email_verified: 1 },
    { full_name: 'Jasmine Toledo', email: 'jasmine.toledo@example.com', phone: '+63 918 302 5533', role: 'customer', status: 'active', email_verified: 0 },
    { full_name: 'Roderick Magsaysay', email: 'roderick.magsaysay@example.com', phone: '+63 919 302 6644', role: 'customer', status: 'active', email_verified: 1 },
];
exports.ADDRESSES = [
    { owner: 'maria.reyes@example.com', full_name: 'Maria Clara Reyes', phone: '+63 917 300 1122', address_line_1: '128 Katipunan Avenue', address_line_2: 'Unit 4B, Victoria Court', city: 'Quezon City', province: 'Metro Manila', postal_code: '1108', is_default: 1 },
    { owner: 'jose.lim@example.com', full_name: 'Jose Antonio Lim', phone: '+63 918 300 2233', address_line_1: '45 Ayala Avenue', address_line_2: null, city: 'Makati City', province: 'Metro Manila', postal_code: '1229', is_default: 1 },
    { owner: 'patricia.navarro@example.com', full_name: 'Patricia Navarro', phone: '+63 919 300 3344', address_line_1: '77 Saint Rufina Street', address_line_2: 'House 2', city: 'Parañaque', province: 'Metro Manila', postal_code: '1700', is_default: 1 },
    { owner: 'kevin.tan@example.com', full_name: 'Kevin Tanchanco', phone: '+63 917 300 4455', address_line_1: '9 General Luna Street', address_line_2: null, city: 'Cebu City', province: 'Cebu', postal_code: '6000', is_default: 1 },
    { owner: 'angela.belmonte@example.com', full_name: 'Angela Belmonte', phone: '+63 918 300 5566', address_line_1: '210 Legazpi Street', address_line_2: 'Tower B, 12F', city: 'Manila', province: 'Metro Manila', postal_code: '1000', is_default: 1 },
    { owner: 'michael.delacruz@example.com', full_name: 'Michael Dela Cruz', phone: '+63 919 300 6677', address_line_1: '56 Meralco Street', address_line_2: null, city: 'Iloilo City', province: 'Iloilo', postal_code: '5000', is_default: 1 },
    { owner: 'grace.ocampo@example.com', full_name: 'Grace Ocampo', phone: '+63 917 300 7788', address_line_1: '33 Roxas Boulevard', address_line_2: null, city: 'Pasay City', province: 'Metro Manila', postal_code: '1300', is_default: 1 },
    { owner: 'daniel.aquino@example.com', full_name: 'Daniel Aquino', phone: '+63 918 300 8899', address_line_1: '81 Tirso de Hera Street', address_line_2: 'Compound 3', city: 'Caloocan City', province: 'Metro Manila', postal_code: '1100', is_default: 1 },
    { owner: 'carmela.villanueva@example.com', full_name: 'Carmela Villanueva', phone: '+63 919 300 9900', address_line_1: '14 Salazar Street', address_line_2: null, city: 'Baguio City', province: 'Benguet', postal_code: '2600', is_default: 1 },
    { owner: 'ricardo.bautista@example.com', full_name: 'Ricardo Bautista', phone: '+63 917 301 1100', address_line_1: '305 Shaw Boulevard', address_line_2: 'Unit 7A', city: 'Mandaluyong', province: 'Metro Manila', postal_code: '1550', is_default: 1 },
    { owner: 'stephanie.cunanan@example.com', full_name: 'Stephanie Cunanan', phone: '+63 918 301 2211', address_line_1: '62 Katipunan Drive', address_line_2: null, city: 'Quezon City', province: 'Metro Manila', postal_code: '1108', is_default: 1 },
    { owner: 'emmanuel.ferrer@example.com', full_name: 'Emmanuel Ferrer', phone: '+63 919 301 3322', address_line_1: '18 Osmeña Highway', address_line_2: 'Riverside Homes', city: 'Davao City', province: 'Davao del Sur', postal_code: '8000', is_default: 1 },
    { owner: 'bea.alonzo@example.com', full_name: 'Bea Alonzo-Cruz', phone: '+63 917 301 4433', address_line_1: '140 Sumulong Highway', address_line_2: null, city: 'Mandaluyong', province: 'Metro Manila', postal_code: '1550', is_default: 1 },
    { owner: 'katrina.malvar@example.com', full_name: 'Katrina Malvar', phone: '+63 919 301 6655', address_line_1: '27 Acacia Street', address_line_2: 'Lot 11', city: 'Tagbilaran City', province: 'Bohol', postal_code: '6300', is_default: 1 },
    { owner: 'frances.domingo@example.com', full_name: 'Frances Domingo', phone: '+63 918 301 8877', address_line_1: '92 Colon Street', address_line_2: 'Suite 808', city: 'Cebu City', province: 'Cebu', postal_code: '6000', is_default: 1 },
    { owner: 'gabriel.puno@example.com', full_name: 'Gabriel Puno', phone: '+63 919 301 9988', address_line_1: '5 San Pablo Street', address_line_2: null, city: 'Makati City', province: 'Metro Manila', postal_code: '1200', is_default: 1 },
    { owner: 'yvette.espino@example.com', full_name: 'Yvette Espino', phone: '+63 917 302 1099', address_line_1: '410 Boni Avenue', address_line_2: null, city: 'Mandaluyong', province: 'Metro Manila', postal_code: '1553', is_default: 1 },
    { owner: 'marianne.quill@example.com', full_name: 'Marianne Quill', phone: '+63 919 302 3311', address_line_1: '76 Vergara Street', address_line_2: null, city: 'San Juan', province: 'Metro Manila', postal_code: '1500', is_default: 1 },
    { owner: 'alfonso.bacsain@example.com', full_name: 'Alfonso Bacsain', phone: '+63 917 302 4422', address_line_1: '23 Echague Street', address_line_2: null, city: 'Baguio City', province: 'Benguet', postal_code: '2600', is_default: 1 },
    { owner: 'roderick.magsaysay@example.com', full_name: 'Roderick Magsaysay', phone: '+63 919 302 6644', address_line_1: '54 Aurora Boulevard', address_line_2: 'Unit 9C', city: 'Quezon City', province: 'Metro Manila', postal_code: '1100', is_default: 1 },
];
exports.PRODUCTS = [
    // ---------------------------------------------------- Sofas & Sectionals
    { name: 'NordicAline Bergen 3-Seater Sofa', category: 'sofas-sectionals', brand: 'NordicAline', short_description: 'A deep three-seater in oatmeal bouclé with reversible seat cushions.', description: 'The Bergen is built around a kiln-dried hardwood frame and eight-way hand-tied suspension. The oatmeal bouclé is 40,000 Martindale rated, so it shrugs off a busy family room. Seat and back cushions are reversible and unzip for cleaning. Legs are solid white oak with a matte lacquer finish.', price: 42900, sale_price: 36900, cost_price: 24500, weight: 62, dimensions: '210 x 92 x 78', stock_quantity: 12, minimum_stock: 4, featured: 1, status: 'active', specifications: [['Frame', 'Kiln-dried hardwood'], ['Upholstery', 'Oatmeal bouclé, 40,000 Martindale'], ['Dimensions', '210 x 92 x 78 cm'], ['Seat depth', '58 cm'], ['Assembly', 'Legs only, 10 minutes']] },
    { name: 'Solace Living Calibre Reclining Sofa', category: 'sofas-sectionals', brand: 'Solace Living', short_description: 'Three power recliners with lumbar support and USB charging.', description: 'Calibre pairs a wall-hugging mechanism with a high-density foam core, so a full recline does not push the sofa off its wall. Each seat has a manual headrest and a USB-C charging port in the arm. Power cords are bundled and exit at the rear.', price: 68900, sale_price: null, cost_price: 41500, weight: 118, dimensions: '240 x 100 x 104', stock_quantity: 2, minimum_stock: 2, featured: 1, status: 'active', specifications: [['Recline', 'Wall-hugger power mechanism'], ['Reclined depth', '168 cm'], ['Charging', 'USB-C per arm'], ['Fabric', 'Performance charcoal']] },
    { name: 'Casa Marina Cove Sectional', category: 'sofas-sectionals', brand: 'Casa Marina', short_description: 'L-shaped rattan-look sectional with whitewashed beech frames.', description: 'A resort-style sectional wrapped in hand-woven PE rattan over a whitewashed beech frame. The chaise flips, so you can swap the corner to suit the room. Cushion covers unzip and are machine washable on a cold cycle.', price: 56800, sale_price: 49900, cost_price: 33000, weight: 88, dimensions: '280 x 165 x 78', stock_quantity: 8, minimum_stock: 3, featured: 0, status: 'active', specifications: [['Configuration', 'L-shaped with reversible chaise'], ['Frame', 'Whitewashed beech'], ['Weave', 'Hand-woven PE rattan'], ['Cushion covers', 'Removable, machine washable']] },
    { name: 'Urban Nest Halcyon Loveseat', category: 'sofas-sectionals', brand: 'Urban Nest', short_description: 'A two-seater that fits a 1.6 m wall, with reversible cushions.', description: 'Designed for condos and small living rooms, the Halcyat measures only 158 cm wide. The slim arms keep the profile tight while the pocket-spring seat still supports 120 kg per cushion. Assembles in under 15 minutes with the included hex key.', price: 24900, sale_price: 21900, cost_price: 13800, weight: 38, dimensions: '158 x 88 x 80', stock_quantity: 22, minimum_stock: 6, featured: 0, status: 'active', specifications: [['Width', '158 cm'], ['Seat', 'Pocket spring, 2 cushions'], ['Frame', 'Engineered hardwood'], ['Assembly', '15 minutes, hex key included']] },
    { name: 'Meridian Ellery Velvet Chesterfield', category: 'sofas-sectionals', brand: 'Meridian Furniture', short_description: 'Deep-buttoned velvet Chesterfield on a walnut plinth.', description: 'The Ellery is a proper Chesterfield: hand-tufted back, rolled arms and a solid walnut plinth set back to float the body. The cotton velvet shifts from emerald to forest depending on the light, which is the whole point of the piece.', price: 74900, sale_price: null, cost_price: 46000, weight: 74, dimensions: '200 x 95 x 72', stock_quantity: 3, minimum_stock: 2, featured: 1, status: 'active', specifications: [['Upholstery', 'Cotton velvet, emerald'], ['Detail', 'Hand-tufted back'], ['Plinth', 'Solid American walnut'], ['Seat', 'Feather-wrapped foam']] },
    // ----------------------------------------------------------- Coffee tables
    { name: 'Terrazzo & Co Carrara Terrazzo Coffee Table', category: 'coffee-tables', brand: 'Terrazzo & Co', short_description: 'Cast terrazzo top with a powder-coated steel base.', description: 'Each top is cast in small batches, so the aggregate pattern is unique to your table. The top is sealed against stains and the 8 mm steel base is powder-coated to a soft matte black that will not show fingerprints.', price: 28500, sale_price: 24900, cost_price: 15500, weight: 46, dimensions: '120 x 70 x 38', stock_quantity: 9, minimum_stock: 3, featured: 1, status: 'active', specifications: [['Top', 'Cast terrazzo, 20 mm'], ['Base', 'Powder-coated steel'], ['Seal', 'Penetrating, stain resistant'], ['Assembly', 'Two bolts']] },
    { name: 'Handcrafted Timber Sabo Coffee Table', category: 'coffee-tables', brand: 'Handcrafted Timber', short_description: 'Reclaimed acacia slab top on a hand-turned pedestal.', description: 'Cut from reclaimed acacia, the slab keeps the natural edge and a few nail marks from its previous life. The pedestal is turned by hand, so no two are identical. Finished with a hardwax oil that can be spot-repaired.', price: 31900, sale_price: null, cost_price: 18000, weight: 34, dimensions: '130 x 75 x 40', stock_quantity: 6, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Top', 'Reclaimed acacia, live edge'], ['Base', 'Hand-turned pedestal'], ['Finish', 'Hardwax oil'], ['Weight capacity', '60 kg']] },
    { name: 'NordicAline Oslo Nesting Tables', category: 'coffee-tables', brand: 'NordicAline', short_description: 'A pair of round ash tables that tuck neatly together.', description: 'Sold as a pair in two sizes. The smaller table slides completely under the larger, which makes them useful in a small living room and as bedside tables. Solid ash with a whitewashed matte finish.', price: 15800, sale_price: 12900, cost_price: 8200, weight: 16, dimensions: '55/45 dia x 50', stock_quantity: 18, minimum_stock: 5, featured: 0, status: 'active', specifications: [['Set', 'Two tables, 55 cm and 45 cm'], ['Material', 'Solid ash, whitewashed'], ['Finish', 'Matte lacquer'], ['Assembly', 'Legs bolt on']] },
    { name: 'Meridian Park Avenue Coffee Table', category: 'coffee-tables', brand: 'Meridian Furniture', short_description: 'Brass-capped walnut rectangle with a lower magazine shelf.', description: 'A mid-century rectangle in book-matched walnut with solid brass feet that lift the top clear of the floor. The lower shelf is felt-lined so magazines and remotes do not mark the timber.', price: 22900, sale_price: null, cost_price: 12100, weight: 27, dimensions: '110 x 60 x 40', stock_quantity: 11, minimum_stock: 4, featured: 0, status: 'active', specifications: [['Top', 'Book-matched walnut, 25 mm'], ['Feet', 'Solid brass'], ['Shelf', 'Felt-lined magazine rack'], ['Weight capacity', '45 kg']] },
    // ----------------------------------------------------- TV & Media units
    { name: 'Urban Nest Halden Media Console', category: 'tv-media-units', brand: 'Urban Nest', short_description: 'Flat-pack media unit with cable routing and soft-close doors.', description: 'Two soft-close doors hide the cable spaghetti, with a ventilated back panel so a games console does not cook. Ships flat in a box roughly the size of the assembled top, which is why couriers accept it.', price: 18900, sale_price: 15900, cost_price: 9600, weight: 42, dimensions: '160 x 40 x 48', stock_quantity: 16, minimum_stock: 5, featured: 1, status: 'active', specifications: [['Width', '160 cm'], ['Doors', 'Soft-close, 2'], ['Back', 'Ventilated cable panel'], ['Flat pack', 'Yes, tool included']] },
    { name: 'Handcrafted Timber Ridge Wall Unit', category: 'tv-media-units', brand: 'Handcrafted Timber', short_description: 'Wall-mounted oak unit with closed storage and open display ledges.', description: 'Concealed steel cleats carry up to 60 kg, so the unit floats clear of the skirting. Two closed cupboards hide remotes and consoles, while the open ledges are deep enough for a 55-inch set.', price: 36900, sale_price: null, cost_price: 20500, weight: 52, dimensions: '180 x 38 x 35', stock_quantity: 7, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Mounting', 'Concealed steel cleats'], ['Capacity', '60 kg'], ['Storage', '2 cupboards, 2 open ledges'], ['Material', 'Solid white oak']] },
    { name: 'Meridian Halston Lowboard', category: 'tv-media-units', brand: 'Meridian Furniture', short_description: 'Four-door walnut lowboard on a slim brass-leg frame.', description: 'A long, low silhouette that keeps a large television from dominating the wall. Each door has a push-latch so the fronts stay flush. The brass legs are 18 cm tall, which is also the right height for a soundbar.', price: 45900, sale_price: 39900, cost_price: 27000, weight: 66, dimensions: '200 x 45 x 52', stock_quantity: 4, minimum_stock: 2, featured: 1, status: 'active', specifications: [['Doors', '4, push-latch'], ['Legs', 'Solid brass, 18 cm'], ['Material', 'Walnut veneer on MDF core'], ['Cable cut-outs', '2 rear']] },
    // --------------------------------------------------------- Beds & frames
    { name: 'Handcrafted Timber Ashford Queen Bed', category: 'beds-bed-frames', brand: 'Handcrafted Timber', short_description: 'Solid oak queen frame with a slatted base, no box spring needed.', description: 'A proper slatted base supports up to 300 kg, so no box spring is required. The headboard is solid oak with a shallow fluted detail that stops the wall behind it looking bare. Ships in two pieces with a ten-year frame guarantee.', price: 42900, sale_price: 37900, cost_price: 24500, weight: 78, dimensions: '160 x 215 x 110', stock_quantity: 8, minimum_stock: 3, featured: 1, status: 'active', specifications: [['Size', 'Queen (160 x 200 cm)'], ['Base', '14 wooden slats, no box spring'], ['Capacity', '300 kg'], ['Guarantee', '10 years on the frame']] },
    { name: 'Urban Nest Latchmini Semi-Double Bed', category: 'beds-bed-frames', brand: 'Urban Nest', short_description: 'A 120 cm bed with three deep storage drawers underneath.', description: 'Made for smaller bedrooms, the Latchmini packs three full-extension drawers into a 120 cm footprint. Drawers run on steel ball bearings and pull out 45 cm, so nothing is lost at the back.', price: 21900, sale_price: null, cost_price: 12400, weight: 54, dimensions: '120 x 200 x 95', stock_quantity: 14, minimum_stock: 4, featured: 0, status: 'active', specifications: [['Size', 'Semi-double (120 x 200 cm)'], ['Storage', '3 drawers, 45 cm extension'], ['Runners', 'Steel ball bearing'], ['Headboard', 'Upholstered, removable cover']] },
    { name: 'NordicAline Fjord King Bed', category: 'beds-bed-frames', brand: 'NordicAline', short_description: 'Low-profile king bed in pale ash with a floating headboard.', description: 'The Fjord sits low to the floor, which suits a platform mattress and makes the room feel larger. The headboard is upholstered in oatmeal linen and floats 4 cm off the frame on concealed brackets.', price: 52900, sale_price: 46900, cost_price: 31000, weight: 96, dimensions: '180 x 215 x 80', stock_quantity: 5, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Size', 'King (180 x 200 cm)'], ['Frame height', '28 cm from floor'], ['Headboard', 'Oatmeal linen, floating'], ['Base', 'Solid ash slats']] },
    { name: 'Puno Woodcraft Cabin Bunk Bed', category: 'beds-bed-frames', brand: 'Puno Woodcraft', short_description: 'Twin-over-twin bunk with a ladder and a safety guard rail.', description: 'Built from FSC-certified acacia with a water-based finish that is safe for a child’s room. The guard rail is 22 cm above the mattress line and the ladder has non-slip treads. Rated for 90 kg per bunk.', price: 27900, sale_price: 23900, cost_price: 15800, weight: 84, dimensions: '100 x 210 x 155', stock_quantity: 9, minimum_stock: 3, featured: 1, status: 'active', specifications: [['Configuration', 'Twin over twin'], ['Material', 'FSC acacia'], ['Guard rail', '22 cm above mattress'], ['Capacity', '90 kg per bunk']] },
    { name: 'Casa Marina Capri Daybed', category: 'beds-bed-frames', brand: 'Casa Marina', short_description: 'Outdoor-rated daybed in quick-dry foam with a rope frame.', description: 'The Capri is built for the terrace: quick-dry foam wrapped in solution-dyed acrylic that will not fade in full sun. The rope frame is marine-grade and the whole thing stacks flat for storage.', price: 33900, sale_price: null, cost_price: 19500, weight: 41, dimensions: '200 x 80 x 65', stock_quantity: 6, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Use', 'Outdoor rated'], ['Fabric', 'Solution-dyed acrylic'], ['Frame', 'Marine-grade rope'], ['Foldable', 'Yes, stacks flat']] },
    // -------------------------------------------------------------- Mattresses
    { name: 'NordicAline Aurora Hybrid Mattress', category: 'mattresses', brand: 'NordicAline', short_description: 'Pocket spring hybrid with a latex comfort layer, queen size.', description: 'A hybrid of 2,000 pocket springs under 4 cm of natural latex. The latex breathes better than memory foam in a humid climate, and the zoned pocket springs keep the lumbar supported without the bounce of an innerspring.', price: 32900, sale_price: 27900, cost_price: 19000, weight: 45, dimensions: '152 x 203 x 28', stock_quantity: 15, minimum_stock: 5, featured: 1, status: 'active', specifications: [['Size', 'Queen (152 x 203 cm)'], ['Layers', '2,000 pocket springs + 4 cm latex'], ['Feel', 'Medium-firm, zoned'], ['Cover', 'Removable, washable'], ['Warranty', '10 years']] },
    { name: 'Solace Living Vantage Memory Foam Mattress', category: 'mattresses', brand: 'Solace Living', short_description: 'Dense 5 cm memory foam over a high-density support core.', description: 'Vantage is built for side sleepers: a dense 5 cm comfort layer slow enough to relieve shoulder pressure, over an HD support core that stops the spine sinking. Open-cell foam helps it cool down within a few minutes of getting up.', price: 38900, sale_price: null, cost_price: 22500, weight: 52, dimensions: '152 x 203 x 30', stock_quantity: 11, minimum_stock: 4, featured: 0, status: 'active', specifications: [['Size', 'Queen (152 x 203 cm)'], ['Comfort layer', '5 cm open-cell memory foam'], ['Core', 'HD support foam'], ['Best for', 'Side sleepers']] },
    { name: 'NordicAline Larkspur Firm Mattress', category: 'mattresses', brand: 'NordicAline', short_description: 'Extra-firm pillow-top mattress with a quilted cashmere cover.', description: 'A firm pillow-top for back sleepers and heavier sleepers. The cover is a cashmere-blend quilt that stays cool, and the top panel is 4 cm of high-resilience foam for a springy, not squishy, feel.', price: 26900, sale_price: 22900, cost_price: 15000, weight: 58, dimensions: '152 x 203 x 27', stock_quantity: 3, minimum_stock: 4, featured: 0, status: 'active', specifications: [['Size', 'Queen (152 x 203 cm)'], ['Feel', 'Extra firm pillow top'], ['Cover', 'Cashmere-blend quilt'], ['Top panel', '4 cm high-resilience foam']] },
    { name: 'Urban Nest Stacking Twin Mattress', category: 'mattresses', brand: 'Urban Nest', short_description: 'Trundle-friendly 18 cm twin mattress with a removable topper.', description: 'At 18 cm it fits under a standard trundle bed, and the topper unzips for a deeper surface without replacing the whole mattress. Stiffened edges keep it from curling when a child climbs on.', price: 11900, sale_price: 9900, cost_price: 6400, weight: 24, dimensions: '97 x 203 x 18', stock_quantity: 26, minimum_stock: 8, featured: 0, status: 'active', specifications: [['Size', 'Twin (97 x 203 cm)'], ['Height', '18 cm, trundle-friendly'], ['Topper', 'Removable, 5 cm'], ['Edges', 'Stiffened perimeter']] },
    // ---------------------------------------------------------- Dining Room
    { name: 'Handcrafted Timber Galleon Dining Table', category: 'dining-room', brand: 'Handcrafted Timber', short_description: 'Six-seat solid oak table with a breadboard top.', description: 'A breadboard top is the traditional way to stop a solid timber table from splitting as the seasons change, and it is why this table can be refinished rather than replaced. Seats six comfortably, eight when squeezed.', price: 58900, sale_price: 51900, cost_price: 34000, weight: 74, dimensions: '200 x 100 x 76', stock_quantity: 5, minimum_stock: 2, featured: 1, status: 'active', specifications: [['Seats', '6 comfortable, 8 maximum'], ['Top', 'Solid oak, breadboard'], ['Base', 'Trestle with through-tenon'], ['Extension', 'None']] },
    { name: 'Meridian Verlaine Dining Chair', category: 'dining-room', brand: 'Meridian Furniture', short_description: 'Upholstered dining chair with a walnut cross-back.', description: 'The seat is foam over webbing rather than foam alone, so it does not bottom out after a long dinner. The cross-back is solid walnut with a hand-rubbed oil finish. Sold individually so you can mix and match.', price: 12900, sale_price: 10900, cost_price: 6400, weight: 8, dimensions: '48 x 55 x 82', stock_quantity: 44, minimum_stock: 12, featured: 0, status: 'active', specifications: [['Seat', 'Foam over webbing'], ['Back', 'Solid walnut cross-back'], ['Frame', 'Kiln-dried hardwood'], ['Sold', 'Individually']] },
    { name: 'Terrazzo & Co Paz Oval Dining Table', category: 'dining-room', brand: 'Terrazzo & Co', short_description: 'Oval cast-terrazzo table on a sculptural concrete base.', description: 'An oval top seats six without anyone sitting at a corner. The base is a single cast concrete form that weighs enough to stop the table being nudged, and the terrazzo is sealed against heat and stains.', price: 76900, sale_price: null, cost_price: 46000, weight: 118, dimensions: '200 x 105 x 75', stock_quantity: 0, minimum_stock: 1, featured: 1, status: 'active', specifications: [['Seats', '6'], ['Top', 'Oval cast terrazzo, 25 mm'], ['Base', 'Single-cast concrete'], ['Seal', 'Heat and stain resistant']] },
    { name: 'Casa Marina Seabreeze Bar Stool', category: 'dining-room', brand: 'Casa Marina', short_description: 'Counter-height rattan stool with a woven seat and footrest.', description: 'A woven rattan seat on a powder-coated steel frame, at 66 cm for a standard 90 cm counter. The footrest ring is welded, not screwed, so it will not work loose.', price: 8900, sale_price: 6900, cost_price: 3800, weight: 7, dimensions: '40 x 40 x 66', stock_quantity: 52, minimum_stock: 15, featured: 0, status: 'active', specifications: [['Height', '66 cm seat'], ['Seat', 'Hand-woven rattan'], ['Frame', 'Powder-coated steel'], ['Footrest', 'Welded ring']] },
    { name: 'NordicAline Ridge Extendable Table', category: 'dining-room', brand: 'NordicAline', short_description: 'Ash table that extends from 140 cm to 200 cm with one leaf.', description: 'One stored leaf turns a four-seat table into a six-seater in about a minute. The extension is a real solid ash board rather than a veneer skin, so it matches the top exactly.', price: 32900, sale_price: null, cost_price: 18500, weight: 52, dimensions: '140-200 x 90 x 76', stock_quantity: 7, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Closed', '140 cm, seats 4'], ['Open', '200 cm, seats 6'], ['Leaf', 'Solid ash, stored under top'], ['Extension time', 'About 1 minute']] },
    // --------------------------------------------------------- Office & Study
    { name: 'Urban Nest Apex Standing Desk', category: 'office-study', brand: 'Urban Nest', short_description: 'Dual-motor sit-stand desk with four memory presets.', description: 'Dual motors lift 120 kg smoothly and hold position without a sag in the middle. Four presets remember the heights you actually use rather than making you reach the controller every time.', price: 34900, sale_price: 29900, cost_price: 19500, weight: 42, dimensions: '140 x 70 x 62-125', stock_quantity: 13, minimum_stock: 4, featured: 1, status: 'active', specifications: [['Range', '62-125 cm'], ['Capacity', '120 kg'], ['Motors', 'Dual, whisper quiet'], ['Presets', '4 memory positions'], ['Top', '25 mm melamine, cable tray']] },
    { name: 'Meridian Corvina Ergonomic Chair', category: 'office-study', brand: 'Meridian Furniture', short_description: 'Mesh-back task chair with adjustable lumbar and 4D arms.', description: 'A breathable mesh back keeps you cool through a long afternoon, and the lumbar support adjusts through 45 mm so it can be dialled to your shape rather than a stock position. The seat is moulded foam, not fabric over foam.', price: 27900, sale_price: 23900, cost_price: 15800, weight: 18, dimensions: '66 x 66 x 96-108', stock_quantity: 20, minimum_stock: 6, featured: 1, status: 'active', specifications: [['Back', 'Breathable mesh'], ['Lumbar', 'Adjustable, 45 mm range'], ['Arms', '4D, height and width'], ['Seat', 'Moulded foam'], ['Max load', '120 kg']] },
    { name: 'Handcrafted Timber Folio Writing Desk', category: 'office-study', brand: 'Handcrafted Timber', short_description: 'Solid walnut desk with a leather-inset writing surface.', description: 'A proper writing desk rather than a computer desk: the top is tilted at 4 degrees and inset with a green leather pad, which stops a pen catching on the grain. One shallow drawer takes a laptop and a notebook.', price: 42900, sale_price: null, cost_price: 24000, weight: 36, dimensions: '120 x 60 x 76', stock_quantity: 6, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Top', 'Solid walnut, 4° tilt'], ['Inset', 'Green leather writing pad'], ['Storage', '1 shallow laptop drawer'], ['Cable', 'Rear grommet']] },
    { name: 'Urban Nest Ledger Filing Cabinet', category: 'office-study', brand: 'Urban Nest', short_description: 'Three-drawer vertical file with a full-extension suspension.', description: 'Three full-height drawers on ball-bearing suspension, with a lock on the top one. The frame is powder-coated steel, so it can carry A4 hanging files without sagging the way a plastic insert does.', price: 14900, sale_price: 12900, cost_price: 8200, weight: 24, dimensions: '46 x 62 x 102', stock_quantity: 17, minimum_stock: 5, featured: 0, status: 'active', specifications: [['Drawers', '3, full height'], ['Suspension', 'Ball bearing, full extension'], ['Lock', 'Top drawer'], ['Files', 'A4 hanging files']] },
    // ---------------------------------------------------------- Outdoor & Patio
    { name: 'Casa Marina Palapa Outdoor Sofa', category: 'outdoor-patio', brand: 'Casa Marina', short_description: 'Three-seat outdoor sofa with a quick-dry cushion and teak frame.', description: 'FSC teak frames weather to a silver-grey rather than rotting, and the cushions use a quick-dry foam wrapped in UV-stable acrylic. Fully knock-down, so it moves through a narrow doorway without disassembly.', price: 56900, sale_price: 49900, cost_price: 33000, weight: 64, dimensions: '200 x 85 x 78', stock_quantity: 6, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Frame', 'FSC teak'], ['Cushion', 'Quick-dry foam, UV acrylic'], ['Assembly', 'Fully knock-down'], ['Use', 'Outdoor rated']] },
    { name: 'NordicAline Sundown Outdoor Lounge', category: 'outdoor-patio', brand: 'NordicAline', short_description: 'Reclining garden lounger in powder-coated aluminium.', description: 'Six backrest positions from upright to flat, on a powder-coated aluminium frame that will not rust at the joints the way folding steel does. Wheels at the front make it easy to move.', price: 23900, sale_price: 19900, cost_price: 12800, weight: 21, dimensions: '70 x 165 x 60-105', stock_quantity: 14, minimum_stock: 4, featured: 0, status: 'active', specifications: [['Positions', '6 backrest settings'], ['Frame', 'Powder-coated aluminium'], ['Fabric', 'UV-stable polyester'], ['Wheels', 'Front, 2']] },
    { name: 'Casa Marina Boardwalk Outdoor Dining Set', category: 'outdoor-patio', brand: 'Casa Marina', short_description: 'Six-seat teak dining set with cushions and a parasol hole.', description: 'A dining set that survives a Philippine wet season: all-teak construction, marine-grade cushions and a 50 mm parasol hole in the centre of the table. Folds flat for storage against the wall.', price: 79900, sale_price: 69900, cost_price: 48000, weight: 96, dimensions: '180 x 90 x 76', stock_quantity: 0, minimum_stock: 1, featured: 1, status: 'active', specifications: [['Seats', '6'], ['Material', 'All-teak with marine cushions'], ['Parasol hole', '50 mm, centred'], ['Folding', 'Yes']] },
    { name: 'NordicAline Cove Outdoor Side Table', category: 'outdoor-patio', brand: 'NordicAline', short_description: 'Compact teak-look side table for a balcony or pool deck.', description: 'Small enough for a 90 cm balcony yet stable enough for a tray of drinks, the Cove has a slatted top that lets water drain instead of sitting in puddles. Resin-wood slats on an aluminium frame, so it will not swell.', price: 8900, sale_price: null, cost_price: 4500, weight: 8, dimensions: '50 dia x 50', stock_quantity: 32, minimum_stock: 10, featured: 0, status: 'active', specifications: [['Top', 'Slatted, drains water'], ['Frame', 'Aluminium with resin-wood slats'], ['Diameter', '50 cm'], ['Use', 'Balcony and pool deck']] },
    // -------------------------------------------------------- Kitchen & Storage
    { name: 'Urban Nest Tessera Kitchen Cabinet Set', category: 'kitchen-storage', brand: 'Urban Nest', short_description: 'Six-piece base cabinet set with soft-close doors.', description: 'Six base cabinets in a modular 60 cm grid, with soft-close hinges and adjustable legs that take out the need to scribe to an uneven floor. Door and drawer fronts can be swapped later without replacing the carcass.', price: 84900, sale_price: 74900, cost_price: 52000, weight: 210, dimensions: '360 x 60 x 90', stock_quantity: 4, minimum_stock: 2, featured: 1, status: 'active', specifications: [['Set', '6 base cabinets, 60 cm grid'], ['Hinges', 'Soft-close throughout'], ['Legs', 'Adjustable, 100-150 mm'], ['Fronts', 'Interchangeable']] },
    { name: 'Handcrafted Timber Larder Pantry Cabinet', category: 'kitchen-storage', brand: 'Handcrafted Timber', short_description: 'Tall oak larder with adjustable shelves and a pull-out spice rack.', description: 'A proper larder rather than a flat pack: solid oak shelves that will not sag under the weight of plates, plus two pull-out racks at waist height for spices and jars. Adjustable on 32 mm holes, so the layout can follow how you actually cook.', price: 62900, sale_price: null, cost_price: 37000, weight: 108, dimensions: '90 x 45 x 200', stock_quantity: 1, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Shelves', '5 solid oak, 32 mm adjustment'], ['Pull-outs', '2 spice and jar racks'], ['Height', '200 cm'], ['Doors', 'Soft-close']] },
    { name: 'Urban Nest Stackbin Storage Unit', category: 'kitchen-storage', brand: 'Urban Nest', short_description: 'Modular stacking bins on a rolling frame for the garage.', description: 'Bins drop into a rolling frame without tools, so you can add a tier whenever the pile grows. Each bin holds 40 litres and the frame is lockable, which matters more than expected in a shared garage.', price: 18900, sale_price: 15900, cost_price: 9600, weight: 31, dimensions: '80 x 40 x 120', stock_quantity: 15, minimum_stock: 4, featured: 0, status: 'active', specifications: [['Capacity', '3 bins, 40 L each'], ['Frame', 'Lockable, on castors'], ['Assembly', 'Tool-free bin drop-in'], ['Height', '120 cm']] },
    { name: 'NordicAline Hallway Bench with Storage', category: 'kitchen-storage', brand: 'NordicAline', short_description: 'Entryway bench with a lift-up seat and shoe tray.', description: 'The sort of piece an entryway actually needs: somewhere to sit, a place to drop keys, and a concealed shoe tray underneath. The seat lifts on gas struts, so it stays up on its own.', price: 16900, sale_price: 13900, cost_price: 8800, weight: 19, dimensions: '90 x 36 x 46', stock_quantity: 21, minimum_stock: 6, featured: 0, status: 'active', specifications: [['Storage', 'Concealed shoe tray'], ['Seat', 'Gas-strut lift-up'], ['Frame', 'Solid ash'], ['Load', '90 kg']] },
    // ---------------------------------------------------------- Kids & Nursery
    { name: 'Puno Woodcraft Sprout Kids Study Desk', category: 'kids-nursery', brand: 'Puno Woodcraft', short_description: 'Height-adjustable desk with a rounded edge for ages 4-14.', description: 'Grows with the child: the top adjusts from 52 cm to 74 cm, so one desk covers a first-grader and a teenager. Every edge is rounded to 12 mm radius, which is the detail that actually matters in a kids’ room.', price: 21900, sale_price: 18900, cost_price: 12500, weight: 23, dimensions: '110 x 55 x 52-74', stock_quantity: 12, minimum_stock: 4, featured: 1, status: 'active', specifications: [['Height range', '52-74 cm'], ['Age', '4 to 14'], ['Edges', '12 mm radius, all corners'], ['Finish', 'Water-based low-VOC']] },
    { name: 'Puno Woodcraft Nestle Changing Station', category: 'kids-nursery', brand: 'Puno Woodcraft', short_description: 'Changing table with two drawers and a safety stop rail.', description: 'A changing table with a raised rail on all three open sides, and a strap anchor point. Two deep drawers take nappies and clothes separately, which stops the drawer you need most being the one at the bottom.', price: 26900, sale_price: null, cost_price: 15200, weight: 29, dimensions: '80 x 50 x 95', stock_quantity: 8, minimum_stock: 3, featured: 0, status: 'active', specifications: [['Safety', 'Rail on 3 sides, strap anchor'], ['Storage', '2 drawers'], ['Material', 'FSC birch plywood'], ['Finish', 'Water-based, non-toxic']] },
    { name: 'Puno Woodcraft Steppe Toy Chest', category: 'kids-nursery', brand: 'Puno Woodcraft', short_description: 'Toy chest that doubles as a bench, with a safety lid stay.', description: 'A toy chest that is also a bench, with a lid stay so it cannot slam shut on small fingers. The slatted top doubles as a step, which is the sort of thing a real nursery needs.', price: 12900, sale_price: 9900, cost_price: 6200, weight: 14, dimensions: '80 x 40 x 45', stock_quantity: 19, minimum_stock: 6, featured: 0, status: 'active', specifications: [['Lid', 'Gas-strut safety stay'], ['Use', 'Storage and bench'], ['Top', 'Slatted, doubles as a step'], ['Material', 'FSC acacia']] },
    // --------------------------------------------------------- Decor & Lighting
    { name: 'Casa Marina Halston Jute Area Rug', category: 'decor-lighting', brand: 'Casa Marina', short_description: 'Hand-woven jute rug with a fringed edge, 200 x 300 cm.', description: 'Hand-woven jute on a cotton backing, with the irregular slub you only get from a natural fibre. Reversible, so it wears evenly across the two faces. Fringed at both short ends.', price: 17900, sale_price: 14900, cost_price: 9800, weight: 16, dimensions: '200 x 300 x 1', stock_quantity: 22, minimum_stock: 6, featured: 1, status: 'active', specifications: [['Size', '200 x 300 cm'], ['Fibre', 'Hand-woven jute on cotton backing'], ['Reversible', 'Yes'], ['Edge', 'Fringed both ends']] },
    { name: 'NordicAline Fjord Arc Floor Lamp', category: 'decor-lighting', brand: 'NordicAline', short_description: 'Marble-weighted arc lamp with a linen drum shade.', description: 'A 1.6 m arc that reaches over a sofa without a floor cable, weighted with a solid marble base so it does not tip when you adjust it. The linen drum shade dims warmly rather than reading as harsh.', price: 22900, sale_price: null, cost_price: 12800, weight: 18, dimensions: '160 reach x 40 base x 165', stock_quantity: 16, minimum_stock: 5, featured: 1, status: 'active', specifications: [['Reach', '160 cm'], ['Base', 'Solid marble, weighted'], ['Shade', 'Natural linen drum'], ['Bulb', 'E27, up to 9 W LED']] },
    { name: 'Meridian Solstice Brass Table Lamp', category: 'decor-lighting', brand: 'Meridian Furniture', short_description: 'Solid brass lamp with a fluted glass shade.', description: 'Unlacquered brass that is meant to patina, with a fluted opal shade that softens the light in both directions. A weighted base stops it being knocked over by a cat.', price: 12900, sale_price: 10900, cost_price: 6400, weight: 4, dimensions: '24 dia x 42', stock_quantity: 28, minimum_stock: 8, featured: 0, status: 'active', specifications: [['Base', 'Unlacquered solid brass'], ['Shade', 'Fluted opal glass'], ['Height', '42 cm'], ['Dimmer', 'Inline, foot switch']] },
    { name: 'Casa Marina Tidal Wall Mirror', category: 'decor-lighting', brand: 'Casa Marina', short_description: 'Arched wall mirror with a rattan frame, 70 x 120 cm.', description: 'An arched mirror in a hand-woven rattan frame that softens a hard wall. Mounts flush with a single French cleat, so there is no visible bracket from the front.', price: 14900, sale_price: 12900, cost_price: 7800, weight: 9, dimensions: '70 x 120 x 4', stock_quantity: 18, minimum_stock: 5, featured: 0, status: 'active', specifications: [['Size', '70 x 120 cm'], ['Frame', 'Hand-woven rattan'], ['Mounting', 'Single French cleat'], ['Glass', '4 mm, safety-backed']] },
    { name: 'NordicAline Fern Down Duvet Set', category: 'decor-lighting', brand: 'NordicAline', short_description: 'Stonewashed cotton duvet cover with two pillowcases.', description: 'Stonewashed European flax cotton that starts soft instead of needing a dozen washes to get there. A hidden placket means the cover reads as a flat sheet from the front. Sold as a set with two pillowcases.', price: 13900, sale_price: 11900, cost_price: 7200, weight: 3, dimensions: '220 x 240 (queen)', stock_quantity: 34, minimum_stock: 10, featured: 0, status: 'active', specifications: [['Set', 'Duvet cover + 2 pillowcases'], ['Fibre', 'European flax cotton, stonewashed'], ['Closure', 'Hidden placket'], ['Size', 'Queen']] },
    { name: 'Meridian Onyx Round Coffee Table', category: 'coffee-tables', brand: 'Meridian Furniture', short_description: 'Stacked concrete and glass side table, 50 cm diameter.', description: 'Two cast concrete discs under a smoked glass top: light enough to move with one hand, heavy enough not to slide. The glass is 10 mm tempered, so a knock will not shatter it into shards.', price: 13900, sale_price: null, cost_price: 7400, weight: 17, dimensions: '50 dia x 45', stock_quantity: 24, minimum_stock: 6, featured: 0, status: 'active', specifications: [['Diameter', '50 cm'], ['Base', '2 stacked cast concrete discs'], ['Top', '10 mm tempered smoked glass'], ['Weight', '17 kg']] },
    { name: 'Urban Nest Foldaway Guest Mattress', category: 'mattresses', brand: 'Urban Nest', short_description: 'Roll-packed tri-fold guest mattress, 75 x 190 cm.', description: 'Folds into thirds and rolls into a bag about the size of a gym duffel, which is what makes a spare bed possible in a small flat. The tri-fold has a handle at each end so two people can carry it.', price: 13900, sale_price: 11900, cost_price: 7600, weight: 9, dimensions: '75 x 190 x 12', stock_quantity: 28, minimum_stock: 8, featured: 0, status: 'active', specifications: [['Size', '75 x 190 x 12 cm'], ['Folds', 'Tri-fold, roll-packed'], ['Carry', 'Handles at both ends'], ['Cover', 'Removable, washable']] },
    { name: 'Handcrafted Timber Ledger Console Table', category: 'tv-media-units', brand: 'Handcrafted Timber', short_description: 'Narrow oak console with two drawers and a lower shelf.', description: 'At 32 cm deep this fits behind a sofa or in a hallway where a 40 cm unit would not. Two soft-close drawers on dovetail joints, with a lower open shelf for the things that do not need to be hidden.', price: 27900, sale_price: 24900, cost_price: 15000, weight: 27, dimensions: '120 x 32 x 78', stock_quantity: 10, minimum_stock: 3, featured: 0, status: 'active', specifications: [['Depth', '32 cm, hallway-ready'], ['Drawers', '2 soft-close, dovetail'], ['Shelf', '1 lower open shelf'], ['Material', 'Solid white oak']] },
    { name: 'Casa Marina Shoreline Rattan Armchair', category: 'sofas-sectionals', brand: 'Casa Marina', short_description: 'A compact accent chair in woven rattan and cream cushion.', description: 'Light enough to move between the bedroom and the balcony, which is the point of an accent chair. The woven rattan back breathes, and the seat cushion ties onto the frame so it does not slide.', price: 19900, sale_price: 16900, cost_price: 10500, weight: 11, dimensions: '68 x 72 x 78', stock_quantity: 17, minimum_stock: 5, featured: 0, status: 'active', specifications: [['Weight', '11 kg, easily moved'], ['Frame', 'Rattan over hardwood'], ['Cushion', 'Tied to frame, removable'], ['Fabric', 'Cream cotton-linen']] },
    { name: 'NordicAline Skerry Floating Shelves', category: 'decor-lighting', brand: 'NordicAline', short_description: 'Set of three floating ash shelves with hidden steel brackets.', description: 'Concealed steel brackets hold 15 kg per shelf, which is enough for hardbacks and a trailing plant. Set at 40 cm intervals, so books sit at a comfortable height rather than at eye level.', price: 8900, sale_price: 6900, cost_price: 4200, weight: 9, dimensions: '90 x 18 x 20 (set)', stock_quantity: 38, minimum_stock: 10, featured: 0, status: 'active', specifications: [['Set', '3 shelves, 90 cm'], ['Capacity', '15 kg per shelf'], ['Brackets', 'Concealed steel'], ['Material', 'Solid ash']] },
    { name: 'Meridian Quillon Bar Cabinet', category: 'kitchen-storage', brand: 'Meridian Furniture', short_description: 'Walnut drinks cabinet with a mirrored back and glass shelves.', description: 'A drinks cabinet that hides its contents: mirrored back, glass shelves on adjustable brackets, and a lock for the good stuff. The top is a serving surface with a small lip so glasses do not slide.', price: 52900, sale_price: 45900, cost_price: 31000, weight: 58, dimensions: '100 x 45 x 130', stock_quantity: 1, minimum_stock: 2, featured: 0, status: 'active', specifications: [['Height', '130 cm, bar height'], ['Interior', 'Mirrored back, glass shelves'], ['Lock', 'Yes'], ['Top', 'Serving surface with lip']] },
    { name: 'Puno Woodcraft Pebble Kids Bookcase', category: 'kids-nursery', brand: 'Puno Woodcraft', short_description: 'Low, forward-leaning bookcase sized for small hands.', description: 'At 60 cm tall a four-year-old can actually reach the top shelf, which is the whole design brief. The shelves tilt slightly forward so picture books stand up rather than slide flat.', price: 18900, sale_price: 15900, cost_price: 10500, weight: 21, dimensions: '80 x 28 x 60', stock_quantity: 11, minimum_stock: 4, featured: 0, status: 'active', specifications: [['Height', '60 cm, child-reachable'], ['Shelves', '4, forward tilted'], ['Material', 'FSC birch plywood'], ['Finish', 'Water-based, non-toxic']] },
];
exports.COUPONS = [
    { code: 'WELCOME10', type: 'percentage', value: 10, minimum_order: 5000, maximum_discount: 2000, usage_limit: 500, used_count: 47, start_offset_days: -120, end_offset_days: 60, status: 'active' },
    { code: 'LUMERA15', type: 'percentage', value: 15, minimum_order: 25000, maximum_discount: 5000, usage_limit: 200, used_count: 31, start_offset_days: -90, end_offset_days: 30, status: 'active' },
    { code: 'NEWHOME20', type: 'fixed', value: 2000, minimum_order: 30000, maximum_discount: null, usage_limit: 150, used_count: 22, start_offset_days: -60, end_offset_days: 90, status: 'active' },
    { code: 'FREESHIP', type: 'fixed', value: 500, minimum_order: 10000, maximum_discount: 500, usage_limit: null, used_count: 88, start_offset_days: -180, end_offset_days: 120, status: 'active' },
    { code: 'GLOWUP5', type: 'percentage', value: 5, minimum_order: 0, maximum_discount: 1000, usage_limit: 1000, used_count: 154, start_offset_days: -200, end_offset_days: -10, status: 'expired' },
    { code: 'STAFFONLY', type: 'fixed', value: 5000, minimum_order: 10000, maximum_discount: 5000, usage_limit: 20, used_count: 3, start_offset_days: -30, end_offset_days: 90, status: 'inactive' },
];
exports.SETTINGS = [
    // Payment gateways (values from the project brief — replace before going live)
    { key: 'stripe_publishable_key', group: 'payment', value: 'pk_test' },
    { key: 'stripe_secret_key', group: 'payment', value: 'sk_test' },
    { key: 'paypal_client_id', group: 'payment', value: 'test' },
    { key: 'paypal_client_secret', group: 'payment', value: 'test' },
    { key: 'payment_methods_enabled', group: 'payment', value: 'cod,bank_transfer,stripe,paypal' },
    { key: 'cod_enabled', group: 'payment', value: 'true' },
    { key: 'bank_transfer_enabled', group: 'payment', value: 'true' },
    { key: 'bank_account_name', group: 'payment', value: 'Lumera Home Furnishings Inc.' },
    { key: 'bank_account_number', group: 'payment', value: '0056 0512 4470' },
    { key: 'bank_account_details', group: 'payment', value: 'BPI Family Savings — Pasig Branch' },
    // Store identity
    { key: 'site_name', group: 'general', value: 'Lumera Home' },
    { key: 'site_tagline', group: 'general', value: 'Furniture worth living with' },
    { key: 'site_description', group: 'general', value: 'Solid wood, honest prices, and delivery across the Philippines.' },
    { key: 'site_logo', group: 'general', value: '' },
    { key: 'support_email', group: 'general', value: 'hello@lumerahome.com' },
    { key: 'support_phone', group: 'general', value: '+63 2 8555 0142' },
    { key: 'store_address', group: 'general', value: '112 Katipunan Avenue, Quezon City, 1108 Metro Manila' },
    { key: 'business_hours', group: 'general', value: 'Mon-Sat 9:00-19:00, Sun 10:00-17:00' },
    // Commerce
    { key: 'currency', group: 'general', value: 'PHP' },
    { key: 'currency_symbol', group: 'general', value: '₱' },
    { key: 'tax_rate', group: 'general', value: '12' },
    { key: 'tax_inclusive', group: 'general', value: 'false' },
    { key: 'shipping_fee', group: 'general', value: '250' },
    { key: 'free_shipping_threshold', group: 'general', value: '25000' },
    { key: 'orders_per_page', group: 'general', value: '10' },
    { key: 'products_per_page', group: 'general', value: '12' },
    // SMTP / notifications
    { key: 'smtp_host', group: 'email', value: 'smtp.gmail.com' },
    { key: 'smtp_port', group: 'email', value: '587' },
    { key: 'smtp_secure', group: 'email', value: 'false' },
    { key: 'smtp_username', group: 'email', value: 'notifications@lumerahome.com' },
    { key: 'smtp_password', group: 'email', value: '' },
    { key: 'mail_from_name', group: 'email', value: 'Lumera Home' },
    { key: 'mail_from_address', group: 'email', value: 'notifications@lumerahome.com' },
    { key: 'email_order_confirmation', group: 'email', value: 'true' },
    { key: 'email_order_status_update', group: 'email', value: 'true' },
    { key: 'email_password_reset', group: 'email', value: 'true' },
    { key: 'sms_enabled', group: 'sms', value: 'false' },
    { key: 'sms_provider', group: 'sms', value: 'semaphore' },
    { key: 'sms_sender_id', group: 'sms', value: 'LUMERA' },
    // Localisation
    { key: 'language', group: 'localization', value: 'en-PH' },
    { key: 'timezone', group: 'localization', value: 'Asia/Manila' },
    { key: 'date_format', group: 'localization', value: 'MMM D, YYYY' },
    { key: 'decimal_separator', group: 'localization', value: '.' },
    { key: 'thousand_separator', group: 'localization', value: ',' },
    // Appearance
    { key: 'theme', group: 'appearance', value: 'light' },
    { key: 'theme_mode_default', group: 'appearance', value: 'system' },
    { key: 'accent_color', group: 'appearance', value: '#b07d4b' },
    { key: 'products_per_row', group: 'appearance', value: '3' },
    // Backup
    { key: 'backup_enabled', group: 'backup', value: 'true' },
    { key: 'backup_frequency', group: 'backup', value: 'daily' },
    { key: 'backup_retention_days', group: 'backup', value: '30' },
    { key: 'last_backup_at', group: 'backup', value: '' },
];
exports.REVIEW_COMMENTS = [
    {
        titles: ['Exactly as pictured', 'Worth every peso', 'Arrived ahead of schedule', 'Better in person'],
        bodies: [
            'Delivery crew called ahead and carried it up to the third floor without a fuss. The finish is even better than the photos suggest.',
            'Second one I have bought from this store. Consistent quality and the staff actually answer the phone.',
            'Sturdier than I expected for the price. We have two kids and it has held up to a year of daily use so far.',
            'Slight colour difference from the listing photo, but that is my monitor, not the product. No complaints at all.',
            'The assembly took about twenty minutes and everything lined up. That never happens.',
        ],
        rating: [4, 5],
    },
    {
        titles: ['Good, with one caveat', 'Solid but heavy', 'Happy overall', 'Would buy again'],
        bodies: [
            'No complaints about quality. It is heavier than I estimated from the dimensions, so measure your doorway first.',
            'Comfortable and well made. Took a while for the courier to reschedule, which was the only frustrating part.',
            'The instructions were in English and the diagrams actually matched the parts. Rare.',
            'Does what it promises. Delivery was two days late but they kept me updated the whole time.',
        ],
        rating: [3, 4],
    },
    {
        titles: ['Not for me', 'Quality control issue', 'Disappointing'],
        bodies: [
            'The finish on one leg was uneven. Support offered a replacement and it arrived in three days, so I am giving it two stars rather than none.',
            'Smaller than I expected from the photos. My mistake for not reading the dimensions, but it is not what I pictured.',
            'One of the slats was cracked out of the box. Returns process was smooth, but I would rather not have had to use it.',
        ],
        rating: [1, 3],
    },
];
/** Review bodies by star rating bucket: 5, 4, 3, 2, 1. */
exports.REVIEW_BUCKETS = {
    5: { titles: exports.REVIEW_COMMENTS[0].titles, bodies: exports.REVIEW_COMMENTS[0].bodies },
    4: { titles: exports.REVIEW_COMMENTS[1].titles, bodies: exports.REVIEW_COMMENTS[1].bodies },
    3: { titles: exports.REVIEW_COMMENTS[1].titles, bodies: exports.REVIEW_COMMENTS[1].bodies },
    2: { titles: exports.REVIEW_COMMENTS[2].titles, bodies: exports.REVIEW_COMMENTS[2].bodies },
    1: { titles: exports.REVIEW_COMMENTS[2].titles, bodies: exports.REVIEW_COMMENTS[2].bodies },
};
exports.NOTIFICATIONS = [
    { title: 'Low stock: Larkspur Firm Mattress', message: '12 units left, below the reorder point of 20 in the next cycle.', type: 'warning' },
    { title: 'Payout scheduled', message: 'The Stripe payout for 14 completed orders is scheduled for tomorrow.', type: 'success' },
    { title: 'New review awaiting moderation', message: 'A customer left a 3-star review on the Bergen 3-Seater Sofa.', type: 'info' },
    { title: 'Return received', message: 'A return was logged against order LM-240412-0007.', type: 'warning' },
    { title: 'Backup completed', message: 'Nightly database backup finished in 1.8s.', type: 'success' },
    { title: 'Payment failed', message: 'A Stripe charge for order LM-240418-0021 was declined.', type: 'error' },
];
exports.FILES = [
    { name: 'warranty-terms-2024', original_name: 'lumera-warranty-terms-2024.pdf', category: 'contract', mime_type: 'application/pdf', size: 184_320, label: 'Warranty Terms 2024' },
    { name: 'supplier-agreement-terrazzo', original_name: 'supplier-agreement-terrazzo-co.pdf', category: 'contract', mime_type: 'application/pdf', size: 96_500, label: 'Supplier Agreement' },
    { name: 'store-floor-plan', original_name: 'store-floor-plan-2f.svg', category: 'image', mime_type: 'image/svg+xml', size: 21_900, label: 'Store Floor Plan' },
    { name: 'product-care-guide', original_name: 'product-care-guide.docx', category: 'document', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 64_100, label: 'Product Care Guide' },
    { name: 'invoice-template', original_name: 'invoice-template.csv', category: 'invoice', mime_type: 'text/csv', size: 3_200, label: 'Invoice Template' },
    { name: 'delivery-rates-luzon', original_name: 'delivery-rates-luzon.csv', category: 'document', mime_type: 'text/csv', size: 2_750, label: 'Delivery Rates' },
    { name: 'delivery-rates-visayas', original_name: 'delivery-rates-visayas.csv', category: 'document', mime_type: 'text/csv', size: 2_400, label: 'Delivery Rates' },
    { name: 'showroom-interior', original_name: 'showroom-interior.svg', category: 'image', mime_type: 'image/svg+xml', size: 18_400, label: 'Showroom Interior' },
    { name: 'customer-id-maria-reyes', original_name: 'customer-id-maria-reyes.pdf', category: 'customer', mime_type: 'application/pdf', size: 128_700, label: 'Customer ID' },
    { name: 'warehouse-stock-count', original_name: 'warehouse-stock-count.csv', category: 'document', mime_type: 'text/csv', size: 5_180, label: 'Stock Count' },
    { name: 'brand-guidelines', original_name: 'brand-guidelines.svg', category: 'document', mime_type: 'image/svg+xml', size: 32_600, label: 'Brand Guidelines' },
    { name: 'returns-policy', original_name: 'returns-policy.txt', category: 'document', mime_type: 'text/plain', size: 4_120, label: 'Returns Policy' },
];
//# sourceMappingURL=seedData.js.map
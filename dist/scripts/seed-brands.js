"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const mongoose_1 = require("@nestjs/mongoose");
const brand_schema_1 = require("../database/schemas/brand.schema");
async function seedBrands() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const brandModel = app.get((0, mongoose_1.getModelToken)(brand_schema_1.Brand.name));
    const brands = [
        { name: 'The Derma Co', slug: 'the-derma-co', description: 'The Derma Co skincare products', isActive: true },
        { name: 'Minimalist', slug: 'minimalist', description: 'Minimalist skincare products', isActive: true },
        { name: 'Fix Derma', slug: 'fix-derma', description: 'Fix Derma products', isActive: true },
        { name: 'Denver', slug: 'denver', description: 'Denver fragrances', isActive: true },
        { name: 'Wotta Girl', slug: 'wotta-girl', description: 'Wotta Girl fragrances', isActive: true },
        { name: 'LA Girl', slug: 'la-girl', description: 'LA Girl makeup', isActive: true },
        { name: 'Brazilian Keratin', slug: 'brazilian-keratin', description: 'Brazilian Keratin haircare', isActive: true },
        { name: 'Fairy Skin', slug: 'fairy-skin', description: 'Fairy Skin products', isActive: true },
        { name: 'Derma', slug: 'derma', description: 'Derma products', isActive: true },
    ];
    try {
        for (const brandData of brands) {
            const existing = await brandModel.findOne({ slug: brandData.slug });
            if (existing) {
                console.log(`✓ Brand ${brandData.name} already exists`);
                continue;
            }
            await brandModel.create(brandData);
            console.log(`✓ Created brand: ${brandData.name}`);
        }
        console.log('\n✓ Brand seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding brands:', error.message);
    }
    finally {
        await app.close();
    }
}
seedBrands().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-brands.js.map
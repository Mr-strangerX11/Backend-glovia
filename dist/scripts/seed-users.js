"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const mongoose_1 = require("@nestjs/mongoose");
const bcryptjs = require("bcryptjs");
const user_schema_1 = require("../database/schemas/user.schema");
async function seedUsers() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const userModel = app.get((0, mongoose_1.getModelToken)(user_schema_1.User.name));
    const users = [
        {
            email: 'superadmin@glovia.com.np',
            password: 'SuperAdmin123!',
            firstName: 'Super',
            lastName: 'Admin',
            phone: '+977-9800000001',
            role: user_schema_1.UserRole.SUPER_ADMIN,
            isEmailVerified: true,
            trustScore: 100,
        },
        {
            email: 'admin@glovia.com.np',
            password: 'Admin123!',
            firstName: 'Admin',
            lastName: 'User',
            phone: '+977-9800000002',
            role: user_schema_1.UserRole.ADMIN,
            isEmailVerified: true,
            trustScore: 100,
        },
        {
            email: 'vendor@glovia.com.np',
            password: 'Vendor123!',
            firstName: 'Vendor',
            lastName: 'Account',
            phone: '+977-9800000003',
            role: user_schema_1.UserRole.VENDOR,
            isEmailVerified: true,
            trustScore: 75,
        },
        {
            email: 'user@glovia.com.np',
            password: 'User123!',
            firstName: 'Regular',
            lastName: 'User',
            phone: '+977-9800000004',
            role: user_schema_1.UserRole.CUSTOMER,
            isEmailVerified: true,
            trustScore: 50,
        },
    ];
    try {
        for (const userData of users) {
            const existingUser = await userModel.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`✓ User ${userData.email} already exists`);
                continue;
            }
            const hashedPassword = await bcryptjs.hash(userData.password, 10);
            const user = await userModel.create({
                ...userData,
                password: hashedPassword,
            });
            console.log(`✓ Created ${userData.role}: ${userData.email}`);
            console.log(`  Password: ${userData.password}`);
        }
        console.log('\n✓ User seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding users:', error.message);
    }
    finally {
        await app.close();
    }
}
seedUsers().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-users.js.map
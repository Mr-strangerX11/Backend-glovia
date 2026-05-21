import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../database/schemas/product.schema';
import { User } from '../database/schemas/user.schema';

/**
 * Migration script to add vendor information to existing products
 * Run with: npm run migrate
 */
@Injectable()
export class AddVendorToProductsMigration {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Migrate products without vendor info to have a default vendor
   */
  async migrate(): Promise<{ success: number; failed: number; message: string }> {
    console.log('🔄 Starting migration: Add vendor info to products...\n');

    try {
      // Find products without vendorId
      const productsWithoutVendor = await this.productModel.find({
        $or: [
          { vendorId: { $exists: false } },
          { vendorId: null },
        ],
      });

      console.log(
        `📊 Found ${productsWithoutVendor.length} products without vendor information\n`,
      );

      if (productsWithoutVendor.length === 0) {
        return {
          success: 0,
          failed: 0,
          message: '✅ All products already have vendor information',
        };
      }

      // Get default vendor (first admin user)
      const defaultVendor = await this.userModel.findOne({
        role: 'ADMIN',
      }).lean();

      if (!defaultVendor) {
        return {
          success: 0,
          failed: productsWithoutVendor.length,
          message: '❌ No admin user found to assign as default vendor',
        };
      }

      console.log(`👤 Using admin user as default vendor:`);
      console.log(`   Name: ${defaultVendor.firstName} ${defaultVendor.lastName}`);
      console.log(`   Email: ${defaultVendor.email}\n`);

      const vendorName = `${defaultVendor.firstName} ${defaultVendor.lastName}`;
      const vendorEmail = defaultVendor.email;
      const vendorPhone = defaultVendor.phone || null;

      // Update all products without vendor
      const updateResult = await this.productModel.updateMany(
        {
          $or: [
            { vendorId: { $exists: false } },
            { vendorId: null },
          ],
        },
        {
          $set: {
            vendorId: new Types.ObjectId(defaultVendor._id),
            vendorName,
            vendorEmail,
            vendorPhone,
            uploadedBy: 'admin',
            uploadedById: new Types.ObjectId(defaultVendor._id),
          },
        },
      );

      console.log(`✅ Migration Results:`);
      console.log(`   Updated: ${updateResult.modifiedCount} products`);
      console.log(`   Matched: ${updateResult.matchedCount} products\n`);

      // Verify migration
      const verifyNoVendor = await this.productModel.countDocuments({
        $or: [
          { vendorId: { $exists: false } },
          { vendorId: null },
        ],
      });

      if (verifyNoVendor === 0) {
        console.log('✨ Migration completed successfully!');
        console.log('   All products now have vendor information\n');
        return {
          success: updateResult.modifiedCount,
          failed: 0,
          message: '✅ Migration completed successfully',
        };
      } else {
        console.log(`⚠️  Warning: ${verifyNoVendor} products still missing vendor info\n`);
        return {
          success: updateResult.modifiedCount,
          failed: verifyNoVendor,
          message: `⚠️  Migration partial: ${verifyNoVendor} products still missing vendor`,
        };
      }
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate vendor information consistency
   */
  async validate(): Promise<{ valid: number; invalid: number; details: any[] }> {
    console.log('🔍 Validating vendor information consistency...\n');

    const products = await this.productModel.find().lean();
    const invalid: any[] = [];
    let validCount = 0;

    for (const product of products) {
      const issues: string[] = [];

      if (!product.vendorId) {
        issues.push('Missing vendorId');
      }
      if (!product.vendorName) {
        issues.push('Missing vendorName');
      }
      if (!product.vendorEmail) {
        issues.push('Missing vendorEmail');
      }

      if (issues.length > 0) {
        invalid.push({
          productId: product._id,
          name: product.name,
          issues,
        });
      } else {
        validCount++;
      }
    }

    console.log(`✅ Valid: ${validCount} products`);
    console.log(`❌ Invalid: ${invalid.length} products`);

    if (invalid.length > 0) {
      console.log('\nInvalid products:');
      invalid.slice(0, 10).forEach(item => {
        console.log(`  - ${item.name} (${item.productId}): ${item.issues.join(', ')}`);
      });
      if (invalid.length > 10) {
        console.log(`  ... and ${invalid.length - 10} more`);
      }
    }

    return {
      valid: validCount,
      invalid: invalid.length,
      details: invalid,
    };
  }

  /**
   * Rollback migration (set all vendor fields to null)
   * Use with caution!
   */
  async rollback(): Promise<{ rolled_back: number; message: string }> {
    console.log('⚠️  WARNING: This will remove vendor info from ALL products\n');
    console.log('Rolling back...\n');

    const result = await this.productModel.updateMany(
      {},
      {
        $set: {
          vendorId: null,
          vendorName: null,
          vendorEmail: null,
          vendorPhone: null,
        },
      },
    );

    console.log(`✅ Rolled back ${result.modifiedCount} products\n`);

    return {
      rolled_back: result.modifiedCount,
      message: 'Rollback completed',
    };
  }
}

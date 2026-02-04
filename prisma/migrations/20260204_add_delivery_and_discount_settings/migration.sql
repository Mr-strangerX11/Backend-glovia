-- Insert default delivery settings if not exist
INSERT INTO "settings" ("id", "key", "value", "type", "description", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'FREE_DELIVERY_THRESHOLD', '2999', 'NUMBER', 'Orders above this amount get free delivery', NOW(), NOW()),
  (gen_random_uuid(), 'VALLEY_DELIVERY_CHARGE', '100', 'NUMBER', 'Delivery charge for Kathmandu Valley (NPR)', NOW(), NOW()),
  (gen_random_uuid(), 'OUTSIDE_VALLEY_DELIVERY_CHARGE', '150', 'NUMBER', 'Delivery charge for areas outside Kathmandu Valley (NPR)', NOW(), NOW())
ON CONFLICT ("key") DO NOTHING;

-- Add comment to Order model for discount field
COMMENT ON COLUMN "orders"."discount" IS 'Discount amount applied by admin (NPR)';

-- Add comment to Order model for deliveryCharge field
COMMENT ON COLUMN "orders"."deliveryCharge" IS 'Delivery charge (NPR). Auto-calculated or set by admin';

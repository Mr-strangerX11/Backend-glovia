-- Add announcement settings to the settings table
INSERT INTO "Setting" (id, key, value, type, description, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'ANNOUNCEMENT_TEXT', '🚚 Express Delivery: We deliver within 60 minutes!', 'STRING', 'Announcement bar text content', NOW(), NOW()),
  (gen_random_uuid(), 'ANNOUNCEMENT_ICON', '🚚', 'STRING', 'Announcement bar icon (emoji)', NOW(), NOW()),
  (gen_random_uuid(), 'ANNOUNCEMENT_BG_COLOR', '#0066CC', 'STRING', 'Announcement bar background color (hex)', NOW(), NOW()),
  (gen_random_uuid(), 'ANNOUNCEMENT_ACTIVE', 'true', 'BOOLEAN', 'Whether announcement bar is active', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

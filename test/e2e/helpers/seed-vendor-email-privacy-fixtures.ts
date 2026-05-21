import { INestApplication } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { seedDbVendorEmailPrivacy } from './seed-db-vendor-email-privacy';

// Placeholder wrapper so the test can evolve without touching model-wiring logic.
// For now it delegates to seedDbVendorEmailPrivacy.

export async function seedVendorEmailPrivacyFixtures(app: INestApplication) {
  return seedDbVendorEmailPrivacy(app);
}


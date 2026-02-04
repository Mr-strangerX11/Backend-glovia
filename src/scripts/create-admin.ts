import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const result: { email?: string; password?: string; role?: string; firstName?: string; lastName?: string } = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.replace(/^--/, '');
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
      if (value) {
        (result as any)[key] = value;
        i++;
      } else {
        (result as any)[key] = 'true';
      }
    }
  }
  return result;
}

function generatePassword(length = 16) {
  // URL-safe random string
  return randomBytes(length).toString('base64url');
}

async function main() {
  const { email, password, role, firstName, lastName } = parseArgs();

  const userEmail = email || 'admin@glovia.local';
  const userRole = (role || 'SUPER_ADMIN').toUpperCase();
  const userFirstName = firstName || 'Admin';
  const userLastName = lastName || 'User';

  if (!Object.keys(UserRole).includes(userRole)) {
    console.error(`Invalid role: ${userRole}. Use one of: ${Object.keys(UserRole).join(', ')}`);
    process.exit(1);
  }

  const plainPassword = password || generatePassword(12);
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.user.findUnique({ where: { email: userEmail } });

  let user;
  if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashedPassword,
        role: userRole as UserRole,
        firstName: userFirstName,
        lastName: userLastName,
        isEmailVerified: true,
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, createdAt: true },
    });
    console.log('✅ Updated existing user to admin');
  } else {
    user = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        firstName: userFirstName,
        lastName: userLastName,
        role: userRole as UserRole,
        isEmailVerified: true,
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, createdAt: true },
    });
    console.log('✅ Created new admin user');
  }

  console.log('\nAdmin Credentials');
  console.log('-----------------');
  console.log(`Email:    ${user.email}`);
  console.log(`Role:     ${user.role}`);
  console.log(`Password: ${plainPassword}`);
  console.log('\nStore this password securely. You can change it after login.');
}

main()
  .catch((e) => {
    console.error('❌ Failed to create admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

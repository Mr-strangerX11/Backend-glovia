import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const TEST_EMAIL = 'kashichaudhary2002@gmail.com';

async function sendAllEmailTypes() {
  console.log('🚀 Starting Email Test Suite');
  console.log(`📧 Target Email: ${TEST_EMAIL}\n`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Verify SMTP
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection: SUCCESS\n');
  } catch (error) {
    console.error('❌ SMTP Connection: FAILED');
    console.error('Error:', error.message);
    return;
  }

  // Email Templates
  const emailTemplates = [
    {
      name: 'OTP Verification Email',
      subject: 'Your OTP Code - Glovia Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="background: #f0f0f0; padding: 20px; text-align: center; letter-spacing: 5px;">123456</h1>
          <p>This code expires in 10 minutes.</p>
          <p>Best regards,<br/>Glovia Marketplace Team</p>
        </div>
      `,
    },
    {
      name: 'Welcome Email (Customer)',
      subject: 'Welcome to Glovia Marketplace!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Glovia! 🎉</h2>
          <p>Thank you for creating an account with us.</p>
          <p>Your account has been successfully created.</p>
          <p><strong>Email:</strong> ${TEST_EMAIL}</p>
          <p><a href="http://localhost:3000" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a></p>
          <p>Best regards,<br/>Glovia Marketplace Team</p>
        </div>
      `,
    },
    {
      name: 'Order Confirmation Email',
      subject: 'Order Confirmed - Order #12345',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Confirmation ✅</h2>
          <p>Thank you for your order!</p>
          <p><strong>Order ID:</strong> #12345</p>
          <p><strong>Total Amount:</strong> NPR 2,500</p>
          <p><strong>Items:</strong></p>
          <ul>
            <li>Product 1 - NPR 1,200</li>
            <li>Product 2 - NPR 1,300</li>
          </ul>
          <p><strong>Status:</strong> Pending Payment</p>
          <p><a href="http://localhost:3000/orders/12345" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a></p>
          <p>Best regards,<br/>Glovia Marketplace Team</p>
        </div>
      `,
    },
    {
      name: 'Payment Confirmation Email',
      subject: 'Payment Successful - Order #12345',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Received ✅</h2>
          <p>Your payment has been successfully processed.</p>
          <p><strong>Order ID:</strong> #12345</p>
          <p><strong>Amount:</strong> NPR 2,500</p>
          <p><strong>Payment Status:</strong> Completed</p>
          <p><strong>Transaction ID:</strong> TXN-20260519-001</p>
          <p>Your order will be shipped shortly. Track it from your account.</p>
          <p><a href="http://localhost:3000/orders/12345" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a></p>
          <p>Best regards,<br/>Glovia Marketplace Team</p>
        </div>
      `,
    },
    {
      name: 'Order Shipped Email',
      subject: 'Your Order Has Been Shipped! 📦',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Shipped 🚚</h2>
          <p>Great news! Your order has been shipped.</p>
          <p><strong>Order ID:</strong> #12345</p>
          <p><strong>Tracking Number:</strong> TRACK123456789</p>
          <p><strong>Carrier:</strong> FedEx</p>
          <p><strong>Estimated Delivery:</strong> 5-7 business days</p>
          <p><a href="http://localhost:3000/orders/12345" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Shipment</a></p>
          <p>Best regards,<br/>Glovia Marketplace Team</p>
        </div>
      `,
    },
    {
      name: 'Vendor Account Approval Email',
      subject: 'Your Vendor Account Has Been Approved! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Approved ✅</h2>
          <p>Congratulations! Your vendor account has been approved.</p>
          <p>You can now start selling on Glovia Marketplace.</p>
          <p><strong>Vendor ID:</strong> VENDOR-12345</p>
          <p><strong>Account Status:</strong> Active</p>
          <p><a href="http://localhost:3000/vendor/dashboard" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Vendor Dashboard</a></p>
          <p>Best regards,<br/>Glovia Marketplace Team</p>
        </div>
      `,
    },
    {
      name: 'New Order Notification (Vendor)',
      subject: 'New Order Received - Order #12345',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Order! 📦</h2>
          <p>You have received a new order from a customer.</p>
          <p><strong>Order ID:</strong> #12345</p>
          <p><strong>Customer:</strong> John Doe</p>
          <p><strong>Items:</strong> 2 product(s)</p>
          <p><strong>Total:</strong> NPR 2,500</p>
          <p><strong>Status:</strong> Awaiting Fulfillment</p>
          <p><a href="http://localhost:3000/vendor/orders/12345" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a></p>
          <p>Best regards,<br/>Glovia Marketplace Team</p>
        </div>
      `,
    },
    {
      name: 'Password Reset Email',
      subject: 'Reset Your Password - Glovia Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p><a href="http://localhost:3000/reset-password?token=abc123def456" style="background: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br/>Glovia Marketplace Team</p>
        </div>
      `,
    },
    {
      name: 'Contact Support Email',
      subject: 'We Received Your Message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank You for Contacting Us! 📬</h2>
          <p>We have received your message and will respond shortly.</p>
          <p><strong>Reference ID:</strong> SUPPORT-20260519-001</p>
          <p>Our support team typically responds within 24 hours.</p>
          <p>Best regards,<br/>Glovia Marketplace Support Team</p>
        </div>
      `,
    },
  ];

  console.log('📧 Email Types to Send:\n');
  emailTemplates.forEach((template, index) => {
    console.log(`${index + 1}. ${template.name}`);
  });
  console.log('\n-----------------------------------\n');

  // Send all emails
  let successCount = 0;
  let failureCount = 0;

  for (const template of emailTemplates) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: TEST_EMAIL,
        subject: template.subject,
        html: template.html,
      });

      console.log(`✅ ${template.name}`);
      console.log(`   Message ID: ${info.messageId}\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${template.name}`);
      console.error(`   Error: ${error.message}\n`);
      failureCount++;
    }

    // Add delay between emails
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('-----------------------------------');
  console.log(`\n📊 Email Test Summary:`);
  console.log(`✅ Successful: ${successCount}/${emailTemplates.length}`);
  console.log(`❌ Failed: ${failureCount}/${emailTemplates.length}`);
  console.log(`📧 All emails sent to: ${TEST_EMAIL}`);
}

sendAllEmailTypes().catch(error => {
  console.error('Fatal Error:', error.message);
  process.exit(1);
});

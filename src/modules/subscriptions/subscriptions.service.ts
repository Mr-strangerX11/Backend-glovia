import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsletterSubscriber } from '../../database/schemas/newsletter.schema';
import { EmailNotificationService } from '../../common/services/email-notification.service';
import ExcelJS from 'exceljs';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel('NewsletterSubscriber')
    private readonly subscriberModel: Model<NewsletterSubscriber>,
    private readonly emailService: EmailNotificationService,
  ) {}

  async subscribe(email: string, source?: string): Promise<{ message: string; alreadySubscribed: boolean; promoCode?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new BadRequestException('Invalid email address');
    }

    const existing = await this.subscriberModel.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.isActive) {
        return { message: 'You are already subscribed!', alreadySubscribed: true };
      }
      // Re-activate if previously unsubscribed
      existing.isActive = true;
      await existing.save();
      // Send email on re-subscription
      await this.emailService.sendNewsletterSubscriptionEmail(normalizedEmail);
      return { message: 'Welcome back! You have been re-subscribed.', alreadySubscribed: false, promoCode: 'SUB-GLOVIA' };
    }

    // Create new subscription
    await this.subscriberModel.create({ email: normalizedEmail, source: source || 'homepage' });
    
    // Send welcome email with promo code
    try {
      await this.emailService.sendNewsletterSubscriptionEmail(normalizedEmail);
    } catch (error) {
      console.error('Failed to send newsletter subscription email:', error);
      // Don't fail subscription if email fails
    }

    return { message: 'Successfully subscribed! Thank you for joining Glovia.', alreadySubscribed: false, promoCode: 'SUB-GLOVIA' };
  }

  async unsubscribe(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    await this.subscriberModel.findOneAndUpdate(
      { email: normalizedEmail },
      { isActive: false },
    );
    return { message: 'You have been unsubscribed.' };
  }

  async getAllSubscribers(limit?: number, skip?: number) {
    const query = this.subscriberModel.find({ isActive: true }).sort({ createdAt: -1 });
    
    if (skip) query.skip(skip);
    if (limit) query.limit(limit);
    
    return query.lean();
  }

  async getSubscriberCount() {
    return this.subscriberModel.countDocuments({ isActive: true });
  }

  async exportSubscribersToExcel(): Promise<Buffer> {
    // Get all active subscribers
    const subscribers = await this.subscriberModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    // Prepare data for Excel
    const data = subscribers.map((sub, index) => ({
      '#': index + 1,
      'Email': sub.email,
      'Source': sub.source || 'homepage',
      'Subscribed Date': new Date(sub.createdAt).toLocaleDateString('en-US'),
      'Subscribed Time': new Date(sub.createdAt).toLocaleTimeString('en-US'),
      'Status': sub.isActive ? 'Active' : 'Inactive',
    }));

    // Add summary at the top
    const summary = [
      { '#': 'GLOVIA NEWSLETTER SUBSCRIBERS REPORT', 'Email': '', 'Source': '', 'Subscribed Date': '', 'Subscribed Time': '', 'Status': '' },
      { '#': `Generated on: ${new Date().toLocaleString()}`, 'Email': '', 'Source': '', 'Subscribed Date': '', 'Subscribed Time': '', 'Status': '' },
      { '#': `Total Subscribers: ${subscribers.length}`, 'Email': '', 'Source': '', 'Subscribed Date': '', 'Subscribed Time': '', 'Status': '' },
      { '#': '', 'Email': '', 'Source': '', 'Subscribed Date': '', 'Subscribed Time': '', 'Status': '' },
      ...data,
    ];

    // Create workbook and worksheet using exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Subscribers');

    // Define columns
    worksheet.columns = [
      { header: '#', key: 'index', width: 5 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Source', key: 'source', width: 15 },
      { header: 'Subscribed Date', key: 'date', width: 15 },
      { header: 'Subscribed Time', key: 'time', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Add rows (summary + data)
    for (const row of summary) {
      worksheet.addRow({
        index: row['#'],
        email: row['Email'],
        source: row['Source'],
        date: row['Subscribed Date'],
        time: row['Subscribed Time'],
        status: row['Status'],
      });
    }

    // Apply some style to header rows (first 3 summary rows)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 3) {
        row.font = { bold: true } as any;
      }
    });

    // Return buffer (convert ArrayBuffer to Node Buffer)
    const ab = await workbook.xlsx.writeBuffer();
    return Buffer.from(ab as ArrayBuffer);
  }
}

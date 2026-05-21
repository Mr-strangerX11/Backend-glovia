import { Injectable } from '@nestjs/common';

/**
 * Service for handling vendor-related business logic
 * Specifically grouping orders by vendor for email notifications
 */
@Injectable()
export class VendorGroupingService {
  /**
   * Group order items by vendor
   * Returns object with vendorId as key containing vendor details and items
   */
  groupOrdersByVendor(orderItems: any[]) {
    const vendorGroups: Record<string, any> = {};

    orderItems.forEach((item) => {
      const vendorId = item.vendorId?.toString() || item.vendorId;

      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendorId,
          vendorName: item.vendorName,
          vendorEmail: item.vendorEmail,
          vendorPhone: item.vendorPhone,
          items: [],
          vendorSubtotal: 0,
        };
      }

      vendorGroups[vendorId].items.push(item);
      vendorGroups[vendorId].vendorSubtotal += item.total || 0;
    });

    return vendorGroups;
  }

  /**
   * Get list of unique vendors from order items
   */
  getUniqueVendors(orderItems: any[]) {
    const vendorMap = new Map();

    orderItems.forEach((item) => {
      const vendorId = item.vendorId?.toString() || item.vendorId;
      if (!vendorMap.has(vendorId)) {
        vendorMap.set(vendorId, {
          vendorId,
          vendorName: item.vendorName,
          vendorEmail: item.vendorEmail,
          vendorPhone: item.vendorPhone,
        });
      }
    });

    return Array.from(vendorMap.values());
  }

  /**
   * Filter order items for a specific vendor
   */
  filterItemsByVendor(orderItems: any[], vendorId: string) {
    return orderItems.filter((item) => {
      const itemVendorId = item.vendorId?.toString() || item.vendorId;
      return itemVendorId === vendorId;
    });
  }

  /**
   * Calculate vendor total from items
   */
  calculateVendorTotal(items: any[]) {
    return items.reduce((total, item) => total + (item.total || 0), 0);
  }
}

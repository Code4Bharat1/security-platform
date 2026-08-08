import { connectDB } from './db';
import Order from '@/models/Order';

/**
 * Saves a new pending/created order record into MongoDB.
 * Never throws — gracefully logs warning if database is not available.
 */
export async function saveOrderRecord({
  orderId,
  planName,
  amount,
  currency = 'INR',
  receipt = null,
  status = 'created',
}) {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('[orderService] MONGODB_URI not configured or unavailable. Skipping direct order insert.');
      return null;
    }

    const newOrder = await Order.create({
      orderId,
      planName,
      amount,
      currency,
      receipt,
      status,
    });

    console.log(`[orderService] ✅ Saved order record: ${orderId} (${planName}, ₹${amount})`);
    return newOrder;
  } catch (err) {
    console.warn(`[orderService] ⚠️ Failed to save order record ${orderId}:`, err.message);
    return null;
  }
}

/**
 * Updates an order record by razorpay order_id (e.g. status paid, failed).
 * Never throws — gracefully logs warning if database is not available.
 */
export async function updateOrderRecord(orderId, updateData) {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('[orderService] MONGODB_URI not configured or unavailable. Skipping order update.');
      return null;
    }

    const updated = await Order.findOneAndUpdate(
      { orderId },
      { $set: updateData },
      { new: true, upsert: false }
    );

    if (updated) {
      console.log(`[orderService] ✅ Updated order ${orderId} -> status: ${updated.status}`);
    } else {
      console.log(`[orderService] ℹ️ Order ${orderId} not found in database to update.`);
    }

    return updated;
  } catch (err) {
    console.warn(`[orderService] ⚠️ Failed to update order record ${orderId}:`, err.message);
    return null;
  }
}

/**
 * Updates an order record by razorpay payment_id (e.g. refund events).
 * Never throws — gracefully logs warning if database is not available.
 */
export async function updateOrderRecordByPaymentId(paymentId, updateData) {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('[orderService] MONGODB_URI not configured or unavailable. Skipping payment update.');
      return null;
    }

    const updated = await Order.findOneAndUpdate(
      { paymentId },
      { $set: updateData },
      { new: true }
    );

    if (updated) {
      console.log(`[orderService] ✅ Updated order by paymentId ${paymentId} -> status: ${updated.status}`);
    } else {
      console.log(`[orderService] ℹ️ Order with paymentId ${paymentId} not found to update.`);
    }

    return updated;
  } catch (err) {
    console.warn(`[orderService] ⚠️ Failed to update order by paymentId ${paymentId}:`, err.message);
    return null;
  }
}

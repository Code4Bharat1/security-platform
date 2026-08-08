import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: null,
      index: true,
    },
    planName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    receipt: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    refundId: {
      type: String,
      default: null,
    },
    capturedAt: {
      type: Date,
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.models?.Order || mongoose.model('Order', orderSchema);

export default Order;

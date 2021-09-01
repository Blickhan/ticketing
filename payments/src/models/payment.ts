import { model, Schema } from 'mongoose';

interface PaymentDoc {
  orderId: string;
  stripeId: string;
}

const paymentSchema = new Schema<PaymentDoc>(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const Payment = model<PaymentDoc>('Payment', paymentSchema);

export { Payment };

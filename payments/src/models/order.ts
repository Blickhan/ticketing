import { OrderStatus } from '@jbticketz/common';
import { Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderDoc {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

const orderSchema = new Schema<OrderDoc>(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
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

orderSchema.set('versionKey', 'version');
// @ts-ignore
orderSchema.plugin(updateIfCurrentPlugin);

const Order = model<OrderDoc>('Order', orderSchema);

export { Order };

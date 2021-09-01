import { Schema, model, Model, Document } from 'mongoose';
import { OrderStatus } from '@jbticketz/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { TicketDoc } from './ticket';

interface OrderDoc {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

const orderSchema = new Schema<OrderDoc>(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: Schema.Types.Date,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
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

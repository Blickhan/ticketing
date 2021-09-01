import { Publisher, Subjects, OrderCancelledEvent } from '@jbticketz/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}

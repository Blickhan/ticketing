import { Publisher, Subjects, OrderCreatedEvent } from '@jbticketz/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}

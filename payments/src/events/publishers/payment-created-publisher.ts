import { PaymentCreatedEvent, Publisher, Subjects } from '@jbticketz/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}

import { Publisher, Subjects, TicketUpdatedEvent } from '@jbticketz/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}

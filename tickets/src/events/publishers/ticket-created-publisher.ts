import { Publisher, Subjects, TicketCreatedEvent } from '@jbticketz/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

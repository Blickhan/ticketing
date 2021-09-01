import { Message } from 'node-nats-streaming';
import { Listener, Subjects, TicketCreatedEvent } from '@jbticketz/common';

import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const ticket = new Ticket({
      _id: id,
      title,
      price,
    });
    await ticket.save();

    msg.ack();
  }
}

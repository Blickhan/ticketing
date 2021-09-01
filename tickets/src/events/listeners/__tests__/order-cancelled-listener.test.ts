import { OrderCancelledEvent } from '@jbticketz/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { getId } from '../../../test/helpers';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = new Ticket({
    title: 'Blink 182',
    price: 69,
    userId: getId(),
    orderId: getId(),
  });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: ticket.orderId!,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('clears the orderId on the ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.ticket.id);

  expect(ticket).toBeDefined();
  expect(ticket!.orderId).toBeUndefined();
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.id).toEqual(ticket.id);
  expect(ticketUpdatedData.orderId).toBeUndefined();
});

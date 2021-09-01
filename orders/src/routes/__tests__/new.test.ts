import request from 'supertest';
import { OrderStatus } from '@jbticketz/common';

import { app } from '../../app';
import { signin, getId } from '../../test/helpers';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
  const ticketId = getId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = new Ticket({
    id: getId(),
    title: 'Golden ticket',
    price: 40,
  });
  await ticket.save();

  const order = new Order({
    ticket,
    userId: getId(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = new Ticket({
    id: getId(),
    title: 'Another one',
    price: 23,
  });
  await ticket.save();

  const order = new Order({
    ticket,
    userId: getId(),
    status: OrderStatus.Cancelled,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order created event', async () => {
  const ticket = new Ticket({
    id: getId(),
    title: 'Another one',
    price: 23,
  });
  await ticket.save();

  const order = new Order({
    ticket,
    userId: getId(),
    status: OrderStatus.Cancelled,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

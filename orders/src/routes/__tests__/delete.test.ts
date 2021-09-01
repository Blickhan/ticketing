import request from 'supertest';

import { app } from '../../app';
import { getId, signin } from '../../test/helpers';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@jbticketz/common';
import { natsWrapper } from '../../nats-wrapper';

it('cancels the order', async () => {
  const ticket = new Ticket({
    id: getId(),
    title: 'The golden ticket',
    price: 42,
  });
  await ticket.save();

  const user = signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const cancelledOrder = await Order.findById(order.id);
  expect(cancelledOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("returns an error if a user tries to delete another user's order", async () => {
  const ticket = new Ticket({
    id: getId(),
    title: 'The golden ticket',
    price: 42,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', signin())
    .send()
    .expect(401);
});

it('emits an order cancelled event', async () => {
  const ticket = new Ticket({
    title: 'The golden ticket',
    price: 42,
  });
  await ticket.save();

  const user = signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

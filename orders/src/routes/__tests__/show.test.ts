import request from 'supertest';

import { app } from '../../app';
import { getId, signin } from '../../test/helpers';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
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

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
  expect(fetchedOrder.ticket.id).toEqual(ticket.id);
});

it("returns an error if a user tries to fetch another user's order", async () => {
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
    .get(`/api/orders/${order.id}`)
    .set('Cookie', signin())
    .send()
    .expect(401);
});

import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { getId, signin } from '../../test/helpers';

it('returns a 404 if the ticket is not found', async () => {
  await request(app)
    .put(`/api/tickets/${getId()}`)
    .set('Cookie', signin())
    .send({ title: 'asdfasdf', price: 20 })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  await request(app)
    .put(`/api/tickets/${getId()}`)
    .send({ title: 'asdfasdf', price: 20 })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ title: 'asdfasf', price: 23 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', signin())
    .send({ title: 'jksdjk', price: 15 })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdfasf', price: 23 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 15 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'asdfas', price: -10 })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdfasf', price: 23 })
    .expect(201);

  const title = 'Very cool, Kanye';
  const price = 30;

  const ticketResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it('publishes an event', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdfasf', price: 23 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Very cool, Kanye', price: 30 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it('returns a 400 if a user tries to update a reserved ticket', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdfasf', price: 23 })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);

  ticket!.set({ orderId: getId() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Very cool, Kanye', price: 30 })
    .expect(400);
});

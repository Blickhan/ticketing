import request from 'supertest';

import { app } from '../../app';
import { signin } from '../../test/helpers';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ title: 'asdfasf', price: 23 })
    .expect(201);
};

it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});

it('returns the ticket if the ticket is found', async () => {
  const title = 'Hello';
  const price = 30;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

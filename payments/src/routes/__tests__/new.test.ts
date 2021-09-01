import { OrderStatus } from '@jbticketz/common';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';
import { getId, signin } from '../../test/helpers';

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({ token: 'asdfasdf', orderId: getId() })
    .expect(404);
});

it("returns a 401 when purchasing an order that doesn't belong to the user", async () => {
  const order = new Order({
    id: getId(),
    userId: getId(),
    price: 30,
    version: 0,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({ token: 'asdfasdf', orderId: order.id })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = getId();
  const order = new Order({
    id: getId(),
    userId,
    price: 30,
    version: 0,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({ token: 'asdfasdf', orderId: order.id })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  stripe.charges.create = jest.fn().mockResolvedValue({ id: 'asdfasfdas' });

  const userId = getId();
  const order = new Order({
    id: getId(),
    userId,
    price: 30,
    version: 0,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(204);

  expect(stripe.charges.create).toHaveBeenCalledWith({
    currency: 'usd',
    amount: order.price * 100,
    source: 'tok_visa',
  });

  const payment = await Payment.findOne({ orderId: order.id });

  expect(payment).not.toBeNull();
});

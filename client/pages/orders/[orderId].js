import { useEffect, useState } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const ORDER_COMPLETE = 'complete';

const OrderShow = ({ order, currentUser }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeRemaining = () => {
      const msRemaining = new Date(order.expiresAt) - new Date();
      setTimeRemaining(Math.round(msRemaining / 1000));
    };

    findTimeRemaining();
    const timerId = setInterval(findTimeRemaining, 1000);
    return () => clearInterval(timerId);
  }, [order]);

  if (order.status === ORDER_COMPLETE) {
    return <div>Order Complete</div>;
  }

  if (timeRemaining < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      <h4>Time left to pay: {timeRemaining} seconds</h4>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_rqAVImla0tqESDPuG8Wr47nH"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;

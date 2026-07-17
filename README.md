# CtechPay Node.js SDK

Official Node.js SDK for CtechPay payments.

Use this package from your server. Your CtechPay service token must never be exposed in browser JavaScript or mobile apps.

## Install

```bash
npm install @ctechpay/ctechpay-js
```

## Hosted Payment Page

```js
import CtechPay from '@ctechpay/ctechpay-js';

const ctechpay = CtechPay.client(process.env.CTECHPAY_TOKEN);

const payment = await ctechpay.hostedPayments.create({
  amount: 100,
  customer_reference: 'INV-1001',
  customer_message: 'Invoice payment',
  customer_name: 'Jane Doe',
  customer_email: 'jane@example.com',
  redirectUrl: 'https://example.com/payments/success',
  cancelUrl: 'https://example.com/payments/cancelled',
});

console.log(payment.data.hosted_payment_url);
```

Redirect your customer to `payment.data.hosted_payment_url`. When payment succeeds, CtechPay redirects to your `redirectUrl` with a `reference` query parameter.

```js
app.get('/payments/success', async (req, res) => {
  const reference = req.query.reference;
  const status = await ctechpay.cards.status(reference);

  res.json(status);
});
```

For Airtel Money hosted payments, use:

```js
const details = await ctechpay.airtel.details(req.query.reference);
```

## Airtel Money Direct API

```js
const payment = await ctechpay.airtel.pay({
  amount: 100,
  phone: '0999123456',
  customer_reference: 'INV-1001',
});

const transactionId = payment.data.transaction.id;
const status = await ctechpay.airtel.status(transactionId);
```

## Card Hosted Bank Page

```js
const order = await ctechpay.cards.createPaymentPage({
  amount: 100,
  merchantAttributes: true,
  redirectUrl: 'https://example.com/payments/success',
  cancelUrl: 'https://example.com/payments/cancelled',
});

console.log(order.payment_page_URL);
```

This SDK intentionally does not expose direct card PAN/CVV helpers. Use the CtechPay Hosted Payment Page for card collection unless your integration is formally approved for card-data handling.

# CtechPay Node.js SDK

Official Node.js SDK for integrating CtechPay payments in Node.js applications.

Use this package from your server. Your CtechPay service token must never be exposed in browser JavaScript, mobile apps, or public repositories.

## Installation

```bash
npm install @ctechpay/ctechpay-js
```

## Basic Usage

```js
import CtechPay from '@ctechpay/ctechpay-js';

const ctechpay = CtechPay.client(process.env.CTECHPAY_TOKEN);
```

You can also configure the API base URL and request timeout:

```js
const ctechpay = CtechPay.client(process.env.CTECHPAY_TOKEN, {
  baseUrl: 'https://new-api.ctechpay.com',
  timeout: 30000,
});
```

## Hosted Payment Page

Hosted checkout is the recommended integration for most merchants. CtechPay gives you a secure payment page where the customer can choose Airtel Money or card.

```js
const payment = await ctechpay.hostedPayments.create({
  amount: 100,
  category_flag: 'LOAN_APPLICATION',
  customer_reference: 'INV-1001',
  customer_message: 'Invoice payment',
  customer_name: 'Jane Doe',
  customer_email: 'jane@example.com',
  redirectUrl: 'https://example.com/payments/success',
  cancelUrl: 'https://example.com/payments/cancelled',
});

console.log(payment.data.hosted_payment_url);
```

Redirect your customer to `payment.data.hosted_payment_url`.

### Hosted Redirect Reference

When a hosted payment completes successfully, CtechPay redirects the customer to your `redirectUrl` with a `reference` query parameter.

```text
https://example.com/payments/success?reference=TRANSACTION_OR_ORDER_REFERENCE
```

Use the `reference` to check the final payment status:

```js
app.get('/payments/success', async (req, res) => {
  const reference = req.query.reference;

  const cardStatus = await ctechpay.cards.status(reference);

  res.json(cardStatus);
});
```

For Airtel Money hosted payments, the reference is the Airtel transaction ID:

```js
const details = await ctechpay.airtel.details(reference);
```

## Airtel Money

### Initiate Payment

```js
const payment = await ctechpay.airtel.pay({
  amount: 100,
  phone: '0999123456',
  category_flag: 'LOAN_APPLICATION',
  customer_reference: 'INV-1001',
  customer_message: 'Invoice payment',
});

const transactionId = payment.data.transaction.id;
```

### Check Airtel Status

Use the transaction ID returned when initiating payment.

```js
const status = await ctechpay.airtel.status(transactionId);
```

### Get Airtel Transaction Details

```js
const details = await ctechpay.airtel.details(transactionId);
```

### Find CtechPay Transaction By Airtel Money ID

```js
const reference = await ctechpay.airtel.reference('AIRTEL_MONEY_ID');
```

## Card Hosted Bank Page

This creates the Standard Bank hosted card checkout page.

```js
const order = await ctechpay.cards.createPaymentPage({
  amount: 100,
  category_flag: 'LOAN_APPLICATION',
  merchantAttributes: true,
  redirectUrl: 'https://example.com/payments/success',
  cancelUrl: 'https://example.com/payments/cancelled',
  customer_reference: 'INV-1001',
  customer_message: 'Invoice payment',
});

console.log(order.payment_page_URL);
```

### Check Card Order Status

```js
const status = await ctechpay.cards.status(order.order_reference);
```

## Express Example

```js
import express from 'express';
import CtechPay from '@ctechpay/ctechpay-js';

const app = express();
const ctechpay = CtechPay.client(process.env.CTECHPAY_TOKEN);

app.post('/pay', async (req, res, next) => {
  try {
    const payment = await ctechpay.hostedPayments.create({
      amount: 100,
      category_flag: 'LOAN_APPLICATION',
      customer_reference: 'ORDER-1001',
      redirectUrl: 'https://example.com/payments/success',
      cancelUrl: 'https://example.com/payments/cancelled',
    });

    res.redirect(payment.data.hosted_payment_url);
  } catch (error) {
    next(error);
  }
});
```

## Payment Categories

If the merchant has configured payment categories in CtechPay, pass the category flag when creating the payment. This lets CtechPay allocate the transaction to the right category for balances, reports, and category-based settlements.

```js
const payment = await ctechpay.hostedPayments.create({
  amount: 10500,
  category_flag: 'LOAN_APPLICATION',
  customer_reference: 'APP-1001',
  customer_message: 'Loan application fee',
  redirectUrl: 'https://example.com/payments/success',
  cancelUrl: 'https://example.com/payments/cancelled',
});
```

The Node.js SDK also accepts `categoryFlag` and sends it to CtechPay as `category_flag`.

Supported payment category flows:

| Method | Category field |
| --- | --- |
| `ctechpay.hostedPayments.create({...})` | `category_flag` or `categoryFlag` |
| `ctechpay.airtel.pay({...})` | `category_flag` or `categoryFlag` |
| `ctechpay.cards.createPaymentPage({...})` | `category_flag` or `categoryFlag` |

The flag must match an active payment category on the merchant account. Omit it when the payment should remain uncategorized.

## Error Handling

The SDK throws `CtechPayError` for failed requests.

```js
import CtechPay, { CtechPayError } from '@ctechpay/ctechpay-js';

try {
  const payment = await ctechpay.hostedPayments.create({
    amount: 100,
  });
} catch (error) {
  if (error instanceof CtechPayError) {
    console.error(error.message);
    console.error(error.status);
    console.error(error.response);
  }
}
```

## Security Notes

This SDK intentionally does not expose direct card PAN/CVV helpers. Use the CtechPay Hosted Payment Page for card collection unless your integration is formally approved for card-data handling.

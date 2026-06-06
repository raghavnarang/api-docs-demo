# Getting Started with Stub Payments

Stub Payments is a mock payments API demonstrating write methods, request bodies,
and `oneOf` composition. It is **not a live service** — requests in the sandbox are
illustrative only.

## Authentication

All requests require a bearer token in the `Authorization` header:

```bash
curl https://api.example-pay.test/v1/payments \
  -H "Authorization: Bearer sk_test_..."
```

When you are signed in to the portal, the sandbox injects your token automatically.

## Creating a payment

`POST /payments` accepts an `amount` (in minor units), a `currency`, and a
`paymentMethod` (one of `card` or `bank_transfer`):

```bash
curl -X POST https://api.example-pay.test/v1/payments \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: a1b2c3" \
  -d '{ "amount": 4200, "currency": "USD", "paymentMethod": { "type": "card", "last4": "4242" } }'
```

## Idempotency

Send a unique `Idempotency-Key` header on every `POST`. Retrying with the same key
returns the original result instead of creating a duplicate payment.

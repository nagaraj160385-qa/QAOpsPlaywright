# Simple Tool Rental API tests

These Playwright API tests are kept separate from the browser UI suite and are
based on the supplied Simple Tool Rental API documentation.

Run them from the repository root:

```sh
npm run test:api
```

The suite covers API status, tool listing and filters, tool lookup, client
registration and duplicate registration, authentication requirements, and an
authenticated order create/read/update/delete lifecycle.

The registration and order tests make requests to the live demo API. They use
synthetic client names, `.invalid` email addresses, and a synthetic customer
name. The order lifecycle test deletes its created order and also attempts
cleanup if an assertion fails after order creation.

The docs specify that `results` must be from 1 through 20. A live run returned
HTTP 200 for `GET /tools?results=0`, so that contract test currently reports
the discrepancy as a failure rather than treating the undocumented behavior
as valid.

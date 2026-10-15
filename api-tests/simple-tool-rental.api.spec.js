const { randomUUID } = require('node:crypto');
const { test, expect } = require('@playwright/test');

function createClientEmail() {
  return `playwright-api-${randomUUID()}@example.invalid`;
}

async function registerApiClient(request) {
  const response = await request.post('/api-clients', {
    data: {
      clientName: 'Playwright API test client',
      clientEmail: createClientEmail(),
    },
  });

  expect(response.status()).toBe(201);
  const client = await response.json();
  expect(client.accessToken).toBeTruthy();
  return client.accessToken;
}

async function getAvailableTool(request) {
  const response = await request.get('/tools?available=true');
  expect(response.status()).toBe(200);

  const tools = await response.json();
  expect(Array.isArray(tools)).toBe(true);
  const tool = tools.find((item) => item.inStock);
  expect(tool, 'The inventory should include an available tool').toBeTruthy();
  return tool;
}

test.describe('Simple Tool Rental API', () => {
  test('GET /status reports that the API is up', async ({ request }) => {
    const response = await request.get('/status');

    expect(response.status()).toBe(200);
    await expect(response).toBeOK();
    await expect(response.json()).resolves.toMatchObject({ status: 'UP' });
  });

  test('GET /tools returns tools and honors the results limit', async ({ request }) => {
    const response = await request.get('/tools?results=5');

    expect(response.status()).toBe(200);
    const tools = await response.json();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeLessThanOrEqual(5);
    expect(tools.length).toBeGreaterThan(0);
    expect(tools[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        category: expect.any(String),
        name: expect.any(String),
        inStock: expect.any(Boolean),
      }),
    );
  });

  test('GET /tools filters by category and availability', async ({ request }) => {
    const categoryResponse = await request.get('/tools?category=trailers');
    expect(categoryResponse.status()).toBe(200);
    const trailers = await categoryResponse.json();
    expect(Array.isArray(trailers)).toBe(true);
    expect(trailers.length).toBeGreaterThan(0);
    expect(trailers.every((tool) => tool.category === 'trailers')).toBe(true);

    const availabilityResponse = await request.get('/tools?available=true');
    expect(availabilityResponse.status()).toBe(200);
    const availableTools = await availabilityResponse.json();
    expect(Array.isArray(availableTools)).toBe(true);
    expect(availableTools.length).toBeGreaterThan(0);
    expect(availableTools.every((tool) => tool.inStock === true)).toBe(true);
  });

  test('GET /tools rejects an invalid category', async ({ request }) => {
    const invalidCategory = await request.get('/tools?category=not-a-category');
    expect(invalidCategory.status()).toBe(400);
  });

  test('GET /tools rejects results below the documented minimum', async ({ request }) => {
    const tooFewResults = await request.get('/tools?results=0');
    expect(tooFewResults.status()).toBe(400);
  });

  test('GET /tools rejects results above the documented maximum', async ({ request }) => {
    const tooManyResults = await request.get('/tools?results=21');
    expect(tooManyResults.status()).toBe(400);
  });

  test('GET /tools/:toolId returns a tool or a not-found response', async ({ request }) => {
    const tool = await getAvailableTool(request);

    const foundResponse = await request.get(`/tools/${tool.id}`);
    expect(foundResponse.status()).toBe(200);
    await expect(foundResponse.json()).resolves.toMatchObject({
      id: tool.id,
      name: tool.name,
    });

    const missingResponse = await request.get('/tools/999999999');
    expect(missingResponse.status()).toBe(404);
  });

  test('POST /api-clients registers a client and rejects duplicate email', async ({ request }) => {
    const clientEmail = createClientEmail();
    const clientData = {
      clientName: 'Playwright API test client',
      clientEmail,
    };

    const registration = await request.post('/api-clients', { data: clientData });
    expect(registration.status()).toBe(201);
    const registeredClient = await registration.json();
    expect(registeredClient.accessToken).toBeTruthy();

    const duplicateRegistration = await request.post('/api-clients', {
      data: clientData,
    });
    expect(duplicateRegistration.status()).toBe(409);
  });

  test('POST /api-clients rejects a request with missing required fields', async ({ request }) => {
    const response = await request.post('/api-clients', {
      data: { clientName: 'Incomplete Playwright API client' },
    });

    expect(response.status()).toBe(400);
  });

  test('GET and POST /orders require bearer authentication', async ({ request }) => {
    const ordersResponse = await request.get('/orders');
    expect(ordersResponse.status()).toBe(401);

    const createOrderResponse = await request.post('/orders', {
      data: {
        toolId: 6483,
        customerName: 'Playwright API test customer',
      },
    });
    expect(createOrderResponse.status()).toBe(401);
  });

  test('an authenticated client can create, read, update, and delete an order', async ({
    request,
  }) => {
    const accessToken = await registerApiClient(request);
    const headers = { Authorization: `Bearer ${accessToken}` };
    const tool = await getAvailableTool(request);
    let orderId;

    try {
      const createResponse = await request.post('/orders', {
        headers,
        data: {
          toolId: tool.id,
          customerName: 'Playwright API test customer',
          comment: 'Created by an automated API test',
        },
      });
      expect(createResponse.status()).toBe(201);
      const createdOrder = await createResponse.json();
      expect(createdOrder.orderId).toBeTruthy();
      orderId = createdOrder.orderId;

      const listResponse = await request.get('/orders', { headers });
      expect(listResponse.status()).toBe(200);
      const orders = await listResponse.json();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.some((order) => order.orderId === orderId)).toBe(true);

      const readResponse = await request.get(`/orders/${orderId}`, { headers });
      expect(readResponse.status()).toBe(200);
      await expect(readResponse.json()).resolves.toMatchObject({
        orderId,
        customerName: 'Playwright API test customer',
      });

      const updateResponse = await request.patch(`/orders/${orderId}`, {
        headers,
        data: { customerName: 'Updated Playwright API test customer' },
      });
      expect(updateResponse.status()).toBe(204);

      const updatedOrderResponse = await request.get(`/orders/${orderId}`, { headers });
      expect(updatedOrderResponse.status()).toBe(200);
      await expect(updatedOrderResponse.json()).resolves.toMatchObject({
        orderId,
        customerName: 'Updated Playwright API test customer',
      });

      const deleteResponse = await request.delete(`/orders/${orderId}`, { headers });
      expect(deleteResponse.status()).toBe(204);

      const deletedOrderResponse = await request.get(`/orders/${orderId}`, { headers });
      expect(deletedOrderResponse.status()).toBe(404);
      orderId = undefined;
    } finally {
      if (orderId) {
        const cleanupResponse = await request.delete(`/orders/${orderId}`, { headers });
        if (![204, 404].includes(cleanupResponse.status())) {
          throw new Error(`Order cleanup failed with HTTP ${cleanupResponse.status()}.`);
        }
      }
    }
  });
});

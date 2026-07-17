export class CtechPayError extends Error {
  constructor(message, { status = 0, response = null } = {}) {
    super(message);
    this.name = 'CtechPayError';
    this.status = status;
    this.response = response;
  }
}

export class CtechPay {
  constructor(token, options = {}) {
    if (!token) {
      throw new CtechPayError('A CtechPay service token is required.');
    }

    this.token = token;
    this.baseUrl = (options.baseUrl || 'https://new-api.ctechpay.com').replace(/\/+$/, '');
    this.timeout = options.timeout || 30000;

    this.hostedPayments = {
      create: (payload) => this.post('/api/v1/hosted/payment', payload),
    };

    this.airtel = {
      pay: (payload) => this.post('/api/v1/airtel/payment', payload),
      status: (transactionId) => this.post('/api/v1/airtel/status', { trans_id: transactionId }),
      details: (transactionId) => this.post('/api/v1/airtel/transaction/details', { transaction_id: transactionId }),
      reference: (airtelMoneyId) => this.post('/api/v1/airtel/transaction/reference', { transaction_id: airtelMoneyId }),
    };

    this.cards = {
      createPaymentPage: (payload) => this.post('/api/v1/orders', payload),
      status: (orderReference) => this.get('/api/v1/orders/status', { orderRef: orderReference }),
    };
  }

  static client(token, options = {}) {
    return new CtechPay(token, options);
  }

  async get(path, query = {}) {
    return this.request('GET', path, query);
  }

  async post(path, payload = {}) {
    return this.request('POST', path, payload);
  }

  async request(method, path, data = {}) {
    const requestData = { ...data, token: data.token || this.token };
    const url = new URL(`${this.baseUrl}/${path.replace(/^\/+/, '')}`);
    const headers = { Accept: 'application/json' };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const options = {
      method,
      headers,
      signal: controller.signal,
    };

    if (method === 'GET') {
      for (const [key, value] of Object.entries(requestData)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    } else {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(requestData);
    }

    let response;
    let bodyText;

    try {
      response = await fetch(url, options);
      bodyText = await response.text();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new CtechPayError('CtechPay request timed out.');
      }

      throw new CtechPayError(error.message || 'CtechPay request failed.');
    } finally {
      clearTimeout(timeoutId);
    }

    let body = null;
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      throw new CtechPayError('CtechPay returned an invalid JSON response.', {
        status: response.status,
        response: bodyText,
      });
    }

    if (!response.ok) {
      throw new CtechPayError(body.message || body.error || 'CtechPay request failed.', {
        status: response.status,
        response: body,
      });
    }

    return body;
  }
}

export default CtechPay;

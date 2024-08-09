const { parentPort } = require('worker_threads');
const mockFetch = require('../utils/mockFetch');

const cachedTokensMap = new Map();

const refreshToken = async (data) => {
  try {
    console.log('Refreshing token for key:', data.key);
    const refreshedToken = await invokeTokenService(data.key);
    cachedTokensMap.set(data.key, { token: refreshedToken, timestamp: Date.now() });
    setTimeout(() => refreshToken(data), 5000);
  } catch (error) {
    console.error('Token refresh error:', error);
  }
};

const invokeTokenService = async (key) => {
  return `${key}-${Date.now()}`;
};

const generateToken = async (data) => {
  const cachedToken = cachedTokensMap.get(data.key);
  if (!cachedToken || (Date.now() - cachedToken.timestamp > 7000)) {
    console.log('Generating new token for key:', data.key);
    const token = await invokeTokenService(data.key);
    cachedTokensMap.set(data.key, { token, timestamp: Date.now() });
    setTimeout(() => refreshToken(data), 5000);
  } else {
    console.log('Using cached token for key:', data.key);
    return cachedToken.token;
  }
};

const handleMessage = async (data) => {
  console.log('Handling request to get cats');
  const token = await generateToken({ key: 'token-key' });
  console.log('Token for request:', token);
  const response = await mockFetch('cats', token);
  return response;
};

parentPort.on('message', async (message) => {
  try {
    const response = await handleMessage(message);
    parentPort.postMessage({ response, requestId: message.requestId });
  } catch (error) {
    console.error('handleResponse error:', error);
    parentPort.postMessage({ response: 'error response from worker', requestId: message.requestId });
  }
});

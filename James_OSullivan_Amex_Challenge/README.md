## Task 1 - Identify and fix the issue with getCatsInfo API

The getCatsInfo API works fine for the first few requests, but after a few requests, it stops responding. Your task is to identify the root cause of this issue and implement a fix. Additionally, you should document the reason for the issue and the fix applied in the README.md file,along with list of files changed.

### Accepentance Criteria
- The getCatsInfo API should work without any issues for any number of requests.
- The fix and list of files changed should be documented in the README.md
- If you have any additional suggestions (or) best practices, please document them as well in README.md

### Changes Made

- Added timestamp to each token in `cachedTokensMap` in `refreshToken` getCatsWorker.js
- Check the timestamp each time tokens are generated in `generateNewToken` to see if the timestamp is older than 7 seconds. If so, generate new token, if not, use cached token in `cachedTokensMap` in getCatsWorker.js


## Task 2 - Add correlationId header to all the requests and response

In order to track the requests, we would need a correlationId header in all the requests and response. 

- Validate every incoming request
- Since the users of the API can pass correlationId header, if its passed use that, else generate a new id
- Add the correlationId header to response headers as well. 
- Document the list of files changed in the README.md.

### Accepentance Criteria
- All the requests and response should have correlationId header.
- Document the list of files changed in the README.md

### Changes Made

- Added correlationId to request headers and response headers in index.js
- Generated correlationId using UUIDs if an correlationId is not provided in index.js

## Task 3 - Terminate the idle worker and recreate when needed

Worker threads are used to process the requests. If the worker thread is idle i.e., any API haven't received the requests in last 15 minutes, it should be terminated. Generate a new worker when a new request comes.

- Implement the logic to terminate the worker thread if it is idle for 15 minutes.
- Create a new worker thread whenever a new request comes.
- Log the worker thread termination and creation in the console.

### Accepentance Criteria
- Worker thread should be terminated if it is idle for 15 minutes.
- Whenever a new request comes, a new worker thread should be created.
- Logs should be printed in the console for worker thread termination and creation.
- Explain the approach and document the list of files changed in the README.md

### Changes made

- Terminated worker and removed worker from dictionary of workers in generateNewWorker.js after 15 minutes
- Cleared requests in requestTracker for worker that was terminated in generateNewWorker.js
- Created new worker if needed in index.js
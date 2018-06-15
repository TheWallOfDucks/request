## Introduction

This module is used for making API requests. Uses [Node.js HTTPS](https://nodejs.org/api/https.html) under the hood.

### Table of contents

1.  [Installation](#markdown-header-installation)
2.  [Features](#markdown-header-features)
3.  [Request Options](#markdown-header-request-options)
4.  [Examples](#markdown-header-examples)

## Installation

-   Coming soon

## Features

-   Supports HTTPS and HTTP
-   Supports JSON/XML requests. By default XML requests will convert response and return JSON object
-   Automatically follows 302 redirects
-   Custom retry logic
-   Simplified multipart form data upload

### Request Options

`method` - Supports standard HTTP verbs (default: `GET`)

`url` - Full URL to send request to. Will support HTTP and HTTPS requests

`body` - Request body to send

`formData` - FormData object to send

`parameters` - Query parameters to include in request

`escapeParameters` - If true it will escape all parameters before they are added to the URL (default: `true`)

`headers` - Headers to include in request

`auth` - Authorization required to send request

`key` - Key required for request

`cert` - Certificate required for request

`passphrase` - Passphrase for certificate

`resolveWithBodyOnly` - If true only the response body will be returned (default: `false`)

`rejectNon2xx` - If true it will reject non 2xx status codes (default: `true`)

`debug` - If true it will log information about the request/response (default: `false`)

`timeout` - MS to wait for a response (default: `10000`)

`retryLogic` - Array of `RetryLogic` objects for automatic request retries

### Examples

Making an API call

```js
const url: string = 'https://jsonplaceholder.typicode.com/comments';

try {
    const request = new OpenRequest({ url });
    const response = await request.execute();
} catch (error) {
    throw new Error(error);
}
```

Making an API call using XML

```js
const body: string = `<?xml version="1.0" encoding="UTF-8"?>
                <Pet>
                    <id>0</id>
                    <Category>
                        <id>0</id>
                        <name>string</name>
                    </Category>
                    <name>Doggo</name>
                    <photoUrl>
                        <photoUrl>string</photoUrl>
                    </photoUrl>
                    <tag>
                        <Tag>
                            <id>0</id>
                            <name>string</name>
                        </Tag>
                    </tag>
                    <status>available</status>
                </Pet>`;
const url: string = 'http://petstore.swagger.io/v2/pet';
const headers: object = { Accept: 'application/xml', 'Content-Type': 'application/xml' };

try {
    const request = new OpenRequest({ method: Method.POST, url, body, headers });
    const response = await request.execute();
} catch (error) {
    throw new Error(error);
}
```

Making an API call using query parameters

```js
const url: string = 'https://jsonplaceholder.typicode.com/comments';
const parameters: object = { postId: 1 };

try {
    const request = new OpenRequest({ url, parameters });
    const response = await request.execute();
} catch (error) {
    throw new Error(error);
}
```

Uploading multipart form data

```js
import * as fs from 'fs';
import * as FormData from 'form-data';

const filePath = 'src/tests/docs/image.png';
const url = `http://petstore.swagger.io/v2/pet/${petId}/uploadImage`;

try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const request = new OpenRequest({ method: Method.POST, url, formData });
    const response = await request.execute();
} catch (error) {
    throw new Error(error);
}
```

Using retry logic

```js
const url = 'http://petstore.swagger.io/v2/pet/garbageId';

try {
    const request = new OpenRequest({ url, rejectNon2xx: false, retryLogic: [{ retryLimit: 2, retryCondition: `response.statusCode === 404` }, { retryLimit: 2, retryCondition: `JSON.stringify(response.body).includes('java.lang.NumberFormatException')` }] });
    const response = await request.execute();

} catch (error) {
    throw new Error(error);
}
```

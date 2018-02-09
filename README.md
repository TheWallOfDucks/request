## Introduction

This module is used for making API requests. Uses [Node.js HTTPS](https://nodejs.org/api/https.html) under the hood.

## Installation
* Not published (yet)

## Features
* Supports HTTPS and HTTP
* Supports JSON/XML requests. By default XML requests will convert response and return JSON object

### #Options

```method``` - Supports standard HTTP verbs (default: ```GET```)

```url``` - Full URL to send request to. Will support HTTP and HTTPS requests

```body``` - Request body to send

```parameters``` - Query parameters to include in request

```headers``` - Headers to include in request

```auth``` - Authorization required to send request

```key``` - Key required for request

```cert``` - Certificate required for request

```passphrase``` - Passphrase for certificate

```contentType``` - Content type of the request body (default: ```application/json```)

```resolveWithBodyOnly``` - If true only the response body will be returned (default: ```false```)

```rejectNon2xx``` - If true it will reject non 2xx status codes (default: ```true```)

```debug``` - If true it will log information about the request/response (default: ```false```)

```timeout``` - MS to wait for a response (default: ```10000```)

Making an API call

```js
const url: string = 'https://jsonplaceholder.typicode.com/comments';

try {
    const request = new promise({ url });
    const response = await request.execute();
} catch (error) {
    //handle errors
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
const headers: object = { Accept: 'application/xml' };
const contentType: string = 'application/xml';

try {
    const request = new promise({ method: 'POST', url, body, headers, contentType });
    const response = await request.execute();
} catch (error) {
    //handle errors
}
```

Making an API call using query parameters

```js
const url: string = 'https://jsonplaceholder.typicode.com/comments';
const parameters: object = { postId: 1 };

try {
    const request = new promise({ url, parameters });
    const response = await request.execute();
} catch (error) {
    //handle errors
}
```
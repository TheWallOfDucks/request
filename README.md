## Introduction

This module is used for making API requests. Uses [Node.js HTTPS](https://nodejs.org/api/https.html) under the hood.

## Features

* Supports promises or callbacks
* Supports HTTPS and HTTP
* Supports JSON/XML requests. By default XML requests will convert response and return JSON object

## Coming soon

* Logging to a database near you

## Methods

### #constructor (options)

```options.method``` - Supports standard HTTP verbs (default: ```GET```)

```options.url``` - Full URL to send request to. Will support HTTP and HTTPS requests

```options.body``` - Request body to send

```options.parameters``` - Query parameters to include in request

```options.headers``` - Headers to include in request

```options.auth``` - Authorization required to send request

```options.contentType``` - Content type of the request body (default: ```application/json```)

```options.resolveWithBodyOnly``` - If true only the response body will be returned (default: ```false```)

```options.rejectNon2xx``` - If true it will reject non 2xx status codes (default: ```true```)

```options.debug``` - If true it will log information about the request/response (default: ```false```)

Making an API call that returns a promise

```js
let Request = new https.request({ url: 'https://jsonplaceholder.typicode.com/comments' });

Request.promise()
    .then(response => {
        //do stuff
    })
    .catch(err => {
        //handle errors
    });
```

Making an API call that returns a callback

```js
let Request = new https.request({ url: 'https://jsonplaceholder.typicode.com/comments' });

Request.callback((err, response) => {
    if (err) { 
        //handle error
    }

    //do stuff
});
```

Making an API call using XML

```js
let postBody = `<?xml version="1.0" encoding="UTF-8"?>
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
                </Pet>`

let Request = new https.request({ method: 'POST', url: 'http://petstore.swagger.io/v2/pet', body: postBody, headers: { Accept: 'application/xml' }, contentType: 'application/xml' })

Request.promise()
    .then(response => {
        //do stuff
    })
    .catch(err => {
        //handle errors
    });
```

Making an API call using query parameters

```js
let Request = new https.request({ url: 'https://jsonplaceholder.typicode.com/comments', parameters: { postId: 1 } });

Request.promise()
    .then(response => {
        //do stuff
    })
    .catch(err => {
        //handle errors
    });

```

Chaining multiple API calls together using promises

```js
let postBody = {
    "id": 0,
    "category": {
        "id": 0,
        "name": "string"
    },
    "name": "Dog",
    "photoUrls": [
        "string"
    ],
    "tags": [
        {
            "id": 0,
            "name": "string"
        }
    ],
    "status": "available"
};

let createPet = new https.request({ method: 'POST', url: 'http://petstore.swagger.io/v2/pet', body: postBody });
let petId;

createPet.promise()
    .then(response => {
        petId = response.body.id;
        expect(petId).toBeDefined();

        let findPet = new https.request({ url: `http://petstore.swagger.io/v2/pet/${petId}` });

        return findPet.promise();
    })
    .then(response => {
        expect(response.body.id).toEqual(petId);
        done();
    })
    .catch(err => {
        done.fail(err);
    });
```
## Introduction

This module is used for making API requests. Uses [Node.js HTTPS](https://nodejs.org/api/https.html) under the hood.

## Installation
```npm install @apiture/request --save-dev```

## Features

* Supports promises or callbacks
* Supports JSON/XML requests and responses

## Coming soon

* Logging to a database near you

## Methods

### #constructor (String method, String url, Object body, Object parameters, Object headers, Object auth, String contentType)

```method``` - Supports standard HTTP verbs (default: ```GET```)

```url``` - Full URL to send request to. Will support HTTP and HTTPS requests

```body``` - Request body to send

```parameters``` - Query parameters to include in request

```headers``` - Headers to include in request

```auth``` - Authorization required to send request

```contentType``` - Content type of the request body (default: ```application/json```)

Making an API call that returns a promise

```js
var Request = new https.request('GET', 'https://jsonplaceholder.typicode.com/comments', null, null, null, null, null);

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
var Request = new https.request('GET', 'https://jsonplaceholder.typicode.com/comments', null, null, null, null, null);

Request.callback(response => {
    //do stuff
});
```
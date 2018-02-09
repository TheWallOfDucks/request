"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
let https;
class promise extends request_1.Request {
    /**
     * @description Calls Request constructor and determines which HTTP module to use based on the protocol
     * @param  {RequestOptions} options
     */
    constructor(options) {
        super(options);
        (this.protocol === 'http:') ? https = require('http') : https = require('https');
    }
    execute() {
        const options = {
            hostname: this.hostname,
            port: this.port,
            path: this.path + this.qs,
            headers: this.headers,
            auth: this.auth,
            method: this.method,
            key: this.key,
            cert: this.cert,
            passphrase: this.passphrase,
        };
        let response;
        let responseBody;
        const start = new Date().getTime();
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const err = new Error(`Timed out waiting for response after ${this.timeout / 1000} seconds`);
                return reject(err);
            }, this.timeout);
            const req = https.request(options, (res) => {
                const statusCode = res.statusCode;
                responseBody = '';
                res.on('data', (body) => {
                    // Once a response is received clear the timeout timer
                    clearTimeout(timeout);
                    responseBody += body;
                });
                res.on('end', () => {
                    /**
                     * @todo: Add database logging
                     */
                    const end = new Date().getTime();
                    response = {
                        statusCode,
                        body: responseBody,
                        duration: end - start,
                    };
                    // If debug is turned on, log debugInfo object with request and response
                    if (this.debug) {
                        this.debugInfo = {
                            request: this.body,
                            response: res,
                        };
                        console.log(this.debugInfo);
                    }
                    // Handle any non-200 rejections
                    if (this.rejectNon2xx && response.statusCode.toString().charAt(0) !== '2') {
                        return reject('Invalid status code: ' + response.statusCode + '\n'
                            + 'Response: ' + '\n' + JSON.stringify(response.body, null, 2));
                    }
                    // Handle parsing of the response body
                    if (response.body.length > 0) {
                        (this.contentType === 'application/json' || options['headers']['Accept'] === 'application/json') ? response.body = JSON.parse(response.body)
                            : options['headers']['Content-Type'] === 'application/xml' || 'text/xml' ? this.xmlToJSON(response.body, (res) => { response.body = res; })
                                : reject(`Unrecognized Content-Type: ${options['headers']['Content-Type']}`);
                    }
                    // If resolveWithBodyOnly is turned on then only return the response body
                    this.resolveWithBodyOnly ? resolve(response.body) : resolve(response);
                });
            });
            req.write(this.body);
            req.on('error', (err) => {
                /**
                 * @todo: Add database logging
                 */
                return reject(err);
            });
            req.end();
        });
    }
}
exports.promise = promise;

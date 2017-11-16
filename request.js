//Created by Caleb Duckwall
let https, timeout;

'use strict';

class Request {

    /**
     * @todo - Figure out how to handle API versioning
     * @param {Object} options - Options to be used in request
     * @param {String} options.method - HTTP verb. Defaults to GET
     * @param {String} options.url - URL to send request to
     * @param {Object} options.body - Request body
     * @param {Object} options.parameters - Request parameters
     * @param {Object} options.headers - Request headers
     * @param {Object} options.auth - Authorization required for request
     * @param {String} options.contentType - Content type of the request
     * @param {Boolean} options.resolveWithBodyOnly - If true it will only return the response body. Defaults to true
     * @param {Boolean} options.rejectNon2xx - If true it will reject non 2xx status codes. Defaults to true
     * @param {Boolean} options.debug - If true it will log information about the request/response. Defaults to false
     * @param {Int} options.timeout - MS to wait for response to be returned. Defaults to 10000
     */
    constructor(options) {

        const { URL } = require('url'),
            querystring = require('querystring');

        let err, url;

        //Build a new URL and store hostname/path
        !options.url ? console.error('No URL provided') : (url = new URL(options.url), this.hostname = url.hostname, this.path = url.pathname);

        //If protocol is HTTP, use HTTP module instead of HTTPS
        (url.protocol == 'http:') ? https = require('http') : https = require('https');

        /**
         *  If there is a port, use it
         *  If there is no port, and protocol is HTTP, default to port 80
         *  Otherwise default to port 443
         */
        url.port ? this.port = url.port : url.protocol == 'http:' ? this.port = 80 : this.port = 443

        !options.method ? this.method = 'GET' : this.method = options.method.toUpperCase();

        /**
         *  If there is no request body use querystring to stringify it
         *  If the request body is an object use JSON.stringify
         */
        !options.body ? this.body = querystring.stringify(options.body)
            : (typeof options.body == 'object') ? this.body = JSON.stringify(options.body)
                : this.body = options.body;

        //If there is a contentType specified, use it. Otherwise default to JSON
        options.contentType ? this.contentType = options.contentType : this.contentType = 'application/json';

        //Build the headers based on the contentType and request body if there is one
        options.headers ? (this.headers = options.headers, this.headers['Content-Type'] = this.contentType, this.headers['Content-Length'] = this.body.length)
            : (this.headers = { 'Content-Type': this.contentType, 'Content-Length': this.body.length });

        //If there are parameters turn them into a query string
        options.parameters ? (this.parameters = options.parameters, this.qs = `?${querystring.stringify(options.parameters)}`)
            : (this.parameters = null, this.qs = '');

        /**
         * @todo: Probably need to figure out a better way to handle this as this only handles basic authorization 
         * 
         * If there is authorization required in the request, get it here
         */
        if (options.auth) {
            this.headers['Authorization'] = 'Basic ' + new Buffer(options.auth.username + ':' + options.auth.password).toString('base64');
        }

        //Handle resolveWithBodyOnly option
        (options.resolveWithBodyOnly || options.resolveWithBodyOnly == undefined) ? this.resolveWithBodyOnly = true : this.resolveWithBodyOnly = false;

        //Handle rejectNon2xx option
        (options.rejectNon2xx == true) ? this.rejectNon2xx = true : (options.rejectNon2xx == false) ? this.rejectNon2xx = false : this.rejectNon2xx = true;

        //Handle debug option
        options.debug ? this.debug = options.debug : this.debug = false;

        //Handle timeout option
        options.timeout ? this.timeout = options.timeout : this.timeout = 10000;
    }

    promise() {

        let response = {},
            options = {
                hostname: this.hostname,
                port: this.port,
                path: this.path + this.qs,
                headers: this.headers,
                auth: this.auth,
                method: this.method
            },
            start = new Date();

        return new Promise((resolve, reject) => {

            let req = https.request(options, (res) => {
                response.statusCode = res.statusCode;
                response.body = '';

                //Emit a timeout event based on configured timeout
                timeout = setTimeout(() => {
                    let err = new Error(`Timed out waiting for response after ${this.timeout / 1000} seconds`)
                    res.emit('error', err);
                }, this.timeout);

                res.on('data', body => {
                    //Once a response is received clear the timer
                    clearTimeout(timeout);
                    response.body += body;
                });

                res.on('timeout', err => {
                    //Once the response has timed out, clear the timer
                    clearTimeout(timeout);
                    return reject(err);
                });

                res.on('end', () => {

                    /**
                     * @todo: Add database logging
                     */
                    let end = new Date();
                    response.duration = end - start;

                    if (this.debug) {
                        this.debugInfo = {
                            request: this.body,
                            response: res
                        };
                        console.log(this.debugInfo);
                    }

                    if (response.body.length > 0) {
                        options['headers']['Content-Type'] == 'application/json' ? response.body = JSON.parse(response.body)
                        : options['headers']['Content-Type'] == 'application/xml' || 'text/xml' ? this.xmlToJSON(response.body, (res) => { response.body = res })
                            : reject(`Unrecognized Content-Type: ${options['headers']['Content-Type']}`);
                    }

                    /**
                     * @todo - consider moving this up in the chain. Basically ran into an issue where I was getting a 307 temporary redirect
                     * and returning an empty response body. Because it was trying to parse an empty response body, it was failing before it got here
                     * 
                     * Handle any non-200 rejections
                     */
                    if (this.rejectNon2xx && response.statusCode.toString().charAt(0) != '2') {
                        // return reject(`Invalid status code: ${response.statusCode}, 
                        //         Response: ${JSON.stringify(response.body, null, 2)}`);
                        return reject('Invalid status code: ' + response.statusCode + '\n'
                                        + 'Response: ' + '\n' + JSON.stringify(response.body, null, 2));
                    }

                    //If resolveWithBodyOnly == true then only return the response body
                    this.resolveWithBodyOnly ? resolve(response.body) : resolve(response);
                });

            });

            req.write(this.body);

            req.on('error', err => {
                /**
                 * @todo: Add database logging
                 */
                return reject(err);
            });

            req.end();

        });

    }

    callback(done) {
        const util = require('util');

        //This allows us to only build the logic into the promise function and simply callbackify it
        const callbackFunction = util.callbackify(this.promise).bind(this);

        callbackFunction(done);
    }

    xmlToJSON(body, done) {

        const { parseString } = require('xml2js');

        parseString(body, (err, result) => {
            if (err) { console.error(err) }
            done(result);
        });

    }

}

module.exports = {
    request: Request
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_model_1 = require("../models/request.model");
class Request {
    /**
     * @description Builds out HttpOptions based on RequestOptions provided
     * @param  {RequestOptions} options
     */
    constructor(options) {
        const { URL } = require('url');
        const querystring = require('querystring');
        const err = '';
        let url;
        // Build a new URL and store hostname/path
        !options.url ? console.error('No URL provided') : (url = new URL(options.url), this.hostname = url.hostname, this.path = url.pathname);
        // If protocol is HTTP, use HTTP module instead of HTTPS
        this.protocol = url.protocol;
        /**
         *  If there is a port, use it
         *  If there is no port, and protocol is HTTP, default to port 80
         *  Otherwise default to port 443
         */
        url.port ? this.port = url.port : url.protocol === 'http:' ? this.port = 80 : this.port = 443;
        !options.method ? this.method = request_model_1.Method.GET : this.method = options.method;
        /**
         *  If there is no request body use querystring to stringify it
         *  If the request body is an object use JSON.stringify
         */
        !options.body ? this.body = querystring.stringify(options.body)
            : (typeof options.body === 'object') ? this.body = JSON.stringify(options.body)
                : this.body = options.body;
        /**
         * If there is contentType specified in the options, use it
         * If there is no contentType, but there is a content-type header, use it
         * If there is nothing, default it to JSON
         */
        options.contentType ? this.contentType = options.contentType
            : options.headers && 'Content-Type' in options.headers ? this.contentType = options.headers['Content-Type']
                // : this.contentType = 'application/hal+json';
                : this.contentType = 'application/json';
        // Build the headers based on the contentType and request body if there is one
        options.headers ? (this.headers = options.headers, this.headers['Content-Type'] = this.contentType, this.headers['Content-Length'] = this.body.length)
            : (this.headers = { 'Content-Type': this.contentType, 'Content-Length': this.body.length });
        // Handle parameters
        options.parameters ? (this.parameters = options.parameters, this.qs = `?${querystring.stringify(options.parameters)}`)
            : (this.parameters = null, this.qs = '');
        // Handle basic authorization
        if (options.auth) {
            this.headers['Authorization'] = 'Basic ' + new Buffer(options.auth.username + ':' + options.auth.password).toString('base64');
        }
        // If there is a key, include it in the request
        if (options.key) {
            this.key = options.key;
        }
        // If there is a cert, include it in the request
        if (options.cert) {
            this.cert = options.cert;
        }
        // If there is a passphrase, include it in the request
        if (options.passphrase) {
            this.passphrase = options.passphrase;
        }
        // Handle resolveWithBodyOnly option
        (options.resolveWithBodyOnly === undefined || !options.resolveWithBodyOnly) ? this.resolveWithBodyOnly = false : this.resolveWithBodyOnly = true;
        // Handle rejectNon2xx option
        (options.rejectNon2xx === true) ? this.rejectNon2xx = true : (options.rejectNon2xx === false) ? this.rejectNon2xx = false : this.rejectNon2xx = true;
        // Handle debug option
        options.debug ? this.debug = options.debug : this.debug = false;
        // Handle timeout option
        options.timeout ? this.timeout = options.timeout : this.timeout = 10000;
    }
    /**
     * @description Converts XML to a JSON object
     * @param {object} body
     * @param {callback} done
     * @returns JSON object
     */
    xmlToJSON(body, done) {
        const { parseString } = require('xml2js');
        parseString(body, (err, result) => {
            if (err) {
                console.error(err);
            }
            done(result);
        });
    }
}
exports.Request = Request;

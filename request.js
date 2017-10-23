//Created by Caleb Duckwall
let https;

class Request {

    /**
     * @param {Object} options - Options to be used in request
     * @param {String} options.method - HTTP verb. Defaults to GET
     * @param {String} options.url - URL to send request to
     * @param {Object} options.body - Request body
     * @param {Object} options.parameters - Request parameters
     * @param {Object} options.headers - Request headers
     * @param {Object} options.auth - Authorization required for request
     * @param {String} options.contentType - Content type of the request
     * @param {Boolean} options.resolveWithBodyOnly - If true it will only return the response body. Defaults to false
     * @param {Boolean} options.rejectNon2xx - If true it will reject non 2xx status codes. Defaults to true
     * @param {Boolean} options.debug - If true it will log information about the request/response. Defaults to false
     */
    constructor(options) {

        const { URL } = require('url'),
            querystring = require('querystring');

        let err, url;

        //Build a new URL and store hostname/path
        url = new URL(options.url);
        this.hostname = url.hostname;
        this.path = url.pathname;

        //If protocol is HTTP, use HTTP module instead of HTTPS...probably a better way to do this ¯\_(ツ)_/¯
        (url.protocol == 'http:') ? https = require('http') : https = require('https');

        /**
         *  If there is a port, use it
         *  If there is no port, and protocol is HTTP, default to port 80
         *  Otherwise default to port 443
         */
        url.port ? this.port = url.port : url.protocol == 'http:' ? this.port = 80 : this.port = 443

        this.method = options.method;

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

        //If there is authorization required in the request, get it here
        //@TODO: Need to figure out a better way to handle this
        // if (options.auth == 'SnapLogic') { this.headers['Authorization'] = 'Basic ' + new Buffer(login_creds.SnapLogic.login + ':' + login_creds.SnapLogic.password).toString('base64'); }

        options.resolveWithBodyOnly ? this.resolveWithBodyOnly = options.resolveWithBodyOnly : this.resolveWithBodyOnly = false;

        (options.rejectNon2xx == true) ? this.rejectNon2xx = true : (options.rejectNon2xx == false) ? this.rejectNon2xx = false : this.rejectNon2xx = true;

        options.debug ? this.debug = options.debug : this.debug = false;
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
            start = new Date(),
            debugInfo = {};

        return new Promise((resolve, reject) => {

            let req = https.request(options, (res) => {

                response.statusCode = res.statusCode;
                response.body = '';

                if (this.rejectNon2xx && response.statusCode.toString().charAt(0) != '2') {
                    reject(`Invalid status code: ${response.statusCode}`);
                }

                res.on('data', body => {
                    response.body += body;
                });

                res.on('end', () => {
                    //TODO: Add logic to store data in MySQL   
                    let end = new Date();
                    response.duration = end - start;
                    options['headers']['Content-Type'] == 'application/json' ? response.body = JSON.parse(response.body)
                        : options['headers']['Content-Type'] == 'application/xml' || 'text/xml' ? this.xmlToJSON(response.body, (res) => { response.body = res })
                            : reject(`Unrecognized Content-Type: ${options['headers']['Content-Type']}`);

                    if (this.debug) {
                        debugInfo.request = this.body;
                        debugInfo.response = res;
                        console.log(debugInfo);
                    }

                    //If resolveWithBodyOnly == true then only return the response body
                    this.resolveWithBodyOnly ? resolve(response.body) : resolve(response);
                });

            });

            req.write(this.body);

            req.on('error', err => {
                //TODO: Add some sort of error handling and log errors to MySQL
                reject(err);
            });

            req.end();

        });

    }

    callback(done) {

        let response = {},
            options = {
                hostname: this.hostname,
                port: this.port,
                path: this.path + this.qs,
                headers: this.headers,
                auth: this.auth,
                method: this.method
            },
            start = new Date(),
            debugInfo = {};

        let req = https.request(options, (res) => {

            response.statusCode = res.statusCode;
            response.body = '';

            if (this.rejectNon2xx && response.statusCode.toString().charAt(0) != '2') {
                reject(`Invalid status code: ${response.statusCode}`);
            }

            res.on('data', body => {
                response.body += body;
            });

            res.on('end', () => {
                //TODO: Add logic to store data in MySQL   
                let end = new Date();
                response.duration = end - start;
                options['headers']['Content-Type'] == 'application/json' ? response.body = JSON.parse(response.body)
                    : options['headers']['Content-Type'] == 'application/xml' || 'text/xml' ? this.xmlToJSON(response.body, (res) => { response.body = res })
                        : done(new Error(`Unrecognized Content-Type: ${options['headers']['Content-Type']}`));

                if (this.debug) {
                    debugInfo.request = this.body;
                    debugInfo.response = res;
                    console.log(debugInfo);
                }

                //If resolveWithBodyOnly == true then only return the response body
                this.resolveWithBodyOnly ? done(null, response.body) : done(null, response);
            });

        });

        req.write(this.body);

        req.on('error', err => {
            //TODO: Add some sort of error handling and log errors to MySQL
            done(new Error(err));
        });

        req.end();

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
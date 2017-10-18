//Created by Caleb Duckwall
var https;

class Request {

    /**
     * @param {String} method - HTTP Verb
     * @param {String} url - URL to send request to
     * @param {Object} body - Request body
     * @param {Object} parameters - Request parameters
     * @param {Object} headers - Request headers
     * @param {Object} auth - Authorization required for request
     * @param {String} contentType - Content type of the request
     */
    constructor(method, url, body, parameters, headers, auth, contentType) {

        const { URL } = require('url'),
            querystring = require('querystring');

        var err;

        //Build a new URL and store hostname/path
        url = new URL(url);
        this.hostname = url.hostname;
        this.path = url.pathname;

        //If protocol is HTTP, use HTTP module instead of HTTPS...probably a better way to do this ¯\_(ツ)_/¯
        (url.protocol == 'http:') ? https = require('http')
            : https = require('https');

        /**
         *  If there is a port, use it
         *  If there is no port, and protocol is HTTP, default to port 80
         *  Otherwise default to port 443
         */
        url.port ? this.port = url.port
            : url.protocol == 'http:' ? this.port = 80
                : this.port = 443

        this.method = method;

        /**
         *  If there is no request body use querystring to stringify it
         *  If the request body is an object use JSON.stringify
         */
        !body ? this.body = querystring.stringify(body)
            : (typeof body == "object") ? this.body = JSON.stringify(body)
                : this.body = body;

        //If there is a contentType specified, use it. Otherwise default to JSON
        contentType ? this.contentType = contentType
            : this.contentType = 'application/json';

        //Build the headers based on the contentType and request body if there is one
        headers ? (this.headers = headers, this.headers['Content-Type'] = this.contentType, this.headers['Content-Length'] = this.body.length)
            : (this.headers = { "Content-Type": this.contentType, "Content-Length": this.body.length });

        //If there are parameters turn them into a query string
        parameters ? (this.parameters = parameters, this.qs = "?" + querystring.stringify(parameters))
            : (this.parameters = null, this.qs = "");

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

            var req = https.request(options, (res) => {

                response.statusCode = res.statusCode;
                response.body = '';

                res.on('data', body => {
                    response.body += body;
                });

                res.on('end', () => {
                    //TODO: Add logic to store data in MySQL   
                    let end = new Date();
                    response.duration = end - start;
                    options['headers']['Content-Type'] == 'application/json' ? response.body = JSON.parse(response.body)
                        : options['headers']['Content-Type'] == 'application/xml' || 'text/xml' ? this.xmlToJSON(response.body, (res) => { response.body = res })
                            : reject(`Unrecognized Content-Type: ${options["headers"]["Content-Type"]}`);

                    resolve(response);
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
            start = new Date();

        var req = https.request(options, (res) => {

            response.statusCode = res.statusCode;
            response.body = "";

            res.on('data', body => {
                response.body += body;
            });

            res.on('end', () => {
                //TODO: Add logic to store data in MySQL   
                let end = new Date();
                response.duration = end - start;
                options['headers']['Content-Type'] == 'application/json' ? response.body = JSON.parse(response.body)
                    : options['headers']['Content-Type'] == 'application/xml' || 'text/xml' ? this.xmlToJSON(response.body, (res) => { response.body = res })
                        : console.error(`Unrecognized Content-Type: ${options["headers"]["Content-Type"]}`);

                done(response);
            });

        });

        req.write(this.body);

        req.on('error', err => {
            //TODO: Add some sort of error handling and log errors to MySQL            
            done(err);
        });

        req.end();

    }

    xmlToJSON(body, done) {

        const { parseString } = require('xml2js');

        parseString(body, (err, result) => {
            if (err) { console.error(err) }
            done(result);
        })

    }

}

module.exports = {
    request: Request
}
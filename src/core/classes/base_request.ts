import { Method, RequestOptions, Auth, ClientCert, RetryLogic } from '../models/request.model';
import { Utility } from './utility';
const { URL } = require('url');
const querystring = require('querystring');

export class BaseRequest {
    url: URL;
    port: string;
    hostname: string;
    path: string;
    method: Method = Method.GET;
    body: any;
    formData: any;
    headers: any;
    parameters: any;
    escapeParameters: boolean = true;
    qs: string;
    key: Buffer;
    cert: Buffer;
    passphrase: string;
    rejectNon2xx: boolean = true;
    debug: boolean = false;
    timeout: number = 10000;
    resolveWithBodyOnly: boolean = false;
    auth: Auth;
    debugInfo: any;
    protocol: string;
    retryConditions: string[] = [];
    stack: string[] = new Error().stack.split('\n');

    /**
     * @description Builds out HttpOptions based on RequestOptions provided
     * @param {RequestOptions} options
     */
    constructor(options: RequestOptions) {
        this.parseUrl(options.url);
        this.setMethod(options.method);
        this.setBody(options.body);
        this.setHeaders(options.headers, options.formData);
        this.setParameters(options.parameters, options.escapeParameters);
        this.setBasicAuthorization(options.auth);
        this.setCert(options.clientCert);
        this.setResolveWithBodyOnly(options.resolveWithBodyOnly);
        this.setRejectNon2xx(options.rejectNon2xx);
        this.setDebug(options.debug);
        this.setTimeout(options.timeout);
        this.setRetryLogic(options.retryLogic);
    }

    /**
     * @description Parses a URL and sets the following:
     *  - this.hostname
     *  - this.path
     *  - this.protocol
     *  - this.port
     * @param {string} url
     */
    private parseUrl(url: string) {
        this.url = new URL(url);
        this.hostname = this.url.hostname;
        this.path = this.url.pathname;
        this.protocol = this.url.protocol;
        if (this.url.port) {
            this.port = this.url.port;
        } else if (this.protocol === 'http:') {
            this.port = '80';
        } else {
            this.port = '443';
        }
    }

    /**
     * @description Sets Authorization header for the request
     * @param {Auth} auth
     */
    private setBasicAuthorization(auth: Auth) {
        if (auth) {
            this.headers['Authorization'] =
                'Basic ' + new Buffer(auth.username + ':' + auth.password).toString('base64');
        }
    }

    /**
     * @description Sets the request body
     * @param {any} body
     */
    private setBody(body: any) {
        if (!body) {
            this.body = querystring.stringify(body);
        } else if (typeof body === 'object' && !Buffer.isBuffer(body)) {
            this.body = JSON.stringify(body);
        } else {
            this.body = body;
        }
    }

    /**
     * @description Sets the client certificate for the request
     * @param {Buffer} clientCert
     */
    private setCert(clientCert: ClientCert) {
        if (clientCert) {
            this.cert = clientCert.certificate;
            this.key = clientCert.key;
            this.passphrase = clientCert.passphrase;
        }
    }

    /**
     * @description Sets the debug flag
     * @param {boolean} debug
     */
    private setDebug(debug: boolean = this.debug) {
        this.debug = debug;
    }

    /**
     * @description Sets the request headers
     * @param {object} headers
     * @param {FormData} formData
     */
    private setHeaders(headers: object, formData: FormData) {
        if (headers) {
            this.headers = headers;
            this.headers['Content-Length'] = this.body.length;
        } else if (formData) {
            this.formData = formData;
            this.headers = {
                'Content-Type': this.formData.getHeaders()['content-type'],
            };
        } else {
            this.headers = {
                'Content-Length': this.body.length,
            };
        }

        if (!this.headers['Content-Type'] && this.method !== Method.GET) {
            this.headers['Content-Type'] = 'application/json';
        }
    }

    /**
     * @description Sets the request method
     * @param {Method} method
     */
    private setMethod(method: Method = this.method) {
        this.method = method;
    }

    /**
     * @description Sets the request parameters
     * @param {object} parameters
     */
    private setParameters(parameters: object, escapeParameters: boolean = this.escapeParameters) {
        this.escapeParameters = escapeParameters;
        if (parameters) {
            this.parameters = parameters;
            this.escapeParameters
                ? (this.qs = `?${querystring.stringify(this.parameters)}`)
                : (this.qs = querystring.unescape(`?${querystring.stringify(this.parameters)}`));
        } else {
            this.parameters = null;
            this.qs = '';
        }
    }

    /**
     * @description Sets the rejectNon2xx flag
     * @param {boolean} rejectNon2xx
     */
    private setRejectNon2xx(rejectNon2xx: boolean = this.rejectNon2xx) {
        this.rejectNon2xx = rejectNon2xx;
    }

    /**
     * @description Sets the resolveWithBodyOnly flag
     * @param {boolean} resolveWithBodyOnly
     */
    private setResolveWithBodyOnly(resolveWithBodyOnly: boolean = this.resolveWithBodyOnly) {
        this.resolveWithBodyOnly = resolveWithBodyOnly;
    }

    /**
     * @description Sets the retry logic for a request
     * @param {RetryLogic[]} retryLogic
     */
    private setRetryLogic(retryLogic: RetryLogic[]) {
        if (retryLogic) {
            retryLogic.forEach(item => {
                const items = Utility.populateRetryConditions(item.retryCondition, item.retryLimit);
                this.retryConditions = this.retryConditions.concat(items);
            });
        }
    }

    /**
     * @description Sets the request timeout. Note: this timeout is the timeout to receive a response from the server and NOT the Jasmine timeout
     * @param {number} timeout
     */
    private setTimeout(timeout: number = this.timeout) {
        this.timeout = timeout;
    }
}

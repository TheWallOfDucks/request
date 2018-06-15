import { RequestOptions, HttpOptions } from '../models/request.model';
import { Response, ErrorResponse } from '../models/response.model';
import { BaseRequest } from './base_request';
import { Utility } from './utility';

let https: any;
const { URL } = require('url');
let promiseReject;
let promiseResolve;
let timeout: NodeJS.Timer;

export class Request extends BaseRequest {
    /**
     * @description Calls Request constructor and determines which HTTP module to use based on the protocol
     * @param {RequestOptions} options
     */
    constructor(options: RequestOptions) {
        super(options);
        this.protocol === 'http:' ? (https = require('http')) : (https = require('https'));
    }

    /**
     * @description Builds out HttpOptions
     * @returns {HttpOptions}
     */
    private buildOptions(): HttpOptions {
        const options: HttpOptions = {
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

        return options;
    }

    /**
     * @description Follows the redirect link provided
     * @param {string} link
     */
    private followRedirect(link: string) {
        if (Utility.isValidUrl(link)) {
            const url = new URL(link);
            this.hostname = url.hostname;
            this.path = url.pathname;
        } else {
            // Assume the link is a path that is relative to the request
            this.path.startsWith('/test/')
                ? (this.path = `/test${link}`)
                : this.path.startsWith('/integration/')
                    ? (this.path = `/integration${link}`)
                    : this.path.startsWith('/production/')
                        ? (this.path = `/production${link}`)
                        : (this.path = link);
        }

        promiseResolve(this.execute());
    }

    /**
     * @description Logs debug information to the console
     * @param {Response} response
     */
    private logDebugInfo(response: Response) {
        if (this.debug) {
            this.debugInfo = {
                request: this.body,
                response,
            };
            console.log(this.debugInfo);
        }
    }

    /**
     * @description Checks if it should reject the request based on the status code and rejectNon2xx flag
     * @param {number} statusCode
     * @param {string} statusMessage
     */
    private evaluateStatusCode(response: Response, statusMessage: string) {
        const error: ErrorResponse = {
            statusCode: response.statusCode,
            message: statusMessage,
            body: response.body,
        };

        if (this.rejectNon2xx && response.statusCode.toString().charAt(0) !== '2') {
            return promiseReject(JSON.stringify(error, null, 2));
        }
    }

    /**
     * @description Checks response and retry logic to determine if the request should be retried
     * @param {Response} response
     * @returns Promise
     */
    private evaluateRetries(response: Response) {
        return new Promise(async (resolve, reject) => {
            for (const [index, condition] of this.retryConditions.entries()) {
                if (eval(condition)) {
                    await Utility.sleep(1000);
                    clearTimeout(timeout);
                    console.error('\x1b[31m%s\x1b[0m', `Got ${condition}! Retrying request...`);
                    this.retryConditions.splice(index, 1);
                    return this.retryRequest();
                }
                return resolve();
            }
            return resolve();
        });
    }

    /**
     * @description Executes HTTP request based on constructed HttpOptions
     * @returns {Response} Promise
     */
    execute(): Promise<Response> {
        const options = this.buildOptions();
        const response: Response = { statusCode: null, body: '', headers: '' };
        const start = new Date().getTime();

        return new Promise((resolve, reject) => {
            promiseResolve = resolve;
            promiseReject = reject;

            timeout = setTimeout(() => {
                const err = new Error(`Timed out waiting for response after ${this.timeout / 1000} seconds`);
                return reject(err);
            }, this.timeout);

            const req = https.request(options, async (res: any) => {
                response.statusCode = res.statusCode;
                response.headers = res.headers;
                const statusMessage = res.statusMessage;

                if (response.statusCode === 302 && res.headers.location) {
                    clearTimeout(timeout);
                    return this.followRedirect(res.headers.location);
                }

                res.on('data', (body: any) => {
                    clearTimeout(timeout);
                    response.body += body;
                });

                res.on('end', async () => {
                    response.body = this.parse(options.headers, response.body);
                    try {
                        this.logDebugInfo(res);
                        await this.log(response, options, start);
                        await this.evaluateRetries(response);
                        this.evaluateStatusCode(response, statusMessage);
                        this.returnResponse(response);
                    } catch (error) {
                        return reject(error);
                    }
                });
            });

            // If there is formData then stream it to request
            if (this.formData) {
                this.formData.pipe(req);
            } else {
                req.write(this.body);
            }

            req.on('error', (err: any) => {
                this.log(response, options, start);
                return reject(err);
            });

            // Don't kill the stream for form data
            if (!this.formData) {
                req.end();
            }
        });
    }

    /**
     * @description Logs to MySQL
     * @param {Response} response
     * @param {HttpOptions} options
     */
    private async log(response: Response, options: HttpOptions, start: number) {
        const end = new Date().getTime();
        options.duration = end - start;
        if (!(process.env.mock || process.env.noLog)) {
            try {
                this.setStack();
                options.body = this.body;
                // await MySQL.insertRequestLog(response, options);
            } catch (error) {
                throw new Error(error);
            }
        }
    }

    /**
     * @description Parses string into object based on Accept headers sent in request
     * @param {Object} headers
     * @param {Object} responseBody
     * @returns {Object}
     */
    private parse(headers: object, responseBody: string) {
        let parsedBody = '';

        if (responseBody.length > 0) {
            if (headers['Accept'] === 'application/json' || !headers['Accept']) {
                try {
                    parsedBody = JSON.parse(responseBody);
                } catch (error) {
                    if (error.message === 'Unexpected token < in JSON at position 0') {
                        parsedBody = responseBody;
                    }
                }
            } else if (headers['Accept'] === 'application/xml' || headers['Accept'] === 'text/xml') {
                this.xmlToJSON(responseBody, res => {
                    parsedBody = res;
                });
            } else {
                parsedBody = responseBody;
            }
        }

        return parsedBody;
    }

    /**
     * @description Retries a request
     * @param {number} statusCode
     */
    private retryRequest() {
        promiseResolve(this.execute());
    }

    /**
     * @description Determines what data to return as the response based on resolveWithBodyOnly flag
     * @param  {Response} response
     */
    private returnResponse(response: Response) {
        this.resolveWithBodyOnly ? promiseResolve(response.body) : promiseResolve(response);
    }

    /**
     * @description Sets values from the stack
     */
    private setStack() {
        let previousLine: string;
        for (const line of this.stack) {
            const statement = Utility.extractString(line, 'UserContext.', ' ');

            if (statement) {
                const lineNumber = Utility.extractString(line, 'tests/', ')');
                process.env.LINE = `${statement} - ${lineNumber}`;

                if (previousLine) {
                    process.env.FUNCTION = Utility.extractString(previousLine, 'at ', ' ');
                }
            }

            previousLine = line;
        }
    }

    /**
     * @description Converts XML to a JSON object
     * @param {object} body
     * @param {callback} done
     * @returns JSON object
     */
    private xmlToJSON(body: string, done: Function) {
        const { parseString } = require('xml2js');

        parseString(body, (err, result) => {
            if (err) {
                console.error(err);
            }
            done(result);
        });
    }
}

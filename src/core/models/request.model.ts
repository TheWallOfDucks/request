/**
 * @description Request parameters that are used to build HttpOptions
 */
export interface RequestOptions {
    /**
     * @description HTTP verb
     * @default GET
     */
    method?: Method;

    /**
     * @description URL to send request to
     */
    url?: string;

    /**
     * @description Request body
     */
    body?: any;

    /**
     * @description Form Data
     */
    formData?: FormData;

    /**
     * @description Query parameters
     */
    parameters?: object | null;

    /**
     * @description Escape query parameters
     */
    escapeParameters?: boolean;

    /**
     * @description Request headers
     */
    headers?: any;

    /**
     * @description Basic authorization to include with request
     */
    auth?: Auth;

    /**
     * @description Certificate information required for request
     */
    clientCert?: ClientCert;

    /**
     * @deprecated
     * @description Content-Type to send with request
     */
    contentType?: string;

    /**
     * @description If true it will only return the response body
     * @default false
     */
    resolveWithBodyOnly?: boolean;

    /**
     * @description If true it will reject any request that returns a non-2xx status code
     * @default true
     */
    rejectNon2xx?: boolean;

    /**
     * @description Information needed to retry request
     */
    retryLogic?: RetryLogic[];

    /**
     * @description If true detailed request/response information will be logged to console
     * @default false
     */
    debug?: boolean;

    /**
     * @description MS to wait for a response to be returned from server
     * @default 10000
     */
    timeout?: number;
}

/**
 * @description These options are derived from RequestOptions
 */
export interface HttpOptions {
    hostname: string;
    port: string;
    path: string;
    headers: any;
    auth?: any;
    method: string;
    key?: any;
    cert?: any;
    passphrase?: string;
    body?: any;
    duration?: number;
}

/**
 * @description Supported HTTP methods
 */
export enum Method {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
}

/**
 * @description Basic authentication
 */
export interface Auth {
    username: string;
    password: string;
}

/**
 * @description SSL cert information
 */
export interface ClientCert {
    certificate: Buffer;
    key: Buffer;
    passphrase: string;
}

/**
 * @description Logic for when a request should be retried
 */
export interface RetryLogic {
    retryLimit: number;
    retryCondition: string;
}

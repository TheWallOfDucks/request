/**
 * Request parameters that are used to build HttpOptions
 */
export interface RequestOptions {
    /** HTTP verb. Defaults to get */
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS',
    /** URL to send request to */
    url: string,
    /** Request body */
    body?: any,
    /** Query parameters */
    parameters?: any,
    /** Request headers */
    headers?: any,
    /** Basic authorization to include with request */
    auth?: { username: string, password: string },
    /** Key required for request */
    key?: string,
    /** Certificate required for request */
    cert?: string,
    /** Passphrase for certificate */
    passphrase?: string,
    /** Content-Type to send with request */
    contentType?: string,
    /** If true it will only return the response body. Defaults to false */
    resolveWithBodyOnly?: boolean,
    /** If true it will reject any request that returns a non-2xx status code. Defaults to true */
    rejectNon2xx?: boolean,
    /** If true detailed request/response information will be logged to console. Defaults to false */
    debug?: boolean,
    /** MS to wait for a response to be returned from server. Defaults to 10000 */
    timeout?: number
}

/**
 * These options are derived from RequestOptions
 */
export interface HttpOptions {
    hostname: string,
    port: number,
    path: string,
    headers: object,
    auth?: any,
    method: string,
    key?: any,
    cert?: any,
    passphrase?: string,
    body?: any
}

export enum Method {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
}

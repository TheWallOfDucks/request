/**
 * @description Response structure
 */
export interface Response {
    /**
     * @description Status code returned by server
     */
    statusCode?: number;

    /**
     * @description Response body
     */
    body: any;

    /**
     * @description Response headers
     */
    headers?: any;
}

export interface ErrorResponse extends Response {
    message: string;
}

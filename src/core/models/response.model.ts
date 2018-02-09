export interface Response {
    /** Status code returned by server */
    statusCode: number,
    /** Response body */
    body: any,
    /** Request duration */
    duration: number
}

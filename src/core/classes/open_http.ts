import { OpenRequest } from '../classes/open_request';
import { RequestOptions, Method } from '../models/request.model';
import { Response } from '../models/response.model';

export class OpenHttp {
    /**
     * @description Performs an HTTP DELETE operation
     * @param  {RequestOptions} options
     * @returns Promise
     */
    protected async delete(options: RequestOptions): Promise<Response> {
        options.method = Method.DELETE;

        try {
            const request = new OpenRequest(options);
            const response = await request.execute();

            return response;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @description Performs an HTTP GET operation
     * @param  {RequestOptions} options
     * @returns Promise
     */
    protected async get(options: RequestOptions): Promise<Response> {
        options.method = Method.GET;

        try {
            const request = new OpenRequest(options);
            const response = await request.execute();

            return response;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @description Performs an HTTP PATCH operation
     * @param  {RequestOptions} options
     * @returns Promise
     */
    protected async patch(options: RequestOptions): Promise<Response> {
        options.method = Method.PATCH;

        try {
            const request = new OpenRequest(options);
            const response = await request.execute();

            return response;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @description Performs an HTTP POST operation
     * @param  {RequestOptions} options
     * @returns Promise
     */
    protected async post(options: RequestOptions): Promise<Response> {
        options.method = Method.POST;

        try {
            const request = new OpenRequest(options);
            const response = await request.execute();

            return response;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @description Performs an HTTP PUT operation
     * @param  {RequestOptions} options
     * @returns Promise
     */
    protected async put(options: RequestOptions): Promise<Response> {
        options.method = Method.PUT;

        try {
            const request = new OpenRequest(options);
            const response = await request.execute();

            return response;
        } catch (error) {
            throw new Error(error);
        }
    }
}

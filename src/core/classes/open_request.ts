import { RequestOptions } from '../models/request.model';
import { Request } from './request';
import { Utility } from './utility';

export class OpenRequest extends Request {
    /**
     * @param {RequestOptions} options
     */
    constructor(options: RequestOptions) {
        super(options);
        /**
         * @todo Overriding the default to account for the cold start issue. Remove this when it is fixed
         */
        this.timeout = 45000;
        const conditions = Utility.populateRetryConditions(`response.statusCode.toString().charAt(0) === '5'`, 3);
        this.retryConditions = this.retryConditions.concat(conditions);
    }
}

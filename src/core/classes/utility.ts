import * as fs from 'fs';
export class Utility {
    /**
     * @description Generates a random UUID
     * @returns String
     */
    static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            // tslint:disable-next-line:one-variable-per-declaration
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * @description Sleeps
     * @param {number} ms
     * @returns Promise
     */
    static sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * @description Populates an array with retry conditions
     * @param {string} condition
     * @param {number} retryLimit
     * @returns string[]
     */
    static populateRetryConditions(condition: string, retryLimit: number): string[] {
        const conditions: string[] = [];
        for (let i = 0; i < retryLimit; i++) {
            conditions.push(condition);
        }
        return conditions;
    }

    /**
     * @description Checks if a string is a valid url
     * @param {string} url
     * @returns Boolean
     */
    static isValidUrl(url: string): Boolean {
        const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(url);
    }

    /**
     * @description Returns string extracted between stringStart and stringEnd
     * @param {string} source
     * @param {string} stringStart
     * @param {string} stringEnd
     * @returns string
     */
    static extractString(source: string, stringStart: string, stringEnd: string): string {
        let start = source.indexOf(stringStart);

        if (start === -1) {
            return undefined;
        }

        start += stringStart.length;
        const end = source.indexOf(stringEnd, start);

        return source.slice(start, end);
    }
}

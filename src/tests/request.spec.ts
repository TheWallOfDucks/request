import { OpenRequest } from '../core/classes/open_request';
import { Method } from '../core/models/request.model';
import { Utility } from '../core/classes/utility';
import * as fs from 'fs';
import * as FormData from 'form-data';

describe('Request', () => {
    const util = new Utility();
    let petId: string;

    it('should support requests using the OpenRequest class', async done => {
        const url: string = 'https://jsonplaceholder.typicode.com/comments';

        try {
            const request = new OpenRequest({ url });
            const response = await request.execute();

            expect(response.statusCode).toEqual(200);
        } catch (error) {
            fail(error);
        }

        done();
    });

    it('should return an object with a response body, status code, and headers', async done => {
        const url: string = 'https://jsonplaceholder.typicode.com/comments';

        try {
            const request = new OpenRequest({ url });
            const response = await request.execute();

            expect(Object.keys(response)).toEqual(['statusCode', 'body', 'headers']);
        } catch (error) {
            fail(error);
        }

        done();
    });

    it('should support query parameters', async done => {
        const url: string = 'https://jsonplaceholder.typicode.com/comments';
        const parameters: object = { postId: 1 };

        try {
            const request = new OpenRequest({ url, parameters });
            const response = await request.execute();

            response.body.forEach(object => {
                expect(object.postId).toEqual(request.parameters.postId);
            });
        } catch (error) {
            fail(error);
        }

        done();
    });

    it('should accept XML and return a JSON object', async done => {
        const body: string = `<?xml version="1.0" encoding="UTF-8"?>
                        <Pet>
                            <id>0</id>
                            <Category>
                                <id>0</id>
                                <name>string</name>
                            </Category>
                            <name>Doggo</name>
                            <photoUrl>
                                <photoUrl>string</photoUrl>
                            </photoUrl>
                            <tag>
                                <Tag>
                                    <id>0</id>
                                    <name>string</name>
                                </Tag>
                            </tag>
                            <status>available</status>
                        </Pet>`;
        const url: string = 'http://petstore.swagger.io/v2/pet';
        const headers: object = { Accept: 'application/xml', 'Content-Type': 'application/xml' };

        try {
            const request = new OpenRequest({ method: Method.POST, url, body, headers });
            const response = await request.execute();
            petId = response.body.Pet.id;

            expect(response.statusCode).toEqual(200);
            expect(typeof response).toEqual('object');
            expect(petId).toBeDefined();
        } catch (error) {
            fail(error);
        }

        done();
    });

    it('should only return the body if resolveWithBodyOnly = true', async done => {
        const body: object = {
            id: 0,
            category: {
                id: 0,
                name: 'string',
            },
            name: 'Doggo',
            photoUrls: ['string'],
            tags: [
                {
                    id: 0,
                    name: 'string',
                },
            ],
            status: 'available',
        };
        const url: string = 'http://petstore.swagger.io/v2/pet';

        try {
            const request = new OpenRequest({ method: Method.POST, url, body, resolveWithBodyOnly: true });
            const response = await request.execute();

            expect(response.statusCode).not.toBeDefined();
        } catch (error) {
            fail(error);
        }

        done();
    });

    it('should upload multipart form data', async done => {
        const filePath = 'src/tests/docs/image.png';
        const url = `http://petstore.swagger.io/v2/pet/${petId}/uploadImage`;

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const request = new OpenRequest({ method: Method.POST, url, formData });
            const response = await request.execute();

            expect(response.statusCode).toBe(200);
        } catch (error) {
            fail(error);
        }

        done();
    });

    it('should default to rejecting non 2xx status codes', async done => {
        const url = 'http://petstore.swagger.io/v2/pet/garbageId';
        const headers: object = { Accept: 'application/xml' };

        // Default behavior
        try {
            const request = new OpenRequest({ url, headers });
            const response = await request.execute();
        } catch (error) {
            error = JSON.parse(error);
            expect(error.statusCode.toString().charAt(0)).not.toBe('2');
        }

        // Overriding default behavior to allow return of non-200 status codes
        try {
            const request = new OpenRequest({ url, rejectNon2xx: false, headers });
            const response = await request.execute();

            expect(response.statusCode.toString().charAt(0)).not.toEqual('2');
        } catch (error) {
            fail(error);
        }

        done();
    });

    it('should allow for debugging', async done => {
        const body: object = {
            id: 0,
            category: {
                id: 0,
                name: 'string',
            },
            name: 'Dog',
            photoUrls: ['string'],
            tags: [
                {
                    id: 0,
                    name: 'string',
                },
            ],
            status: 'available',
        };
        const url: string = 'http://petstore.swagger.io/v2/pet';
        spyOn(console, 'log');

        try {
            const request = new OpenRequest({ method: Method.POST, url, body, debug: true });
            await request.execute();

            expect(console.log).toHaveBeenCalledWith(request.debugInfo);
        } catch (error) {
            fail(error);
        }

        done();
    });

    it(
        'should automatically retry requests when it a 5xx status is received',
        async done => {
            const url: string = 'https://httpstat.us/502';

            try {
                const request = new OpenRequest({ url, rejectNon2xx: false });
                const response = await request.execute();
                expect(response.statusCode).toBe(502);
            } catch (error) {
                fail(error);
            }

            done();
        },
        10000,
    );

    it(
        'should support timeouts',
        async done => {
            const url = 'https://httpstat.us/200';
            const parameters = { sleep: 10000 };
            const timeout = 5000;

            try {
                const request = new OpenRequest({ url, timeout, parameters });
                await request.execute();
            } catch (error) {
                expect(error.message).toEqual(`Timed out waiting for response after ${timeout / 1000} seconds`);
            }

            done();
        },
        20000,
    );

    it(
        'should allow for custom retry logic to be injected',
        async done => {
            const url = 'http://petstore.swagger.io/v2/pet/garbageId';

            try {
                const request = new OpenRequest({
                    url,
                    rejectNon2xx: false,
                    retryLogic: [
                        { retryLimit: 2, retryCondition: `response.statusCode === 404` },
                        {
                            retryLimit: 2,
                            retryCondition: `JSON.stringify(response.body).includes('java.lang.NumberFormatException')`,
                        },
                    ],
                });
                const response = await request.execute();

                expect(response.body.message).toContain('java.lang.NumberFormatException');
            } catch (error) {
                fail(error);
            }

            done();
        },
        10000,
    );
});

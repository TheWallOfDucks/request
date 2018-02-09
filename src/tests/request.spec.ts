import { promise } from '../core/classes/promise';

describe('request.js', () => {

    it('should support promises', async (done) => {

        const url: string = 'https://jsonplaceholder.typicode.com/comments';

        try {
            const request = new promise({ url });
            const response = await request.execute();

            expect(response.statusCode).toEqual(200);
        } catch (error) {
            fail(error);
        }

        done();

    });

    it('should return an object with a response body, status code, and duration', async (done) => {

        const url: string = 'https://jsonplaceholder.typicode.com/comments';

        try {
            const request = new promise({ url });
            const response = await request.execute();

            expect(Object.keys(response)).toEqual(['statusCode', 'body', 'duration']);
        } catch (error) {
            fail(error);
        }

        done();

    });

    it('should support query parameters', async (done) => {

        const url: string = 'https://jsonplaceholder.typicode.com/comments';
        const parameters: object = { postId: 1 };

        try {
            const request = new promise({ url, parameters });
            const response = await request.execute();

            response.body.forEach((object) => {
                expect(object.postId).toEqual(request.parameters.postId);
            });
        } catch (error) {
            fail(error);
        }

        done();

    });

    it('should accept XML and return a JSON object', async (done) => {

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
        const headers: object = { Accept: 'application/xml' };
        const contentType: string = 'application/xml';

        try {
            const request = new promise({ method: 'POST', url, body, headers, contentType });
            const response = await request.execute();

            expect(response.statusCode).toEqual(200);
            expect(typeof response).toEqual('object');
        } catch (error) {
            fail(error);
        }

        done();

    });

    // @todo I think the petstore API is broken
    xit('can chain multiple requests together', async (done) => {

        const body: object = {
            id: 0,
            category: {
                id: 0,
                name: 'string',
            },
            name: 'Dog',
            photoUrls: [
                'string',
            ],
            tags: [
                {
                    id: 0,
                    name: 'string',
                },
            ],
            status: 'available',
        };
        let url: string = 'http://petstore.swagger.io/v2/pet';
        let petId: string;

        try {
            // Create the pet 
            const createPet = new promise({ method: 'POST', url, body });
            const pet = await createPet.execute();
            petId = pet.body.id;
            expect(petId).toBeDefined();

            // Find the pet
            url = `${url}/${petId}`;
            const findPet = new promise({ url });
            const foundPet = await findPet.execute();
            expect(foundPet.body.id).toEqual(petId);
        } catch (error) {
            fail(error);
        }

        done();

    });

    it('should only return the body if resolveWithBodyOnly = true', async (done) => {

        const body: object = {
            id: 0,
            category: {
                id: 0,
                name: 'string',
            },
            name: 'Dog',
            photoUrls: [
                'string',
            ],
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
            const request = new promise({ method: 'POST', url, body, resolveWithBodyOnly: true });
            const response = await request.execute();

            expect(response.statusCode && response.duration).not.toBeDefined();
        } catch (error) {
            fail(error);
        }

        done();

    });

    it('should default to rejecting non 2xx status codes', async (done) => {

        const url = 'http://petstore.swagger.io/v2/pet/garbageId';

        // Default behavior
        try {
            const request = new promise({ url });
            const response = await request.execute();

        } catch (error) {
            expect(error).toContain('Invalid status code');
        }

        // Overriding default behavior to allow return of non-200 status codes
        try {
            const request = new promise({ url, rejectNon2xx: false });
            const response = await request.execute();

            expect(response.statusCode.toString().charAt(0)).not.toEqual('2');
        } catch (error) {
            fail(error);
        }

        done();

    });

    it('should support timeouts', async (done) => {

        const url = 'http://slowwly.robertomurray.co.uk/delay/10000/url/http://google.co.uk';
        const timeout = 2000;

        try {
            const request = new promise({ url, timeout });
            const response = await request.execute();
        } catch (error) {
            expect(error.message).toEqual(`Timed out waiting for response after ${timeout / 1000} seconds`);
        }

        done();

    }, 10000);

    it('should allow for debugging', async (done) => {

        const body: object = {
            id: 0,
            category: {
                id: 0,
                name: 'string',
            },
            name: 'Dog',
            photoUrls: [
                'string',
            ],
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
            // This will mess up any subsequent calls to console.log, so be sure to delete spy after
            console.log = jasmine.createSpy('debug');
            const request = new promise({ method: 'POST', url, body, debug: true });
            const response = await request.execute();

            expect(console.log).toHaveBeenCalledWith(request.debugInfo);
        } catch (error) {
            fail(error);
        }

        done();

    });

});

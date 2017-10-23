let https = require('../request');

describe('request.js', () => {

    it('should support promises', (done) => {

        let Request = new https.request({ url: 'https://jsonplaceholder.typicode.com/comments' });

        Request.promise()
            .then(response => {
                expect(response.statusCode).toEqual(200);
                done();
            })
            .catch(err => {
                done.fail(err);
            });

    });

    it('should support callbacks', (done) => {

        let Request = new https.request({ url: 'https://jsonplaceholder.typicode.com/comments' });

        Request.callback((err, response) => {
            if (err) { done.fail(err) };

            expect(response.statusCode).toEqual(200);
            done();
        });

    });

    it('should return an object with a response body, status code, and duration', (done) => {

        let Request = new https.request({ url: 'https://jsonplaceholder.typicode.com/comments' });

        Request.promise()
            .then(response => {
                expect(Object.keys(response)).toEqual(['statusCode', 'body', 'duration']);
                done();
            })
            .catch(err => {
                done.fail(err);
            });

    });

    it('should use query parameters', (done) => {

        let Request = new https.request({ url: 'https://jsonplaceholder.typicode.com/comments', parameters: { postId: 1 } });

        Request.promise()
            .then(response => {
                response.body.forEach((object) => {
                    expect(object.postId).toEqual(Request.parameters.postId);
                });
                done();
            })
            .catch(err => {
                done.fail(err);
            });

    });

    it('should accept XML and return a JSON object', (done) => {

        let postBody = `<?xml version="1.0" encoding="UTF-8"?>
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
                        </Pet>`

        let Request = new https.request({ method: 'POST', url: 'http://petstore.swagger.io/v2/pet', body: postBody, headers: { Accept: 'application/xml' }, contentType: 'application/xml' })

        Request.promise()
            .then(response => {
                expect(response.statusCode).toEqual(200);
                expect(typeof response).toEqual('object');
                done();
            })
            .catch(err => {
                done.fail(err);
            });

    });

    it('can chain multiple requests together', (done) => {

        let postBody = {
            "id": 0,
            "category": {
                "id": 0,
                "name": "string"
            },
            "name": "Dog",
            "photoUrls": [
                "string"
            ],
            "tags": [
                {
                    "id": 0,
                    "name": "string"
                }
            ],
            "status": "available"
        };

        let createPet = new https.request({ method: 'POST', url: 'http://petstore.swagger.io/v2/pet', body: postBody });
        let petId;

        createPet.promise()
            .then(response => {
                petId = response.body.id;
                expect(petId).toBeDefined();

                let findPet = new https.request({ url: `http://petstore.swagger.io/v2/pet/${petId}` });

                return findPet.promise();
            })
            .then(response => {
                expect(response.body.id).toEqual(petId);
                done();
            })
            .catch(err => {
                done.fail(err);
            });

    });

    it('should only return the body if resolveWithBodyOnly = true', (done) => {

        let postBody = {
            "id": 0,
            "category": {
                "id": 0,
                "name": "string"
            },
            "name": "Dog",
            "photoUrls": [
                "string"
            ],
            "tags": [
                {
                    "id": 0,
                    "name": "string"
                }
            ],
            "status": "available"
        };

        let Request = new https.request({ method: 'POST', url: 'http://petstore.swagger.io/v2/pet', body: postBody, resolveWithBodyOnly: true });

        Request.promise()
            .then(response => {
                expect(response.statusCode && response.duration).not.toBeDefined();
                done();
            })
            .catch(err => {
                done.fail(err);
            });

    });

    it('should default to rejecting non 2xx status codes', (done) => {

        let Request = new https.request({ url: 'http://petstore.swagger.io/v2/pet/garbageId' });

        Request.promise()
            .then(response => {
                done.fail(response);
            })
            .catch(err => {
                expect(err).toContain('Invalid status code');

                let Request = new https.request({ url: 'http://petstore.swagger.io/v2/pet/garbageId', rejectNon2xx: false });
                return Request.promise()
            })
            .then(response => {
                expect(response.statusCode.toString().charAt(0)).not.toEqual('2');
                done();
            });

    });

});
var https = require('../request');

describe('request.js', () => {

    it('should support promises', (done) => {

        var Request = new https.request('GET', 'https://jsonplaceholder.typicode.com/comments', null, null, null, null, null);

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

        var Request = new https.request('GET', 'https://jsonplaceholder.typicode.com/comments', null, null, null, null, null);

        Request.callback(response => {
            expect(response.statusCode).toEqual(200);
            done();
        });

    });

    it('should return an object with a response body, status code, and duration', (done) => {

        var Request = new https.request('GET', 'https://jsonplaceholder.typicode.com/comments', null, null, null, null, null);

        Request.promise()
            .then(response => {
                expect(Object.keys(response)).toEqual(['statusCode', 'body', 'duration']);
                done();
            })
            .catch(err => {
                done.fail(err);
            });

    });

    it('should accept XML and return a JSON object', (done) => {

        var postBody = `<?xml version="1.0" encoding="UTF-8"?>
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

        var Request = new https.request('POST', 'http://petstore.swagger.io/v2/pet', postBody, null, { Accept: 'application/xml' }, null, 'application/xml');

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

});
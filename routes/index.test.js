const request = require('supertest')
const app = require('../app')
const dbService = require('../services/db.service.js');
const db = require('../db').test;

beforeAll(() => dbService.connectDb(db));

describe('"/multiple" endpoint', () => {
    it('Should response with empty endpoint if no subendpoint used in query params', () => {
        return request(app)
            .get('/multiple')
            .then((res) => {
                expect(res.statusCode).toEqual(200);
                expect(res.body).toStrictEqual({});
            });
    });

    it('Should return data in correct format if single subendpoint request is valid', () => {
        return request(app)
            .get('/multiple?bob=/customers/66')
            .then((res) => {
                expect(res.body).toStrictEqual({ bob: { data: { name: 'Casandra', id: 66, age: 16 } } });
            });
    });

    it('Should return data in correct format if mulptiple subendpoints requests are valid', () => {
        return request(app)
            .get('/multiple?bob=/customers/66&apple=/products/99')
            .then((res) => {
                expect(res.body).toStrictEqual({
                    bob: { data: { name: 'Casandra', id: 66, age: 16 } } ,
                    apple: { data: { name: 'product9', id: 99, price: 33 } }
                });
            });
    });

    it('Should add error with 404 if subendpoint does not exists', () => {
        return request(app)
            .get('/multiple?bob=/nonexistent/22')
            .then((res) => {
                expect(res.body && res.body.bob && res.body.bob.error && res.body.bob.error.status).toEqual(404);
            });
    });

    it('Should add error with 404 if no item with id in collectin', () => {
        return request(app)
        .get('/multiple?bob=/customers/2000')
        .then((res) => {
            expect(res.body && res.body.bob && res.body.bob.error && res.body.bob.error.status).toEqual(404);
        });
    });

    it('Should return 400 if id is not a number', () => {
        return request(app)
            .get('/multiple?bob=/customers/null')
            .then((res) => {
                expect(res.body && res.body.bob && res.body.bob.error && res.body.bob.error.status).toEqual(400);
            });
    });

    it('Should return data in correct format if one subendpoint request is valid and second responded with error', () => {
        return request(app)
            .get('/multiple?bob=/customers/66&apple=/products/null')
            .then((res) => {
                expect(res.body.bob).toStrictEqual({ data: { name: 'Casandra', id: 66, age: 16 } });
                expect(res.body && res.body.apple && res.body.apple.error && res.body.apple.error.status).toEqual(400);
            });
    });

    it('Should return data in correct format if multiple endpoints responded with error', () => {
        return request(app)
            .get('/multiple?bob=/customers/1000&apple=/products/null')
            .then((res) => {
                expect(res.body && res.body.bob && res.body.bob.error && res.body.bob.error.status).toEqual(404);
                expect(res.body && res.body.apple && res.body.apple.error && res.body.apple.error.status).toEqual(400);
            });
    });
})

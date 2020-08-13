const express = require('express');
const router = express.Router();
const db = require('../db').production;
const dbService = require('../services/db.service.js');
const axios = require('axios');

dbService.connectDb(db);

// list of collections from db for dynamic routes creation
const collectionsToCreateAPI = ['customers', 'products'];

// dynamic routes creation
collectionsToCreateAPI.forEach((collectionName) => {
    router.get(`/${collectionName}/:id`, (req, res, next) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
           return res.status(400).send({ message: 'Id should be a number'});
        }

        return dbService.find(collectionName, req.params.id)
            .then((data) => res.send(data))
            .catch((err) => res.status(err.status || 500).send({ message: err.message}));
    });
});

router.get('/multiple', (req, res, next) => {
    const queryKeys = Object.keys(req.query);
    res.setHeader('Content-Type', 'application/json');
    let responseCounter = 0; // needed to understand where our first and last responses happen

    function writeData(data) {
        if (responseCounter === 0) {
            res.write('{');
        }

        if (responseCounter === queryKeys.length - 1) {
            // last response
            res.write(data);
            res.write('}');
            res.end();
        } else {
            res.write(data);
            res.write(',');
        }

        responseCounter += 1;
    }

    if (queryKeys.length === 0) {
        return res.send({});
    }

    for (let i = 0; i < queryKeys.length; i += 1) {
        const name = queryKeys[i];
        let url = req.query[queryKeys[i]];

        if (url[0] !== '/') {
            url = '/' + req.query[queryKeys[i]];
        }

        axios.get(`http://localhost:${process.env.PORT || '3000'}${url}`)
            .then(axiosRes => {
                const responseData = `"${name}": { "data": ${JSON.stringify(axiosRes.data)} }`;

                writeData(responseData);
            })
            .catch(err => {
                let error = null;
                if (err.response) { // response error
                    error = `"${name}":  { "error": { "status": ${err.response.status}, "message": "${err.response.data.message}" } }`;
                } else { // code error
                    error = `"${name}": { "error": { "status": 500, "message": "${err.message}" } }`;
                }

                writeData(error);
            });
    }
});

module.exports = router;

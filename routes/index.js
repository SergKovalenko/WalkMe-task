const express = require('express');
const router = express.Router();
const db = require('../services/db.service.js');
const axios = require('axios');

// list of collections from db for dynamic routes creation
const collectionsToCreateAPI = ['customers', 'products'];

// dynamic routes creation
collectionsToCreateAPI.forEach((collectionName) => {
    router.get(`/${collectionName}/:id`, (req, res, next) => {
        return db.find(collectionName, req.params.id)
            .then((data) => res.send(data))
            .catch((err) => {
                res.status(err.status || 500).send({ message: err.message});
            });
    });
});

router.get('/multiple', (req, res, next) => {
    const queryKeys = Object.keys(req.query);
    res.setHeader('Content-Type', 'application/json');
    let responseCounter = 0;

    function writeData(data) {
        console.log(data)
        console.log(responseCounter)
        if (responseCounter === 0) {
            res.write('{')
        }

        if (responseCounter === queryKeys.length - 1) {
            res.write(data);
            res.write('}')
            res.end();
        } else {
            res.write(data);
            res.write(',')
        }

        responseCounter += 1;
    }

    for (let i = 0; i < queryKeys.length; i += 1) {
        const name = queryKeys[i];
        const url = req.query[queryKeys[i]];
        console.log(url)
        axios.get(`http://localhost:3000${url}`)
            .then(axiosRes => {
                const responseData = `${name}: { data: ${JSON.stringify(axiosRes.data)} }`;

                writeData(responseData);
            })
            .catch(err => {
                let error = null;
                if (err.response) {
                    error = `${name}:  { error: { status: ${err.response.status}, message: ${err.response.data.message} } }`;
                } else {
                    error = `${name}: { error: { status: '500', message: ${err.message} } }`;
                }

                writeData(error);
            });
    }
});

module.exports = router;

const db = require('../db');

// find item by id in DB... sort of
function find(collectionName, id) {
    return new Promise((resolve, reject) => {
        if (!db[collectionName]) {
            return reject({ status: 404, message: `Collection ${collectionName} does not exists` });
        }
        
        let dataItem = null;
        
        for (let i = 0; i < db[collectionName].length; i += 1) {
            if (db[collectionName][i].id === parseInt(id)) {
                dataItem = db[collectionName][i];
                break;
            }
        }

        return dataItem ? resolve(dataItem) : reject({ status: 404, message: 'Item with this id does not exists' });
    });
}

module.exports = { find };

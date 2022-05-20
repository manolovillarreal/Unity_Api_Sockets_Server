const fs = require("fs")
const { uid } = require('uid');


class Model {

    constructor(modelName) {
        this.name = modelName;
        this.collection = modelName + 's';
    }

    async find(query) {
        const documents = await loadCollection(this.collection);
        if (query) {
            documents = documents.filter(u => matchByKeys(u, query));
        }
        return documents;
    }
    async findOne(query) {
        const documents = await loadCollection(this.collection);
        let doc = documents.find(u => matchByKeys(u, query));
        return doc;
    }
    async findById(id) {
        const documents = await loadCollection(this.collection);
        let doc = documents.find(u => u._id == id);
        return doc;
    }

    async save(doc) {
        console.log("Goin to save " + this.name + " in " + this.collection + " collections");
        let obj = await saveCollection(this.collection, doc);
        return obj;
    }
}

const loadCollection = async(collectionName) => {
    let collection = [];
    try {
        collection = require(`./db/${collectionName}.json`);
    } catch (error) {

    }

    return collection;
}
const saveCollection = (collectionName, doc) => {
    return new Promise(async(resolve, reject) => {
        let collection = await loadCollection(collectionName);
        doc = { _id: uid(16), ...doc }
        collection.push(doc);
        let data = JSON.stringify(collection);
        console.log(__dirname);
        fs.writeFile(`./jsonDB/db/${collectionName}.json`, data, (err) => {
            if (err) {
                console.log(err.message);
                collection.pop();
                reject(`Error guardando el archivo ${collectionName}.json`);
            } else {
                console.log("Save OK");
                resolve(doc);
            }
        });
    })

}

const matchByKeys = (obj, query) => {
    let match = true;
    for (const key in query) {
        if (query[key] != obj[key])
            match = false;
    }

    return match;
}

module.exports = Model;
const fs = require("fs")
const Model = require('./Model')

const connect = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve() }, 3000);
    })
}

const Schema = (schemaObject) => {

    return schemaObject;

}
const model = (modelName, schema) => {
    return new Model(modelName);
}







module.exports = {
    connect,
    Schema,
    model,
}
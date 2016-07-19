/* global require */
'use strict';
var _ = require('lodash');
var data = require('./data_helper')();
var jsonfile = require('jsonfile');

var properties = [
    'establecimiento',
    'rubro',
    'servicio',
    'direccion',
    'colonia',
    'municipio',
    'cp',
    'estado',
    'telefono',
    'descuento'
];

function app() {

    var marshall = function() {
        var transformedData = [];

        if (!_.isEmpty(data)) {
            console.log('Data is not empty');
            _.forEach(data, function(provider, key) {
                if (_.has(provider, '_aData')) {
                    var arrayData = provider._aData;
                    var providerObject = {};

                    _.forEach(arrayData, function(propertyValue, key) {
                        var property = properties[key];
                        providerObject[property] = propertyValue;
                    });

                    transformedData.push(providerObject);
                }
            });
        }
        console.log(transformedData.length);
        // writeJsonFile(transformedData);
        return transformedData;
    };

    var writeJsonFile = function(data) {
        var file = './data.json';

        jsonfile.writeFile(file, data, {spaces: 4}, function(err) {
            console.error(err);
        });
    };



    return {
        marshall: marshall,
        writeJsonFile: writeJsonFile
    };
}

module.exports = app;
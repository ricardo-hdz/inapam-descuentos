/* global require */
'use strict';
var _ = require('lodash');
var data = require('./data_helper')();
var jsonfile = require('jsonfile');
var officialStates = require('./data_state_helper');

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
    var stateNames = [];
    var dataStates = {};

    var marshall = function() {
        var transformedData = [];


        var dataCities = {};

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

                    var city = providerObject['municipio'];
                    if (!_.has(dataCities, city)) {
                        dataCities[city] = [];
                    }


                    addStates(providerObject);



                    dataCities[city].push(providerObject);

                    transformedData.push(providerObject);
                }
            });
        }
        console.log(transformedData.length);
        writeJsonFile(transformedData, 'data');
        writeJsonFile(dataStates, 'dataStates');
        writeJsonFile(dataCities, 'dataCities');
        writeJsonFile(_.orderBy(stateNames, 'desc'), 'stateNames');
        return transformedData;
    };

    var addStates = function(providerObject) {
        var state = providerObject['estado'].toLowerCase();
        var states = extractStates(state);
        _.forEach(states, function(stateName) {
            if ('guadalajara' == stateName) {
                stateName = 'jalisco';
            }
            if ('monterrey' == stateName) {
                stateName = 'nuevo leon';
            }
            if ('pachuca' == stateName) {
                stateName = 'hidalgo';
            }

            // If state is not offical, pot provider under nacional
            if (_.indexOf(officialStates, stateName) === -1) {
                stateName = 'nacional';
            }

            if (!_.has(dataStates, stateName)) {
                dataStates[stateName] = [];
            }
            dataStates[stateName].push(providerObject);
            if (_.indexOf(stateNames, stateName) === -1) {
                stateNames.push(stateName);
            }
        });
    };

    var extractStates = function(stateString) {
        stateString = _.replace(stateString, ' y ', ',');
        stateString = _.replace(stateString, '/', ',');
        var statesSplitComma = _.split(stateString, ',');
        return _.map(statesSplitComma, _.trim);
    };

    var writeJsonFile = function(data, name) {
        var file = './' + name + '.json';

        jsonfile.writeFile(file, data, {spaces: 4}, function(err) {
            console.error(err);
        });
    };

    return {
        marshall: marshall,
        writeJsonFile: writeJsonFile,
        extractStates: extractStates
    };
}

app().marshall();

module.exports = app;
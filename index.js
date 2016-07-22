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
    var dataCities = {};
    var dataStatesCities = {};
    var dataStatesMapping = {};

    var marshall = function() {
        var transformedData = [];
        if (!_.isEmpty(data)) {

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

        writeJsonFile(transformedData, 'data');
        writeJsonFile(dataStates, 'dataStates');
        writeJsonFile(dataCities, 'dataCities');
        writeJsonFile(dataStatesCities, 'dataStatesCities');
        writeJsonFile(dataStatesMapping, 'dataStatesMapping');
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
            if ('baja california norte' == stateName) {
                stateName = 'baja california';
            }

            // If state is not offical, pot provider under nacional

            if (_.indexOf(officialStates, stateName) === -1) {
                stateName = 'nacional';
                providerObject['estado'] = 'nacional';
                providerObject['municipio'] = 'sucursales';
                providerObject['colonia'] = '';
                providerObject['cp'] = '';
                providerObject['direccion'] = '';
            }

            if (!_.has(dataStates, stateName)) {
                dataStates[stateName] = [];
            }

            // Loop through cities to add inside states
            dataStates[stateName].push(providerObject);
            addCityToState(providerObject, stateName);

            // Add state name
            if (_.indexOf(stateNames, stateName) === -1) {
                stateNames.push(stateName);
            }
        });
        return stateNames;
    };

    var addCityToState = function(providerObject, stateName) {
        // if (stateName === 'sucursales') {
        //     if (!_.has(dataStatesCities, stateName)) {
        //         dataStatesCities[stateName] = [];
        //         dataStatesMapping[stateName] = [];
        //     }
        //     dataStatesCities[stateName].push(providerObject);

        // } else {
            var city = providerObject['municipio'].toLowerCase();
            if (!_.has(dataStatesCities, stateName)) {
                dataStatesCities[stateName] = {};
                dataStatesMapping[stateName] = [];
            }
            if (!_.has(dataStatesCities[stateName], city)) {
                dataStatesCities[stateName][city] = [];
                dataStatesMapping[stateName].push(city);
            }
            dataStatesCities[stateName][city].push(providerObject);
        // }
    };

    var extractStates = function(stateString) {
        // stateString = stateString.replace(/\ / /g, ',');
        var regex = new RegExp(' / ', 'g');
        stateString = stateString.replace(regex, ',');

        // stateString = stateString.replace(/ y /g, ',');
        regex = new RegExp(' y ', 'g');
        stateString = stateString.replace(regex, ',');
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
        extractStates: extractStates,
        addStates: addStates
    };
}

app().marshall();

module.exports = app;
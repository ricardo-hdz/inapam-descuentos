/* global require */
'use strict';
var _ = require('lodash');
var rawData = require('./data_helper')();
var jsonfile = require('jsonfile');
var writefile = require('writefile');
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
    var rubros = [];
    var dataStates = {};
    var dataCities = {};
    var dataStatesCities = {};
    var dataStatesMapping = {};

    var marshall = function(data) {
        var transformedData = [];
        if (!_.isEmpty(data)) {
            _.forEach(data, function(provider, key) {
                if (_.has(provider, '_aData')) {
                    var arrayData = provider._aData;
                    var providerObject = {};

                    _.forEach(arrayData, function(propertyValue, key) {
                        var property = properties[key];

                        if (property === 'descuento' ) {
                            providerObject[property] = propertyValue;
                        } else {
                            var propertyString = _.lowerCase(propertyValue);
                            if (propertyString === 'n e') {
                                propertyString = 'No Disponible';
                            }
                            propertyString = _.startCase(propertyString);

                            providerObject[property] = propertyString;
                        }
                    });

                    var city = providerObject['municipio'];
                    if (!_.has(dataCities, city)) {
                        dataCities[city] = [];
                    }

                    var rubro = providerObject['rubro'];
                    if (_.indexOf(rubros, rubro) === -1) {
                        rubros.push(rubro);
                    }

                    addStates(providerObject);
                    verifyServicesAndIndustry(providerObject);
                    dataCities[city].push(providerObject);
                    transformedData.push(providerObject);
                } else {
                    console.log('Object missing _aData');
                }
            });
        } else {
            console.log('data is isEmpty');
        }

        // Write files
        writeFile(transformedData, 'data', './', 'json');
        writeFile(dataStates, 'dataStates', './', 'json');
        writeFile(dataCities, 'dataCities', './', 'json');
        writeFile(dataStatesCities, 'dataStatesCities', './', 'json');
        writeFile(dataStatesMapping, 'dataStatesMapping', './', 'json');
        writeFile(_.orderBy(stateNames, 'desc'), 'stateNames', './', 'json');
        writeFile(_.orderBy(rubros, 'desc'), 'rubros', './', 'json');

        constructStateCitiesXmlFile(dataStatesMapping);
        return transformedData;
    };

    var verifyServicesAndIndustry = function(providerObject) {
        var rubro = providerObject['rubro'];
        var servicio = providerObject['servicio'];

        if (rubro.indexOf(servicio) > -1) {
            providerObject['rubro'] = rubro.replace(servicio, '');
        }
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
                providerObject['estado'] = 'A Nivel Nacional';
                providerObject['municipio'] = 'Sucursales';
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
            var city = providerObject['municipio'].toLowerCase();
            if (city === 'n/e') {
                city = 'sucursales';
            }
            city = city.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
            if (!_.has(dataStatesCities, stateName)) {
                dataStatesCities[stateName] = {};
                dataStatesMapping[stateName] = [];
            }
            if (!_.has(dataStatesCities[stateName], city)) {
                dataStatesCities[stateName][city] = [];
                if (city !== 'no disponible') {
                    dataStatesMapping[stateName].push(_.startCase(city));
                }
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

    var writeFile = function(data, name, location, extension) {
        var file = location + name + '.' + extension;

        jsonfile.writeFile(file, data, {spaces: 4}, function(err) {
            console.error(err);
        });
    };

    var constructStateCitiesXmlFile = function(dataStatesMapping) {
        var xmlHeader = '<?xml version="1.0" encoding="utf-8"?>' +
            '<resources>';

        var xmlFooter = '</string-array>' +
            '</resources>';

        var xmlItems = '';
        var stateName;
        var xmlArrayHeader = '';
        var regex = new RegExp(' ', 'g');

        _.forEach(dataStatesMapping, function(objectCities, state) {
            stateName = state;
            if (!_.isEmpty(objectCities)) {

                stateName = stateName.replace(regex, '_');
                xmlArrayHeader = '<string-array name="' + stateName + '_array' + '">';
                xmlItems = '';
                _.forEach(objectCities, function(city, index) {
                    xmlItems = xmlItems + '<item>' + city + '</\item>';
                });
            }
            var xml = xmlHeader + xmlArrayHeader + xmlItems + xmlFooter;

            writefile('./state-cities-xml/' + stateName + '.xml', xml);
        });


        return xmlItems;
    };

    return {
        marshall: marshall,
        writeFile: writeFile,
        extractStates: extractStates,
        addStates: addStates,
        constructStateCitiesXmlFile: constructStateCitiesXmlFile
    };
}

app().marshall(rawData);

module.exports = app;
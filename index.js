/* global require */
'use strict';
var _ = require('lodash');
var data = require('./data_helper')();

function transformHelper() {
    var transformedData = {};
    if (!_.isEmpty(data)) {
        _.forEach(data, function(provider, key) {

        });
    }
    return transformedData;
}

module.exports = transformHelper;

/* global describe, require, it */
'use strict';

var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var assert = chai.assert;
// var logicHelper = require('../logicHelper')();
// var errorMessages = require('../errorMessages')();
chai.config.includeStack = true;
var data = require('../index')();

describe('Inapam Discounts', function() {
    it('Should contain data for providers', function() {
        expect(data).to.not.be.empty;
    });
    it('Should correct structure for provider', function() {
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

        _.forEach(properties, function(property, key) {
            assert.property(data[0], property);
        });
    });
});
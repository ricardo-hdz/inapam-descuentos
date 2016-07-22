
/* global describe, require, it */
'use strict';

var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var assert = chai.assert;
chai.config.includeStack = true;
var app = require('../index')();

describe('Inapam Discounts', function() {
    var data = app.marshall();

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

    describe('Add states', function() {
        it('Should add all incorrect states', function() {
            var providerObject = {
                'estado': 'guadalajara, monterrey, pachuca, baja california norte, random'
            };
            // expect(app.addStates(providerObject)).to.deep.equal(['jalisco', 'nuevo leon', 'hidalgo', 'baja california', 'nacional']);
        });
    });

    describe('Extract states logic', function() {
        it('should extract states of single state', function() {
            var states = 'state';
            expect(app.extractStates(states)).to.deep.equal(['state']);
        });

        it('should extract states of multiple state', function() {
            var states = 'DISTRITO FEDERAL     , PACHUCA, ESTADO DE MEXICO, QUERETARO';
            expect(app.extractStates(states)).to.deep.equal(['DISTRITO FEDERAL', 'PACHUCA', 'ESTADO DE MEXICO', 'QUERETARO']);
        });

        it('should extract states of multiple state with y', function() {
            var states = 'DISTRITO FEDERAL y PACHUCA y ESTADO DE MEXICO y QUERETARO';
            expect(app.extractStates(states)).to.deep.equal(['DISTRITO FEDERAL', 'PACHUCA', 'ESTADO DE MEXICO', 'QUERETARO']);
        });

        it('should extract states of multiple state with /', function() {
            var states = 'DISTRITO FEDERAL / PACHUCA / ESTADO DE MEXICO / QUERETARO';
            expect(app.extractStates(states)).to.deep.equal(['DISTRITO FEDERAL', 'PACHUCA', 'ESTADO DE MEXICO', 'QUERETARO']);
        });
    });
});
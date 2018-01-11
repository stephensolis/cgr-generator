'use strict';

var cgr = require('../lib/cgr');
var expect = require('chai').expect;

describe('cgr', function () {
	var seq = 'ATCGTT??ACGT';

	it('is correct using default order', function () {
		expect(Array.from(cgr(seq, 2))).to.eql([0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 2, 0, 1, 1, 1]);
	});
	it('is correct using custom order', function () {
		expect(Array.from(cgr(seq, 2, 'CATG'))).to.eql([0, 1, 1, 1, 0, 0, 0, 2, 1, 1, 0, 0, 0, 0, 2, 0]);
	});
	it('is correct for an empty string', function () {
		expect(Array.from(cgr('', 4))).to.eql(Array(256).fill(0));
	});

	it('throws an error when k is too large or too small', function () {
		expect(() => cgr(seq, 0)).to.throw(Error, 'k must be between 1 and 16');
		expect(() => cgr(seq, 17)).to.throw(Error, 'k must be between 1 and 16');
	});
	it('throws an error when order does not have 4 entries', function () {
		expect(() => cgr(seq, 1, 'XX')).to.throw(Error, 'order must have 4 elements');
	});
});

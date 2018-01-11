'use strict';

module.exports = function cgr(seq, k, order = 'ACGT') {
	if (k < 1 || k > 16) {
		throw new Error('k must be between 1 and 16');
	} else if (order.length !== 4) {
		throw new Error('order must have 4 elements');
	}

	var result = new Uint32Array(1 << (2 * k)); // size 4^k

	var x = (1 << (k - 1)); //x = 2^(k-1)
	var y = (1 << (k - 1)); //y = 2^(k-1)

	for (var i = 0; i < seq.length; i++) {
		//skip sequence entries not in order
		if (seq[i] !== order[0] && seq[i] !== order[1] && seq[i] !== order[2] && seq[i] !== order[3]) {
			continue;
		}

		x >>= 1; //x /= 2
		if (seq[i] === order[2] || seq[i] === order[3]) {
			x |= (1 << (k - 1)); //x += 2^(k-1)
		}

		y >>= 1; //y /= 2
		if (seq[i] === order[0] || seq[i] === order[3]) {
			y |= (1 << (k - 1)); //y += 2^(k-1)
		}

		if (i >= k - 1) {
			result[(y << k) | x]++; //result[(2^k)*y + x]++
		}
	}

	return result;
};

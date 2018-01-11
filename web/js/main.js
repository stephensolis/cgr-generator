'use strict';

const ui = require('./ui');
const cgr = require('cgr');

function make_ncbi_url(id) {
	return `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${id}&rettype=fasta&retmode=text`;
}

function fetch_with_cors(url, response_type, callback) {
	var req = new XMLHttpRequest();
	req.open('GET', `https://cors-anywhere.herokuapp.com/${url}`);
	req.responseType = response_type;
	req.onload = () => callback(req.response);
	req.send();
}

function fasta_to_seq(str) {
	var result = '';
	str.split('\n').forEach(function (line) {
		if (line && line[0] !== '>') {
			result += line.trim();
		}
	});
	return result;
}

function binary_to_abcd(order) {
	return function (buffer) {
		const array = new Uint8Array(buffer);
		var result = '';

		const char_mapping = $.extend.apply(this, order.map((x, i) => ({ [parseInt(x, 2)]: 'ABCD'[i] })));
		array.forEach(function (val) {
			for (var i = 3; i >= 0; i--) {
				result += char_mapping[(val >>> (2 * i)) & 0b11];
			}
		});

		return result;
	};
}

$(function () {
	ui.setup_ui();

	$('#save_image').click(function () {
		const data = $('#cgr_plot')[0].toDataURL('image/png');
		this.href = data;
	});

	$('#do_plot').click(function () {
		//fetch input modes
		const input_data_type = $('#input_data_type_toggles > .active > input').val();
		const input_source = $(`#${input_data_type}_input_source_toggles > .active > input`).val();

		//fetch k and order
		const k = parseInt($('#k_value option:selected').val());
		const order = $('#order_value').val().split(',').map(x => x.trim());

		$('#progress_text').text('').show();

		//check order
		if (new Set(order).size !== 4) {
			$('#progress_text').text('Error: order must be a comma-separated list of 4 unique values');
			return;
		} else if (input_data_type === 'text' && order.some(x => x.length !== 1)) {
			$('#progress_text').text('Error: all entries of order must be single characters');
			return;
		} else if (input_data_type === 'binary' &&
				order.some(x => x !== '00' && x !== '01' && x !== '10' && x !== '11')) {
			$('#progress_text').text('Error: entries of order must be either 00, 01, 10, or 11');
			return;
		}

		//get canvas
		const canvas = $('#cgr_plot')[0];
		const ctx = canvas.getContext('2d');

		//set canvas dimensions
		const cgr_size = 1 << k;
		canvas.width = cgr_size;
		canvas.height = cgr_size;

		//figure out how sequence data should be read
		const preprocess_fn = (input_data_type === 'text') ? fasta_to_seq : binary_to_abcd(order);
		//binary_to_abcd normalizes the string to always have order ABCD
		const compute_order = (input_data_type === 'text') ? order : 'ABCD';

		function do_cgr_plot(str) {
			$('#progress_text').append(' done. ');

			//compute CGR
			$('#progress_text').append('Computing CGR...');
			const cgr_result = cgr(preprocess_fn(str), k, compute_order);
			$('#progress_text').append(' done. ');

			//draw
			$('#progress_text').append('Drawing...');
			const image_data = ctx.createImageData(cgr_size, cgr_size);
			const data = image_data.data;
			for (var i = 0; i < cgr_result.length; i++) {
				const pixel_value = (cgr_result[i] === 0) ? 255 : 0;
				data[(i * 4)] = pixel_value;
				data[(i * 4) + 1] = pixel_value;
				data[(i * 4) + 2] = pixel_value;
				data[(i * 4) + 3] = 255;
			}
			ctx.putImageData(image_data, 0, 0);
			$('#progress_text').append(' done.');
		}

		//fetch sequence
		try {
			$('#progress_text').append('Retrieving sequence...');
			if (input_source === 'textfield') {
				do_cgr_plot($('#textfield_input').val());
			} else if (input_source === 'local_file') {
				const files = $('#local_file_input').prop('files');
				if (!files.length) {
					$('#progress_text').text('Error: you must select a file');
					return;
				}

				var reader = new FileReader();
				reader.onload = () => do_cgr_plot(reader.result);
				if (input_data_type === 'text') {
					reader.readAsText(files[0]);
				} else if (input_data_type === 'binary') {
					reader.readAsArrayBuffer(files[0]);
				}
			} else if (input_source === 'url') {
				fetch_with_cors($('#text_line_input').val(),
					(input_data_type === 'text') ? 'text' : 'arraybuffer', do_cgr_plot);
			} else if (input_source === 'ncbi') {
				fetch_with_cors(make_ncbi_url($('#text_line_input').val()), 'text', do_cgr_plot);
			}
		} catch (e) {
			$('#progress_text').text(`Error: ${e}`);
		}
	});
});

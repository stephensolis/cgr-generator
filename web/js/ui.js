'use strict';

module.exports = {
	setup_ui: function () {
		$('#text_alphabet_toggle').change(function () {
			$('#text_input_source_toggles').parent().show();
			$('#binary_input_source_toggles').parent().hide();

			$('#textfield_toggle')
				.trigger('change')
				.parent().click();

			$('#order_value').val('A,C,G,T');
		});
		$('#binary_data_toggle').change(function () {
			$('#text_input_source_toggles').parent().hide();
			$('#binary_input_source_toggles').parent().show();

			$('#binary_file_toggle')
				.trigger('change')
				.parent().click();

			$('#order_value').val('00,01,10,11');
		});

		$('#textfield_toggle').change(function () {
			$('#textfield_input').show();
			$('#local_file_input').hide();
			$('#text_line_input').hide();
			$('#input_source_description').text('Sequence:');
		});
		$('#text_file_toggle, #binary_file_toggle').change(function () {
			$('#textfield_input').hide();
			$('#local_file_input').show();
			$('#text_line_input').hide();
			$('#input_source_description').text('File:');
		});
		$('#text_url_toggle, #binary_url_toggle').change(function () {
			$('#textfield_input').hide();
			$('#local_file_input').hide();
			$('#text_line_input').show().attr('placeholder', '');
			$('#input_source_description').text('URL:');
		});
		$('#ncbi_toggle').change(function () {
			$('#textfield_input').hide();
			$('#local_file_input').hide();
			$('#text_line_input').show().attr('placeholder', 'eg. NC_012920');
			$('#input_source_description').text('NCBI ID:');
		});

		for (var k = 1; k <= 16; k++) {
			$('#k_value').append($('<option>', {
				value: k,
				text: k,
				selected: k === 9
			}));
		}
	}
};

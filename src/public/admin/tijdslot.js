var API_ENDPOINT = API_URL + 'tijdslot/';

var index = function () {
    $.get(API_ENDPOINT, function (raw) {
        $('#datatable tbody').empty();

        $.each(raw.data, function (index, data) {
            var einduur = ((data.startuur < 24) ? data.startuur + 1 : 1);
            var html = '<tr data-id="' + data.id + '">';
            html += '<td>' + ((data.startuur < 10) ? "0" + data.startuur : data.startuur) + 'u00 - ' + ((einduur < 10) ? "0" + einduur : einduur) + 'u00 </td>';
            html += '<td>';
            html += '<input type="hidden" id="gewicht-' + data.id + '" value="' + data.gewicht + '">';
            html += '<div id="slider-' + data.id + '" class="slider"><div id="sliderhandle-' + data.id + '" class="ui-slider-handle"></div></div>';
            html += '</td>';
            html += '</tr>';

            $('#datatable tbody').append(html);
            var handle = $('#sliderhandle-' + data.id);
            $('#slider-' + data.id).slider({
                value: data.gewicht,
                min: 0,
                max: 5,
                step: 1,
                create: function () {
                    handle.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    handle.text(ui.value);
                    $('#gewicht-' + data.id).val(ui.value);
                },
                stop: function(event, ui) {
                    console.log(ui.value);
                    updateTijdslot(data.id, ui.value);
                }
            });
        });
    }, 'json');
};

var updateTijdslot = function(id, gewicht) {
    $.ajax({
        url: API_ENDPOINT + id,
        type: 'PUT',
        data: {gewicht: gewicht},
        success: function (result) {
            if (result.status) {
                // TODO iets van feedback?
                console.log('saved');
            } else {
                console.log('error');
            }
        }
    });
};

$(document).ready(function () {
    index();
});
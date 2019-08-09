var index = function () {
    $.get(API_URL + 'toestel/', function (raw) {
        $('#datatable tbody').empty();

        $.each(raw.data, function (index, data) {
            var html = '<tr data-id="' + data._id + '">';
            html += '<td>' + data.adres + '</td>';
            html += '<td>' + data.eigenaar + '</td>';
            html += '<td>' + data.score + '</td>';
            html += '</tr>';

            $('#datatable tbody').append(html);
        });
    }, 'json');
};

$(document).ready(function () {
    index();
});
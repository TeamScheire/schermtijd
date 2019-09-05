var index = function () {
    $.get(API_URL + 'scorebord/', function (raw) {
        $('#datatable tbody').empty();
        var i = 1;

        $.each(raw.data, function (index, data) {
            var html = '<tr>';
            html += '<td class="avatar"><span class="ranking">' + i + '</span>';
            html += '<img src="' + data.avatar + '" alt="' + data.eigenaar + '" height="50" width="50" style="border-radius: 50%" />';
            html += data.eigenaar + '</td>';
            html += '<td class="score">' + data.score + '</td>';
            html += '</tr>';

            $('#datatable tbody').append(html);
            i++;
        });
    }, 'json');
};

$(document).ready(function () {
    index();
});
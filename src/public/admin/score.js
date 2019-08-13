var urlParams = new URLSearchParams(location.search);
var API_ENDPOINT = API_URL + 'toestel/' + urlParams.get('toestel_id');

var defaultScore = {
    score: '1',
    bericht: 'goed bezig!'
};

var index = function () {
    $.get(API_ENDPOINT, function (raw) {
        $('#adres').html(raw.data.adres);
        $('#eigenaar').html(raw.data.eigenaar);
        $('#totalescore').html(raw.data.score);
    }, 'json');

    $.get(API_ENDPOINT + '/score/', function (raw) {
        $('#datatable tbody').empty();

        $.each(raw.data, function (index, data) {
            var html = '<tr data-id="' + data.id + '">';
            html += '<td>' + data.score + '</td>';
            html += '<td>' + data.bericht + '</td>';
            html += '<td>' + data.datum + '</td>';
            html += '<td>';
            html += '<a href="#" class="btn btn-danger delete"><i class="fa fa-times-circle"></i> wissen</a>';
            html += '</td>';
            html += '</tr>';

            $('#datatable tbody').append(html);
        });
    }, 'json');
};

var fillDataForm = function (data) {
    $('#score').val((data) ? data.score : '');
    $('#bericht').val((data) ? data.bericht : '');
    $('#errorMessages').html('');
    $('#errorMessages').hide();
};

$(document).ready(function () {
    index();

    $('body').on('click', 'a#newItem', function (e) {
        e.preventDefault();
        $('#dataModalLabel').html('Geef extra punten');
        $('#dataModal form').attr('data-action', 'addBonus');
        fillDataForm(defaultScore);
        $('#dataModal').modal();
    });

    $('body').on('click', 'a#NewMinusItem', function (e) {
        e.preventDefault();
        $('#dataModalLabel').html('Trek punten af');
        $('#dataModal form').attr('data-action', 'addMinus');
        fillDataForm();
        $('#dataModal').modal();
    });

    $('.modal').on('click', '#save', function (e) {
        e.preventDefault();

        var action = $('#dataModal form').attr('data-action');
        if (action == 'addMinus') {
            if ($('#score').val() == parseInt($('#score').val(), 10)) {
                var score = Math.abs($('#score').val()) * -1;
                $('#score').val(score);
            }
        }

        var formData = $("#dataModal form").serializeArray();

        $.post(API_ENDPOINT + '/score/', formData, function (result) {
            if (result.status) {
                $('#dataModal').modal('hide');
                index();
            } else {
                $('#errorMessages').html('Score en bericht zijn verplicht in te vullen. Score moet een cijfer zijn');
                $('#errorMessages').show();
            }
        });
    });

    $('body').on('click', 'a.delete', function (e) {
        e.preventDefault();
        var item = $(this).closest("tr");
        $('#confirm-delete .titleToDelete').attr('data-id', item.attr('data-id'));
        $('#confirm-delete .titleToDelete').html(item.find(">:first-child").html());
        $('#confirm-delete').modal();
    });

    $('.modal').on('click', '#delete', function (e) {
        e.preventDefault();
        var id = $('#confirm-delete .titleToDelete').attr('data-id');
        $.ajax({
            url: API_ENDPOINT + '/score/' + id,
            type: 'DELETE',
            success: function (result) {
                $('#confirm-delete').modal('hide');
                index();
            }
        });
    });
});
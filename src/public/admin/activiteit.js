var API_ENDPOINT = API_URL + 'activiteit/';

var defaultActiviteit = {
    titel: '',
    beschrijving: '',
    aantal_min: 1,
    aantal_max: 8,
    locatie: 'overal',
    tijdstip: 'altijd',
    materiaal: ''
};

var index = function () {
    $.get(API_ENDPOINT, function (raw) {
        $('#datatable tbody').empty();

        $.each(raw.data, function (index, data) {
            var html = '<tr data-id="' + data.id + '">';
            html += '<td>' + data.titel + '</td>';
            html += '<td>' + data.beschrijving.replace(/\n/g,"<br />") + '</td>';
            html += '<td>' + (data.aantal_min ? data.aantal_min : '0') + ' - ' + (data.aantal_max ? data.aantal_max : '100') + '</td>';
            html += '<td>' + (data.locatie ? data.locatie : 'geen locatie') + '</td>';
            html += '<td>' + (data.tijdstip ? data.tijdstip : 'geen tijdstip') + '</td>';
            html += '<td>' + (data.materiaal ? data.materiaal.replace(/\n/g,"<br />") : 'geen materiaal') + '</td>';
            html += '<td>';
            html += '<a href="#" class="btn btn-sm btn-primary edit"><i class="fa fa-pencil"></i> aanpassen</a> ';
            html += '<a href="#" class="btn btn-sm btn-danger delete"><i class="fa fa-times-circle"></i> wissen</a>';
            html += '</td>';
            html += '</tr>';

            $('#datatable tbody').append(html);
        });
    }, 'json');
};

var fillDataForm = function(data) {
    console.log(data);
    $('#titel').val(data.titel);
    $('#beschrijving').val(data.beschrijving);
    $('#aantal_min').val(data.aantal_min);
    $('#aantal_max').val(data.aantal_max);
    $('#locatie').val(data.locatie);
    $('#tijdstip').val(data.tijdstip);
    $('#materiaal').val(data.materiaal);
    $('#errorMessages').html('');
    $('#errorMessages').hide();
};

$(document).ready(function () {
    index();

    $('body').on('click', 'a#newItem', function (e) {
        e.preventDefault();
        $('#dataModalLabel').html('Voeg item toe');
        $('#dataModal form').attr('data-action', 'new');
        fillDataForm(defaultActiviteit);
        $('#dataModal').modal();
    });

    $('body').on('click', 'a.edit', function(e) {
        e.preventDefault();
        var id = $(this).closest("tr").attr('data-id');
        $.get(API_ENDPOINT + id, function(raw) {
            $('#dataModalLabel').html('Bewerk item');
            $('#dataModal form').attr('data-action', 'edit');
            $('#dataModal form').attr('data-id', id);
            fillDataForm(raw.data);
            $('#dataModal').modal();           
        });
    });

    $('.modal').on('click', '#save', function (e) {
        e.preventDefault();
        var formData = $("#dataModal form").serializeArray();
        var action = $('#dataModal form').attr('data-action');

        if (action == 'new') {   
            $.post(API_ENDPOINT, formData, function (result) {
                if (result.status) {
                    $('#dataModal').modal('hide');
                    index();
                } else {
                    $('#errorMessages').html('Titel en beschrijving zijn verplicht in te vullen.');
                    $('#errorMessages').show();
                }
            });
        } else if (action == 'edit') {
            var id = $('#dataModal form').attr('data-id');
            $.ajax({
                url: API_ENDPOINT + id,
                type: 'PUT',
                data: formData,
                success: function(result) {
                    if (result.status) {
                        $('#dataModal').modal('hide');
                        index();
                    } else {
                        $('#errorMessages').html('Titel en beschrijving zijn verplicht in te vullen.')
                        $('#errorMessages').show();
                    }
                }
            });
        }
    });

    $('body').on('click', 'a.delete', function (e) {
        e.preventDefault();
        var item = $(this).closest("tr");
        $('#confirm-delete .titleToDelete').attr('data-id', item.attr('data-id'));
        $('#confirm-delete .titleToDelete').html(item.find(">:first-child").html());
        $('#confirm-delete').modal();
    });

    $('.modal').on('click', '#delete', function(e) {
        e.preventDefault();
        var id = $('#confirm-delete .titleToDelete').attr('data-id');
        $.ajax({
            url: API_ENDPOINT + id,
            type: 'DELETE',
            success: function(result) {
                $('#confirm-delete').modal('hide');
                index();
            }
        });
    });
});
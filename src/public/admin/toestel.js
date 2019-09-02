var API_ENDPOINT = API_URL + 'toestel/';

var defaultToestel = {
    adres: '',
    avatar: '',
    eigenaar: ''
};

var index = function () {
    $.get(API_ENDPOINT, function (raw) {
        $('#datatable tbody').empty();

        $.each(raw.data, function (index, data) {
            var html = '<tr data-id="' + data.id + '">';
            html += '<td>' + data.adres + '</td>';
            html += '<td><img class="avatar" src="' + data.avatar + '" alt="Error" height="50" width="50" style="border-radius: 50%" /></td>';
            html += '<td>' + data.eigenaar + '</td>';
            html += '<td>' + data.score + '</td>';
            html += '<td>';
            html += '<a href="score.html?toestel_id=' + data.id + '" class="btn btn-warning btn-sm editScore"><i class="fa fa-line-chart"></i> bewerk score</a> ';
            html += '<a href="#" class="btn btn-primary btn-sm edit"><i class="fa fa-pencil"></i> bewerk eigenaar</a> ';
            //html += '<a href="#" class="btn btn-danger btn-sm delete"><i class="fa fa-times-circle"></i> wissen</a>';
            html += '</td>';
            html += '</tr>';

            $('#datatable tbody').append(html);
        });
    }, 'json');
};

var fillDataForm = function (data) {
    $('#adres').val(data.adres);
    $('#avatar').val(data.avatar);
    $('#eigenaar').val(data.eigenaar);
    $('#errorMessages').html('');
    $('#errorMessages').hide();
};

var doUpload = function (formData) {
    $.ajax({
        url: API_ENDPOINT + 'uploadavatar',
        method: 'post',
        data: formData,
        processData: false,
        contentType: false,
        xhr: function () {
            var xhr = new XMLHttpRequest();

            // Add progress event listener to the upload.
            xhr.upload.addEventListener('progress', function (event) {
                var progressBar = $('.progress-bar');

                if (event.lengthComputable) {
                    var percent = (event.loaded / event.total) * 100;
                    progressBar.width(percent + '%');

                    if (percent === 100) {
                        progressBar.removeClass('active');
                    }
                }
            });

            return xhr;
        }
    }).done(handleUploadSuccess).fail(function (xhr, status) {
        console.log(status);
    });
};

var handleUploadSuccess = function (data) {
    var newAvatar = data.data;
    newAvatar = newAvatar.replace("public", "");
    $('img#currentAvatar').attr('src', newAvatar);
    $('#newAvatar').val(newAvatar);
};

$(document).ready(function () {
    index();

    $('body').on('click', 'a#newItem', function (e) {
        e.preventDefault();
        $('#dataModalLabel').html('Voeg item toe');
        $('#dataModal form').attr('data-action', 'new');
        fillDataForm(defaultToestel);
        $('#dataModal').modal();
    });

    $('body').on('click', 'img.avatar', function (e) {
        e.preventDefault();
        var id = $(this).closest("tr").attr('data-id');
        var avatar = $(this).attr('src');
        $('img#currentAvatar').attr('src', avatar);
        $('#uploadModal form').attr('data-id', id);
        $('#avatar').val('');
        $('#uploadModal').modal();
    });

    $('body').on('click', 'a.edit', function (e) {
        e.preventDefault();
        var id = $(this).closest("tr").attr('data-id');
        $.get(API_ENDPOINT + id, function (raw) {
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
                    $('#errorMessages').html('Adres en eigenaar zijn verplicht in te vullen.');
                    $('#errorMessages').show();
                }
            });
        } else if (action == 'edit') {
            var id = $('#dataModal form').attr('data-id');
            $.ajax({
                url: API_ENDPOINT + id,
                type: 'PUT',
                data: formData,
                success: function (result) {
                    if (result.status) {
                        $('#dataModal').modal('hide');
                        index();
                    } else {
                        $('#errorMessages').html('Adres en eigenaar zijn verplicht in te vullen.')
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

    $('body').on('change', '#avatar', function (e) {
        e.preventDefault();
        var files = $('#avatar').get(0).files
        formData = new FormData();
        formData.append('avatar', files[0], files[0].name);
        doUpload(formData);
    });

    $('.modal').on('click', '#SaveUpload', function(e) {
        e.preventDefault();
        var formData = $("#uploadModal form").serializeArray();
        var id = $('#uploadModal form').attr('data-id');
        $.ajax({
            url: API_ENDPOINT + id + '/updateavatar',
            type: 'POST',
            data: formData,
            success: function(result) {
                if (result.status) {
                    $('#uploadModal').modal('hide');
                    index();
                } else {
                    $('#errorMessages').html('Titel en beschrijving zijn verplicht in te vullen.')
                    $('#errorMessages').show();
                }
            }
        });
    });

    $('.modal').on('click', '#delete', function (e) {
        e.preventDefault();
        var id = $('#confirm-delete .titleToDelete').attr('data-id');
        $.ajax({
            url: API_ENDPOINT + id,
            type: 'DELETE',
            success: function (result) {
                $('#confirm-delete').modal('hide');
                index();
            }
        });
    });
});
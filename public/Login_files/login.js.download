//jshint esversion: 6
let url = "login";
$('#authHide').hide();
let rdt = $('#url').val();
$('#login-formdata').on("submit", function(e) {
    if ($('#login-formdata')[0].checkValidity()) {
        e.preventDefault();
        $("#authClicked").hide();
        $('#authHide').show();

        $.ajax({
            url: url,
            type: "POST",
            data: $('#login-formdata').serialize() + "&action=authenticate",
            cache: false,
            success: function(response) {
                response = JSON.parse(response);
                if (response.status === 'success') {
                    $(".response").hide();
                    toastr.clear();
                    NioApp.Toast('<h5>' + response.title + '</h5><p>' + response.message + '</p>', response.type, {
                        position: 'top-right'
                    });
                    setTimeout(
                        function() {
                            window.location.replace(rdt + "user/auth");
                        }, 2000
                    );
                }
                if (response.status === 'error') {
                    // $(':input','#login-formdata').not(':disabled, :button, :submit, :reset, :hidden').val('');
                    toastr.clear();
                    setTimeout(() => {
                        $(".response").html('<div class="alert alert-danger alert-icon alert-dismissible" style="margin-bottom: 15px"><em class="icon ni ni-cross-circle"></em> <strong>' + response.title + '</strong>! ' + response.message + '. <button class="close" data-dismiss="alert"></button></div>');
                        $(".response").show();
                        NioApp.Toast('<h5>' + response.title + '</h5><p>' + response.message + '</p>', response.type, {
                            position: 'top-right'
                        });
                        $('#authHide').hide();
                        $("#authClicked").show();
                    }, 1000);

                }
            }
        });
    }
});
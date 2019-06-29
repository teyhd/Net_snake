(function($) {
    "use strict";
    var allInputs = $(".limiter");
    var email = $(".input100").eq(0);
    var pass = $(".input100").eq(1);
    var game = $(".game");
    var frame = $('iframe');
    var win = window.frames.frame;
    frame.innerHeight(window.innerHeight);
    frame.innerWidth(window.innerWidth);
    console.log(win);
    win.postMessage("message", '*');
    game.hide();
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function(e) {
        e.preventDefault();
        var check = true;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function() {
        $(this).focus(function() {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim() == '') {
                return false;
            } else

            {
                console.log(email.val() + " " + pass.val());
                $.get("login.php", { email: email.val(), pass: pass.val() })
                    .done(function(data) {
                        let login = JSON.parse(data);
                        console.log(login);
                        if (login == "nonvalid") alert('Этот ник уже занят')
                        else {
                            win.postMessage(login, '*');
                            allInputs.fadeOut("slow", function() {
                                game.show();
                            });
                        }
                    });
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

})(jQuery);
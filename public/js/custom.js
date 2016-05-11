(function() {
    $(window).scroll(function() {
        var top = $(document).scrollTop();
        $('.splash').css({
            'background-position': '0px -' + (top / 3).toFixed(2) + 'px'
        });
        if (top > 50)
            $('#home > .navbar').removeClass('navbar-transparent');
        else
            $('#home > .navbar').addClass('navbar-transparent');
    });

    $("a[href='#']").click(function(e) {
        e.preventDefault();
    });

    function cleanSource(html) {
        html = html.replace(/×/g, "&times;")
            .replace(/«/g, "&laquo;")
            .replace(/»/g, "&raquo;")
            .replace(/←/g, "&larr;")
            .replace(/→/g, "&rarr;");

        var lines = html.split(/\n/);

        lines.shift();
        lines.splice(-1, 1);

        var indentSize = lines[0].length - lines[0].trim().length,
            re = new RegExp(" {" + indentSize + "}");

        lines = lines.map(function(line) {
            if (line.match(re)) {
                line = line.substring(indentSize);
            }

            return line;
        });

        lines = lines.join("\n");

        return lines;
    }

    $("#datepicker").datepicker({
        format: "yyyy-mm-dd"
    });

    $("#datepicker").keydown(function() {
        return false;
    });

    $('.role_checkbox').change(function() {
        if ($(this).prop('checked')) {
            $(this).val($(this).data('role'));
        } else {
            $(this).val('');
        }
    });

    $("#loginForm, #edituser").submit(function(event) {
        var password = $("#inputPassword").val();
        var confirmPassword = $("#inputConfirmPassword").val();
        if (password != confirmPassword) {
            $('#ConfirmPassword').addClass('has-error');
            $('#ConfirmPasswordLabel').show();
            return false;
        } else {
            $('#ConfirmPassword').removeClass('has-error');
            $('#ConfirmPasswordLabel').hide();
            return true;
        }

    });

    $('.user_role_updated').change(function() {
        var that = this;
        var data = {
            user_id: $(this).data('user_id'),
            role: $(this).data('role_name'),
            status: $(this).prop('checked') ? 'checked' : 'unchecked'
        }
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "/role-update",
            data: JSON.stringify(data),
            dataType: "json",
            success: function(data) {
                if (data.status == 'checked') {
                    $(that).after("<span class='green'>Added</span>");
                    $(that).next("span").fadeOut(3000);
                } else {
                    $(that).after("<span class='red'>Removed</span>");
                    $(that).next("span").fadeOut(3000);
                }
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

    $('#searchByName').keyup(function() {
        var data = {
            query: $(this).val()
        }
        $.ajax({
            type: "POST",
            url: "/search-by-name",
            data: data,
            success: function(data) {
                $("#users_list").html(data);
                addSelectBox()
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

    function addSelectBox() {
        if ($('#user_tables').length > 0) {
            $.ajax({
                type: "GET",
                url: "/get-groups",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    var sel = $('<select class="choose_group_select">')
                    _.each(data.groups, function(element) {
                        sel.append($("<option>").attr('value', element._id).text(element.name));
                    });
                    $('.chooseGroup').append(sel);
                    var choose_group_select = $('.choose_group_select');
                    _.each(choose_group_select, function(element) {
                        $(element).val($.trim($(element).parent().parent().data('group_id')));
                    });
                }
            });

        }
    }

    addSelectBox()

    $('.chooseGroup').on('change', ".choose_group_select", function() {
        console.log('hello')
        var data = {
            user_id: $(this).parent().parent().data('user_id'),
            group_id: $(this).find(":selected").val()
        }
        $.ajax({
            type: "POST",
            url: "/assign-group",
            data: data,
            error: function(err) {
                console.log(err);
            }
        });
    });

    $('.datepicker > .day').click(function() {
        $('body').click();
    });


})();
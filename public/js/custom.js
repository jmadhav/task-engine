(function() {

    $(document).on('change', 'input:radio', function(e) {
      $('#inputChanged').val('true');
    });

    $(document).on('click', '.tasks_pagination', function(e) {
      var changed = $('#inputChanged').val();
      if (changed == 'true') {
        alert('Please save the changes of Field')
        e.preventDefault();
      }
    });

    $('#save_btn').on("click", function() {
        var headings = [];
        var tableRowData = [];
        var data = [];
        $('#excelDataTable tr').eq(0).each(function() {


            $.each(this.cells, function() {
               //console.log('hi',$(this).attr("data-field"));
                //if(j>0)
                headings.push($(this).attr("data-field"));

            });

        });


        $.each(headings, function(i, val) {

            tableRowData[i] = [];
        });
        var reviewed=false;
        $('#excelDataTable tr').not(':first').each(function() {
            var i = 0;
            var rowData = {};
            $.each(this.cells, function() {

                var tdText;
                if (headings[i] == "_id") {
                    var v = $(this).find("input[type=hidden]").val();
                    if (typeof v !== 'undefined') {
                        tdText = v;
                    }

                } else if (headings[i] == "verifier_comments") {

                    var v1 = $(this).find("input[type=textarea]").val();

                    if (typeof v1 !== 'undefined') {
                        tdText = v1;
                    }

                } else if (headings[i] == "is_correct") {

                    var corr_r = $(this).find("input[type=radio]")[0].checked;
                    var incor_t = $(this).find("input[type=radio]")[1].checked;

                    // console.log("corr_r == "+(corr_r==true)+" incor_t== "+incor_t);
                    if (corr_r == true) {
                        reviewed=true
                        tdText = "true";
                    } else if (incor_t == true) {
                         reviewed=true
                        tdText = "false";
                    }else {
                         reviewed=false;
                    }

                } else if (headings[i] == "verifier_name") {
                    var name = $('#user_name').val();
                    if (typeof name !== 'undefined') {
                       if(reviewed){

                         tdText=name;
                       }else {
                         tdText = '';
                       }
                       
                    }

                } else if (headings[i] == "verifier_id") {
                    var id = $('#user_id').val();

                    if (typeof id !== 'undefined') {
                        if(reviewed){

                         tdText=id;
                       }else {
                         tdText = null;
                       }
                      
                    }

                } else {

                    tdText = $(this).html();
                }


                rowData[headings[i]] = tdText;

                i++;
            });
            data.push(rowData);
        });
        //  console.log(headings);
        // console.log(data);


        if (data != null && data.length > 0) {
            var d = {}

            $.ajax({

                type: "POST",
                url: "/update_data",
                data: JSON.stringify({
                    "tabledata": data
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    // getGroupMembersData(data);
                    alert("Your task has been submitted successfully");
                    $('#inputChanged').val('false');

                }

            });
        }


    });

    $('#sel_group').on("change", function() {
        $("#user_group_id").val($(this).val());
        if ($('#user_role').val() == 'Manager') {
            getAnalystModeratorData($(this).val());
            getLeadModeratorData($(this).val());
        }
    });
    var globaldata;
    $('#sel_analyst').on("change", function() {

        var id = $(this).val();

        _.each(globaldata.users_name, function(element) {
            // $('#selecte_user_role').val(element.roles);
            if (id == element._id) {

                $('#selecte_user_role').val(element.roles);
            }

        });

    });
 $('#sel_reviewer').on("change", function() {
   // alert($(this).val())
// $('#selected_viewer_id').val($(this).val());
     });

    if (typeof $('#user_role').val() != 'undefined') {
        if (($('#user_role').val().indexOf('Moderator') != -1) || ($('#user_role').val().indexOf('Lead') != -1)) {

            var id = $('#user_group_id').val()
            getAnalystModeratorData(id);

        }
         if ($('#user_role').val().indexOf('Lead') != -1) {

            var id = $('#user_group_id').val()
            getLeadModeratorData(id);

        }
    }
   //$("#dashboard_sbmit_btn").attr("disabled", true);
   if ($('#user_role').val() == 'Manager') {
        $.ajax({
            type: "GET",
            url: "/get-groups",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                // getGroupMembersData(data);
              //  console.log("sel_group ===",data.groups);
                var selectBox = document.getElementById('sel_group');
                if(selectBox != null){
                    _.each(data.groups, function(element) {
                        selectBox.options.add(new Option(element.name, element._id))
                    });
                }

            }

        });
   }

     function getLeadModeratorData(id) {
        var data1 = {};
        data1["group_id"] = id;
        data1["user_role"]= $('#user_role').val();
        $.ajax({
            type: "GET",
            url: "/get-moderator-lead-members",
            data: data1,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                //globaldata = data;

                var selectBox = document.getElementById('sel_reviewer');
                $('#sel_reviewer').empty();
                if (selectBox != null){
                    _.each(data.users_name, function(element) {
                         if($("#user_id").val()!=element._id &&(element.roles!="Manager") )
                        selectBox.options.add(new Option(element.name, element._id, element.roles))
                    });
                
                    selectBox.selectedIndex = -1;
                     $('#sel_reviewer').autocomplete({
                          source: data
                        });
                }
            }
        });
     }

    function getAnalystModeratorData(id) {
      
        var data = {};
        data["group_id"] = id;
        data["user_role"]= $('#user_role').val();
        $.ajax({
            type: "GET",
            url: "/get-analyst-moderator-members",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                globaldata = data;

                var selectBox = document.getElementById('sel_analyst');
                $('#sel_analyst').empty();
                if (selectBox != null){
                    _.each(data.users_name, function(element) {
                         if($("#user_id").val()!=element._id &&(element.roles!="Manager") )
                        selectBox.options.add(new Option(element.name, element._id, element.roles))
                    });
                
                    selectBox.selectedIndex = -1;
                     $('#sel_analyst').autocomplete({
                          source: data
                        });
                }
            }
        });
    }

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

    $(".datepicker").datepicker({
        format: "yyyy-mm-dd"
    });

    $(".datepicker").keydown(function() {
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
                //pagination();
                addSelectBoxToUsers()
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

    function pagination(){
        if($("#excelDataTable tbody tr").length >= 10) {
            var rowCount = Math.ceil($("#excelDataTable tbody tr").length / 10);

            $(".pagination").html("");
            for (var i = 1; i <= rowCount; i++) {
                $(".pagination").append("<a rel='"+i+"'>"+i+"</a>");
            }

            $.each($("#excelDataTable tbody tr"), function(){
                $(this).addClass("pagination-" + Math.ceil(($(this).index() + 1) / 10));
            });

            $(".pagination a").click(function(){
                $(".pagination a").removeClass("active");
                $(this).addClass("active");
                $("#excelDataTable tbody tr").hide();
                $("#excelDataTable tbody tr.pagination-" + $(this).attr("rel")).show();
            });

            $(".pagination a[rel='1']").trigger("click");
        }
    }

    function addSelectBoxToUsers() {
        if ($('#user_tables').length > 0) {
            var data = getGroup();
            var sel = $('<select class="choose_group_select">')
            sel.append($("<option>").attr('value', "").text(""));
            _.each(data.groups, function(element) {
                sel.append($("<option>").attr('value', element._id).text(element.name));
            });
            $('.chooseGroup').append(sel);
            var choose_group_select = $('.choose_group_select');
            _.each(choose_group_select, function(element) {
                $(element).val($.trim($(element).parent().parent().data('group_id')));
            });
        }
    }

    function getGroup() {
        var result = []
        $.ajax({
            type: "GET",
            url: "/get-groups",
            async: false,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                result = data;
            },
            error: function(err) {
                console.log(err);
            }
        });
        return result
    }

    function addSelectBoxNewUser() {
        if ($('#loginForm').length > 0) {
            var data = getGroup();
            var sel = $('<select name="user[group_id]" required>')
            sel.append($("<option>").attr('value', "").text(""));
            _.each(data.groups, function(element) {
                sel.append($("<option>").attr('value', element._id).text(element.name));
            });
            $('.chooseGroupUser').append(sel);
        }
    }

    function addSelectBoxEditUser() {
        if ($('#edituser').length > 0) {
            var data = getGroup();
            var sel = $('<select name="user[group_id]" class="choose_group_select_edit_user" required>')
            sel.append($("<option>").attr('value', "").text(""));
            _.each(data.groups, function(element) {
                sel.append($("<option>").attr('value', element._id).text(element.name));
            });
            $('.chooseGroupUser').append(sel);
            var choose_group_select = $('.choose_group_select_edit_user');
            _.each(choose_group_select, function(element) {
                $(element).val($.trim($(element).parent().data('group_id')));
            });
        }
    }


    addSelectBoxToUsers();
    addSelectBoxNewUser();
    addSelectBoxEditUser();
    setSelectedMenuItem();

    $('.chooseGroup').on('change', ".choose_group_select", function() {

        var data = {
            user_id: $(this).parent().parent().data('user_id'),
            group_id: $(this).find(":selected").val()
        }
        if (data.group_id != "") {
            $.ajax({
                type: "POST",
                url: "/assign-group",
                data: data,
                error: function(err) {
                    console.log(err);
                }
            });
        }

    }); 

    $("#googletaskUpload").submit(function(e) {
        $(".overlay").show();
        var formData = new FormData($(this)[0]);
        //  'user_group_id'  : $('input[name=user_group_id]').val(),

        $.ajax({
            url: '/upload_performance_sheet',
            type: 'POST',
            data: formData,
            success: function(data) {
                $('#task-upload-count').text(data.tasks_count);
                $('.alert-success').show();
                $(".overlay").hide();
            },
            error: function(err) {
                $(".overlay").hide();
                console.log(err);
            },
            cache: false,
            contentType: false,
            processData: false
        });

        e.preventDefault();
    });


    $("#taskUpload").submit(function(e) {
        $(".overlay").show();
        var formData = new FormData($(this)[0]);
        //  'user_group_id'  : $('input[name=user_group_id]').val(),

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            success: function(data) {
                $('#task-upload-count').text(data.tasks_count);
                $('.alert-success').show();
                $(".overlay").hide();
            },
            error: function(err) {
                $(".overlay").hide();
                console.log(err);
            },
            cache: false,
            contentType: false,
            processData: false
        });

        e.preventDefault();
    });

    $("#searchTask").submit(function(e) {
        $(".overlay").show();
    
        var formData = {
            'user_role'      : $('input[name=user_role]').val(),
            'user_group_id'  : $('input[name=user_group_id]').val(),
            'user_id'        : $('input[name=user_id]').val(),
            'user_name'      : $('input[name=user_name]').val(),
            'selecte_user_role'  : $('input[name=selecte_user_role]').val(),
            'fromDate'        : $('input[name=fromDate]').val(),
            'toDate'      : $('input[name=toDate]').val(),
            'user_group'  : $('input[name=user_group]').val(),
            'selected_user_id'        : $('#sel_analyst').val(),
            'viewer_name'      : $('input[name=viewer_name]').val(),
            'selected_viewer_id': $('#sel_reviewer').val(),
            'isPending':$('#pending_task').is(":checked")
        };
        $.ajax({
            url: '/audit_task',
            type: 'POST',
            data: formData,
            success: function(data) {
                $("#audit_tasks").html(data);
                $("#excelDataTable").parent().show();
                $("#save_btn").parent().show();
                //pagination();
                if (Boolean($("td:contains('No data Found')")[0])) {
                  $('#save_btn').hide();
                }   else {
                  $('#save_btn').show();
                }
                $(".overlay").hide();
            },
            error: function(err) {
              $(".overlay").hide();
              console.log(err);   
            }
        });

        e.preventDefault();
    });



$("#viewOnlyTask").submit(function(e) {
        $(".overlay").show();
       var formData = {
           
            'user_id'        : $('input[name=user_id]').val(),
            'fromDate'        : $('input[name=fromDate]').val(),
            'toDate'      : $('input[name=toDate]').val()
           
        };
        $.ajax({
            url: '/view_only_task',
            type: 'POST',
            data: formData,
            success: function(data) {
                $("#view_tasks").html(data);
                $("#excelDataTable").parent().show();
                $("#save_btn").parent().show();
                //pagination();
                $(".overlay").hide();
            },
            error: function(err) {
              $(".overlay").hide();
              console.log(err);   
            }
        });

        e.preventDefault();
    });


    function setSelectedMenuItem() {
        var path = window.location.pathname;
        path = path.replace(/\/$/, "");
        path = decodeURIComponent(path);

        $(".nav a").each(function() {
            var href = $(this).attr('href');
            if (path.substring(0, href.length) === href) {
                $(this).closest('li').addClass('active');
            }
        });
    }
    $("#excelDataTable").parent().css({"width":parseInt(screen.width) - 250, "overflow":"auto"});
    $("#excelDataTable").find("tr[data-field='landing_page']").css("width","200px");
    $("#excelDataTable").parent().hide();
    $("#save_btn").parent().hide();

    function setInitialDate() {
        var path = window.location.pathname;
        path = path.replace(/\/$/, "");
        path = decodeURIComponent(path);
        date = $.format.date(new Date, "MM/dd/yyyy")
        if (path == '/view_task') {
          $('#viewTaskFromDate').val(date);
          $('#viewTaskToDate').val(date);
          $('#viewTaskSubmit').trigger('click');
        }
        if (path == '/upload') {
          $('#uploadDate').val(date);
        }
        if (path == '/audit_task') {
          $('#auditTaskFromDate').val(date);
          $('#auditTaskToDate').val(date);
        }
        if (path == "/stats") {
          var date = new Date();
          var fromDate =  $.format.date(date.setDate(date.getDate() - 7), "MM/dd/yyyy");
          var toDate =  date = $.format.date(new Date, "MM/dd/yyyy");
          $('#dashboardFromDate').val(fromDate);
          $('#dashboardToDate').val(toDate);
        }

    }
    setInitialDate();

    $('#view_tasks').on('click', 'a.tasks_pagination', function(e) {
        $(".overlay").show();
        var formData = {

            'user_id': $('input[name=user_id]').val(),
            'fromDate': $('input[name=fromDate]').val(),
            'toDate': $('input[name=toDate]').val(),
            'page': $(this).data('page')

        };
        $.ajax({
            url: '/view_only_task',
            type: 'POST',
            data: formData,
            success: function(data) {
                $("#view_tasks").html(data);
                $("#excelDataTable").parent().show();
                $("#save_btn").parent().show();
                //pagination();
                $(".overlay").hide();
            },
            error: function(err) {
                $(".overlay").hide();
                console.log(err);
            }
        });

        e.preventDefault();
    });


    $('#audit_tasks').on('click', 'a.tasks_pagination', function(e) {
        var changed = $('#inputChanged').val();
        if (changed == 'false') {
            $(".overlay").show();

            var formData = {
                'user_role': $('input[name=user_role]').val(),
                'user_group_id': $('input[name=user_group_id]').val(),
                'user_id': $('input[name=user_id]').val(),
                'user_name': $('input[name=user_name]').val(),
                'selecte_user_role': $('input[name=selecte_user_role]').val(),
                'fromDate': $('input[name=fromDate]').val(),
                'toDate': $('input[name=toDate]').val(),
                'user_group': $('input[name=user_group]').val(),
                'selected_user_id': $('#sel_analyst').val(),
                'viewer_name': $('input[name=viewer_name]').val(),
                'selected_viewer_id': $('#sel_reviewer').val(),
                'isPending': $('#pending_task').is(":checked"),
                'page': $(this).data('page')
            };
            $.ajax({
                url: '/audit_task',
                type: 'POST',
                data: formData,
                success: function(data) {
                    $("#audit_tasks").html(data);
                    $("#excelDataTable").parent().show();
                    $("#save_btn").parent().show();
                    //pagination();
                    if (Boolean($("td:contains('No data Found')")[0])) {
                        $('#save_btn').hide();
                    } else {
                        $('#save_btn').show();
                    }
                    $(".overlay").hide();
                },
                error: function(err) {
                    $(".overlay").hide();
                    console.log(err);
                }
            });
        }

        e.preventDefault();
    });

    $('.role_checkbox').click(function() {
      var role = $(this).data('role');
      if (role == 'Manager') {
        $('.chooseGroupUser > select').removeAttr("required");
      } else {
        $('.chooseGroupUser > select').attr('required')
      }
    });

})();




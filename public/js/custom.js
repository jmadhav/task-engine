(function() {


  $('#save_btn').on("click",function(){
       var  headings=[];
       var tableRowData=[]; 
       var data=[];
      $('#excelDataTable tr').eq(0).each(function(){
      

                 $.each(this.cells, function(){
                   //console.log('hi'+$(this).html());
                   //if(j>0)
                   headings.push($(this).html());
                  
                });

              });

                 
        $.each(headings , function(i, val) { 
           
            tableRowData[i]=[]; 
        });

        $('#excelDataTable tr').not(':first').each(function(){
               var i=0;
               var rowData = {};
              $.each(this.cells, function(){
                   
                  var tdText;
                  if(headings[i]== "_id"){
                     var v= $(this).find("input[type=hidden]").val();
                     if(typeof v !== 'undefined'){
                        tdText=v;
                     }
                     
                  }
                  else if(headings[i]=="verifier_comments"){
                    
                   var v1= $(this).find("input[type=textarea]").val();
                  
                     if(typeof v1!== 'undefined'){
                        tdText=v1;
                     }

                  }else if(headings[i]=="is_correct"){

                     var corr_r= $(this).find("input[type=radio]")[0].checked;
                    var incor_t=$(this).find("input[type=radio]")[1].checked;

                // console.log("corr_r == "+(corr_r==true)+" incor_t== "+incor_t);
                      if(corr_r==true){
                        tdText="true";
                      }
                      else if(incor_t==true){
                        tdText="false";
                      }

                  }else if(headings[i]== "verifier_name"){
                    var name= $('#veryfier_name').val();
                   
                      if(typeof name !== 'undefined'){
                        tdText=name;
                     }
                     
                  }else if(headings[i]== "verifier_id"){
                    var name= $('#veryfier_id').val();
                   
                      if(typeof name !== 'undefined'){
                        tdText=name;
                     }
                     
                  }
                  else {

                    tdText= $(this).html();
                  }
                  
                  
                  rowData[headings[i]]=tdText;
                  
                     i++;
                });
                 data.push(rowData);
             });
       //  console.log(headings);
      console.log(data);

     if(data !=null && data.length>0){
        var d={}
       
     $.ajax({
     
        type: "POST",
        url: "/update_data",
        data:JSON.stringify({ "tabledata": data}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
        // getGroupMembersData(data);
        

        }
   
    });
     }


  });

$('#sel_group').on("change",function(){
     if($('#user_role').val()=='Manager'){
        getGroupMembersData($(this).val());
        }
  });


console.log($('#user_role').val());
 if(( $('#user_role').val().indexOf('Moderator')!=-1) || ($('#user_role').val().indexOf('Lead')!=-1)){
    console.log($('#user_group_id').val()); 
    var id = $('#user_group_id').val()
       getGroupMembersData(id);

 }
    
 if($('#user_role').val()=='Manager'){
 $.ajax({
     
        type: "GET",
        url: "/get-groups",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
        // getGroupMembersData(data);
            var selectBox = document.getElementById('sel_group');
          _.each(data.groups, function(element) {
               selectBox.options.add( new Option(element.name, element._id))
            });



        }
   
    });
}

function getGroupMembersData(id) {
    console.log(" calling getGroupMembersData");
    var data={};
    data["id"]=id;
    $.ajax({
                type: "GET",
                url: "/get-groups-members",
                data:data,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
               
                 var selectBox = document.getElementById('sel_analyst');
                $('#sel_analyst').empty();
                  _.each(data.users_name, function(element) {
                   selectBox.options.add( new Option(element.name, element._id))
                   });
                 selectBox.selectedIndex = -1;
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
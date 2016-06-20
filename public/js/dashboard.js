$(document).ready(function() {
    var path = window.location.pathname;
    path = path.replace(/\/$/, "");
    path = decodeURIComponent(path);

    if (path == "/stats") {
        var date = new Date();
        var fromDate = $.format.date(date.setDate(date.getDate() - 7), "MM/dd/yyyy");
        var toDate = date = $.format.date(new Date, "MM/dd/yyyy");
        $('#dashboardFromDate').val(fromDate);
        $('#dashboardToDate').val(toDate);
        var tasks_object = $('#TaskPieChart').data('tasks-object');
        var data = [
          ['Correct', tasks_object.correct],
          ['InCorrect', tasks_object.incorrect]
        ];

        drawPieChart('chart1', data);

        var data = [
            ['Verified', tasks_object.verified],
            ['Unverified', tasks_object.unverified]
        ];

        drawPieChart('chart2', data);

    }

    $('#stat-group-select').change(function(e){

        $(".overlay").show();
        var group_id = $(this).val();
        $.ajax({
            url: '/stats?group_id=' + group_id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: 'GET',
            success: function(data) {
                console.log(data);
                $(".overlay").hide();
                $('#userPerformaceDashboard').show();
                $('#usersSelectList').remove();
                var sel = $('<select id="usersSelectList">')
                sel.append($("<option>").attr('value', "").text("Select User"));
                _.each(data.users, function(element) {
                   sel.append($("<option>").attr('value', element._id).text(element.name));
                });
                $('#userSelectBox').append(sel);
                $('#userSelectBox').show();
                var data1 = [
                  ['Correct', data.tasks_object.correct],
                  ['InCorrect', data.tasks_object.incorrect]
                ];

                drawPieChart('chart1', data1);

                var data2 = [
                    ['Verified', data.tasks_object.verified],
                    ['Unverified', data.tasks_object.unverified]
                ];

                drawPieChart('chart2', data2);

                var seriesData = [{
                    name: 'Correct',
                    data: data.usersList.correct
                }, {
                    name: 'InCorrect',
                    data: data.usersList.incorrect
                }]
                var names = data.usersList.names

                drawBarChart(names, seriesData)

            },
            error: function(err) {
              $(".overlay").hide();
              console.log(err);   
            }
        });

        e.preventDefault();

    });

    $(document).on('change', '#usersSelectList', function(e){
        $(".overlay").show();
        var user_id = $(this).val();
        $('#userPerformaceDashboard').hide();
        $.ajax({
            url: '/stats?user_id=' + user_id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: 'GET',
            success: function(data) {
                $(".overlay").hide();

                var data1 = [
                  ['Correct', data.tasks_object.correct],
                  ['InCorrect', data.tasks_object.incorrect]
                ];

                drawPieChart('chart1', data1);

                var data2 = [
                    ['Verified', data.tasks_object.verified],
                    ['Unverified', data.tasks_object.unverified]
                ];

                drawPieChart('chart2', data2);
            },
            error: function(err) {
              $(".overlay").hide();
              console.log(err);   
            }
        });

        e.preventDefault();

    });

    function drawPieChart(chartName, data) {
        var plot1 = jQuery.jqplot(chartName, [data], {
            seriesDefaults: {
                // Make this a pie chart.
                renderer: jQuery.jqplot.PieRenderer,
                rendererOptions: {
                    // Put data labels on the pie slices.
                    // By default, labels show the percentage of the slice.
                    showDataLabels: true
                }
            },
            legend: {
                show: true,
                location: 'e'
            }
        });
    }

    function drawBarChart(names, seriesData) {
        console.log(names, seriesData)
        $('#chart3').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'User Performance Chart'
            },
            xAxis: {
                categories: names
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            exporting: {
                buttons: {
                    exportButton: {
                        enabled: false
                    },
                    printButton: {
                        enabled: false
                    }

                }
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                        style: {
                            textShadow: '0 0 3px black'
                        }
                    }
                }
            },
            series: seriesData
        });
    }
});
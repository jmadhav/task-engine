$(document).ready(function() {
    var path = window.location.pathname;

    path = path.replace(/\/$/, "");
    path = decodeURIComponent(path);

    if (path == "/performance_dashboard") {
        var date = new Date();
        var date = date = $.format.date(new Date, "MM/dd/yyyy");
        $('#perfomanceFromDate').val(date);
        $('#perfomanceToDate').val(date);

        $('#perfomance_sbmit_btn').click(function(e) {
            e.preventDefault();
            var fromDate = $('#perfomanceFromDate').val();
            var toDate = $('#perfomanceToDate').val();
            var url = '/performance_chart?fromDate=' + fromDate + '&toDate=' + toDate
            $.ajax({
                url: url,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                type: 'GET',
                success: function(data) {
                    $(".overlay").hide();
                    console.log(data)
                    drawPerformanceChart(data);


                },
                error: function(err) {
                    $(".overlay").hide();
                    console.log(err);
                }
            });
        });

        var fromDate = $('#perfomanceFromDate').val();
        var toDate = $('#perfomanceToDate').val();
        var url = '/performance_chart?fromDate=' + fromDate + '&toDate=' + toDate
        $.ajax({
            url: url,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: 'GET',
            success: function(data) {
                $(".overlay").hide();
                console.log(data)
                drawPerformanceChart(data);


            },
            error: function(err) {
                $(".overlay").hide();
                console.log(err);
            }
        });

        $.ajax({
            url: '/weekly_performance_chart',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: 'GET',
            success: function(data) {
                $(".overlay").hide();
                drawWeeklyPerformanceChart(data);

            },
            error: function(err) {
                $(".overlay").hide();
                console.log(err);
            }
        });

        function drawPerformanceChart(data) {
            $('#chart1').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'User Performance Chart'
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: {
                        text: 'Number of ads'
                    }

                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}'
                },

                series: [{
                    name: 'Productivity',
                    colorByPoint: true,
                    data: [{
                        name: 'Users',
                        y: data.performanceData.all,
                        drilldown: 'Users'
                    }]
                }],
                drilldown: {
                    series: [{
                        name: 'Users',
                        id: 'Users',
                        data: data.performanceData.usersProductivity
                    }]
                }
            });
        }

        function drawWeeklyPerformanceChart(data) {
            $('#chart2').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Weekly Performance Chart'
                },
                xAxis: {
                    categories: [
                        'Total Ads Rated',
                        'Average Ads Pre Search Analyst',
                        'Average Hours by Analyst',
                        'Average Productivity'
                    ],
                    crosshair: true
                },
                yAxis: {
                    min: 0
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Weekly Performance Chart',
                    data: data.weeklyData

                }]
            });
        }
    }
});
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


    }

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

    var data = [
        ['Correct', 50],
        ['InCorrect', 50]
    ];

    drawPieChart('chart1', data);

    var data = [
        ['Verified', 50],
        ['Unverified', 50]
    ];

    drawPieChart('chart2', data);

    var seriesData = [{
        name: 'Correct',
        data: [5, 3, 4, 7, 2, 4, 5, 8, 6, 3, 2, 6, 8, 9, 4]
    }, {
        name: 'InCorrect',
        data: [2, 2, 3, 2, 1, 7, 4, 9, 3, 6, 8, 6, 9, 4, 6]
    }]
    var names = ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas', 'Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas', 'Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']

    drawBarChart(names, seriesData)
});
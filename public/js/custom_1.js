$(document).ready(function() {
    function setInitialDate() {
        var path = window.location.pathname;
        path = path.replace(/\/$/, "");
        path = decodeURIComponent(path);
        if (path == '/view_task') {
          $('#viewTaskFromDate').val($.format.date(new Date, "MM/dd/yyyy"));
          $('#viewTaskToDate').val($.format.date(new Date, "MM/dd/yyyy"));
          $('#viewTaskSubmit').trigger('click');
        }
        if (path == '/upload') {
          $('#uploadDate').val($.format.date(new Date, "MM/dd/yyyy"));
        }

    }
    setInitialDate();
});
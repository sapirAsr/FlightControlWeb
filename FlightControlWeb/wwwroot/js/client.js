
function loadFlights() {
    var xhttp = new XMLHttpRequest();
    var table = document.getElementById("flightsTable");
    table.innerHTML = "";
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var flightArray = JSON.parse(this.responseText);
            console.log(flightArray);
            
            for (i in flightArray) {
                var table = document.getElementById("flightsTable");
                var row = table.insertRow(0);
                row.addEventListener("click", selectFlight(), false);
                var cell1 = row.insertCell(0);
                cell1.addEventListener("click", selectFlight(), false);
                var cell2 = row.insertCell(1);
                var array = flightArray[i];
                console.log(array);
                cell1.innerHTML = array["flightId"];
                cell2.innerHTML = array["companyName"];
                var cell3 = row.insertCell(2); 
                cell3.innerHTML = '<i onclick="deleteflight()" class="far fa-window-close"></i>';
            }
           
        }
    };
    xhttp.open("GET", "/api/Flights", true);
    xhttp.send();
}

function selectFlight() {
    var table = document.getElementById('flightsTable');
    var cells = table.getElementsByTagName('td');

    for (var i = 0; i < cells.length; i++) {
        // Take each cell
        var cell = cells[i];
        // do something on onclick event for cell
        cell.onclick = function () {
            // Get the row id where the cell exists
            var rowId = this.parentNode.rowIndex;

            var rowsNotSelected = table.getElementsByTagName('tr');
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].classList.remove('selected');
            }
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "yellow";
            rowSelected.className += " selected";
            console.log(rowSelected.cells[0].innerHTML)
            flightDetails(rowSelected.cells[0].innerHTML);
        }
    }
}


function flightDetails(id) {
    var details = document.getElementById("Details");
    details.innerHTML = "";
    //details.setAttribute("class", id);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var flight = JSON.parse(this.responseText);
            console.log(flight);
            var heading = document.createElement("H3");
            heading.innerHTML = "Flight Details";
            document.getElementById("Details").appendChild(heading);
            heading.setAttribute("class", id);
            var flightId = document.createElement("P");                 // Create a <p> element
            flightId.innerHTML = "Flight id: " + id;                // Insert text
            document.getElementById("Details").appendChild(flightId);
            flightId.setAttribute("class", id);
            var company = flight["companyName"];
            var companyName = document.createElement("P");                 // Create a <p> element
            companyName.innerHTML = "Company: " + company;                // Insert text
            companyName.setAttribute("class", id);
            document.getElementById("Details").appendChild(companyName);            
            var numPassengers = flight["passengers"];
            var passengers = document.createElement("P");                 // Create a <p> element
            passengers.innerHTML = "Passengers: " + numPassengers;                // Insert text
            document.getElementById("Details").appendChild(passengers);
            passengers.setAttribute("class",id);
            var initial = flight["initialLocation"];
            console.log(initial);
            var date = initial["dateTime"];
            var dateTime = document.createElement("P");                 // Create a <p> element
            dateTime.innerHTML = "Date: " + date;                // Insert text
            dateTime.setAttribute("class", id);
            document.getElementById("Details").appendChild(dateTime);
            var segemnts = flight["segments"];
            var total = 0;
            for (i in segemnts) {
                var timespan = segemnts[i];
                var time = timespan["timespanSeconds"];
                console.log(time);
                total += parseInt(time);
            }
            var temp = Date.parse(date);
            console.log(temp);
            var d = new Date(temp);          
            d.setSeconds(d.getSeconds() + total);
           
            var landing = document.createElement("P");                 // Create a <p> element
            landing.innerHTML = "Landing time: " + d.toUTCString();                // Insert text
            document.getElementById("Details").appendChild(landing);
            landing.setAttribute("class", id);
        }
    };
    xhttp.open("GET", "/api/FlightPlan/" + id, true);
    xhttp.send();
}

function deleteflight() {
    
    var table = document.getElementById('flightsTable');
    var rows = table.getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {
        var cell = table.rows[i].cells[2];
        cell.onclick = function () {
            // Get the row id where the cell exists
            var rowId = this.parentNode.rowIndex;
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            console.log(rowSelected);
            var tds = rowSelected.getElementsByTagName('td');
            var id = tds[0].innerHTML;
            rowSelected.remove();
            deleteFromServer(id);
            deleteFlightDetails(id);

        }

    }
}
    /**
    for (var i = 0; i < cells.length; i++) {
        // Take each cell
        var cell = cells[i];
        // do something on onclick event for cell
        cell.onclick = function () {
            // Get the row id where the cell exists
            var rowId = this.parentNode.rowIndex;
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            console.log(rowSelected);
            var tds = rowSelected.getElementsByTagName('td');
            var id = tds[0].innerHTML;           
            rowSelected.remove();
            deleteFromServer(id);
            deleteFlightDetails();
      
        }
        
    }*/


function deleteFromServer(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/api/Flights/" + id, true);
    xhttp.send(null);
}
function deleteFlightDetails(x) {
    var details = document.getElementsByClassName(x);
    console.log(details);
    details.innerHTML = "";
    for (i in details) {
        details[i].innerHTML = "";
       // details[i].remove();
    }
    
}
$('#txtUploadFile').on('change', function (e) {
    var json;

   
        var files = e.target.files; // FileList object

        // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    console.log('e readAsText = ', e);
                    console.log('e readAsText target = ', e.target);
                    try {
                        json = JSON.parse(e.target.result);
                        var request = new XMLHttpRequest();
                        request.open("POST", "/api/FlightPlan");
                        request.setRequestHeader("Content-Type", "application/json");
                        request.send(JSON.stringify(json));
                        alert('json global var has been set to parsed json of this file here it is unevaled = \n' + JSON.stringify(json));
                    } catch (ex) {
                        alert('ex when trying to parse json = ' + ex);
                    }
                }
            })(f);
            reader.readAsText(f);
        }
});
 


    /**
    var fileUpload = $("#txtUploadFile").get(0);
    var files = fileUpload.files;
    console.log(files);
    // Create FormData object  
    var fileData = new FormData();

    // Looping over all files and add it to FormData object  
    for (var i = 0; i < files.length; i++) {
        fileData.append(files[i].name, files[i]);
    }
    console.log(fileData);

    var object = {};
    fileData.forEach((value, key) => {
        // Reflect.has in favor of: object.hasOwnProperty(key)
        if (!Reflect.has(object, key)) {
            object[key] = value;
            return;
        }
        if (!Array.isArray(object[key])) {
            object[key] = [object[key]];
        }
        object[key].push(value);
    });
    
    var json = JSON.stringify(object);
    var request = new XMLHttpRequest();
    request.open("POST", "/api/FlightPlan");
    request.setRequestHeader("Content-Type", "application/json");
    request.send(json);
    /**
    $.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: '/api/FlightPlan',
        type: 'POST',
        data: json,
        cache: false,
        contentType: false,
        processData: false,
        success: function (file) {
            $("#fileProgress").hide();
            $("#lblMessage").html("<b>" + file.name + "</b> has been uploaded.");
        },
        error: function (xhr, status, p3, p4) {
            var err = "Error " + " " + status + " " + p3 + " " + p4;
            if (xhr.responseText && xhr.responseText[0] == "{")
                err = JSON.parse(xhr.responseText).Message;
            console.log(err);
        }
    });   
*/



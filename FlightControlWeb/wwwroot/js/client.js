
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
   



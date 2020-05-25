//global 
var mymap;
var markerDict = {};
var firstpolyline = null;


function functionToBeExecuted() {
    setInterval(function () {
        var xhttp = new XMLHttpRequest();
        var table = document.getElementById("flightsTable");
        table.innerHTML = "";
        var date = new Date();
        var currentDate = date.toISOString();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var flightArray = JSON.parse(this.responseText);
                addMarkers(flightArray);
                for (i in flightArray) {
                    //document.getElementById('myTable').getElementsByTagName('tbody')[0]
                    var table = document.getElementById("flightsTable");
                    var row = table.insertRow(0);
                    var array = flightArray[i];
                    row.setAttribute("id", array["flightId"]);
                    row.addEventListener("click", selectFlight(), false);
                    var cell1 = row.insertCell(0);
                    cell1.addEventListener("click", selectFlight(), false);
                    var cell2 = row.insertCell(1);
                    cell2.addEventListener("click", selectFlight(), false);
                    cell1.innerHTML = array["flightId"];
                    cell2.innerHTML = array["companyName"];
                    var cell3 = row.insertCell(2);
                    cell3.innerHTML = '<i onclick="deleteflight()" class="far fa-window-close"></i>';
                }
            }
        };
        xhttp.open("GET", "/api/Flights?relative_to=" + currentDate, true);
        xhttp.send();
    }, 3000);
    initMap();   
}

function initMap() {
    mymap = L.map('mapid').setView([32.006333,34.873331,], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2FwaXJhc3IiLCJhIjoiY2thbDlxaDcxMHMzNTJzcGloMGl2dWJwcSJ9.BiS3Rh5E7nvb1L1zyCcjuQ', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'your.mapbox.access.token'
    }).addTo(mymap);
}

function addMarkers(array) {
    for (var key in markerDict) {
        markerDict[key].remove();
    }
    var planeIcon = L.icon({
        iconUrl: 'lib/plane.png',
        iconSize: [24,24], // size of the icon
        //shadowSize: [50, 64], // size of the shadow
        //iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        //shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    for (i in array) {    
        var flight = array[i];
        var longitude = flight["longitude"];
        var latitude = flight["latitude"];
        var id = flight["flightId"];
        console.log(longitude);
        console.log(latitude);
        var marker = L.marker([latitude, longitude], { icon: planeIcon }).addTo(mymap);
        markerDict[id] = marker;
        marker.on('click', function () {
            marker.bindPopup(id).openPopup();
            flightDetails(id);
            selectFlightFromMap(id);
            showTrajectory(id);
        });    
    }
}

function showTrajectory(id) {
    if (firstpolyline != null) {
        firstpolyline.remove();
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var flightPlan = JSON.parse(this.responseText);
            console.log(flightPlan);
            var initialPoint = flightPlan.initialLocation;
            console.log(initialPoint);
            var initialLongtitude = initialPoint["longitude"];
            var initialLatitude = initialPoint["latitude"];
            console.log(initialLongtitude);
            console.log(initialLatitude);
            var segments = flightPlan["segments"];
            var len = flightPlan["segments"].length;
            var endPoint = segments[len - 1];
            var endLongtitude = endPoint["longitude"];
            var endLatitude = endPoint["latitude"];
            console.log(endLongtitude);
            console.log(endLatitude);
            var start = new L.LatLng(initialLatitude, initialLongtitude);
            var end = new L.LatLng(endLatitude, endLongtitude);
            var pointList = [start, end];
            firstpolyline = new L.Polyline(pointList, {
                color: 'red',
                weight: 5,
                opacity: 0.5,
                smoothFactor: 1
            });
            firstpolyline.addTo(mymap);
        }
    };
    xhttp.open("GET", "/api/FlightPlan/" + id, true);
    xhttp.send();
}

function selectFlightFromMap(id) {
    var row = document.getElementById(id);  
    row.style.backgroundColor = "yellow";
    row.className += " selected";
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
            var id = rowSelected.cells[0].innerHTML;
            flightDetails(rowSelected.cells[0].innerHTML);
            var marker = markerDict[id];
            marker.bindPopup(id).openPopup();
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
            var flight = JSON.parse(this.responseText);
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
                total += parseInt(time);
            }
            var temp = Date.parse(date);
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
            var tds = rowSelected.getElementsByTagName('td');
            var id = tds[0].innerHTML;
            rowSelected.remove();
            deleteFromServer(id);
            deleteFlightDetails(id);
        }
    }
}

function deleteFromServer(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/api/Flights/" + id, true);
    xhttp.send(null);
}
function deleteFlightDetails(x) {
    var details = document.getElementsByClassName(x);
    details.innerHTML = "";
    for (i in details) {
        details[i].innerHTML = "";
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
                    json = JSON.stringify(e.target.result);
                    var request = new XMLHttpRequest();
                    request.open("POST", "/api/FlightPlan");
                    request.setRequestHeader("Content-Type", "application/json");
                    request.send(json);                      
                } catch (ex) {
                    alert('ex when trying to parse json = ' + ex);
                }
            }
        })(f);
        reader.readAsText(f);
    }
});
//global 
var mymap;
var markerDict = {};
var listPolyLine = [];
var activeInternalFlights = [];
var activeExternalFlights = [];
var idRowSelected = null;

function functionToBeExecuted() {
    setInterval(function () {
        var xhttp = new XMLHttpRequest();       
        $('#internal_table_body').empty();
        activeFlights = [];
        var date = new Date();
        var currentDate = date.toISOString().substr(0, 19) + "Z";
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var flightArray = JSON.parse(this.responseText);             
                addMarkers(flightArray);              
                for (i in flightArray) {
                    var flight = flightArray[i];
                    var isExternal = flight["isExternal"];  
                    if (!isExternal) {
                        $("#internal_table_body").append("<tr class='select'" + "id='" + flight.flightId + "'" + "><td class='select'>" + flight.flightId + "</td>" +
                            "<td class='select'>" + flight.companyName + "</td>" + "<td class='delete'>" +
                            '<i onclick="deleteflight()" class="far fa-window-close"></i>' + "</td></tr> ");                      
                        $(".select").on("click", function () {
                            selectFlight();
                        });
                        $(".delete").on("click", function () {                                              
                            var id = this.closest("tr").cells[0].innerHTML;                                                                   
                            deleteFromServer(id);
                            deleteFlightDetails(id);  
                            $(this).closest("tr").remove();
                        });
                        activeInternalFlights.push(flight["flightId"]);
                    } else {
                        loadExternalFlight(flight);
                        activeExternalFlights.push(flight["flightId"]);
                    }
                    if (idRowSelected != null) {
                        var row = document.getElementById(idRowSelected);                        
                        if (row != null) {
                            row.style.backgroundColor = "yellow";
                            row.className += " selected";
                        }
                    }
                }
            }
        };
        //"/api/Flights?relative_to=" + currentDate + "&sync_all"
        xhttp.open("GET", "/api/Flights?relative_to=" + currentDate + "&sync_all", true);
        xhttp.send();
    }, 5000);
    initMap();   
}

function loadExternalFlight(flight) {
    $('#external_table_body').empty();
    $("#external_table_body").append("<tr class='select'" + "id='" + flight.flightId + "'" + "><td class='select'>" + flight.flightId + "</td>" +
        "<td class='select'>" + flight.companyName + "</td></tr>");
    $(".select").on("click", function () {
        selectExternalFlight();
    });
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
    mymap.on('click', onMapClick);
}

function onMapClick() {
    for (i in listPolyLine) {
        mymap.removeLayer(listPolyLine[i]);
    }
    listPolyLine = [];
    var flightD = document.getElementById("Details");
    flightD.innerHTML = "";
    var rowsNotSelected = document.getElementsByClassName("selected");
    var row = rowsNotSelected[0];
    row.style.backgroundColor = "";
    row.classList.remove('selected');
    if (idRowSelected != null) {
        var row = document.getElementById(idRowSelected);
        if (row != null) {
            row.style.backgroundColor = "";
            row.classList.remove('selected');
        }
        idRowSelected = null;

    } 

}

function addMarkers(array) {
    for (var key in markerDict) {
        markerDict[key].remove();
    }
    var planeIcon = L.icon({
        iconUrl: 'lib/plane.png',
        iconSize: [24,24], // size of the icon
       // popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    for (i in array) {    
        var flight = array[i];
        var longitude = flight["longitude"];
        var latitude = flight["latitude"];
        var id = flight["flightId"];
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
    listPolyLine = [];   
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var flightPlan = JSON.parse(this.responseText);
            console.log(flightPlan);
            var initialPoint = flightPlan.initialLocation;
            console.log(initialPoint);
            var initialLongtitude = initialPoint["longitude"];
            var initialLatitude = initialPoint["latitude"];
            var segments = flightPlan["segments"];
            var len = flightPlan["segments"].length;
            for (var i = 0; i < len; i++) {
                var endPoint = segments[i];
                var endLongtitude = endPoint["longitude"];
                var endLatitude = endPoint["latitude"];
                var start = new L.LatLng(initialLatitude, initialLongtitude);
                var end = new L.LatLng(endLatitude, endLongtitude);
                var pointList = [start, end];
                console.log(start);
                console.log(end);
                var firstpolyline = new L.Polyline(pointList, {
                    color: 'red',
                    weight: 5,
                    opacity: 0.5,
                    smoothFactor: 1
                });
                firstpolyline.addTo(mymap);
                
                listPolyLine.push(firstpolyline);               
                initialLatitude = endLatitude;
                initialLongtitude = endLongtitude;
            }
            console.log(listPolyLine);
        }
    };
    xhttp.open("GET", "/api/FlightPlan/" + id, true);
    xhttp.send();
}

function selectFlightFromMap(id) {
    idRowSelected = id;
    var row = document.getElementById(id);  
    row.style.backgroundColor = "yellow";
    row.className += " selected";
}

function selectFlight() { 
    var table = document.getElementById('internalFlightsTable');
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
            idRowSelected = rowSelected.cells[0].innerHTML;
            flightDetails(rowSelected.cells[0].innerHTML);
            var marker = markerDict[idRowSelected];
            marker.bindPopup(idRowSelected).openPopup();
        }
    }
}

function selectExternalFlight() {
    var table = document.getElementById('externalFlightsTable');
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
            console.log(rowSelected);
            rowSelected.style.backgroundColor = "yellow";
            rowSelected.className += " selected";
            idRowSelected = rowSelected.cells[0].innerHTML;
            flightDetails(rowSelected.cells[0].innerHTML);
            var marker = markerDict[idRowSelected];
            marker.bindPopup(idRowSelected).openPopup();
        }
    }
}

function flightDetails(id) {
    var details = document.getElementById("Details");
    details.innerHTML = "";
    if (activeInternalFlights.includes(id)) {
        var details = document.getElementById("Details");
        details.innerHTML = "";
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
                passengers.setAttribute("class", id);
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
    } else {
        getDetailsExternal(id);
    }
}

function getDetailsExternal(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var servers = JSON.parse(this.responseText);
            console.log(servers);
            for (i in servers) {
                var server = servers[i];
                console.log(server);
                var serverUrl = server["serverUrl"];
                console.log(serverUrl);
                var url = serverUrl + "/api/FlightPlan/" + id;
                getFlightPlan(url, id);
            }
        }
    };
    xhttp.open("GET", "/api/servers", true);
    xhttp.send();

}

function externalTrajectory(flight) {
    console.log(flight);
    listPolyLine = []; 
    var initialPoint = flight.initial_location;
    console.log(initialPoint);
    var initialLongtitude = initialPoint["longitude"];
    var initialLatitude = initialPoint["latitude"];
    var segments = flight["segments"];
    var len = flight["segments"].length;
    for (var i = 0; i < len; i++) {
        var endPoint = segments[i];
        var endLongtitude = endPoint["longitude"];
        var endLatitude = endPoint["latitude"];
        var start = new L.LatLng(initialLatitude, initialLongtitude);
        var end = new L.LatLng(endLatitude, endLongtitude);
        var pointList = [start, end];
        console.log(start);
        console.log(end);
        var firstpolyline = new L.Polyline(pointList, {
            color: 'red',
            weight: 5,
            opacity: 0.5,
            smoothFactor: 1
        });
        firstpolyline.addTo(mymap);

        listPolyLine.push(firstpolyline);
        initialLatitude = endLatitude;
        initialLongtitude = endLongtitude;
    }
    console.log(listPolyLine);
}


function getFlightPlan(url, id) {
    var details = document.getElementById("Details");
    details.innerHTML = "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var flight = JSON.parse(this.responseText);
            console.log(flight);
            externalTrajectory(flight);
            console.log(flight);
            var heading = document.createElement("H3");
            heading.innerHTML = "Flight Details";
            document.getElementById("Details").appendChild(heading);
            heading.setAttribute("class", id);
            var flightId = document.createElement("P");                 // Create a <p> element
            flightId.innerHTML = "Flight id: " + id;                // Insert text
            document.getElementById("Details").appendChild(flightId);
            flightId.setAttribute("class", id);
            var company = flight["company_name"];
            var companyName = document.createElement("P");                 // Create a <p> element
            companyName.innerHTML = "Company: " + company;                // Insert text
            companyName.setAttribute("class", id);
            document.getElementById("Details").appendChild(companyName);
            var numPassengers = flight["passengers"];
            var passengers = document.createElement("P");                 // Create a <p> element
            passengers.innerHTML = "Passengers: " + numPassengers;                // Insert text
            document.getElementById("Details").appendChild(passengers);
            passengers.setAttribute("class", id);
            var initial = flight["initial_location"];
            var date = initial["date_time"];
            var dateTime = document.createElement("P");                 // Create a <p> element
            dateTime.innerHTML = "Date: " + date;                // Insert text
            dateTime.setAttribute("class", id);
            document.getElementById("Details").appendChild(dateTime);
            var segemnts = flight["segments"];
            var total = 0;
            for (i in segemnts) {
                var timespan = segemnts[i];
                var time = timespan["timespan_seconds"];
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
    xhttp.open("GET",url, true);
    xhttp.send();

}

function deleteflight(id) {
    console.log("$$$$$$$$");
    deleteFromServer(id);
    deleteFlightDetails(id);  
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


/** TO CHECK
$("#Details").on('click', function () {
    if (firstpolyline != null) {
        firstpolyline.remove();
    }
    var flightD = document.getElementById("Details");
    flightD.innerHTML = "";
    var rowSelected = document.getElementsByClassName("selected");
    var row = rowSelected[0];   
    row.style.backgroundColor = "";
    row.classList.remove('selected');
    if (idRowSelected != null) {
        var row = document.getElementById(idRowSelected);
        console.log(row);
        if (row != null) {
            row.style.backgroundColor = "";
            row.classList.remove('selected');
        }
        idRowSelected = null;

    } 

});
 */


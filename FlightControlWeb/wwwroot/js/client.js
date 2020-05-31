//global 
var mymap;
var markerDict = {};
var dictPolyLine = {};
var activeInternalFlights = {};
var activeExternalFlights = [];
var idRowSelected = null;
var markerSelected = null;

function functionToBeExecuted() {
    setInterval(function () {
        var xhttp = new XMLHttpRequest();       
        $('#internal_table_body').empty();
        activeInternalFlights = [];
        activeExternalFlights = [];
        var date = new Date();
        var currentDate = date.toISOString().substr(0, 19) + "Z";
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var flightArray = JSON.parse(this.responseText);
                    addMarkers(flightArray);
                    for (i in flightArray) {
                        var flight = flightArray[i];
                        var isExternal = flight["isExternal"];
                        if (!isExternal) {
                            loadInternalFlight(flight);
                            activeInternalFlights[flight["flightId"]] = "";
                            //activeInternalFlights.push(String(flight["flightId"]));
                           // console.log(activeInternalFlights);
                        } else {
                            loadExternalFlight(flight);
                            activeExternalFlights.push(flight["flightId"]);
                        }
                        if (idRowSelected !== null) {
                            var row = document.getElementById(idRowSelected);
                            if (row !== null) {
                                row.style.backgroundColor = "yellow";
                                row.className += " selected";
                            }
                        }
                    }
                } else {
                    console.log("Error", xhttp.statusText);
                    alert(xhttp.statusText);
                } 
            }
            checkIfFlightIsOver();
        };     
        xhttp.open("GET", "/api/Flights?relative_to=" + currentDate + "&sync_all", true);
        xhttp.send();
    }, 1000);
    initMap();   
}

function checkIfFlightIsOver() {
    var idClass = $("#flightDetails").attr("class");
    if (idClass !== null) {
       // console.log(idClass);
        deleteDetails(idClass);
        deleteTrajectory(idClass);
    }
}

function deleteDetails(id) {
    //console.log("heyyyyy");
    //console.log( id in activeInternalFlights);
    //console.log(activeInternalFlights.includes( Object(id)));
    //console.log(!activeInternalFlights.includes(id) && !activeExternalFlights.includes(id));
    if (!activeInternalFlights.includes(id) && !activeExternalFlights.includes(id)) {
        var details = document.getElementById("Details");
        details.innerHTML = "";
    }
}
function deleteTrajectory(id) {
    dictPolyLine[id] = [];
}
function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}
function loadExternalFlight(flight) {
    $('#external_table_body').empty();
    $("#external_table_body").append("<tr class='select'" + "id='" + flight.flightId + "'" + "><td class='select'>" + flight.flightId + "</td>" +
        "<td class='select'>" + flight.companyName + "</td></tr>");
    $(".select").on("click", function () {
        selectExternalFlight();
    });
}

function loadInternalFlight(flight) {
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
    console.log(dictPolyLine);
    for (var key in dictPolyLine) {
        console.log(dictPolyLine[key]);
        for (var poly in dictPolyLine[key]) {
            console.log(dictPolyLine[key][poly]);
            mymap.removeLayer(dictPolyLine[key][poly]);
        }
    }
    dictPolyLine = {};
    markerSelected = null;
    var flightD = document.getElementById("Details");
    flightD.innerHTML = "";
    var rowsNotSelected = document.getElementsByClassName("selected");
    var row = rowsNotSelected[0];
    row.style.backgroundColor = "";
    row.classList.remove('selected');
    if (idRowSelected !== null) {
        var row = document.getElementById(idRowSelected);
        if (row !== null) {
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
    });
    var clickedIcon = L.icon({
        iconUrl: 'lib/travel.png',
        iconSize: [24, 24], // size of the icon
    });
    for (i in array) {    
        var flight = array[i];
        var longitude = flight["longitude"];
        var latitude = flight["latitude"];
        var id = flight["flightId"];
        var marker;
        if (id !== markerSelected) {
             marker = L.marker([latitude, longitude], { icon: planeIcon }).addTo(mymap);
        } else {
             marker = L.marker([latitude, longitude], { icon: clickedIcon }).addTo(mymap);
        }
        markerDict[id] = marker;
        marker.on('click', function () {
            markerSelected = id;
            marker.setIcon(clickedIcon);
            marker.bindPopup(id).openPopup();
            flightDetails(id);
            selectFlightFromMap(id);
            showTrajectory(id);
        });    
    }
}

function showTrajectory(id) {  
   // dictPolyLine = {};
    var listPolyLines = [];
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
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
                    listPolyLines.push(firstpolyline);
                    initialLatitude = endLatitude;
                    initialLongtitude = endLongtitude;
                }
                console.log(listPolyLines);
                dictPolyLine[id] = listPolyLines;
                console.log(dictPolyLine);
            }
            else {
                alert("error in getting flight plan from server");
            }
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
        };
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
        };
    }
}

function flightDetails(id) {
    var details = document.getElementById("Details");
    details.innerHTML = "";
    dictPolyLine = {};

    if (activeInternalFlights.includes(id)) {
        var details = document.getElementById("Details");
        details.innerHTML = "";
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var flight = JSON.parse(this.responseText);
                    var heading = document.createElement("H3");
                    heading.innerHTML = "Flight Details";
                    document.getElementById("Details").appendChild(heading);
                    heading.setAttribute("class", id);
                    heading.setAttribute("id", "flightDetails");
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
                } else {
                    alert("error in getting flight details.");
                }
            }
        };
        xhttp.open("GET", "/api/FlightPlan/" + id, true);
        xhttp.send();
    } else {
        getDetailsExternal(id);
    }
}

function getDetailsExternal(id) {
    var details = document.getElementById("Details");
    details.innerHTML = "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
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
            } else {
                alert("error in getting the servers list.");
            }
        }
    };
    xhttp.open("GET", "/api/servers", true);
    xhttp.send();

}

function externalTrajectory(flight) {
    console.log(flight);
    //dictPolyLine = {}; 
    var listPolyLines = [];
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
        listPolyLines.push(firstpolyline);
       
        initialLatitude = endLatitude;
        initialLongtitude = endLongtitude;
    }
    dictPolyLine[flight.flightId] = listPolyLines;
    console.log(dictPolyLine);
}


function getFlightPlan(url, id) {
    var details = document.getElementById("Details");
    details.innerHTML = "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
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
            } else {
                alert("error in getting external flight details");
            }
        } 
    };
    xhttp.open("GET",url, true);
    xhttp.send();

}

function deleteflight(id) {
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
                    request.open("POST", "/api/FlightPlan",true);
                    request.setRequestHeader("Content-Type", "application/json");
                    request.onreadystatechange = function () {//Call a function when the state changes.
                        if (request.readyState === 4 && request.status !== 200) {
                            alert(request.responseText);
                        }
                    };
                    request.send(json);
                   
                } catch (ex) {
                    
                    alert('ex when trying to upload json file: ' + ex);
                }
            };
        })(f);
        reader.readAsText(f);
    }
});
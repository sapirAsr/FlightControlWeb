﻿let mymap;
let markerDict = {};
let dictPolyLine = {};
let activeInternalFlights = [];
let activeExternalFlights = [];
let activeFlights = [];
let idRowSelected = null;
let markerSelected = null;
let planeIcon = L.icon({
    iconUrl: 'lib/plane.png',
    iconSize: [24, 24] 
});
let clickedIcon = L.icon({
    iconUrl: 'lib/travel.png',
    iconSize: [24, 24] 
});

/**
 * loading all the flights from the server and sendung them to functions to handle the information 
 */
function functionToBeExecuted() {
    setInterval(function () {
        let xhttp = new XMLHttpRequest();
        let date = new Date();
        let currentDate = date.toISOString().substr(0, 19) + "Z";
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let flightArray = JSON.parse(this.responseText);
                    let listOfIds = [];
                    //adding all the flights icons to the map
                    addMarkers(flightArray);                   
                    let i;
                    for (i = 0; i < flightArray.length; i++) {  
                        let flight = flightArray[i];  
                        //checking if the flight exist in our program
                        if (!activeInternalFlights.includes(flight.flightId) &&
                            !activeExternalFlights.includes(flight.flightId)) {
                            let isExternal = flight["isExternal"];
                            if (!isExternal) {
                                loadInternalFlight(flight);
                                activeInternalFlights.push(flight.flightId);
                                activeFlights.push(flight.flightId);
                            } else {                               
                                loadExternalFlight(flight);
                                activeExternalFlights.push(flight.flightId);
                                activeFlights.push(flight.flightId);                               
                            }
                            if (idRowSelected !== null) {
                                let row = document.getElementById(idRowSelected);
                                if (row !== null) {
                                    row.style.backgroundColor = "Lavender";
                                    row.className += " selected";
                                }                            
                            }
                        }
                        listOfIds.push(flight.flightId);                   
                    }
                    //checking if a flight isn't active anymore, if so we delete all the info about it
                    for (i = 0; i < activeFlights.length; i++) {
                        if (!listOfIds.includes(activeFlights[i])) {
                            $('#' + activeFlights[i]).remove();
                            deleteTrajectory(activeFlights[i]);
                            deleteFlightDetails(activeFlights[i]);
                        }
                    }                 
                } else {                   
                    console.log("Error", xhttp.statusText);
                    alert(xhttp.statusText);
                } 
            }           
        };     
        xhttp.open("GET", "/api/Flights?relative_to=" + currentDate + "&sync_all", true);
        xhttp.send();
    }, 1000);
    //inserting the map to our program
    initMap();   
}

/**
 * loading flights to the external flights table
 * @param {any} flight the flight to load to the table 
 */
function loadExternalFlight(flight) {
    $("#external_table_body").append("<tr class='select'" + "id='" + flight.flightId +
        "'" + "><td class='select'>" + flight.flightId + "</td>" +
        "<td class='select'>" + flight.companyName + "</td></tr>");
    $(".select").on("click", function () {
        selectExternalFlight();
    });
}
/**
 * loading flights to the internal flights table
 * @param {any} flight the flight to load to the table
 */
function loadInternalFlight(flight) {
    $("#internal_table_body").append("<tr class='select'" + "id='" + flight.flightId +
        "'" + "><td>" + flight.flightId + "</td>" +
        "<td >" + flight.companyName + "</td>" + "<td class='delete'>" +
        '<i onclick="deleteflight()" class="far fa-window-close"></i>' + "</td></tr> ");
    $(".select").on("click", function () {
        selectFlight();
    });
    $(".delete").on("click", function(event) {
        event.stopPropagation();      
        let id = this.closest("tr").cells[0].innerHTML;
        deleteFromServer(id);
        deleteFlightDetails(id);
        $(this).closest("tr").remove();
    });
}
/**
 * setting the map
  */
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
/**
 * undo actions when clicking the map
 * */
function onMapClick() {
   for (var key in dictPolyLine) {      
       for (var poly in dictPolyLine[key]) {
           mymap.removeLayer(dictPolyLine[key][poly]);
       }
   }
    dictPolyLine = {};  
    markerSelected = null;
    let flightD = document.getElementById("Details");
    flightD.innerHTML = "";
    let rowsNotSelected = document.getElementsByClassName("selected");
    let row = rowsNotSelected[0];
    row.style.backgroundColor = "";
    row.classList.remove('selected');
    if (idRowSelected !== null) {
        let rowSelected = document.getElementById(idRowSelected);
        if (rowSelected !== null) {
            rowSelected.style.backgroundColor = "";
            rowSelected.classList.remove('selected');
        }
        idRowSelected = null;
    } 
}
/**
 * 
 * @param {any} array of flights to set all the markers
 */
function addMarkers(array) {
    for (var key in markerDict) {
        mymap.removeLayer(markerDict[key]);
    }    
    for (i in array) {
        let flight = array[i];
        let longitude = flight["longitude"];
        let latitude = flight["latitude"];
        let id = flight["flightId"];
        let marker;
        if (id !== markerSelected) {
             marker = L.marker([latitude, longitude], { icon: planeIcon }).addTo(mymap);
        } else {
             marker = L.marker([latitude, longitude], { icon: clickedIcon }).addTo(mymap);
        }
        markerDict[id] = marker;
        onMarkerClick(flight);
            
    }
}

/**
 * 
 * @param {any} flight set the flight marker on click function
 */
function onMarkerClick(flight) {
    let id = flight["flightId"];
    let isExternal = flight["isExternal"];
    let marker = markerDict[id];
    marker.on('click', function () {
        markerSelected = id;  
        for (var key in dictPolyLine) {
            for (var poly in dictPolyLine[key]) {
                mymap.removeLayer(dictPolyLine[key][poly]);
            }
        }
        if (!isExternal) {
           
            flightDetails(id);
            showTrajectory(id);
        } else {
            //get the details and show the trajectory
            getDetailsExternal(id);
        }
        marker.setIcon(clickedIcon);
        selectFlightFromMap(id);
    });
}

/**
 * 
 * @param {any} id of the internal flight we get the flight plan and show it trajectory on the map
 */
function showTrajectory(id) { 
    let listPolyLines = [];
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let flightPlan = JSON.parse(this.responseText);
                let initialPoint = flightPlan.initialLocation;
                let initialLongtitude = initialPoint["longitude"];
                let initialLatitude = initialPoint["latitude"];
                let segments = flightPlan["segments"];
                let len = flightPlan["segments"].length;
                for (var i = 0; i < len; i++) {
                    let endPoint = segments[i];
                    let endLongtitude = endPoint["longitude"];
                    let endLatitude = endPoint["latitude"];
                    let start = new L.LatLng(initialLatitude, initialLongtitude);
                    let end = new L.LatLng(endLatitude, endLongtitude);
                    let pointList = [start, end];
                    let firstpolyline = new L.Polyline(pointList, {
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
                dictPolyLine[id] = listPolyLines;
            }
            else {
                alert("error in getting flight plan from server");
            }
        }
    };
    xhttp.open("GET", "/api/FlightPlan/" + id, true);
    xhttp.send();
}

/**
 * 
 * @param {any} flight the flight plan of the external flight
 * @param {any} id of the external flight we get the flught plan and show it trajectory on the map
 */
function externalTrajectory(flight, id) {
    let listPolyLines = [];
    let initialPoint = flight.initial_location;
    let initialLongtitude = initialPoint["longitude"];
    let initialLatitude = initialPoint["latitude"];
    let segments = flight["segments"];
    let len = flight["segments"].length;
    for (var i = 0; i < len; i++) {
        let endPoint = segments[i];
        let endLongtitude = endPoint["longitude"];
        let endLatitude = endPoint["latitude"];
        let start = new L.LatLng(initialLatitude, initialLongtitude);
        let end = new L.LatLng(endLatitude, endLongtitude);
        let pointList = [start, end];
        let firstpolyline = new L.Polyline(pointList, {
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
    dictPolyLine[id] = listPolyLines;
}
/**
 * 
 * @param {any} id of the flight we select from the table when clicking a flight marker from map
 */
function selectFlightFromMap(id) {
    console.log(idRowSelected);
    if (idRowSelected !== null) {
        let rowSelected = document.getElementById(idRowSelected);
        rowSelected.style.backgroundColor = "";
        rowSelected.classList.remove('selected');
        
    }   
    idRowSelected = id;
    markerSelected = id;
    console.log(idRowSelected);
    let row = document.getElementById(id);  
    row.style.backgroundColor = "Lavender";
    row.className += " selected";
}
/**
 * select flight from internal flights table
  */
function selectFlight() { 
    let table = document.getElementById('internalFlightsTable');
    let rows = table.getElementsByTagName('tr');
    let externalTable = document.getElementById('externalFlightsTable');
    let externalRows = externalTable.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        // Take each row
        let row = rows[i];
        // do something on onclick event for row
        row.onclick = function () {           
            // Get the row id 
            let rowId = this.rowIndex;
            for (var row = 0; row < rows.length; row++) {
                rows[row].style.backgroundColor = "";
                rows[row].classList.remove('selected');
            }
            for (var rowEx = 0; rowEx < externalRows.length; rowEx++) {
                externalRows[rowEx].style.backgroundColor = "";
                externalRows[rowEx].classList.remove('selected');
            }

            let rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "Lavender";
            rowSelected.className += " selected";
            if (idRowSelected !== rowSelected.cells[0].innerHTML) {             
                deleteTrajectory(idRowSelected);
                idRowSelected = rowSelected.cells[0].innerHTML;
                flightDetails(rowSelected.cells[0].innerHTML);
                let marker = markerDict[idRowSelected];
                marker.setIcon(clickedIcon);
                markerSelected = idRowSelected;
                showTrajectory(idRowSelected);
            }
        };
    }
}
/**
 * select flight from external flights table
  */
function selectExternalFlight() {
    let table = document.getElementById('externalFlightsTable');
    let rows = table.getElementsByTagName('tr');
    let internalTable = document.getElementById('internalFlightsTable');
    let internalRows = internalTable.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        // Take each row
        let row = rows[i];
        // do something on onclick event for cell
        row.onclick = function () {
            // Get the row id where the cell exists
            let rowId = this.rowIndex;
            for (var row = 0; row < rows.length; row++) {
                rows[row].style.backgroundColor = "";
                rows[row].classList.remove('selected');
            }
            for (var rowIn = 0; rowIn < internalRows.length; rowIn++) {
                internalRows[rowIn].style.backgroundColor = "";
                internalRows[rowIn].classList.remove('selected');
            }
            let rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "Lavender";
            rowSelected.className += " selected";
            if (idRowSelected !== rowSelected.cells[0].innerHTML) {
                deleteTrajectory(idRowSelected);
                idRowSelected = rowSelected.cells[0].innerHTML;
                getDetailsExternal(idRowSelected);
                let marker = markerDict[idRowSelected];
                marker.setIcon(clickedIcon);
                markerSelected = idRowSelected;              
            }
        };
    }
}
/**
 * 
 * @param {any} id of the flight we show it details
 */
function flightDetails(id) {
    let details = document.getElementById("Details");
    details.innerHTML = "";
    dictPolyLine = {};
    if (activeInternalFlights.includes(id)) {
        details = document.getElementById("Details");
        details.innerHTML = "";
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let flight = JSON.parse(this.responseText);
                    parseInternalFlightDetails(flight, id);
                    
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
/**
 * 
 * @param {any} id of the external flight we show it details
 */
function getDetailsExternal(id) {
    let details = document.getElementById("Details");
    details.innerHTML = "";
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let servers = JSON.parse(this.responseText);
                for (i in servers) {
                    let server = servers[i];
                    let serverUrl = server["serverUrl"];
                    let url = serverUrl + "/api/FlightPlan/" + id;
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
/**
 * 
 * @param {any} url of the request to the flight plan we want
 * @param {any} id of the flight
 */
function getFlightPlan(url, id) {
    let details = document.getElementById("Details");
    details.innerHTML = "";
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let flight = JSON.parse(this.responseText);
                parseExternalFlightDetails(flight, id);
                externalTrajectory(flight,id);
            } else {
                alert("error in getting external flight details");
            }
        } 
    };
    xhttp.open("GET",url, true);
    xhttp.send();
}
/**
 * 
 * @param {any} id of the flight we want to delete from the server
 */
function deleteFromServer(id) {
    let xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/api/Flights/" + id, true);
    xhttp.send(null);
}
/**
 * 
 * @param {any} id of the flight we want to delete it details
 */
function deleteFlightDetails(id) {
    let details = document.getElementsByClassName(id);
    details.innerHTML = "";
    for (i in details) {
        details[i].innerHTML = "";
    }
}
/**
 * 
 * @param {any} id of the flight we want to deltet its trajectory
 */
function deleteTrajectory(id) {
    console.log(dictPolyLine);
    for (var poly in dictPolyLine[id]) {
        console.log(dictPolyLine[id][poly]);
        mymap.removeLayer(dictPolyLine[id][poly]);
    }
    dictPolyLine[id] = [];
}
/*
 *function gets a file from the browser and send it to the server
 *
 */
$('#txtUploadFile').on('change', function (e) {
    let json;
    let files = e.target.files; // FileList object
    // files is a FileList of File objects. List some properties.
    let output = [];
    for (var i = 0, f; f = files[i]; i++) {
        let reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                try {
                    json = JSON.stringify(e.target.result);
                    let request = new XMLHttpRequest();
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
/**
 * 
 * @param {any} flight the flight plan to parse it details
 * @param {any} id of the external flight
 */
function parseExternalFlightDetails(flight, id) {
    let heading = document.createElement("H3");
    heading.innerHTML = "Flight Details";
    document.getElementById("Details").appendChild(heading);
    heading.setAttribute("class", id);
    heading.setAttribute("id", "flightDetails");
    let flightId = document.createElement("P");                 // Create a <p> element
    flightId.innerHTML = "Flight id: " + id;                // Insert text
    document.getElementById("Details").appendChild(flightId);
    flightId.setAttribute("class", id);
    let company = flight.company_name;
    let companyName = document.createElement("P");                 // Create a <p> element
    companyName.innerHTML = "Company: " + company;                // Insert text
    companyName.setAttribute("class", id);
    document.getElementById("Details").appendChild(companyName);
    let numPassengers = flight.passengers;
    let passengers = document.createElement("P");                 // Create a <p> element
    passengers.innerHTML = "Passengers: " + numPassengers;   
    document.getElementById("Details").appendChild(passengers);
    passengers.setAttribute("class", id);
    let initial = flight.initial_location;
    let date = initial.date_time;
    let dateTime = document.createElement("P");                 // Create a <p> element
    dateTime.innerHTML = "Date: " + date;                // Insert text
    dateTime.setAttribute("class", id);
    document.getElementById("Details").appendChild(dateTime);
    let segments = flight.segments;
    let total = 0;
    for (i in segments) {
        let timespan = segments[i];
        let time = timespan.timespan_seconds;
        total += parseInt(time);
    }
    let temp = Date.parse(date);
    let d = new Date(temp);
    d.setSeconds(d.getSeconds() + total);
    let landing = document.createElement("P");                 // Create a <p> element
    landing.innerHTML = "Landing time: " + d.toUTCString();                // Insert text
    document.getElementById("Details").appendChild(landing);
    landing.setAttribute("class", id);    
}
/**
 *
 * @param {any} flight the flight plan to parse it details
 * @param {any} id of the internal flight
 */
function parseInternalFlightDetails(flight, id){
    let heading = document.createElement("H3");
    heading.innerHTML = "Flight Details";
    document.getElementById("Details").appendChild(heading);
    heading.setAttribute("class", id);
    heading.setAttribute("id", "flightDetails");
    let flightId = document.createElement("P");                 // Create a <p> element
    flightId.innerHTML = "Flight id: " + id;                // Insert text
    document.getElementById("Details").appendChild(flightId);
    flightId.setAttribute("class", id);
    let company = flight["companyName"];
    let companyName = document.createElement("P");                 // Create a <p> element
    companyName.innerHTML = "Company: " + company;                // Insert text
    companyName.setAttribute("class", id);
    document.getElementById("Details").appendChild(companyName);
    let numPassengers = flight["passengers"];
    let passengers = document.createElement("P");                 // Create a <p> element
    passengers.innerHTML = "Passengers: " + numPassengers;                // Insert text
    document.getElementById("Details").appendChild(passengers);
    passengers.setAttribute("class", id);
    let initial = flight["initialLocation"];
    let date = initial["dateTime"];
    let dateTime = document.createElement("P");                 // Create a <p> element
    dateTime.innerHTML = "Date: " + date;                // Insert text
    dateTime.setAttribute("class", id);
    document.getElementById("Details").appendChild(dateTime);
    let segemnts = flight["segments"];
    let total = 0;
    for (i in segemnts) {
        let timespan = segemnts[i];
        let time = timespan["timespanSeconds"];
        total += parseInt(time);
    }
    let temp = Date.parse(date);
    let d = new Date(temp);
    d.setSeconds(d.getSeconds() + total);
    let landing = document.createElement("P");                 // Create a <p> element
    landing.innerHTML = "Landing time: " + d.toUTCString();                // Insert text
    document.getElementById("Details").appendChild(landing);
    landing.setAttribute("class", id);
}
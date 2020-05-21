
function loadFlights() {
    var xhttp = new XMLHttpRequest();
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
                cell1.innerHTML = array["flightId"];
                cell2.innerHTML = array["companyName"];
            }
           
        }
    };
    xhttp.open("GET", "/api/Flights", true);
    xhttp.send();
}

function selectFlight() {
    var index,
        table = document.getElementById("flightsTable");
    console.log("check");
    for (var i = 1; i < table.rows.length; i++) {
        table.rows[i].onclick = function () {
            // remove the background from the previous selected row
            if (typeof index !== "undefined") {
                table.rows[index].classList.toggle("selected");
            }
            console.log(typeof index);
            // get the selected row index
            index = this.rowIndex;
            // add class selected to the row
            this.classList.toggle("selected");
            console.log(typeof index);
        };
    }

}
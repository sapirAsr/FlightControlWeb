using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlightControlWeb.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FlightControlWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlightPlanController : ControllerBase
    {
        private IFlightManager flightManager = new FlightManager();

        //function returns the flight plan of the flight with this id
        [HttpGet]
        //api/FlightPlan/{id}
        public ActionResult<Flight> Get(string id)
        {
            return flightManager.GetFlightById(id);
        }


        //function post the flight plan of a new flight
        [HttpPost]
        // api/FlightPlan
        public Flight Post(Flight f)
        {
            flightManager.AddFlight(f);
            return f;
        }

        //function deletes the flight with this id
        [HttpDelete]
        //api/Flights/{id}
        public void Delete(string id)
        {
            flightManager.DeleteFlight(id);

        }
    }
}
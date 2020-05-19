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
    public class FlightController : ControllerBase
    {
        private IFlightManager flightManager = new FlightManager();
        [HttpGet]
        //relative to
        public IEnumerable<Flight> GetAllFlights()
        {
            //todo
            return flightManager.GetAllFlights();
        }


        ///api/Flights?relative_to=<DATE_TIME>
    }
}
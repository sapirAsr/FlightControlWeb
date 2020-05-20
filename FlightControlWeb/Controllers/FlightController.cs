using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlightControlWeb.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace FlightControlWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlightController : ControllerBase
    {
        private IFlightManager flightManager = new FlightManager();
        private IMemoryCache _cache;

        public FlightController(IMemoryCache cache)
        {
            _cache = cache;
        }
        [HttpGet]
        //relative to
        public IEnumerable<Flight> GetAllFlights(string relative_to)
        {
            DateTime currTime = DateTime.Parse(relative_to);
            bool addBool = _cache.TryGetValue("ids", out List<string> ids);
            foreach(string id in ids)
            {
                _cache.TryGetValue(id, out FlightPlan fp);
                DateTime flightDate = fp.InitialLocation.DateTime;

                int result = DateTime.Compare(currTime, date2);
            }
           
            //todo
            return flightManager.GetAllFlights();
        }


        ///api/Flights?relative_to=<DATE_TIME>
    }
}
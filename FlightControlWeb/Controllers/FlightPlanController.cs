using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using FlightControlWeb.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace FlightControlWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlightPlanController : ControllerBase
    {
        private FlightPlanManager flightManager = new FlightPlanManager();
        private IMemoryCache _cache;

        public FlightPlanController(IMemoryCache cache)
        {
            _cache = cache;
        }
        //This function returns the flight plan of a flight with his id
        [HttpGet("{id}")]
        //api/FlightPlan/{id}
        public ActionResult<FlightPlan> Get(string id)
        {
            bool get = _cache.TryGetValue(id, out FlightPlan item);
            if (get)
            {
                return item;
            }
            return null;

        }


        //This function posts the flight plan of a new flight
        [HttpPost]
        // api/FlightPlan
        public ActionResult<FlightPlan> Post(JsonElement planJson)
        {
            try
            {
                string plan = planJson.ToString();
                dynamic jsonObj = JsonConvert.DeserializeObject(plan);
                //parsing the json
                long passengers = jsonObj["passengers"];
                string company_name = jsonObj["company_name"];
                double longitude = jsonObj["initial_location"]["longitude"];
                double latitude = jsonObj["initial_location"]["latitude"];
                DateTime date_time = jsonObj["initial_location"]["date_time"];
                Segment[] segments = new Segment[jsonObj["segments"].Count];
                int i = 0;
                foreach (var segment in jsonObj["segments"])
                {
                    segments[i] = new Segment
                    {
                        Latitude = segment["latitude"],
                        Longitude = segment["longitude"],
                        TimespanSeconds = segment["timespan_seconds"]
                    };
                    i++;
                }
                FlightPlan f = new FlightPlan
                {
                    CompanyName = company_name,
                    Passengers = passengers,
                    InitialLocation = new InitialLocation
                    {
                        Latitude = latitude,
                        Longitude = longitude,
                        DateTime = date_time
                    },
                    Segments = segments
                };
                string id = flightManager.GenerateId();
                f.FlightId = id;
                bool addBool = _cache.TryGetValue("ids", out List<string> ids);
                if (addBool)
                {
                    ids.Add(id);
                }
                _cache.Set(id, f);
                return f;
            }
            catch (Exception)
            {              
                return BadRequest("Worng json file format!");
            }
          
       }
    }
}
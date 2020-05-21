using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FlightControlWeb.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace FlightControlWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlightsController : ControllerBase
    {
        private IFlightManager flightManager = new FlightManager();
        private IMemoryCache _cache;

        public FlightsController(IMemoryCache cache)
        {
            _cache = cache;
        }
        [HttpGet]
        // /api/Flights?relative_to=<DATE_TIME>
        public IEnumerable<Flight> GetAllFlights(string? relative_to = null)
        {
            List<Flight> listflights = new List<Flight>();
            if (relative_to != null)
            {
                bool sync = relative_to.Contains("&sync_all");
                DateTime currTime = DateTime.Parse(relative_to);
                bool addBool = _cache.TryGetValue("ids", out List<string> ids);
                foreach (string id in ids)
                {
                    _cache.TryGetValue(id, out FlightPlan fp);
                    DateTime flightDate = addTimeSpans(fp);

                    int result = DateTime.Compare(currTime, flightDate);
                    if (result < 0)
                    {
                        Flight flight = new Flight(fp, fp.FlightId);
                        listflights.Add(flight);
                    }
                }
                if (sync)
                {
                    bool servers = _cache.TryGetValue("servers", out List<string> serverIds);
                    foreach (string id in serverIds)
                    {
                        _cache.TryGetValue(id, out Server server);
                        string strFlights = string.Empty;
                        string url = server.ServerUrl;
                        //TODO sen the relative to
                        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                        request.AutomaticDecompression = DecompressionMethods.GZip;

                        using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                        using (Stream stream = response.GetResponseStream())
                        using (StreamReader reader = new StreamReader(stream))
                        {
                            //read the content
                            strFlights = reader.ReadToEnd();
                        };
                        //TODO is_external - true 
                        List<Flight> flights = JsonConvert.DeserializeObject<List<Flight>>(strFlights);
                        listflights.AddRange(flights);
                    }
                }
            }
            else
            {
                bool addBool = _cache.TryGetValue("ids", out List<string> ids);
                foreach (string id in ids)
                {
                    _cache.TryGetValue(id, out FlightPlan fp);
                    Flight flight = new Flight(fp, fp.FlightId);
                    listflights.Add(flight);
                    
                }
            }
           
            return listflights;
        }
         public DateTime addTimeSpans(FlightPlan flightPlan)
        {
            DateTime flightDate = flightPlan.InitialLocation.DateTime;
            foreach(var segment in flightPlan.Segments)
            {
                TimeSpan seconds = new TimeSpan(0, 0, (int)segment.TimespanSeconds);
                flightDate.Add(seconds);
            }
            return flightDate;
        }

        
    }
}
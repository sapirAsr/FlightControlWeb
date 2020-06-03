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
        private IMemoryCache _cache;

        public FlightsController(IMemoryCache cache)
        {
            _cache = cache;
        }

        //This function returns all the flights that according to the relative to
        [HttpGet]
        // /api/Flights?relative_to=<DATE_TIME>
        public async Task<List<Flight>> GetAllFlights(string relative_to)
        {
            List<Flight> listflights = new List<Flight>();
            string requestStr = Request.QueryString.Value;
            bool sync = requestStr.Contains("sync_all");
            DateTime relativeTime = DateTime.Parse(relative_to).ToUniversalTime();
            List<Flight> internalFlights = getInternalFlights(relativeTime);
            listflights.AddRange(internalFlights);
            if (sync)
            {
                List<Flight> externalFlights = await getExternalFlights(relative_to);
                listflights.AddRange(externalFlights);
            }
            return listflights;
        }

        //This function returns only the flights from the internal server
        private List<Flight> getInternalFlights(DateTime relativeTime)
        {
            List<Flight> flights = new List<Flight>();
            _cache.TryGetValue("ids", out List<string> ids);
            DateTime startFlightDate, currFlightDate;
            Segment[] segments;

            foreach (string id in ids)
            {
                _cache.TryGetValue(id, out FlightPlan flightPlan);
                currFlightDate = flightPlan.InitialLocation.DateTime.ToUniversalTime();
                startFlightDate = flightPlan.InitialLocation.DateTime.ToUniversalTime();
                segments = flightPlan.Segments;
                int index = 0;
                int len = segments.Length;
                if (startFlightDate > relativeTime)
                {
                    // if the flight didnt started yet.
                    continue;
                }
                // Stop when we are in the segment or there are no more segments.
                while ((startFlightDate <= relativeTime) && (index < len))
                {
                    currFlightDate = startFlightDate;
                    // sums all the segments timespan
                    startFlightDate = startFlightDate.AddSeconds(segments[index].TimespanSeconds);
                    index++;
                }
                // The flight didn't end yet.
                if (startFlightDate >= relativeTime)
                {                  
                    Flight flight = CalcLocation(relativeTime, currFlightDate, flightPlan, index, segments);
                    flights.Add(flight);
                }
            }
            return flights;
        }

        //This function is responsible for the interpolation.
        private Flight CalcLocation(DateTime relativeDate, DateTime currTimeFlifgt, FlightPlan flightPlan, int index, Segment[] flightSegments)
        {
            double startLongtitude = 0, endLongtitude, startLatitude = 0, endLatitude, finalLongtitude, finalLatitude;
            double timePassed, fracRate;
            // finds the time that passed until now.
            timePassed = relativeDate.Subtract(currTimeFlifgt).TotalSeconds;
            // Find the time ratio.
            fracRate = timePassed / flightSegments[index - 1].TimespanSeconds;
            // the first segment
            if (index == 1)
            {                
                startLongtitude = flightPlan.InitialLocation.Longitude;
                startLatitude = flightPlan.InitialLocation.Latitude;
            }
            else
            {
                startLongtitude = flightSegments[index - 2].Longitude;
                startLatitude = flightSegments[index - 2].Latitude;
            }
            // The current segment's coordinates.
            endLongtitude = flightSegments[index - 1].Longitude;
            endLatitude = flightSegments[index - 1].Latitude;
            // calculate the intepolation.
            finalLatitude = startLatitude + (fracRate * (endLatitude - startLatitude));
            finalLongtitude = startLongtitude + (fracRate * (endLongtitude - startLongtitude));
            Flight flight = new Flight(flightPlan.FlightId, flightPlan.CompanyName,
                flightPlan.Passengers, false, finalLatitude, finalLongtitude,
                flightPlan.InitialLocation.DateTime);
            return flight;
        }

        //This function returns all the flight from external servers.
       private async Task<List<Flight>> getExternalFlights(string relativeTime)
        {
            //List<Flight> flights = new List<Flight>();
            _cache.TryGetValue("servers", out List<string> serverIds);
            List<Flight> externalFlights = new List<Flight>();
            foreach (string id in serverIds)
            {
                _cache.TryGetValue(id, out Server server);              
                string url = server.ServerUrl + "/api/Flights?relative_to=" + relativeTime;
                List<Flight> flights = await getFlights(url);
                externalFlights.AddRange(flights);

            }
            foreach (Flight f in externalFlights)
            {
                f.IsExternal = true;
            }
            return externalFlights;
        }

        //This function calls the GET method of the server.
        private async Task<List<Flight>> getFlights(string url)
        {
            List<Flight> flights = new List<Flight>();            
            string strFlights = string.Empty;
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.AutomaticDecompression = DecompressionMethods.GZip;
            request.Method = "GET";
            try
            {
                using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
                using (Stream stream = response.GetResponseStream())
                using (StreamReader reader = new StreamReader(stream))
                {
                    //read the content
                    strFlights = reader.ReadToEnd();
                    reader.Close();
                };
                flights = JsonConvert.DeserializeObject<List<Flight>>(strFlights);

            }
            catch (Exception)
            {
               // return null;
            }
            return flights;
        }

        //This function deletes the flight acording to id
        [HttpDelete("{id}")]
        //api/Flights/{id}
        public void Delete(string id)
        {
            _cache.Remove(id);
            bool deleteBool = _cache.TryGetValue("ids", out List<string> ids);
            if (deleteBool)
            {
                ids.Remove(id);
            }
        }
    }
}
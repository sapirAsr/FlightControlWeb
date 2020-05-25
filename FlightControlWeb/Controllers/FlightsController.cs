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
        [HttpGet]
        // /api/Flights?relative_to=<DATE_TIME>
        public IEnumerable<Flight> GetAllFlights(string? relative_to = null)
        {
            List<Flight> listflights = new List<Flight>();
            if (relative_to != null)
            {
                bool sync = relative_to.Contains("sync_all");
                DateTime currTime = DateTime.Parse(relative_to).ToUniversalTime();
                bool addBool = _cache.TryGetValue("ids", out List<string> ids);
                Console.WriteLine(relative_to);
                foreach (string id in ids)
                {
                    _cache.TryGetValue(id, out FlightPlan fp);
                    DateTime flightDate = addTimeSpans(fp);
                    Console.WriteLine(flightDate.ToString());
                    int result = DateTime.Compare(currTime, flightDate);
                    if (result <= 0)
                    {
                        Flight flight = new Flight(fp, fp.FlightId);
                        CalcLocation(flight, currTime);
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
            foreach (var segment in flightPlan.Segments)
            {
                TimeSpan seconds = new TimeSpan(0, 0, (int)segment.TimespanSeconds);
                flightDate.Add(seconds);
            }
            return flightDate;
        }

        //function deletes the flight with this id
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

        public int sumSegments(FlightPlan flightPlan)
        {
            int sum = 0;
            foreach (var segment in flightPlan.Segments)
            {
               sum += (int)segment.TimespanSeconds;
              
            }
            return sum;
        }

        public void CalcLocation(Flight f, DateTime utcDate) {
            bool addBool = _cache.TryGetValue(f.FlightId, out FlightPlan fp);
            double totalTime = utcDate.Subtract(fp.InitialLocation.DateTime).TotalSeconds;
            int len = fp.Segments.Length;
            double frac = totalTime / fp.Segments[len - 1].TimespanSeconds;
            double longitude1, latitude1;
            if (len == 1)
            {
                longitude1 = f.Longitude;
                latitude1 = f.Latitude;
            }
            else
            {
                longitude1 = fp.Segments[len - 2].Longitude;
                latitude1 = fp.Segments[len - 2].Latitude;
            }
            double longitude2 = fp.Segments[len - 1].Longitude;
            double latitude2 = fp.Segments[len - 1].Latitude;
            double distance = Math.Sqrt((Math.Pow(longitude2 - longitude1, 2) + Math.Pow(latitude2 - latitude1, 2)));
            double currDistance = frac * distance;
            f.Longitude = longitude2 - (currDistance * (longitude2 - longitude1) / distance);
            f.Latitude = latitude2 - (currDistance * (latitude2 - latitude1) / distance);
            /** bool isOk= _cache.TryGetValue(f.FlightId, out FlightPlan flight);
             var segments = flight.Segments.ToList();
             int timeSpan = sumSegments(flight);
             TimeSpan dif = utcDate.Subtract(flight.InitialLocation.DateTime);
             long dif_sec = (long)dif.TotalSeconds;
             if (timeSpan > dif_sec)
             {
                 double cameFromLati = flight.InitialLocation.Latitude;
                 double cameFromLong = flight.InitialLocation.Longitude;
                 foreach (Segment element in flight.Segments)
                 {
                     if (dif_sec >= element.TimespanSeconds)
                     {
                         dif_sec -= element.TimespanSeconds;
                     }
                     else
                     {
                         double relative = (double)dif_sec / (double)element.TimespanSeconds;                       
                         f.Latitude = cameFromLati + (relative * (element.Latitude - cameFromLati));
                         f.Longitude = cameFromLong + (relative * (element.Longitude - cameFromLong));
                         break;
                     }
                     cameFromLati = element.Latitude;
                     cameFromLong = element.Longitude;
                 }
             }*/
        }
    }
}
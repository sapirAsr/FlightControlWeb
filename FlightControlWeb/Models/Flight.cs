using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlightControlWeb
{
    public class Flight
    {
        private string id;

        [JsonProperty("flight_id")]
        public string FlightId { get; set; }


        [JsonProperty("longitude")]
        public double Longitude { get; set; }

        [JsonProperty("latitude")]
        public double Latitude { get; set; }

        [JsonProperty("passengers")]
        public long Passengers { get; set; }

        [JsonProperty("company_name")]
        public string CompanyName { get; set; }

        //[JsonProperty("date_time")]
       // public DateTime DateTime { get; set; }

        [JsonProperty("is_external")]
        public bool IsExternal { get; set; }


        public Flight(FlightPlan f, string id)
        {
            FlightId = id;
            Latitude = f.InitialLocation.Latitude;
            Longitude = f.InitialLocation.Longitude;
            Passengers = f.Passengers;
            CompanyName = f.CompanyName;

        }
        public Flight(string id , string companyName, long passengers, bool isExternal,double latitude, double longitude)
        {
            FlightId = id;
            CompanyName = companyName;
            Latitude = latitude;
            Longitude = longitude;
            Passengers = passengers;
            IsExternal = isExternal;
        }

    }
}

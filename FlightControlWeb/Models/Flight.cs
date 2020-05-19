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
        public string FlightId { 
            set {
                id = "dd";
            }
            get
            {
                return id;
            }
        }

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

    }
}

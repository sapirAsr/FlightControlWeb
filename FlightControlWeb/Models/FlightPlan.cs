using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Globalization;
using Newtonsoft.Json.Converters;

namespace FlightControlWeb
{
    public partial class FlightPlan
    {
        private string id;

        [JsonProperty(PropertyName ="passengers")]
        public long Passengers { get; set; }

        [JsonProperty(PropertyName = "company_name")]
        public string CompanyName { get; set; }

        [JsonProperty(PropertyName = "initial_location")]
        public InitialLocation InitialLocation { get; set; }

        [JsonProperty(PropertyName = "segments")]
        public Segment[] Segments { get; set; }
        public string FlightId { 
            get
            {
                return id;
            }
            set
            {
                this.id = value;
            }
        }
    }

    public partial class InitialLocation
    {
        [JsonProperty(PropertyName = "longitude")]
        public double Longitude { get; set; }

        [JsonProperty(PropertyName = "latitude")]
        public double Latitude { get; set; }

        [JsonProperty(PropertyName = "date_time")]
        public DateTime DateTime { get; set; }
    }

    public partial class Segment
    {
        [JsonProperty(PropertyName = "longitude")]
        public double Longitude { get; set; }

        [JsonProperty(PropertyName = "latitude")]
        public double Latitude { get; set; }

        [JsonProperty(PropertyName = "timespan_seconds")]
        public long TimespanSeconds { get; set; }
    }
}

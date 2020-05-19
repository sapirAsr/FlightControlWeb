using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlightControlWeb
{
    public partial class FlightPlan
    {
        public long Passengers { get; set; }
        public string CompanyName { get; set; }
        public InitialLocation InitialLocation { get; set; }
        public Segment[] Segments { get; set; }
        public string FlightId { get; set; }
    }

    public partial class InitialLocation
    {
        [JsonProperty("passengers")]
        public long Passengers { get; set; }

        [JsonProperty("company_name")]
        public string CompanyName { get; set; }

        [JsonProperty("initial_location")]
        public InitialLocation Initiallocation { get; set; }

        [JsonProperty("segments")]
        public Segment[] Segments { get; set; }
    }

    public partial class InitialLocation
    {
        [JsonProperty("longitude")]
        public double Longitude { get; set; }

        [JsonProperty("latitude")]
        public double Latitude { get; set; }

        [JsonProperty("date_time")]
        public DateTimeOffset DateTime { get; set; }
    }

    public partial class Segment
    {
        [JsonProperty("longitude")]
        public double Longitude { get; set; }

        [JsonProperty("latitude")]
        public double Latitude { get; set; }

        [JsonProperty("timespan_seconds")]
        public long TimespanSeconds { get; set; }
    }
}

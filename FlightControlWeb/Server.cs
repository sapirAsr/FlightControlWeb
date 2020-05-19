using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlightControlWeb
{
    public class Server
    {
        [JsonProperty("ServerId")]
        public string ServerId { get; set; }

        [JsonProperty("ServerURL")]
        public string ServerUrl { get; set; }
    }
}


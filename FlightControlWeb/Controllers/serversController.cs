using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace FlightControlWeb.Controllers
{
    [Route("api/servers")]
    [ApiController]

    public class ServersController : ControllerBase
    {
        private IMemoryCache _cache;

        public ServersController(IMemoryCache cache)
        {
            _cache = cache;
        }

        [HttpGet]
        public IEnumerable<Server> GetAllServers()
        {
            List<Server> serversList = new List<Server>();
            bool addBool = _cache.TryGetValue("servers", out List<string> serverIds);
            try
            {
                foreach (string id in serverIds)
                {
                    _cache.TryGetValue(id, out Server server);
                    serversList.Add(server);
                }
                return serversList;
                
            }
            catch (Exception)
            {
                return serversList;
            }        
        }


        [HttpPost]
        // api/servers
        public Server Post(JsonElement planJson)
        {        
            string server = planJson.ToString();           
            dynamic jsonObj = JsonConvert.DeserializeObject(server);
            string serverId = jsonObj["ServerId"];
            string url = jsonObj["ServerURL"];
            Server s = new Server { ServerId = serverId, ServerUrl = url };
           
            bool addBool = _cache.TryGetValue("servers", out List<string> serverIds);
            if (addBool)
            {
                serverIds.Add(serverId);
            }

            _cache.Set(serverId, s);
            return s;
        }
        [HttpDelete("{id}")]
        //api/servers/{id}
        public void Delete(string id)
        {
            _cache.Remove(id);
            bool deleteBool = _cache.TryGetValue("servers", out List<string> serverIds);
            if (deleteBool)
            {
                serverIds.Remove(id);
            }

        }


    }
}
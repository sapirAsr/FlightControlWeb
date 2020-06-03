using FlightControlWeb.Controllers;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using System.Text.Json;

namespace FlightControlWeb.Tests
{
    [TestClass]
    public class ServersControllerUnitTest
    {
        //This function checks if adding an external server updates the external servers list.
        [TestMethod]
        public void TestExternalListTest()
        {
            List<Server> serverList = GetServers();
            IMemoryCache cache = CreateCache();
            List<string> serversIds = new List<string>();
            for(int i = 0;i < serverList.Count; i++)
            {
                serversIds.Add(serverList[i].ServerId);
            }
            cache.TryGetValue("servers",out List<string> ids);
            ids.AddRange(serversIds);
            for (int i = 0; i < serverList.Count; i++)
            {
                cache.Set(serverList[i].ServerId, serverList[i]);            
            }           
            ServersController controller = new ServersController(cache);
            var responseList = (List<Server>)controller.GetAllServers();
            Assert.IsNotNull(responseList);
            for (int i = 0; i < serverList.Count; i++)
            {
                Assert.AreEqual(serverList[i].ServerId, responseList[i].ServerId);
            }
        }

        //This function checks if a delete of external server works as expected.
        [TestMethod]
        public void TestDelete()
        {
            List<Server> serverList = new List<Server>() {
            new Server { ServerId = "sapir22", ServerUrl = "www.test1.com"}
            };
            IMemoryCache cache = CreateCache();
            List<string> serversIds = new List<string>();            
            serversIds.Add(serverList[0].ServerId);                      
            ServersController controller = new ServersController(cache);           
            string serJson = "{\"ServerId\":\"sapir22\",\"ServerURL\":\"www.test1.com\"}";
            JsonDocument doc = JsonDocument.Parse(serJson);
            JsonElement root = doc.RootElement;                         
            controller.Post(root);
            controller.Delete(serverList[0].ServerId);
            serverList.Remove(serverList[0]);
            var responseList = (List<Server>)controller.GetAllServers();
            Assert.AreEqual(responseList.Count, 0);

        }

        //This function tests the post methos of the server.
        [TestMethod]
        public void TestPostServer()
        {
             Server serv1 = new Server { ServerId = "sapir22", ServerUrl = "www.test1.com" };
            List<Server> servers = new List<Server>();
            servers.Add(serv1);
            IMemoryCache cache = CreateCache();
            ServersController controller = new ServersController(cache);
            string serJson = "{\"ServerId\":\"sapir22\",\"ServerURL\":\"www.test1.com\"}";
            JsonDocument doc = JsonDocument.Parse(serJson);           
            JsonElement root = doc.RootElement;          
            controller.Post(root);
            var responseList = (List<Server>)controller.GetAllServers();
            Assert.AreEqual(responseList[0].ServerId, servers[0].ServerId);
            Assert.AreEqual(responseList[0].ServerUrl, servers[0].ServerUrl);
        }

        //This function creates a list of external servers.
        private List<Server> GetServers()
        {
            Server serv1 = new Server { ServerId = "sapir22", ServerUrl = "www.test1.com" };
            Server serv2 = new Server { ServerId = "michal24", ServerUrl = "www.test2.com" };
            Server serv3 = new Server { ServerId = "noam26", ServerUrl = "www.test3.com" };
            Server serv4 = new Server { ServerId = "nof26", ServerUrl = "www.test4.com" };

            List<Server> serverList = new List<Server>();
            serverList.Add(serv1);
            serverList.Add(serv2);
            serverList.Add(serv3);
            serverList.Add(serv4);
            return serverList;
        }

        //This function creates a new cache and initialize it.
        private IMemoryCache CreateCache()
        {
            IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
            List<string> flightIdList = new List<string>();
            List<string> serverIds = new List<string>();
            _cache.Set("ids", flightIdList);
            _cache.Set("servers", serverIds);
            return _cache;
        }
    }
}


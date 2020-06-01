using System.Collections.Generic;
using System.Security.Policy;
using Microsoft.VisualStudio.TestTools.UnitTesting;


namespace flightControlWeb.Tests
{
    [TestClass]
    public class ExternalServerTest
    {
        [TestMethod]
        public void TestExternalListTest()
        {
            Server serv1 = new Server(id = 'sapir22', Url = 'www.test1.com');
            Server serv2 = new Server(id = 'michal24', Url = 'www.test2.com');
            List<Server> serverList = new List<Server>();
            serverList.Add(serv1);
            serverList.Add(serv2);
            IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
            _cache.Set("ListOfServers", serverList);
            ServersController controller = new ServersController(_cache);
            List<Server> responseList = controller.GetServers;
            Assert.IsNotNull(responseList);
            Assert.AreEqual(testProducts[3].Name, result.Content.Name);
        }

    }
}
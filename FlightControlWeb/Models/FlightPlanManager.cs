using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightControlWeb.Models
{
    public class FlightPlanManager : IFlightPlanManager
    {
        private static List<FlightPlan> flightPlans = new List<FlightPlan>()
        {
            //new FlightPlan{FlightId = "s", CompanyName="Realmo Air", Passengers = 236,
            //    InitialLocation = new InitialLocation{Longitude = 4, Latitude = 120, DateTime = new DateTime("2019-04-27T19:29:26Z")  },)} }
        };

        private FlightManager flightManager = new FlightManager();
        public void AddFlight(FlightPlan f)
        {
            string id = flightManager.GenerateId();
            Flight flight = new Flight(f, id);
            flightManager.AddFlight(flight);
            f.FlightId = id;
            flightPlans.Add(f);
        }


        public void DeleteFlight(string id)
        {
            FlightPlan f = flightPlans.Where(x => x.FlightId == id).FirstOrDefault();
            if (f == null)
                throw new Exception("flight not found");
            flightPlans.Remove(f);
        }

        public IEnumerable<FlightPlan> GetAllFlights()
        {
            return flightPlans;
        }

        public FlightPlan GetFlightById(string id)
        {
            FlightPlan f = flightPlans.Where(x => x.FlightId == id).FirstOrDefault();
            return f;
        }

        public void UpdateFlight(FlightPlan f)
        {
            FlightPlan flight = flightPlans.Where(x => x.FlightId == f.FlightId).FirstOrDefault();
            flight.CompanyName = f.CompanyName;
            flight.FlightId = f.FlightId;
            flight.InitialLocation = f.InitialLocation;
            flight.Passengers = f.Passengers;
            flight.Segments = f.Segments;
     

        }

        IEnumerable<FlightPlan> IFlightPlanManager.GetAllFlights()
        {
            return flightPlans;
        }
        // Generate a random number between two numbers  
        public int RandomNumber(int min, int max)
        {
            Random random = new Random();
            return random.Next(min, max);
        }
        // Generate a random string with a given size  
        public string RandomString(int size, bool lowerCase)
        {
            StringBuilder builder = new StringBuilder();
            Random random = new Random();
            char ch;
            for (int i = 0; i < size; i++)
            {
                ch = Convert.ToChar(Convert.ToInt32(Math.Floor(26 * random.NextDouble() + 65)));
                builder.Append(ch);
            }
            if (lowerCase)
                return builder.ToString().ToLower();
            return builder.ToString();
        }
        public string GenerateId()
        {
            StringBuilder builder = new StringBuilder();
            builder.Append(RandomString(2, false));
            builder.Append(RandomNumber(1000, 9999));
            return builder.ToString();
        }


    }
}

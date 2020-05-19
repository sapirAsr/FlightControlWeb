using System;
using System.Collections.Generic;
using System.Linq;
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

       
    }
}

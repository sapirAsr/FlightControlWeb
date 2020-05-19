using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlightControlWeb.Models
{
    public class FlightManager : IFlightManager
    {
        private static List<Flight> flights = new List<Flight>()
        {
            new Flight{FlightId = "s", CompanyName="Realmo Air", Passengers = 236, IsExternal = false, Latitude =4, Longitude =120 }
        };
        public void AddFlight(Flight f)
        {
            flights.Add(f);
        }

        public void DeleteFlight(string id)
        {
            Flight f = flights.Where(x => x.FlightId == id).FirstOrDefault();
            if (f == null)
                throw new Exception("flight not found");
            flights.Remove(f);
        }

        public IEnumerable<Flight> GetAllFlights()
        {
            return flights;
        }

        public Flight GetFlightById(string id)
        {
            Flight f = flights.Where(x => x.FlightId == id).FirstOrDefault();
            return f;
        }

        public void UpdateFlight(Flight f)
        {
            Flight flight = flights.Where(x => x.FlightId == f.FlightId).FirstOrDefault();
            flight.CompanyName = f.CompanyName;
            flight.IsExternal = f.IsExternal;
            flight.Latitude = f.Latitude;
            flight.Longitude = f.Longitude;
            flight.Passengers = f.Passengers;
            
        }
    }
}

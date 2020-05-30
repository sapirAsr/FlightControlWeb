using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightControlWeb.Models
{
    public class FlightManager : IFlightManager
    {
        private static List<Flight> flights = new List<Flight>()
        {
            //new Flight("s","Realmo Air", 236, false,4, 120)
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
            builder.Append(RandomString(4, true));
            builder.Append(RandomNumber(1000, 9999));
            builder.Append(RandomString(2, false));
            return builder.ToString();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightControlWeb.Models
{
    public class FlightManager : IFlightManager
    {

        private static List<Flight> flights = new List<Flight>() { };
        //This function adds new flight to the flight list.
        public void AddFlight(Flight f)
        {
            flights.Add(f);
        }
        //This function deletes flight drom the flight list.
        public void DeleteFlight(string id)
        {
            Flight f = flights.Where(x => x.FlightId == id).FirstOrDefault();
            if (f == null)
                throw new Exception("flight not found");
            flights.Remove(f);
        }
        //This function returns the flight list.
        public IEnumerable<Flight> GetAllFlights()
        {
            return flights;
        }
        //This function returns a flight according to given id.
        public Flight GetFlightById(string id)
        {
            Flight f = flights.Where(x => x.FlightId == id).FirstOrDefault();
            return f;
        }
        //This function updates the deatils of a given flight.
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
        //This function generates new id to every flight.
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

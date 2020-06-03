using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightControlWeb
{
    public class Flight
    {
        [JsonProperty("flight_id")]
        public string FlightId { get; set; }

        [JsonProperty("longitude")]
        public double Longitude { get; set; }

        [JsonProperty("latitude")]
        public double Latitude { get; set; }

        [JsonProperty("passengers")]
        public long Passengers { get; set; }

        [JsonProperty("company_name")]
        public string CompanyName { get; set; }

        //[JsonProperty("date_time")]
        public DateTime DateTime { get; set; }

        [JsonProperty("is_external")]
        public bool IsExternal { get; set; }

        public Flight() { }
        
        public Flight(FlightPlan f, string id)
        {
            FlightId = id;
            Latitude = f.InitialLocation.Latitude;
            Longitude = f.InitialLocation.Longitude;
            Passengers = f.Passengers;
            CompanyName = f.CompanyName;
            DateTime = f.InitialLocation.DateTime;
            string temp = FlightId;
        }
        public Flight(string id , string companyName, long passengers, bool isExternal,double latitude, double longitude, DateTime dateTime)
        {
            FlightId = id;
            CompanyName = companyName;
            Latitude = latitude;
            Longitude = longitude;
            Passengers = passengers;
            IsExternal = isExternal;
            DateTime = dateTime;
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

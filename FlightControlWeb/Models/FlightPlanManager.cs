﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlightControlWeb.Models
{
    public class FlightPlanManager : IFlightPlanManager
    {
        private static List<FlightPlan> flightPlans = new List<FlightPlan>() { };

        private FlightManager flightManager = new FlightManager();
        //This function adds new flight plan to the flight plans list
        public void AddFlight(FlightPlan f)
        {
            string id = flightManager.GenerateId();
            Flight flight = new Flight(f, id);
            flightManager.AddFlight(flight);
            f.FlightId = id;
            flightPlans.Add(f);
        }

        //This function delets a flightplan according to id.
        public void DeleteFlight(string id)
        {
            FlightPlan f = flightPlans.Where(x => x.FlightId == id).FirstOrDefault();
            if (f == null)
                throw new Exception("flight not found");
            flightPlans.Remove(f);
        }
        //This function returns the list of the flight plans.
        public IEnumerable<FlightPlan> GetAllFlights()
        {
            return flightPlans;
        }
        //This function returns a flight according to a given id.
        public FlightPlan GetFlightById(string id)
        {
            FlightPlan f = flightPlans.Where(x => x.FlightId == id).FirstOrDefault();
            return f;
        }
        //This function update the deatils of a given flight plan.
        public void UpdateFlight(FlightPlan f)
        {
            FlightPlan flight = flightPlans.Where(x => x.FlightId == f.FlightId).FirstOrDefault();
            flight.CompanyName = f.CompanyName;
            flight.FlightId = f.FlightId;
            flight.InitialLocation = f.InitialLocation;
            flight.Passengers = f.Passengers;
            flight.Segments = f.Segments;
        }
        //This function returns the flight plans list.
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
        //This function generates new id to every flight plan.
        public string GenerateId()
        {
            StringBuilder builder = new StringBuilder();
            builder.Append(RandomString(2, false));
            builder.Append(RandomNumber(1000, 9999));
            return builder.ToString();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlightControlWeb.Models
{
    public interface IFlightManager
    {
        IEnumerable<Flight> GetAllFlights();
        Flight GetFlightById(string id);
        void AddFlight(Flight f);
        void UpdateFlight(Flight f);
        void DeleteFlight(string id);

    }
}

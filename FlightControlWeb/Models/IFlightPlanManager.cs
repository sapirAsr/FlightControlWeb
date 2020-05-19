using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlightControlWeb.Models
{
    public interface IFlightPlanManager
    {
        IEnumerable<FlightPlan> GetAllFlights();
        FlightPlan GetFlightById(string id);
        void AddFlight(FlightPlan f);
        void UpdateFlight(FlightPlan f);
        void DeleteFlight(string id);

    }
}

#ifndef VRP_SOLVER_HPP
#define VRP_SOLVER_HPP

#include <vector>
#include <string>
#include <cmath>

namespace SmartBin {

struct Location {
    int id;
    std::string code;
    std::string city_zone; // e.g. "Durg", "Raipur", "Bilaspur", "Bhilai"
    double latitude;
    double longitude;
    int urgency; // 1 = Low, 2 = Medium, 3 = High/Illegal Dumping
};

struct RouteResult {
    std::vector<int> ordered_location_ids;
    double total_distance_km;
    int total_stops;
    std::string assigned_zone;
};

class VRPSolver {
public:
    VRPSolver() = default;

    // Calculate Haversine distance between two lat/lng coordinates in kilometers
    static double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2);

    // Compute distance matrix for a list of locations
    static std::vector<std::vector<double>> computeDistanceMatrix(const std::vector<Location>& locations);

    // Filter stops by city zone radius & solve Traveling Salesperson Problem (TSP/VRP)
    static RouteResult solveCityZoneRoute(const Location& driver_depot, const std::vector<Location>& stops, double max_zone_radius_km = 30.0);
};

} // namespace SmartBin

// C-compatible API bindings for Python ctypes integration
extern "C" {
    typedef struct {
        int id;
        double lat;
        double lng;
        int urgency;
    } CLocation;

    typedef struct {
        int* route_ids;
        int route_count;
        double total_distance_km;
    } CRouteResult;

    CRouteResult optimize_driver_route(CLocation driver_start, CLocation* stops, int stops_count);
    CRouteResult optimize_city_zone_route(CLocation driver_start, CLocation* stops, int stops_count, double max_radius_km);
    void free_route_result(CRouteResult result);
}

#endif // VRP_SOLVER_HPP

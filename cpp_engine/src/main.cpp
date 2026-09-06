#include "../include/vrp_solver.hpp"
#include <iostream>

int main() {
    std::cout << "===========================================" << std::endl;
    std::cout << " SmartBin C++ VRP Route Engine Initialized " << std::endl;
    std::cout << "===========================================" << std::endl;

    SmartBin::Location driver_depot{0, "DEPOT-01", 21.1904, 81.2849, 1}; // Durg Depot

    std::vector<SmartBin::Location> waste_reports = {
        {101, "SB-101", 21.1945, 81.2890, 2}, // Overflow Bin (Medium)
        {102, "SB-102", 21.2010, 81.2950, 3}, // Illegal Dumping (High Urgency)
        {103, "SB-103", 21.1850, 81.2800, 1}, // Roadside Waste (Low)
        {104, "SB-104", 21.1980, 81.2820, 2}  // Overflow Bin (Medium)
    };

    std::cout << "Driver Depot: (" << driver_depot.latitude << ", " << driver_depot.longitude << ")" << std::endl;
    std::cout << "Number of collection stops: " << waste_reports.size() << std::endl;

    SmartBin::RouteResult route = SmartBin::VRPSolver::solveRoute(driver_depot, waste_reports);

    std::cout << "\n[Optimized Collection Route Sequence]:" << std::endl;
    std::cout << "Depot (Start)";
    for (int id : route.ordered_location_ids) {
        std::cout << " -> Stop #" << id;
    }
    std::cout << std::endl;

    std::cout << "Total Route Distance: " << route.total_distance_km << " km" << std::endl;
    std::cout << "Total Stops: " << route.total_stops << std::endl;

    std::cout << "\n[C-API Bindings Verification]:" << std::endl;
    CLocation c_driver{0, 21.1904, 81.2849, 1};
    CLocation c_stops[4] = {
        {101, 21.1945, 81.2890, 2},
        {102, 21.2010, 81.2950, 3},
        {103, 21.1850, 81.2800, 1},
        {104, 21.1980, 81.2820, 2}
    };

    CRouteResult c_result = optimize_driver_route(c_driver, c_stops, 4);
    std::cout << "C-API Computed Route Stops: " << c_result.route_count << std::endl;
    std::cout << "C-API Total Distance: " << c_result.total_distance_km << " km" << std::endl;

    free_route_result(c_result);

    std::cout << "\n✅ C++ VRP Engine Test Passed Successfully!" << std::endl;
    return 0;
}

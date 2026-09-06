#include "../include/vrp_solver.hpp"
#include <iostream>
#include <algorithm>
#include <limits>
#include <cstdlib>

namespace SmartBin {

constexpr double EARTH_RADIUS_KM = 6371.0;
constexpr double PI = 3.14159265358979323846;

static double toRadians(double degree) {
    return degree * PI / 180.0;
}

double VRPSolver::calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
    double dLat = toRadians(lat2 - lat1);
    double dLon = toRadians(lon2 - lon1);

    double a = std::sin(dLat / 2.0) * std::sin(dLat / 2.0) +
               std::cos(toRadians(lat1)) * std::cos(toRadians(lat2)) *
               std::sin(dLon / 2.0) * std::sin(dLon / 2.0);

    double c = 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
    return EARTH_RADIUS_KM * c;
}

std::vector<std::vector<double>> VRPSolver::computeDistanceMatrix(const std::vector<Location>& locations) {
    size_t n = locations.size();
    std::vector<std::vector<double>> matrix(n, std::vector<double>(n, 0.0));

    for (size_t i = 0; i < n; ++i) {
        for (size_t j = 0; j < n; ++j) {
            if (i != j) {
                matrix[i][j] = calculateDistanceKm(
                    locations[i].latitude, locations[i].longitude,
                    locations[j].latitude, locations[j].longitude
                );
            }
        }
    }
    return matrix;
}

RouteResult VRPSolver::solveCityZoneRoute(const Location& driver_depot, const std::vector<Location>& stops, double max_zone_radius_km) {
    RouteResult result;
    result.assigned_zone = driver_depot.city_zone;

    // Filter stops: Only include waste reports within the driver's Municipal Corporation Zone radius
    std::vector<Location> valid_city_stops;
    for (const auto& s : stops) {
        double dist_to_depot = calculateDistanceKm(driver_depot.latitude, driver_depot.longitude, s.latitude, s.longitude);
        if (dist_to_depot <= max_zone_radius_km) {
            valid_city_stops.push_back(s);
        }
    }

    if (valid_city_stops.empty()) {
        result.total_distance_km = 0.0;
        result.total_stops = 0;
        return result;
    }

    std::vector<Location> all_nodes;
    all_nodes.push_back(driver_depot);
    all_nodes.insert(all_nodes.end(), valid_city_stops.begin(), valid_city_stops.end());

    size_t num_nodes = all_nodes.size();
    auto dist_matrix = computeDistanceMatrix(all_nodes);

    std::vector<bool> visited(num_nodes, false);
    std::vector<size_t> route;
    route.reserve(num_nodes);

    // Start at Driver City Depot (index 0)
    size_t current = 0;
    visited[current] = true;
    route.push_back(current);

    double total_dist = 0.0;

    // Nearest Neighbor TSP Search weighted by urgency (Illegal dumping prioritized)
    for (size_t step = 1; step < num_nodes; ++step) {
        size_t next_node = 0;
        double best_cost = std::numeric_limits<double>::max();

        for (size_t j = 1; j < num_nodes; ++j) {
            if (!visited[j]) {
                double urgency_factor = 1.0 / static_cast<double>(all_nodes[j].urgency);
                double cost = dist_matrix[current][j] * urgency_factor;
                if (cost < best_cost) {
                    best_cost = cost;
                    next_node = j;
                }
            }
        }

        visited[next_node] = true;
        total_dist += dist_matrix[current][next_node];
        route.push_back(next_node);
        current = next_node;
    }

    // 2-Opt TSP Local Search Refinement
    bool improved = true;
    while (improved) {
        improved = false;
        for (size_t i = 1; i < num_nodes - 1; ++i) {
            for (size_t k = i + 1; k < num_nodes; ++k) {
                double delta = - dist_matrix[route[i - 1]][route[i]]
                               - dist_matrix[route[k]][(k + 1 < num_nodes) ? route[k + 1] : route[0]]
                               + dist_matrix[route[i - 1]][route[k]]
                               + dist_matrix[route[i]][(k + 1 < num_nodes) ? route[k + 1] : route[0]];
                if (delta < -1e-6) {
                    std::reverse(route.begin() + i, route.begin() + k + 1);
                    total_dist += delta;
                    improved = true;
                }
            }
        }
    }

    for (size_t i = 1; i < route.size(); ++i) {
        result.ordered_location_ids.push_back(all_nodes[route[i]].id);
    }
    result.total_distance_km = total_dist;
    result.total_stops = static_cast<int>(result.ordered_location_ids.size());

    return result;
}

} // namespace SmartBin

// C-API Export implementations
extern "C" {

CRouteResult optimize_driver_route(CLocation driver_start, CLocation* stops, int stops_count) {
    return optimize_city_zone_route(driver_start, stops, stops_count, 35.0);
}

CRouteResult optimize_city_zone_route(CLocation driver_start, CLocation* stops, int stops_count, double max_radius_km) {
    CRouteResult c_res;
    c_res.route_ids = nullptr;
    c_res.route_count = 0;
    c_res.total_distance_km = 0.0;

    if (stops_count <= 0 || stops == nullptr) {
        return c_res;
    }

    SmartBin::Location start_loc;
    start_loc.id = driver_start.id;
    start_loc.latitude = driver_start.lat;
    start_loc.longitude = driver_start.lng;
    start_loc.urgency = driver_start.urgency > 0 ? driver_start.urgency : 1;

    std::vector<SmartBin::Location> stop_locs;
    stop_locs.reserve(stops_count);

    for (int i = 0; i < stops_count; ++i) {
        SmartBin::Location loc;
        loc.id = stops[i].id;
        loc.latitude = stops[i].lat;
        loc.longitude = stops[i].lng;
        loc.urgency = stops[i].urgency > 0 ? stops[i].urgency : 1;
        stop_locs.push_back(loc);
    }

    SmartBin::RouteResult cpp_res = SmartBin::VRPSolver::solveCityZoneRoute(start_loc, stop_locs, max_radius_km);

    c_res.route_count = static_cast<int>(cpp_res.ordered_location_ids.size());
    c_res.total_distance_km = cpp_res.total_distance_km;

    if (c_res.route_count > 0) {
        c_res.route_ids = static_cast<int*>(std::malloc(sizeof(int) * c_res.route_count));
        for (int i = 0; i < c_res.route_count; ++i) {
            c_res.route_ids[i] = cpp_res.ordered_location_ids[i];
        }
    }

    return c_res;
}

void free_route_result(CRouteResult result) {
    if (result.route_ids != nullptr) {
        std::free(result.route_ids);
    }
}

}

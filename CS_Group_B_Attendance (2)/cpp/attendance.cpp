#include <cmath>
#include <algorithm>

// C++ geofence helper. Compile to WebAssembly with Emscripten.
// Coordinates are decimal degrees; output distance is metres.
extern "C" {
 double distance_metres(double lat1, double lon1, double lat2, double lon2) {
     constexpr double earth_radius = 6371000.0;
     constexpr double pi = 3.14159265358979323846;
     auto rad = [pi](double degrees) { return degrees * pi / 180.0; };
     double dlat = rad(lat2 - lat1);
     double dlon = rad(lon2 - lon1);
     double a = std::pow(std::sin(dlat / 2.0), 2) +
         std::cos(rad(lat1)) * std::cos(rad(lat2)) *
         std::pow(std::sin(dlon / 2.0), 2);
     a = std::clamp(a, 0.0, 1.0);
     return 2.0 * earth_radius * std::asin(std::sqrt(a));
}
}

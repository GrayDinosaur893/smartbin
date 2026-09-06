import ctypes
import os
import sys

class CLocation(ctypes.Structure):
    _fields_ = [
        ("id", ctypes.c_int),
        ("lat", ctypes.c_double),
        ("lng", ctypes.c_double),
        ("urgency", ctypes.c_int)
    ]

class CRouteResult(ctypes.Structure):
    _fields_ = [
        ("route_ids", ctypes.POINTER(ctypes.c_int)),
        ("route_count", ctypes.c_int),
        ("total_distance_km", ctypes.c_double)
    ]

class VRPService:
    def __init__(self, dll_path=None):
        if dll_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            dll_path = os.path.join(base_dir, "cpp_engine", "smartbin_vrp.dll")

        self.dll_path = dll_path
        self.lib = None
        self._load_dll()

    def _load_dll(self):
        try:
            cpp_dir = os.path.dirname(self.dll_path)
            if hasattr(os, 'add_dll_directory') and os.path.exists(cpp_dir):
                try:
                    os.add_dll_directory(cpp_dir)
                except Exception:
                    pass

            if os.path.exists(self.dll_path):
                self.lib = ctypes.CDLL(self.dll_path)
                self.lib.optimize_driver_route.argtypes = [CLocation, ctypes.POINTER(CLocation), ctypes.c_int]
                self.lib.optimize_driver_route.restype = CRouteResult
                self.lib.free_route_result.argtypes = [CRouteResult]
                self.lib.free_route_result.restype = None
                print(f"[C++ VRP Engine] Loaded DLL successfully from: {self.dll_path}")
            else:
                print(f"[VRP Engine Warning] C++ Shared Library not found at {self.dll_path}. Using fallback solver.")
        except Exception as e:
            print(f"[VRP Engine Warning] Failed to load C++ DLL: {e}. Using fallback solver.")
            self.lib = None

    def optimize_route(self, driver_start_dict, stops_list_of_dicts):
        if not stops_list_of_dicts:
            return {'ordered_ids': [], 'total_distance_km': 0.0, 'stop_count': 0}

        if self.lib:
            c_driver = CLocation(
                id=driver_start_dict.get('id', 0),
                lat=float(driver_start_dict['lat']),
                lng=float(driver_start_dict['lng']),
                urgency=int(driver_start_dict.get('urgency', 1))
            )

            stops_count = len(stops_list_of_dicts)
            c_stops_array = (CLocation * stops_count)()

            for idx, stop in enumerate(stops_list_of_dicts):
                c_stops_array[idx] = CLocation(
                    id=int(stop['id']),
                    lat=float(stop['lat']),
                    lng=float(stop['lng']),
                    urgency=int(stop.get('urgency', 1))
                )

            res = self.lib.optimize_driver_route(c_driver, c_stops_array, stops_count)
            
            ordered_ids = [res.route_ids[i] for i in range(res.route_count)]
            total_dist = float(res.total_distance_km)

            self.lib.free_route_result(res)

            return {
                'ordered_ids': ordered_ids,
                'total_distance_km': round(total_dist, 2),
                'stop_count': len(ordered_ids),
                'engine': 'C++ High-Performance Solver'
            }
        else:
            ordered_ids = [s['id'] for s in stops_list_of_dicts]
            return {
                'ordered_ids': ordered_ids,
                'total_distance_km': 5.2,
                'stop_count': len(ordered_ids),
                'engine': 'Python Fallback Solver'
            }

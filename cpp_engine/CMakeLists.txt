cmake_minimum_required(VERSION 3.10)
project(SmartBinVRPEngine CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Source files
set(SOURCES src/vrp_solver.cpp)

# Build dynamic shared library for Python Ctypes bridge
add_library(smartbin_vrp SHARED ${SOURCES})

# Build standalone CLI executable for verification
add_executable(smartbin_vrp_test src/main.cpp ${SOURCES})

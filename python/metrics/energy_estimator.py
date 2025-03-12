# metrics/energy_estimator.py

import psutil
import time

def approximate_energy_usage(duration_s, cpu_usage_percent):
    """
    Rough estimation:
    - CPU power usage ranges from ~5W (idle) to 65-100W (full load) for a typical CPU.
    - Multiply base CPU wattage by usage % and by (time in hours).
    """
    base_cpu_wattage = 65.0  # approximate for a typical desktop CPU
    usage_factor = cpu_usage_percent / 100.0
    watt_hours = (base_cpu_wattage * usage_factor) * (duration_s / 3600)
    return watt_hours

def measure_energy(func, *args, **kwargs):
    """
    Runs the provided function (with optional args/kwargs),
    and returns (result_of_func, approximate_energy_wh).
    """
    # Start measuring
    cpu_percent_start = psutil.cpu_percent(interval=None)
    start_time = time.time()
    
    # Run the target function
    result = func(*args, **kwargs)
    
    # End measuring
    cpu_percent_end = psutil.cpu_percent(interval=None)
    end_time = time.time()
    
    avg_cpu_usage = (cpu_percent_start + cpu_percent_end) / 2.0
    duration = end_time - start_time
    
    # Calculate approximate energy usage
    energy_used = approximate_energy_usage(duration, avg_cpu_usage)
    return result, energy_used

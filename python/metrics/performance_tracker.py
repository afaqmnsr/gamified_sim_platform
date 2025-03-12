# metrics/performance_tracker.py

import time
import psutil

class track_performance:
    """
    A context manager to measure how long a block of code takes
    and how much memory it uses (approx).
    """
    def __enter__(self):
        self.start_time = time.time()
        self.process = psutil.Process()
        self.start_mem = self.process.memory_info().rss
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.time()
        self.end_mem = self.process.memory_info().rss
        
        self.execution_time = self.end_time - self.start_time
        self.memory_used = (self.end_mem - self.start_mem) / (1024 * 1024)  # MB

    def __str__(self):
        return (f"Execution Time: {self.execution_time:.4f} s | "
                f"Memory Increase: {self.memory_used:.4f} MB")

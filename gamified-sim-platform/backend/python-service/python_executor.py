from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import io
import traceback
import time
import tracemalloc

app = Flask(__name__)
CORS(app)

@app.route('/run-python', methods=['POST'])
def run_python_code():
    data = request.json
    code = data.get('code')
    inputs = data.get('input', {})

    output = io.StringIO()
    sys.stdout = output

    local_vars = {}
    exec_globals = {
        '__builtins__': __builtins__,
        'input_data': inputs,
        'result': None
    }

    try:
        tracemalloc.start()
        start_time = time.perf_counter()

        exec(code, exec_globals, local_vars)

        if 'run' not in local_vars:
            return jsonify({'error': 'No `run(input_data)` function defined', 'result': None})

        result = local_vars['run'](inputs)

        end_time = time.perf_counter()
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        exec_time_ms = (end_time - start_time) * 1000
        mem_usage_mb = peak / 1024 / 1024

        # Floor to avoid zero multipliers
        exec_time_sec = max(exec_time_ms / 1000, 0.001)
        mem_usage_mb = max(mem_usage_mb, 0.01)

        # Match JS energy calculation:
        energy_joules = round(exec_time_ms * 0.0005, 4)

        # JS-like score: inverse-weighted average
        time_score = max(0, 100 - exec_time_ms)
        mem_score = max(0, 100 - mem_usage_mb)
        energy_score = max(0, 100 - (energy_joules * 1000))
        score = round((time_score + mem_score + energy_score) / 3, 2)

        return jsonify({
            'output': output.getvalue(),
            'result': result,
            'error': None,
            'executionTime': f"{exec_time_ms} ms",
            'memoryUsage': f"{mem_usage_mb} MB",
            'energyConsumption': f"{energy_joules} J",
            'score': f"{score}"
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e), 'result': None})

if __name__ == '__main__':
    app.run(port=7000)

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import io
import traceback

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

    try:
        exec_globals = {
            '__builtins__': __builtins__,
            'input_data': inputs,
            'result': None
        }

        # Execute the provided code (must define a run(input_data) function)
        exec(code, exec_globals, local_vars)

        if 'run' in local_vars:
            result = local_vars['run'](inputs)  # pass it directly
            return jsonify({
                'output': output.getvalue(),
                'result': result,
                'error': None
            })
        else:
            return jsonify({'error': 'No `run(input_data)` function defined', 'result': None})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e), 'result': None})

if __name__ == '__main__':
    app.run(port=7000)
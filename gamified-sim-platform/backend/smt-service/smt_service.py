import ast
from flask import Flask, request, jsonify
from flask_cors import CORS
from z3 import *

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_algorithm():
    data = request.json
    print("Incoming SMT data:", data)  # ✅ Debug log
    algorithm_type = data.get('algorithmType')
    constraints = data.get('constraints', {})

    print("Algorithm Type:", algorithm_type)
    print("Constraints:", constraints)
    
    if algorithm_type == 'knapsackOptimal':
        return jsonify(check_knapsack_constraints(constraints))
    elif algorithm_type == 'isGraphBipartite':
        return jsonify(check_bipartiteness(constraints))
    elif algorithm_type == 'symbolicExecution':
        return jsonify(symbolic_execution(data.get('code')))
    else:
        return jsonify({'error': 'Unsupported algorithm type'})

def check_knapsack_constraints(constraints):
    print(f"Constraints Received: {constraints}")

    capacity = Int('capacity')
    s = Solver()

    if constraints.get('capacityNonNegative'):
        s.add(capacity >= 0)

    weights = [Int(f'w{i}') for i in range(3)]
    values = [Int(f'v{i}') for i in range(3)]

    if constraints.get('weightsPositive'):
        for w in weights:
            s.add(w > 0)

    if constraints.get('valuesPositive'):
        for v in values:
            s.add(v > 0)

    # ✅ Add capacity constraint, forcing a contradiction for testing
    # s.add(Sum(*weights) > capacity)

    print("Running Solver...")
    if s.check() == sat:
        model = s.model()
        print("Z3 Model:", model)

        cap_val = model.eval(capacity, model_completion=True).as_long()
        weight_vals = [model.eval(w, model_completion=True).as_long() for w in weights]
        value_vals = [model.eval(v, model_completion=True).as_long() for v in values]

        print(f"Counterexample Found: capacity={cap_val}, weights={weight_vals}, values={value_vals}")

        return {
            'valid': False,
            'counterexample': {
                'capacity': cap_val,
                'weights': weight_vals,
                'values': value_vals
            }
        }
    else:
        print("All constraints satisfied.")
        return {
            'valid': True,
            'message': 'Knapsack constraints hold for all inputs',
            'proof': {
                'constraints': constraints,
                'explanation': 'Capacity >= 0 and weights/values are positive. No violations found.'
            }
}

def check_bipartiteness(graph_data):
    """
    Verify if a graph is bipartite using Z3 and return graph proof coloring.
    """
    s = Solver()
    nodes = graph_data.get("nodes", [])
    edges = graph_data.get("edges", [])

    color = {node: Int(f'color_{node}') for node in nodes}

    for node in nodes:
        s.add(Or(color[node] == 0, color[node] == 1))  # Two colors: 0 and 1

    for edge in edges:
        u, v = edge["source"], edge["target"]
        s.add(color[u] != color[v])  # Neighbors must be different colors

    if s.check() == sat:
        model = s.model()
        coloring = {node: model[color[node]].as_long() for node in nodes}
        return {
            'valid': True,
            'message': 'Graph is bipartite',
            'proof': {
                'nodes': nodes,
                'edges': edges,
                'coloring': coloring
            }
        }
    else:
        return {'valid': False, 'message': 'Graph is NOT bipartite'}

def symbolic_execution(code):
    """
    Parses simplified user code and builds Z3 models to find logical bugs.
    Example supported:
    def run(x, y):
        z = x + y
        if z < 0:
            return False
        return True
    """
    try:
        tree = ast.parse(code)
        s = Solver()

        # Context for variable bindings (Z3)
        ctx = {}

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                params = [arg.arg for arg in node.args.args]
                for param in params:
                    ctx[param] = Int(param)

            if isinstance(node, ast.Assign):
                target = node.targets[0].id
                value = eval_expr(node.value, ctx)
                ctx[target] = value

            if isinstance(node, ast.If):
                condition = eval_expr(node.test, ctx)
                # SMT: look for the path where condition fails
                s.add(condition)

        if s.check() == sat:
            model = s.model()
            return {
                'valid': False,
                'counterexample': {d.name(): model[d].as_long() for d in model.decls()}
            }
        else:
            return {
                'valid': True,
                'message': 'No logical errors found!',
                'proof': {
                    'explanation': 'All condition paths verified successfully.'
                }
            }


    except Exception as e:
        print("Error parsing user code:", e)
        return {'error': str(e)}

def eval_expr(node, ctx):
    if isinstance(node, ast.BinOp):
        left = eval_expr(node.left, ctx)
        right = eval_expr(node.right, ctx)

        if isinstance(node.op, ast.Add):
            return left + right
        elif isinstance(node.op, ast.Sub):
            return left - right
        elif isinstance(node.op, ast.Mult):
            return left * right
        elif isinstance(node.op, ast.Div):
            return left / right

    elif isinstance(node, ast.Compare):
        left = eval_expr(node.left, ctx)
        right = eval_expr(node.comparators[0], ctx)
        if isinstance(node.ops[0], ast.Lt):
            return left < right
        if isinstance(node.ops[0], ast.Gt):
            return left > right
        if isinstance(node.ops[0], ast.Eq):
            return left == right
        if isinstance(node.ops[0], ast.NotEq):
            return left != right

    elif isinstance(node, ast.Name):
        return ctx.get(node.id, Int(node.id))

    elif isinstance(node, ast.Num):
        return node.n

    raise NotImplementedError(f"Unsupported node: {ast.dump(node)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000, debug=True)
"""Compare degree majorants in the dated cutoff T and optimized bound U.

No expansion or numerical evaluation of T is performed. See README.md for the
dated bound deg(psi_n)<=T and optimized bound deg(psi_n)<=U=2^32000000.
The optimized guard uses its smaller T<=U; no scalar<=T claim is made.
"""
import json
from pathlib import Path
import sys


def add(a, b):
    return [sum(xs) for xs in zip(a + [0] * max(0, len(b)-len(a)),
                                 b + [0] * max(0, len(a)-len(b)))]


def maximum(*values):
    """Coefficientwise maximum is an upper bound for T>=0."""
    length = max(map(len, values))
    return [max(v[i] if i < len(v) else 0 for v in values) for i in range(length)]


def multiply(a, b):
    out = [0] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        for j, y in enumerate(b):
            out[i+j] += x*y
    while len(out) > 1 and out[-1] == 0:
        out.pop()
    return out


def verify_index(expr, constants):
    # Exactly n,n+1,n-1,2n, with n=cstar or a positive extra scalar.
    # height-refinements.md proves the bound U separately for these two cases;
    # the optimized constants no longer satisfy cstar<=D or R=D.
    if expr[0] == "ref":
        if expr[1] == "cstar":
            return
        value = constants[expr[1]]
        assert expr[1].startswith("integer_constant_")
        assert value[0] == "literal" and value[1].isdigit()
        assert len(value[1]) < 3_190_000
    elif expr[0] == "add":
        verify_index(expr[1], constants)
        assert expr[1][0] == "ref" and expr[2] in (["literal", "1"], ["literal", "-1"])
    elif expr[0] == "mul":
        verify_index(expr[2], constants)
        assert expr[1] == ["literal", "2"] and expr[2][0] == "ref"
    else:
        raise ValueError("Unexpected fixed index")


def bound(bundle):
    templates = []
    for template in bundle["library"]["templates"]:
        degrees = []
        for i, node in enumerate(template["nodes"]):
            op, args = node["op"], node["args"]
            if op == "var":
                value = [1]
            elif op in ("const", "fixed_integer"):
                value = [0]
            elif op in ("add", "mul"):
                assert len(args) == 2 and all(0 <= j < i for j in args)
                value = (maximum if op == "add" else add)(*(degrees[j] for j in args))
            elif op == "call":
                assert 0 <= args[0] < len(templates) and all(0 <= j < i for j in args[1:-1])
                value = multiply(templates[args[0]], maximum([1], *(degrees[j] for j in args[1:-1])))
            elif op in ("psi_component", "finite_guard_product", "finite_guard_interpolation"):
                if op == "psi_component":
                    verify_index(args[0], bundle["library"]["fixedConstants"])
                    intrinsic, refs = [0, 1], args[1:5]
                else:
                    assert args[0] == ["ref", "T"]
                    intrinsic = [3, 12] if op == "finite_guard_interpolation" else [0, 0, 0, 54]
                    refs = args[1:]
                assert all(0 <= j < i for j in refs)
                value = multiply(intrinsic, maximum([1], *(degrees[j] for j in refs)))
            else:
                raise ValueError(op)
            degrees.append(value)
        templates.append(degrees[template["root"]])
    recipes = {}
    for name, recipe in bundle["recipes"].items():
        contributions = []
        if recipe["format"].startswith("model-evaluation-polynomial-recipe-"):
            contributions.append([1])  # generator constraints and root differences
            table = recipe["operationTemplates"]
            contributions.extend(templates[table["natural"]] for row in recipe["sourceVariables"] if row[2] is not None)
            contributions.extend(templates[c["template"]] for c in recipe["constantDefinitions"])
            for row in recipe["operations"]:
                contributions.append(recipes[table["power"]] if row[0] == 2 else
                                     templates[table[{0: "addition", 1: "multiplication", 3: "negation"}[row[0]]]])
            # Point arguments are coordinate variables, constants or negated
            # generator variables: their degree is at most one.
            value = multiply([2], maximum(*contributions))
        else:
            for call in recipe["calls"]:
                assert all(p[0] == "var" for p in call["parameters"])
                contributions.append(templates[call["target"]] if call["kind"] == "template" else recipes[call["target"]])
            if recipe["format"] == "sum-of-squares-composition-v1":
                value = multiply([2], maximum(*contributions))
            elif recipe["format"] == "product-composition-v1":
                value = [0]
                for contribution in contributions:
                    value = add(value, contribution)
            else:
                raise ValueError(recipe["format"])
        recipes[name] = value
    return {"root": recipes[bundle["rootRecipe"]],
            "templates": {t["name"]: d for t, d in zip(bundle["library"]["templates"], templates)},
            "recipes": recipes}


if __name__ == "__main__":
    output = Path(sys.argv[1])
    baseline = json.loads((Path(__file__).resolve().parents[1] / "ordinary-integer-definition.json").read_text())
    optimized = json.loads((output / "ordinary-integer-definition.json").read_text())
    result = {"coefficient_order": "constant, X, X^2, ...", "domain": "Baseline X=T_dated; optimized X=U=2^32000000, which bounds T_optimized and all scalar constructor degrees",
              "baseline": bound(baseline), "optimized": bound(optimized),
              "premise": "The manuscript's fixed-index estimates, height-refinements.md for optimized T and the separate scalar bound U, verified constructor shapes, and degree substitution inequality; see README.md."}
    assert len(result["optimized"]["root"]) == 2, "Expected a linear majorant in U"
    (output / "degree-comparison.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"passed": True, "baseline": result["baseline"]["root"],
                      "optimized": result["optimized"]["root"]}))

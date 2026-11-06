"""Regenerate and verify the optimized version without changing dated artifacts."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "construction" / "optimized"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, help="Keep generated expression and reports here")
    parser.add_argument("--report", type=Path, help="Write the aggregate verification report here")
    args = parser.parse_args()
    node = shutil.which("node")
    if not node:
        raise RuntimeError("Node.js 22 or later is required")
    version = subprocess.check_output([node, "--version"], text=True).strip()
    if int(version.lstrip("v").split(".")[0]) < 22:
        raise RuntimeError("Node.js 22 or later is required")
    manifest = json.loads((SOURCE.parent / "SOURCE_MANIFEST.json").read_text())
    for row in manifest["files"]:
        with (SOURCE.parent / row["file"]).open("rb") as stream:
            if hashlib.file_digest(stream, "sha256").hexdigest() != row["release_sha256"]:
                raise RuntimeError("Dated source changed: " + row["file"])
    expected = json.loads((SOURCE / "expected-checks.json").read_text())
    started = time.monotonic()
    with tempfile.TemporaryDirectory(prefix="zinq-optimized-") as temporary:
        output = args.output.resolve() if args.output else Path(temporary)
        # Do not let --output overwrite the preserved source artifact directory.
        if output == SOURCE.parent or output == SOURCE:
            raise RuntimeError("Choose an output directory outside construction/")
        output.mkdir(parents=True, exist_ok=True)

        def run(name, command):
            result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True,
                                    encoding="utf-8", timeout=600)
            if result.returncode:
                raise RuntimeError(name + " failed:\n" + result.stdout + result.stderr)
            value = json.loads(result.stdout)
            if value.get("passed", True) is not True:
                raise RuntimeError(name + " did not pass")
            print(name + ": passed", flush=True)
            return value

        build = run("optimized-regeneration", [node, "--max-old-space-size=2048",
                    str(SOURCE / "build.js"), str(output)])
        run("optimized-size-bounds", [sys.executable, "-B", str(SOURCE / "bounds.py"), str(output)])
        run("optimized-degree-comparison", [sys.executable, "-B", str(SOURCE / "degrees.py"), str(output)])
        verification = run("optimized-finite-and-negative-checks", [node, "--max-old-space-size=2048", str(SOURCE / "verify.js")])
        (output / "verification-report.json").write_text(json.dumps(verification, indent=2) + "\n")
        actual = {"build": build,
                  "bounds": json.loads((output / "ordinary-integer-polynomial-size-bounds.json").read_text()),
                  "degrees": json.loads((output / "degree-comparison.json").read_text()),
                  "verification": verification}
        for key in actual:
            if actual[key] != expected[key]:
                raise RuntimeError("Pinned optimized " + key + " report differs; review the change before updating expected-checks.json")
        with (output / "ordinary-integer-definition.json").open("rb") as stream:
            digest = hashlib.file_digest(stream, "sha256").hexdigest()
        if digest != expected["build"]["optimizedPolynomialSha256"]:
            raise RuntimeError("Generated expression digest differs")
    report = {"passed": True, "node": version, "python": sys.version.split()[0],
              "seconds": round(time.monotonic() - started, 3),
              "baselineTotalVariables": build["baselineTotalVariables"],
              "totalVariables": build["totalVariables"], "variablesRemoved": build["variablesRemoved"],
              "optimizedPolynomialSha256": digest, "arithmeticTheoremProved": False,
              "checks": actual}
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k != "checks"}, indent=2))


if __name__ == "__main__":
    main()

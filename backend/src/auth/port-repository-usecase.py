import os
import re
import argparse

# Regex
INTERFACE_REGEX = re.compile(r'export\s+interface\s+(\w+)')

# metodi di interface (senza body, terminano con ;)
METHOD_REGEX = re.compile(
    r'(\w+)\s*\(([^)]*)\)\s*:\s*([^;\n]+);'
)


def get_visibility_symbol():
    # nelle interface TS è sempre pubblico
    return "+"


def latex_escape(text):
    return (
        text.replace("<", "$<$")
            .replace(">", "$>$")
            .replace("|", "$|$")
    )


def clean_type(typ):
    typ = typ.strip()
    typ = typ.rstrip(",")
    return typ


def parse_methods(content):
    methods = []

    for match in METHOD_REGEX.findall(content):
        name, params, return_type = match

        if name in ["if", "for", "while", "switch"]:
            continue

        symbol = get_visibility_symbol()

        params = params.strip()

        clean_params = []
        if params:
            for p in re.split(r',(?![^\(]*\))', params):
                p = p.strip()

                # rimuove eventuali decoratori
                p = re.sub(r'@\w+\([^)]*\)', '', p)

                if p:
                    clean_params.append(p)

        param_str = ", ".join(clean_params)

        methods.append((symbol, name, param_str, clean_type(return_type)))

    return methods


def parse_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    interface_match = INTERFACE_REGEX.search(content)
    if not interface_match:
        return None

    interface_name = interface_match.group(1)

    methods = parse_methods(content)

    return interface_name, methods


def generate_latex(interface_name, methods):
    lines = []

    for vis, name, params, return_type in methods:
        name = latex_escape(name)
        params = latex_escape(params)
        return_type = latex_escape(return_type)

        lines.append(
            f"\\addMet{{{vis}}}{{{name}({params}): {return_type}}}{{}}"
        )

    lines.append(f"\\makeItf{{{interface_name}}}{{}}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Genera LaTeX da interface TypeScript"
    )
    parser.add_argument("input_dir")
    parser.add_argument("-o", "--output", default="interfaces_output.tex")

    args = parser.parse_args()

    results = []

    for root, _, files in os.walk(args.input_dir):
        for filename in files:
            if filename.endswith(".ts"):
                filepath = os.path.join(root, filename)
                parsed = parse_file(filepath)

                if parsed:
                    interface_name, methods = parsed
                    latex = generate_latex(interface_name, methods)
                    results.append(latex)

    with open(args.output, "w", encoding="utf-8") as f:
        f.write("\n\n".join(results))

    print(f"Generato: {args.output}")


if __name__ == "__main__":
    main()

with open('web/style.css', 'r') as f:
    content = f.read()

content = content.replace("border: 15px solid #3e2723;", "border: 15px solid #3e2723; min-height: 400px; width: 100%;")

with open('web/style.css', 'w') as f:
    f.write(content)

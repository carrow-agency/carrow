import re

with open("src/pages/About.tsx", "r") as f:
    text = f.read()

text = text.replace("let isThree = true;", "let isTwo = true;")
text = text.replace("const count = isThree ? 3 : 2;", "const count = isTwo ? 2 : 3;")
text = text.replace("isThree = !isThree;", "isTwo = !isTwo;")

with open("src/pages/About.tsx", "w") as f:
    f.write(text)

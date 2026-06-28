import re

with open('Arquimedes/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Choc
content = re.sub(
    r'(if\s*\(chocChallenge === 2\)\s*\{\s*if\s*\(remainingVal < 0\.001\)\s*\{)(\s*)(chocFeedback\.textContent = ¡Espectacular!)',
    r'\1\2if (window.completeMission) window.completeMission(1);\n\2\3',
    content
)

# Race
content = re.sub(
    r'(if\s*\(distanceVal < 1\.901\)\s*\{)(\s*)(raceFeedback\.textContent = ¡Logrado!)',
    r'\1\2if (window.completeMission) window.completeMission(2);\n\2\3',
    content
)

# Lab bounds
content = re.sub(
    r'(if\s*\(error < 0\.05\)\s*\{)(\s*)(missionCota1\.textContent =)',
    r'\1\2if (window.completeMission) window.completeMission(3);\n\2\3',
    content
)

# Epsilon
content = re.sub(
    r'(if\s*\(errorBand <= eps\)\s*\{)(\s*)(epsilonFeedback\.textContent =)',
    r'\1\2if (window.completeMission) window.completeMission(4);\n\2\3',
    content
)

with open('Arquimedes/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')

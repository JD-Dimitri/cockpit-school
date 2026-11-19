"""Construit les cours rédigés pour la version Pro : data/academy-0.json (Cours 0) et data/academy-2.json (Cours II).
python3 tools/cours/build.py   — chaque bonne réponse est recalculée et vérifiée à la construction."""
import importlib, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from commun import write

C0 = ['c0_maths', 'c0_trigo', 'c0_unites', 'c0_mecanique', 'c0_fluides', 'c0_electricite', 'c0_geo']
mods = []
for name in C0:
    try:
        mods.append(importlib.import_module(name).MOD)
    except ModuleNotFoundError:
        pass   # thème pas encore rédigé
write('academy-0', [{
    'id': 'p0', 'n': 'Partie 0 — Les sciences utiles à l\'aéronautique',
    'd': 'Préparation : mathématiques, géométrie, unités, physique et géographie appliquées au vol. Un cours par thème et 30 exercices corrigés, du plus facile au plus difficile.',
    'mods': mods,
}])

# Cours II · Confirmé : mêmes thèmes que le Cours I, niveau très difficile (théorie de niveau ATPL)
C2 = ['c2_cellule', 'c2_aero', 'c2_propulsion', 'c2_instruments', 'c2_meteo', 'c2_navigation', 'c2_humain']
mods2 = []
for name in C2:
    try:
        mods2.append(importlib.import_module(name).MOD)
    except ModuleNotFoundError:
        pass   # module pas encore rédigé
write('academy-2', [{
    'id': 'q1', 'n': 'Partie II-1 — Fondamentaux de l\'avion et du vol, niveau ATPL',
    'd': 'Les thèmes du cours débutant (l\'avion, le vol, le moteur, les instruments, la météo, la navigation, le pilote) au niveau '
         'de la théorie du pilote de ligne (ATPL). Niveau très difficile : calculs, cas limites, pièges d\'examen. Exercices corrigés.',
    'mods': mods2,
}] if mods2 else [])

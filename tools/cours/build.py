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

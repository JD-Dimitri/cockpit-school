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
PARTS2 = [
    ('q1', 'Partie II-1 — Fondamentaux de l\'avion et du vol, niveau ATPL',
     'Les thèmes du cours débutant (l\'avion, le vol, le moteur, les instruments, la météo, la navigation, le pilote) au niveau '
     'de la théorie du pilote de ligne (ATPL). Niveau très difficile : calculs, cas limites, pièges d\'examen. Exercices corrigés.',
     ['c2_cellule', 'c2_aero', 'c2_propulsion', 'c2_instruments', 'c2_meteo', 'c2_navigation', 'c2_humain']),
    ('q2', 'Partie II-2 — Exploitation du transport aérien, niveau ATPL',
     'Les matières de la théorie PPL et des calculs du pilote reprises au niveau du pilote de ligne : réglementation, communications, '
     'performances de classe A, masse et centrage, préparation du vol et carburant, systèmes, procédures et sécurité. Exercices corrigés.',
     ['c2_reglementation', 'c2_communications', 'c2_performances', 'c2_masse', 'c2_planification', 'c2_systemes', 'c2_procedures']),
]
parts2 = []
for pid, n, d, names in PARTS2:
    mods = []
    for name in names:
        try:
            mods.append(importlib.import_module(name).MOD)
        except ModuleNotFoundError:
            pass   # module pas encore rédigé
    if mods:
        parts2.append({'id': pid, 'n': n, 'd': d, 'mods': mods})
write('academy-2', parts2)

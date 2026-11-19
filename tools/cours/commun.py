"""Outils communs à la rédaction des cours (Cours 0 et Cours II) : exercices à choix, valeurs calculées, format français.

Chaque exercice est vérifié à la construction : la bonne réponse est calculée par Python (assert),
jamais recopiée à la main. Les mauvaises réponses sont des erreurs typiques (oubli d'un carré, d'une conversion…).
"""
import json, math, pathlib, random

ROOT = pathlib.Path(__file__).resolve().parents[2]

def fr(x, d=0):
    """Nombre au format français : espace fine pour les milliers, virgule décimale."""
    s = f'{x:,.{d}f}'.replace(',', ' ').replace('.', ',').replace('-', '−')
    return s

def ex(q, good, wrongs, why, seed=None):
    """Exercice à choix : la bonne réponse est placée à une position stable mais variée."""
    opts = [good] + list(wrongs)
    norm = [o.replace('\u202f', ' ').replace('\u00a0', ' ').replace('-', '−') for o in opts]
    assert len(set(norm)) == len(norm), ('options en double', q, opts)
    rnd = random.Random(seed if seed is not None else q)
    order = list(range(len(opts))); rnd.shuffle(order)
    o = [opts[i] for i in order]
    return {'q': q, 'o': o, 'c': o.index(good), 'why': why}

def close(a, b, tol=1e-6):
    assert abs(a - b) <= tol * max(1, abs(b)), (a, b)
    return True

def write(name, parts):
    for p in parts:
        for m in p['mods']:
            for q in m.get('quiz', []):
                assert 0 <= q['c'] < len(q['o']) and q['why'], q
    out = ROOT / 'data' / (name + '.json')
    out.write_text(json.dumps(parts, ensure_ascii=False, indent=1), encoding='utf-8')
    n = sum(len(m.get('quiz', [])) for p in parts for m in p['mods'])
    print(f'{out.name} : {len(parts)} partie(s), {sum(len(p["mods"]) for p in parts)} modules, {n} exercices')

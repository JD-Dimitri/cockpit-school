#!/usr/bin/env python3
"""Envoi du trafic capté par le récepteur ADS-B personnel (Raspberry Pi + readsb) vers PLANE TRAJECTORIES Pro.

Le Pi est derrière la box : c'est lui qui envoie, le serveur ne peut pas l'interroger.
Toutes les PERIODE secondes : lecture de aircraft.json (fichier local ou adresse locale), compression gzip,
POST vers SERVEUR/api/trafic/recepteur avec l'en-tête X-Recepteur-Jeton.

Réglages (variables d'environnement, fichier /etc/default/envoi-trafic avec le service systemd) :
  SERVEUR   adresse du site, ex. https://mon-site.fr            (obligatoire)
  JETON     même valeur que TRAFIC_RECEPTEUR_JETON du serveur   (obligatoire, 24 caractères au moins)
  SOURCE    /run/readsb/aircraft.json (par défaut) ou http://127.0.0.1/tar1090/data/aircraft.json
  PERIODE   secondes entre deux envois (2 par défaut, 1 au minimum)
Bibliothèque standard Python seulement : rien à installer.
  python3 envoi_trafic.py --une-fois   → un seul envoi, pour vérifier les réglages
"""
import gzip, json, os, sys, time, urllib.request, urllib.error

def lire(source):
    if source.startswith(('http://', 'https://')):
        with urllib.request.urlopen(source, timeout=5) as r:
            return r.read()
    with open(source, 'rb') as f:
        return f.read()

def envoyer(serveur, jeton, brut):
    json.loads(brut)  # refuse un fichier coupé en cours d'écriture
    req = urllib.request.Request(serveur.rstrip('/') + '/api/trafic/recepteur', data=gzip.compress(brut), method='POST',
                                 headers={'Content-Type': 'application/json', 'Content-Encoding': 'gzip', 'X-Recepteur-Jeton': jeton,
                                          'User-Agent': 'plane-trajectories-recepteur/1'})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read() or b'{}')

def main():
    serveur, jeton = os.environ.get('SERVEUR', ''), os.environ.get('JETON', '')
    source = os.environ.get('SOURCE', '/run/readsb/aircraft.json')
    periode = max(1.0, float(os.environ.get('PERIODE', '2')))
    if not serveur or len(jeton) < 24:
        sys.exit('Réglages manquants : SERVEUR et JETON (24 caractères au moins).')
    une_fois = '--une-fois' in sys.argv
    attente = periode
    while True:
        try:
            rep = envoyer(serveur, jeton, lire(source))
            print(f"{time.strftime('%H:%M:%S')} envoyé : {rep.get('recu', '?')} appareils", flush=True)
            attente = periode
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'replace')[:200]
            print(f'Refus du serveur ({e.code}) : {msg}', file=sys.stderr, flush=True)
            if e.code in (401, 503):          # jeton faux ou récepteur non configuré : inutile d'insister vite
                attente = min(300, attente * 2)
        except Exception as e:                # réseau coupé, readsb arrêté, fichier en cours d'écriture…
            print(f'Envoi impossible : {e}', file=sys.stderr, flush=True)
            attente = min(60, attente * 2)
        if une_fois:
            return
        time.sleep(attente)

if __name__ == '__main__':
    main()

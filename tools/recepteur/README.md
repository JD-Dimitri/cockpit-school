# Récepteur ADS-B personnel (Raspberry Pi) → PLANE SIMULATOR

Le boîtier capte les messages ADS-B (1090 MHz) des avions autour de lui : position, altitude, vitesse, cap, indicatif.
Il **n'enregistre pas les conversations radio**. Ces données arrivent dans la version Pro par `GET /api/trafic`,
avec le statut [OBSERVÉ] et la source « récepteur ».

## 1. Matériel (≈ 80 à 150 €)

| Élément | Conseil |
|---|---|
| Raspberry Pi | 4 (2 Go suffisent) ou 3B+ ; un Zero 2 W convient aussi |
| Alimentation | officielle (Pi 4 : USB-C 5,1 V 3 A) : une alimentation faible est la première cause de pannes |
| Carte microSD | 16 Go ou plus |
| Clé radio USB | pour débuter : clé ADS-B avec filtre et amplificateur intégrés (type FlightAware Pro Stick Plus) ; la RTL-SDR Blog V4 marche aussi mais demande ses pilotes à jour |
| Antenne 1090 MHz | celle de la clé pour un premier essai ; antenne colinéaire sur le toit pour la portée (plusieurs centaines de km rapportées) |
| Câble coaxial | le plus court possible |

## 2. Installation du Pi

1. **Raspberry Pi Imager** → « Raspberry Pi OS Lite (64 bits) » ; dans les réglages : SSH activé, Wi-Fi, nom `adsb`, utilisateur et mot de passe.
2. Carte dans le Pi, clé et antenne branchées, alimentation. Depuis l'ordinateur : `ssh <utilisateur>@adsb.local`.
3. Mises à jour : `sudo apt update && sudo apt full-upgrade -y`.
4. RTL-SDR Blog V4 seulement : installer ses pilotes selon le guide officiel de la clé.
5. **Décodeur readsb** et **carte tar1090** : suivre le guide d'installation automatique indiqué sur
   https://github.com/wiedehopf/readsb et https://github.com/wiedehopf/tar1090. Gain : `--gain=auto` pour commencer.
6. Vérifier : `http://adsb.local/tar1090` dans le navigateur affiche les avions captés.
   Les mêmes données sont dans `/run/readsb/aircraft.json` (mis à jour chaque seconde).
7. Antenne : le plus haut possible, dégagée, à l'extérieur.

## 3. Envoi vers la version Pro

Sur le serveur (o2switch), dans `backend/.env.local` :

```
TRAFIC_RECEPTEUR_JETON=<jeton secret>      # php -r 'echo bin2hex(random_bytes(24));'
```

Sur le Pi :

```
sudo mkdir -p /opt/plane-simulator
sudo cp envoi_trafic.py /opt/plane-simulator/
sudo tee /etc/default/envoi-trafic >/dev/null <<'FIN'
SERVEUR=https://<adresse-du-site>
JETON=<le même jeton>
SOURCE=/run/readsb/aircraft.json
PERIODE=2
FIN
sudo chmod 600 /etc/default/envoi-trafic
SERVEUR=… JETON=… python3 /opt/plane-simulator/envoi_trafic.py --une-fois   # essai : « envoyé : N appareils »
sudo cp envoi-trafic.service /etc/systemd/system/
sudo systemctl enable --now envoi-trafic
journalctl -u envoi-trafic -f                                                    # suivi
```

Le serveur garde le dernier envoi 30 s. Si le Pi s'arrête, la source passe simplement à « 0 appareil ».

## 4. Autres sources (même point d'entrée `/api/trafic`)

- **OpenSky Network** : `TRAFIC_OPENSKY_ACTIVE=1` (+ identifiants OAuth2 facultatifs). Usage non commercial seulement, sauf accord avec OpenSky.
- **Flightradar24** : `TRAFIC_FR24_CLE=<clé de l'API officielle>`. Abonnement payant ; vérifier la licence (affichage public, usage commercial) avant.

Aucune source n'est active par défaut : leur choix et leur licence relèvent de l'auteur du projet.

## Points légaux

Recevoir l'ADS-B est une pratique répandue (des milliers de particuliers alimentent les sites de suivi de vols).
L'écoute, l'enregistrement ou la diffusion des **conversations** radio relèvent d'autres règles (secret des correspondances) :
ce boîtier et ce code ne les traitent pas. Vérifier auprès de l'ANFR avant tout usage de la radio vocale.

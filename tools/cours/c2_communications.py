"""Cours II · partie 2 · module 2 : communications — phraséologie OACI, collationnement, codes transpondeur, urgence et détresse,
panne radio, calage altimétrique. Niveau ATPL, très difficile. 20 exercices corrigés."""
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matières « Communications VFR et IFR » (EASA ATPL, sujet 090). Reprend le module « Communications » de la théorie PPL (Cours I, partie 6).
Les fréquences et procédures citées ici sont des exemples d'école : en vol, seules comptent celles publiées pour le terrain (AIP, cartes en vigueur).</p>

<h3>1. Collationnement obligatoire</h3>
<p>Le pilote répète (collationne) au minimum : les clairances de route ; les clairances et instructions d'entrée, d'atterrissage, de décollage, d'alignement, de traversée ou de remontée de piste ;
la piste en service ; le calage altimétrique ; les codes transpondeur ; les instructions de niveau, de cap et de vitesse ; les niveaux de transition [RÉFÉRENCÉ] OACI Doc 4444 et Annexe 10 vol. II.
Il termine par son indicatif. Une clairance non comprise n'est jamais exécutée : on demande « Répétez » (« Say again »).</p>

<h3>2. Les mots clés</h3>
<table class="kv"><tbody>
<tr><th>« Roger »</th><td>j'ai reçu tout votre message (ce n'est ni un accord ni un collationnement)</td></tr>
<tr><th>« Wilco »</th><td>compris, je me conformerai</td></tr>
<tr><th>« Affirm » / « Negative »</th><td>oui / non (on évite « yes » et « no »)</td></tr>
<tr><th>« Standby »</th><td>attendez, je vous rappelle ; ce n'est pas une autorisation</td></tr>
<tr><th>« Cleared »</th><td>réservé aux clairances ; « take-off » n'est prononcé que dans la clairance de décollage ou son annulation (sinon « departure »)</td></tr>
</tbody></table>
<p>La catastrophe de Tenerife (1977) a imposé cette discipline : une phrase ambiguë (« we are now at take-off ») a été comprise différemment par l'équipage et la tour.</p>

<h3>3. Détresse, urgence, transpondeur</h3>
<ul>
<li><b>MAYDAY</b> (trois fois) : danger grave et imminent, assistance immédiate nécessaire. <b>PAN PAN</b> (trois fois) : urgence, sans danger immédiat.</li>
<li>Message : indicatif de la station, MAYDAY ×3, indicatif, nature de la détresse, intentions, position, niveau, cap, autres informations (personnes à bord, carburant en heures).</li>
<li>Codes : <b>7700</b> urgence, <b>7600</b> panne radio, <b>7500</b> intervention illicite. 2000 : IFR sans code assigné en Europe ; 7000 : VFR (selon l'État).</li>
<li>« MAYDAY FUEL » : le carburant restant à l'atterrissage sera inférieur à la réserve finale ; « MINIMUM FUEL » : plus de marge pour un retard [RÉFÉRENCÉ] AMC1 CAT.OP.MPA.281.</li>
</ul>

<h3>4. Panne radio en IFR (règle générale OACI, à vérifier dans l'AIP)</h3>
<p>Afficher 7600 ; en conditions VMC, continuer en VMC et atterrir sur le terrain approprié le plus proche ; en IMC, garder le dernier niveau assigné (ou l'altitude minimale si plus haute) pendant 7 min
(en espace où le radar est utilisé), puis suivre le plan de vol ; commencer la descente le plus près possible de l'heure prévue d'arrivée [RÉFÉRENCÉ] OACI Doc 4444 § 15.3, Annexe 2 § 3.6.5.2.</p>

<h3>5. Calages altimétriques</h3>
<p>Sous l'altitude de transition : QNH (altitudes). Au-dessus du niveau de transition : 1 013,25 hPa (niveaux de vol). La couche de transition est entre les deux.
QFE : hauteur au-dessus du terrain. On passe en 1013 en montée à l'altitude de transition ; on affiche le QNH en descente au niveau de transition.</p>
<div class="box"><b>Pièges d'examen</b> : « Roger » ne vaut pas collationnement ; le mot « take-off » est réservé ; 7500 est pour l'intervention illicite (et non l'urgence).</div>
"""

Q = []
Q.append(ex('Code transpondeur en cas d\'intervention illicite :', '7500', ['7700', '7600', '2000'], '7500 : intervention illicite ; 7600 : panne radio ; 7700 : urgence.'))
Q.append(ex('Code transpondeur en panne radio :', '7600', ['7500', '7700', '7000'], '7600.'))
Q.append(ex('Le contrôleur dit « Descend FL120 ». Réponse correcte :', '« Descend FL120, [indicatif] »', ['« Roger, [indicatif] »', '« Wilco »', '« Affirm »'],
            'Les instructions de niveau doivent être collationnées ; « Roger » n\'est pas un collationnement.'))
Q.append(ex('Lequel n\'est PAS obligatoirement collationné ?', 'une information de trafic', ['le calage altimétrique', 'le code transpondeur', 'la clairance d\'atterrissage'],
            'Les informations (trafic, météo générale) ne sont pas à collationner ; on accuse réception.'))
Q.append(ex('Signification de « Wilco » :', 'compris, je me conformerai', ['j\'ai reçu votre message', 'répétez', 'attendez'], 'Will comply.'))
Q.append(ex('Signification de « Standby » :', 'attendez, je vous rappelle', ['vous êtes autorisé', 'je me conforme', 'annulez'], 'Ce n\'est jamais une autorisation.'))
Q.append(ex('Avant d\'être autorisé, l\'équipage veut signaler qu\'il est prêt au décollage. Formulation correcte :', '« Ready for departure »', ['« Ready for take-off »', '« We are now at take-off »', '« Cleared for take-off »'],
            'Le mot « take-off » est réservé à la clairance de décollage (ou à son annulation) depuis Tenerife (1977).'))
Q.append(ex('Panne moteur sur un bimoteur, l\'autre fonctionne, aucun danger immédiat, mais besoin de priorité. Message :', 'PAN PAN ×3', ['MAYDAY ×3', 'SECURITE ×3', 'aucun message'],
            'Urgence sans danger grave et imminent. Beaucoup d\'exploitants demandent MAYDAY pour une panne moteur : l\'équipage juge selon ses procédures.'))
Q.append(ex('Feu moteur non maîtrisé après décollage :', 'MAYDAY ×3', ['PAN PAN ×3', 'MINIMUM FUEL', '7600'], 'Danger grave et imminent : détresse.'))
Q.append(ex('L\'équipage calcule que le carburant à l\'atterrissage sera inférieur à la réserve finale. Il annonce :', '« MAYDAY MAYDAY MAYDAY FUEL »', ['« MINIMUM FUEL »', '« PAN PAN »', 'rien tant que le carburant n\'est pas nul'],
            'AMC1 CAT.OP.MPA.281 : MAYDAY FUEL si le carburant prévu à l\'atterrissage est sous la réserve finale ; MINIMUM FUEL quand tout retard supplémentaire l\'y amènerait.'))
Q.append(ex('Panne radio en IFR, en IMC, dans un espace où le radar est utilisé. D\'abord :', 'garder le dernier niveau assigné 7 minutes, puis suivre le plan de vol', ['descendre immédiatement', 'faire demi-tour', 'monter au niveau maximal'],
            'Règle générale OACI (Doc 4444 § 15.3) ; les États peuvent publier des procédures particulières dans l\'AIP.'))
Q.append(ex('En montée, à quel moment affiche-t-on 1013 hPa ?', 'à l\'altitude de transition', ['au niveau de transition', 'au décollage', 'au FL100'], 'En montée : altitude de transition ; en descente : niveau de transition (affichage du QNH).'))
Q.append(ex('Altitude de transition 5 000 ft, QNH 993 hPa (≈ 27 ft/hPa). Plus bas niveau de vol utilisable en gardant au moins 1 000 ft au-dessus de l\'altitude de transition ?', 'FL070',
            ['FL060', 'FL050', 'FL080'],
            f'QNH 993 : FL060 correspond à 6 000 − 20 × 27 = {fr(6000-20*27)} ft d\'altitude, soit {fr(6000-20*27-5000)} ft au-dessus de l\'altitude de transition (insuffisant) ; FL070 : {fr(7000-20*27)} ft d\'altitude, soit {fr(7000-20*27-5000)} ft au-dessus → FL070.'))
Q.append(ex('QNH 1 030 hPa, terrain à 400 ft. QFE approximatif (≈ 27 ft/hPa) ?', f'≈ {fr(1030-400/27)} hPa', ['≈ 1 045 hPa', '≈ 1 030 hPa', '≈ 990 hPa'],
            f'QFE = QNH − 400 / 27 ≈ 1 030 − 15 = {fr(1030-400/27)} hPa.'))
Q.append(ex('Indicatif d\'urgence prononcé pour une évacuation médicale (MEDEVAC), message de priorité :', 'PAN PAN suivi de MEDICAL', ['MAYDAY MEDICAL', 'SECURITE', 'aucun'],
            'Les transports sanitaires utilisent le signal d\'urgence PAN PAN suivi de MEDICAL (Annexe 10 vol. II).'))
Q.append(ex('Lors d\'un message MAYDAY, l\'équipage doit indiquer en particulier :', 'la nature de la détresse et ses intentions', ['la météo de destination', 'le code de la compagnie', 'le nom du commandant'],
            'Nature de la détresse, intentions, position, niveau, cap, autonomie, personnes à bord.'))
Q.append(ex('Le contrôle dit « Report 10 miles final ». Le pilote répond :', '« Wilco, [indicatif] »', ['« Roger »', '« Report 10 miles final »', '« Negative »'],
            'Une demande de compte rendu future se reçoit par « Wilco » : on s\'y conformera.'))
Q.append(ex('Phraséologie pour dire « oui » en radiotéléphonie :', '« Affirm »', ['« Yes »', '« Roger »', '« Correct »'],
            '« Affirm » (ou « Affirmatif »), « Negative » pour non. « Correct » signifie « exact » après un contrôle de lecture.'))
Q.append(ex('Lettre de l\'alphabet OACI correspondant à « Lima » :', 'L', ['I', 'M', 'K'], 'Alphabet OACI : Kilo, Lima, Mike.'))
Q.append(ex('Prononciation OACI du chiffre 9 :', '« Niner »', ['« Nine »', '« Nain »', '« Nueve »'], 'Pour éviter la confusion avec l\'allemand « nein ».'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q2-communications', 't': 'Communications : phraséologie, urgence, panne radio, calages', 'h': H, 'quiz': Q}

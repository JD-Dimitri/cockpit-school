"""Cours II · partie 2 · module 1 : droit aérien et réglementation — OACI, libertés de l'air, annexes, espaces aériens,
règles de l'air, minimums VMC, licences. Niveau ATPL, très difficile. 20 exercices corrigés."""
from commun import ex, fr, close

H = """
<p class="lead"><b>Niveau confirmé.</b> Matière « Droit aérien » (EASA ATPL, sujet 010). Reprend au niveau professionnel le module « Réglementation » de la théorie PPL (Cours I, partie 6).
Les textes évoluent : la référence est toujours la version en vigueur publiée par l'OACI, l'EASA ou l'autorité nationale.</p>

<h3>1. L'OACI et la convention de Chicago (1944)</h3>
<p>L'Organisation de l'aviation civile internationale (Montréal) publie des <b>normes et pratiques recommandées</b> (SARPs) dans 19 annexes. Un État qui s'écarte d'une norme doit le notifier (« différences », publiées dans son AIP).</p>
<table class="kv"><tbody>
<tr><th>Annexe 1</th><td>licences du personnel</td></tr>
<tr><th>Annexe 2</th><td>règles de l'air</td></tr>
<tr><th>Annexe 3</th><td>assistance météorologique</td></tr>
<tr><th>Annexe 6</th><td>exploitation technique des aéronefs</td></tr>
<tr><th>Annexe 7</th><td>marques de nationalité et d'immatriculation</td></tr>
<tr><th>Annexe 8</th><td>navigabilité</td></tr>
<tr><th>Annexe 10</th><td>télécommunications aéronautiques</td></tr>
<tr><th>Annexe 11</th><td>services de la circulation aérienne</td></tr>
<tr><th>Annexe 12</th><td>recherches et sauvetage</td></tr>
<tr><th>Annexe 13</th><td>enquêtes sur les accidents et incidents</td></tr>
<tr><th>Annexe 14</th><td>aérodromes</td></tr>
<tr><th>Annexe 17</th><td>sûreté</td></tr>
<tr><th>Annexe 18</th><td>marchandises dangereuses</td></tr>
<tr><th>Annexe 19</th><td>gestion de la sécurité (SMS)</td></tr>
</tbody></table>

<h3>2. Les libertés de l'air</h3>
<p>1<sup>re</sup> : survoler un État sans atterrir. 2<sup>e</sup> : y faire une escale technique (sans embarquer ni débarquer de trafic). 3<sup>e</sup> : débarquer dans un autre État du trafic venant de l'État d'immatriculation.
4<sup>e</sup> : y embarquer du trafic à destination de l'État d'immatriculation. 5<sup>e</sup> : transporter du trafic entre deux États étrangers sur une ligne qui part ou aboutit à l'État d'immatriculation.
Les deux premières sont échangées multilatéralement (accord de transit) ; les autres dans des accords bilatéraux.</p>

<h3>3. Les espaces aériens (Annexe 11)</h3>
<p>Classes A à G. A : IFR seul. B : IFR et VFR, tous séparés. C : IFR séparés de tous, VFR séparés des IFR. D : IFR séparés des IFR, information de trafic sur les VFR. E : IFR seuls séparés entre eux ; VFR sans clairance.
F et G : non contrôlés. Minimums VMC en espaces B à E : sous 3 050 m (10 000 ft) AMSL, visibilité 5 km ; au-dessus, 8 km ; distances aux nuages 1 500 m horizontalement et 300 m (1 000 ft) verticalement [RÉFÉRENCÉ] SERA.5001.</p>

<h3>4. Règles de l'air (priorités)</h3>
<ul>
<li>Deux aéronefs face à face : chacun oblique vers la <b>droite</b>.</li>
<li>Routes convergentes à même niveau : celui qui a l'autre <b>à sa droite</b> cède le passage. Priorité, dans l'ordre : ballons, planeurs, aéronefs remorquant, dirigeables, aéronefs motorisés plus lourds que l'air.</li>
<li>Dépassement : l'aéronef rattrapé a priorité ; le dépassant passe <b>par la droite</b>.</li>
<li>Aéronef en détresse : priorité sur tous.</li>
</ul>

<h3>5. Licences (EASA Part-FCL)</h3>
<p>CPL(A) : âge minimal 18 ans. ATPL(A) : 21 ans et 1 500 h de vol (dont 500 h en exploitation multipilote, 250 h comme commandant, 200 h en vol de navigation…). Certificat médical de classe 1 pour les pilotes professionnels.
Le pilote de 60 ans et plus en transport commercial doit voler dans un équipage multipilote dont l'autre pilote a moins de 60 ans ; limite à 65 ans [RÉFÉRENCÉ] Part-FCL (FCL.065).</p>
<div class="box"><b>Pièges d'examen</b> : la 2<sup>e</sup> liberté exclut tout trafic commercial ; en dépassement on passe par la droite (et non la gauche comme sur la route) ;
la classe E n'exige pas de clairance pour les VFR.</div>
"""

Q = []
Q.append(ex('Annexe OACI qui traite des enquêtes sur les accidents et incidents :', 'Annexe 13', ['Annexe 6', 'Annexe 11', 'Annexe 19'], 'Annexe 13 ; l\'Annexe 19 traite des systèmes de gestion de la sécurité.'))
Q.append(ex('Annexe OACI consacrée aux licences du personnel :', 'Annexe 1', ['Annexe 2', 'Annexe 6', 'Annexe 8'], 'Annexe 1 (licences) ; Annexe 2 : règles de l\'air ; Annexe 8 : navigabilité.'))
Q.append(ex('Une compagnie française fait escale à Dakar uniquement pour avitailler, sans passagers embarqués ni débarqués. Liberté utilisée :', '2e liberté', ['1re liberté', '5e liberté', '4e liberté'],
            'Escale technique sans trafic commercial : 2e liberté.'))
Q.append(ex('Une compagnie française transporte des passagers de Dakar à Abidjan sur sa ligne Paris – Dakar – Abidjan. Liberté :', '5e liberté', ['3e liberté', '4e liberté', '2e liberté'],
            'Trafic entre deux États étrangers sur une ligne partant de l\'État d\'immatriculation : 5e liberté.'))
Q.append(ex('Un État s\'écarte d\'une norme OACI. Il doit :', 'notifier la différence à l\'OACI et la publier', ['obtenir l\'accord des autres États', 'quitter l\'OACI', 'rien faire'],
            'Article 38 de la convention de Chicago : notification des différences, publiées dans l\'AIP (GEN 1.7).'))
Q.append(ex('Espace de classe D : un vol IFR est séparé :', 'des autres vols IFR seulement', ['de tous les vols', 'de personne', 'des vols VFR seulement'],
            'En D, IFR séparés des IFR ; ils reçoivent une information de trafic sur les VFR.'))
Q.append(ex('Espace de classe E : un vol VFR :', 'n\'a pas besoin de clairance', ['doit obtenir une clairance', 'est interdit', 'est séparé des IFR'],
            'En E, seuls les IFR sont contrôlés et séparés entre eux.'))
Q.append(ex('Espace de classe A :', 'vols IFR seulement', ['IFR et VFR séparés', 'VFR seulement', 'non contrôlé'], 'La classe A n\'admet que les vols IFR.'))
Q.append(ex('Minimum de visibilité en vol VFR en classe C à FL120 :', '8 km', ['5 km', '1 500 m', '10 km'], 'Au-dessus de 3 050 m (10 000 ft) AMSL : 8 km [RÉFÉRENCÉ] SERA.5001.'))
Q.append(ex('Distance verticale minimale aux nuages en VMC (classes B à E) :', '300 m (1 000 ft)', ['150 m (500 ft)', '1 500 m', '30 m (100 ft)'], '1 500 m horizontalement et 300 m verticalement.'))
Q.append(ex('Deux avions motorisés en routes convergentes au même niveau. Lequel cède le passage ?', 'celui qui a l\'autre à sa droite', ['celui qui a l\'autre à sa gauche', 'le plus rapide', 'le plus haut'],
            'Règle de la priorité à droite (SERA.3210).'))
Q.append(ex('Un avion en rattrape un autre. Il le dépasse :', 'par la droite', ['par la gauche', 'par-dessus', 'par-dessous'],
            'Le dépassant modifie sa trajectoire vers la droite ; le rattrapé garde la priorité.'))
Q.append(ex('Un avion motorisé rencontre un planeur en route convergente :', 'l\'avion motorisé cède le passage', ['le planeur cède le passage', 'priorité à droite seulement', 'le plus haut cède'],
            'Les aéronefs moins manœuvrants ont la priorité : ballons, planeurs, remorqueurs, dirigeables, puis motorisés.'))
Q.append(ex('Âge minimal pour délivrer un ATPL(A) (Part-FCL) :', '21 ans', ['18 ans', '17 ans', '23 ans'], 'ATPL : 21 ans ; CPL : 18 ans ; PPL : 17 ans.'))
Q.append(ex('Expérience minimale de vol pour un ATPL(A) (Part-FCL) :', '1 500 h', ['250 h', '500 h', '3 000 h'], '1 500 h, dont 500 h en exploitation multipilote.'))
Q.append(ex('Classe de certificat médical exigée pour un pilote de ligne :', 'classe 1', ['classe 2', 'LAPL', 'classe 3'], 'La classe 3 concerne les contrôleurs aériens.'))
Q.append(ex('Pilote de 62 ans en transport commercial de passagers :', 'autorisé en équipage multipilote si l\'autre pilote a moins de 60 ans', ['interdit', 'autorisé seul', 'autorisé sans condition'],
            'Part-FCL FCL.065 : de 60 à 64 ans, en équipage multipilote avec un pilote de moins de 60 ans ; plus de transport commercial à partir de 65 ans.'))
Q.append(ex('Marques de nationalité d\'un avion immatriculé F-HXXX :', 'France', ['Allemagne', 'Royaume-Uni', 'Espagne'], 'F : France ; D : Allemagne ; G : Royaume-Uni ; EC : Espagne (Annexe 7).'))
Q.append(ex('Document dans lequel un État publie les informations aéronautiques permanentes (aérodromes, espaces, procédures) :', 'l\'AIP', ['le NOTAM', 'le METAR', 'le manuel d\'exploitation'],
            'Publication d\'information aéronautique (Annexe 15) ; les NOTAM signalent les changements temporaires.'))
Q.append(ex('Organisme qui enquête sur un accident d\'avion de ligne en France :', 'le BEA', ['la DGAC', 'l\'EASA', 'la gendarmerie seule'],
            'Le Bureau d\'enquêtes et d\'analyses pour la sécurité de l\'aviation civile mène l\'enquête de sécurité, distincte de l\'enquête judiciaire, conformément à l\'Annexe 13.'))
assert len(Q) == 20, len(Q)

MOD = {'id': 'q2-reglementation', 't': 'Droit aérien : OACI, libertés, espaces, règles de l\'air, licences', 'h': H, 'quiz': Q}

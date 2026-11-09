// Leerwoorden Frans, transcribed from the "Apprendre" boxes of the French book (photos of 2026-11-09).
// Same line format as data.js:  french [note] = meaning | sense 2 {italic remark}
// Lessons marked phrases: true hold whole sentences: they are checked as one answer and left out of the Woordenboek.
// French punctuation keeps its space before ? and !, written as a no-break space ( ).

const FRENCH_LESSONS_RAW = [
{ id: "8", chapter: 8, kind: "les", title: "Apprendre 8 – Écrire – vocabulaire", subtitle: "Écrire · vocabulaire", words: `
le programme d’échange = het uitwisselingsprogramma
proposer = voorstellen
cher, chère = beste {aanhef mail}
entre = tussen
avoir lieu = plaatsvinden
au mois de = in de maand
content = blij, tevreden
auparavant = eerder
la famille d’accueil = het gastgezin
les coordonnées = de persoonsgegevens
se présenter = zich voorstellen
environ = ongeveer
le cuir = het leer
ancien, ancienne = oud
vivre = leven, wonen
jouer aux jeux vidéo = gamen
plus tard = later
parce que = omdat
améliorer = verbeteren
le mot = het woord
se demander = zich afvragen
plein de = volop
ensemble = samen
s’entendre avec = met elkaar kunnen opschieten
vite = snel
amitiés = groetjes
`},
{ id: "9", chapter: 9, kind: "les", title: "Apprendre 9 – Écrire – phrases", subtitle: "Écrire · phrases", phrases: true, words: `
Elle participera à un programme d’échange. = Ze zal meedoen aan een uitwisselingsprogramma.
L’échange aura lieu au mois de septembre. = De uitwisseling zal plaatsvinden in de maand september.
J’écris ce mail pour me présenter. = Ik schrijf deze e-mail om me voor te stellen.
Au collège, j’ai français depuis trois ans. = Op school heb ik sinds drie jaar Frans.
Je voudrais améliorer mon niveau d’anglais. = Ik zou graag mijn niveau van het Engels willen verbeteren.
Tu peux me parler de tes camarades de classe ? = Kun je me vertellen over je klasgenoten?
Ce n’est pas la première fois que je vais à l’étranger. = Het is niet de eerste keer dat ik naar het buitenland ga.
J’adore voyager. = Ik ben dol op reizen.
J’ai très envie de te montrer mon pays. = Ik heb veel zin om je mijn land te laten zien.
J’espère qu’on s’entendra bien. = Ik hoop dat wij het goed met elkaar zullen kunnen vinden.
`},
];

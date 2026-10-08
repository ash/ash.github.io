// Leerwoorden — transcribed from the Fortuna word lists (img/IMG_3655 … IMG_3671).
//
// Format per line:   latin [note] = meaning
//   [note]   grammar hint shown small next to the Latin (bijw., infinitivus, + acc., …)
//   |        separates numbered senses (1. … 2. …)
//   {note}   explanatory remark inside the meaning, shown small/italic
//
// Sections: "tekst" = Woorden tekst NX, "herhaling" = Herhaling moeilijke woorden / voorzetsels.

const LESSONS_RAW = [
{ id: "3A", chapter: 3, kind: "tekst", words: `
dea = godin
filia = dochter
non = niet
mater, matrem = moeder
est = (hij, zij, het) is
dominus = heer, heerser
deus = god
soror, sororem = zuster
pater, patrem = vader
et = en | ook
uxor, uxorem = vrouw, echtgenote
filius = zoon
sed = maar
quoque = ook {quoque benadrukt het woord waar het achter staat}
regina = koningin
`},
{ id: "3B", chapter: 3, kind: "tekst", words: `
etiam = ook, zelfs
populus = volk
sedet = (hij, zij, het) zit
amat = (hij, zij, het) houdt van
in templo = in de tempel
nam = want
servat = (hij, zij, het) beschermt, bewaart, behoudt
timet = (hij, zij, het) vreest, is bang (voor)
in Italia = in Italië
saepe = vaak, dikwijls
habet = (hij, zij, het) heeft, houdt
bellum = oorlog
mittit = (hij, zij, het) zendt, stuurt
defendit = (hij, zij, het) verdedigt, beschermt
regnat = (hij, zij, het) heerst, regeert
`},
{ id: "3C", chapter: 3, kind: "tekst", words: `
ignis, ignem = vuur
vincit = (hij, zij, het) overwint
relinquit = (hij, zij, het) verlaat, laat achter
habitat = (hij, zij, het) (be)woont
curat = (hij, zij, het) zorgt voor, verzorgt
pervenit = (hij, zij, het) komt aan, bereikt
templum = tempel
urbs, urbem = stad
semper = altijd
amor, amorem = liefde
`},
{ id: "4A", chapter: 4, kind: "tekst", words: `
laetus, laeta, laetum = blij
vir, virum = man
in [+ acc.] = naar, naar binnen
rex, regem = koning
necat = (hij) doodt
mors, mortem = de dood
pulcher, pulchra, pulchrum = mooi
regnum = heerschappij
bonus, bona, bonum = goed
frater, fratrem = broer
facit = (hij) maakt
nunc = nu
ducit = (hij) leidt, brengt
puella = meisje
malus, mala, malum = slecht
novus, nova, novum = nieuw
`},
{ id: "4B", chapter: 4, kind: "tekst", words: `
gloria = roem
apud [+ acc.] = bij
lacrimat = (hij) huilt
silva = bos
magnus, magna, magnum = groot
cupit = (hij) verlangt (naar), (hij) begeert
valde [bijw.] = erg, zeer
ad [+ acc.] = naar, bij, tot
obscurus, obscura, obscurum = donker, duister
fluvius = rivier
parvus, parva, parvum = klein
ambulat = (hij) wandelt
aqua = water
subito [bijw.] = plotseling
videt = (hij) ziet
clarus, clara, clarum = helder, beroemd
deinde = daarna, vervolgens
`},
{ id: "4C", chapter: 4, kind: "tekst", words: `
quis? = wie?
ubi? = waar?
miser, misera, miserum = ongelukkig
non iam = niet meer
solus, sola, solum = alleen, (als) enige
iratus, irata, iratum = boos
morbus = ziekte
timidus, timida, timidum = bang
verus, vera, verum = echt, waar
meus, mea, meum = mijn
causa = reden, oorzaak
cogitat = (hij) denkt (aan), overweegt
filii [nom. mv.] = zonen
sunt = (zij) zijn
cognoscit = (hij) leert kennen, verneemt
`},
{ id: "4H", chapter: 4, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
soror, sororem = zuster
quoque = ook
pervenit = (hij, zij, het) komt aan, bereikt
relinquit = (hij, zij, het) verlaat, laat achter
uxor, uxorem = vrouw, echtgenote
servat = (hij, zij, het) beschermt, bewaart, behoudt
saepe = vaak, dikwijls
curat = (hij, zij, het) zorgt voor, verzorgt
`},
{ id: "5A", chapter: 5, kind: "tekst", words: `
ergo [bijw.] = dus
amittĕre [infinitivus] = verliezen
periculum = gevaar
duo = twee
bibĕre [infinitivus] = drinken
iacent = (zij) liggen
audit = (hij) hoort
vult = (hij) wil
fratres [nom./acc. mv.] = broers
venit = (hij) komt
tum [bijw.] = toen, dan
`},
{ id: "5B", chapter: 5, kind: "tekst", words: `
enim = want, namelijk, immers
vester, vestra, vestrum = (van) jullie
invenit = (hij) vindt
tempus [nom./acc. onz.] = tijd
portat = (hij) draagt
vivunt = (zij) leven
cognoscĕre [infinitivus] = leren kennen, vernemen
dicit = (hij) zegt
tristis, triste = droevig, bedroefd
fortis, forte = dapper, sterk
crudelis, crudele = wreed
incolumis, incolume = ongedeerd
salutant = (zij) begroeten (als)
eius = van hem, zijn | (van) haar | van het, zijn, ervan
consilium = plan, besluit
faciunt = (zij) maken | (zij) doen
gaudent = (zij) zijn blij
capiunt = (zij) pakken, (zij) nemen
`},
{ id: "5C", chapter: 5, kind: "tekst", words: `
circa [+ acc.] = rondom, om … heen
altus, alta, altum = hoog, diep
habitare [infinitivus] = (be)wonen
volunt = (zij) willen
omnis, omne = geheel | ieder, elk
omnes [nom./acc. mv.] = alle(n)
amicus, mv. amici = vriend
terret = (hij) maakt bang, (hij) verschrikt
ita = zo
esse [infinitivus] = (te) zijn
nondum = nog niet
super [+ acc.] = boven(op), over
sic = zo
incipiunt = (zij) beginnen
nomen [nom./acc. onz.] = naam
ubi = waar? | waar {betr. vnw. van plaats}
immortalis, immortale = onsterfelijk
locus = plaats
`},
{ id: "5H", chapter: 5, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
uxor, uxorem = vrouw, echtgenote
quoque = ook
sed = maar
soror, sororem = zuster
regina = koningin
servat = (hij) beschermt, bewaart, behoudt
mittit = (hij) zendt, stuurt
regnat = (hij) heerst, regeert
saepe = vaak, dikwijls
relinquit = (hij) verlaat, laat achter
ignis, ignem = vuur
pervenit = (hij) komt aan, bereikt
`},
{ id: "6A", chapter: 6, kind: "tekst", words: `
gens, gentem = volk
terribilis, terribile = verschrikkelijk
autem = maar, echter
itaque = daarom
contentus, contenta, contentum = tevreden
quia = omdat
femina = vrouw
dant = (zij) geven
parat = (hij) bereidt voor, (hij) maakt gereed
domus = huis
conveniunt = (zij) komen samen
parentes [nom./acc. mv.] = ouders
finis, finem = einde
multus, multa, multum = veel
invitat = (hij) nodigt uit
iam = al, reeds
Romanus = Romein | Romeins
iuvenis, iuvenem = jongeman
rapiunt = (zij) grijpen, (zij) roven
homo, hominem = mens | man
`},
{ id: "6B", chapter: 6, kind: "tekst", words: `
per [+ acc.] = door … heen | gedurende | door (middel van)
postea [bijw.] = daarna, later
rogat = (hij) vraagt
perdit = (hij) richt te gronde | (hij) verliest
post [+ acc.] = na
talis, tale = zo'n, zodanig(e), zulk(e)
atque = en
donum = geschenk
miles, militem = soldaat
dux, ducem = aanvoerder
extra [+ acc.] = buiten
donat = (hij) geeft
sperat = (hij) hoopt
iaciunt = (zij) gooien
expugnat = (hij) verovert
aurum = goud
`},
{ id: "6C", chapter: 6, kind: "tekst", words: `
clades, cladem = nederlaag
inter [+ acc.] = tussen
pars, partem = deel
prope = bijna | {+ acc.} dichtbij
lacrima = traan
vulnerant = (zij) verwonden
pax, pacem = vrede
finit = (hij) beëindigt
accipiunt = (zij) nemen aan, ontvangen, (zij) verkrijgen | (zij) vernemen
facĕre [infinitivus] = (te) maken | (te) doen
verbum = woord
pugnare [infinitivus] = vechten
orant = (zij) smeken
`},
{ id: "6H", chapter: 6, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
non iam = niet meer
cognoscit = (hij) leert kennen, verneemt
cogitat = (hij) denkt (aan), overweegt
ducit = (hij) leidt, voert
subito [bijw.] = plotseling
apud [+ acc.] = bij
fluvius = rivier
timidus, timida, timidum = bang
quis? = wie?
deinde = daarna, vervolgens
valde [bijw.] = zeer, erg
laetus, laeta, laetum = blij
`},
{ id: "7A", chapter: 7, kind: "tekst", words: `
agricola = boer
gero (gerĕre) = dragen | (oorlog)voeren
malum = ramp
quid? = wat?
primus, prima, primum = eerste
pario (parĕre) = voortbrengen
debeo (debēre) = moeten
praeterea = bovendien
vos [nom./acc.] = jullie
pugna = gevecht
ante [+ acc.] = voor
nos [nom./acc.] = wij, ons
`},
{ id: "7B", chapter: 7, kind: "tekst", words: `
statim = meteen
iterum = weer, opnieuw
clamo (clamare) = roepen
ecce! = kijk!
denique = tenslotte
rideo (ridēre) = lachen
opprimo (opprimĕre) = neerdrukken | overweldigen, overvallen
occido (occidĕre) = doden
at = maar
ego = ik
respondeo (respondēre) = antwoorden
tu = jij
eum [acc.] = hem
maneo (manēre) = wachten (op), blijven
fugio (fugĕre) = vluchten
-ne = …? {leidt een vraagzin in; niet vertalen}
te [acc.] = je, jou
interficio (interficĕre) = doden
secundus, secunda, secundum = tweede
mortuus, mortua, mortuum = dood, gestorven
curro (currĕre) = rennen
`},
{ id: "7V", chapter: 7, kind: "herhaling", title: "Herhaling voorzetsels", words: `
circa [+ acc.] = rondom, om … heen
apud [+ acc.] = bij
inter [+ acc.] = tussen
extra [+ acc.] = buiten
in [+ acc.] = naar, naar binnen
super [+ acc.] = boven(op), over
ante [+ acc.] = voor
ad [+ acc.] = naar, bij, tot
post [+ acc.] = na
per [+ acc.] = door … heen | gedurende | door (middel van)
`},
{ id: "7H", chapter: 7, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
ubi = waar? | waar {betr. vnw. van plaats}
amitto (amittĕre) = verliezen
ergo = dus
gaudeo (gaudēre) = blij zijn
iaceo (iacēre) = liggen
iacio (iacĕre) = gooien
consilium = plan, besluit
invenio (invenire) = vinden
vester, vestra, vestrum = (van) jullie
incipiunt = (zij) beginnen
nondum = nog niet
habito (habitare) = (be)wonen
omnis, omne = geheel | ieder, elke | {mv.} alle(n)
periculum = gevaar
incolumis = ongedeerd
`},
{ id: "8A", chapter: 8, kind: "tekst", words: `
olim [bijw.] = ooit, eens, vroeger
laudo (laudare) = prijzen
excito (excitare) = (op)wekken | opjagen
hostis, hostem = vijand
antea [bijw.] = vroeger
puer, puerum = jongen
nobilis, nobile = aanzienlijk, van hoge afkomst
erat [imperf.] = (hij) was
soleo (solēre) = de gewoonte hebben, gewoonlijk doen
dormio (dormire) = slapen
postquam = nadat
intro (intrare) = binnengaan
ibi = daar
territus, territa, territum = verschrikt
clamor, clamorem = geschreeuw, lawaai
propero (properare) = zich haasten
`},
{ id: "8B", chapter: 8, kind: "tekst", words: `
caput [onz.] = hoofd
intellego, intellexi (intellegĕre) = begrijpen
video, vidi (vidēre) = zien
flamma = vlam
noster, nostra, nostrum = onze, (van) ons
servus = slaaf
totus, tota, totum = (ge)hele
appareo, apparui (apparēre) = verschijnen
convoco (convocare) = bijeenroepen
eos [acc. mnl. mv.] = hen | deze(n), die
cum = toen, wanneer
veto, vetui (vetare) = verbieden
cur = waarom
inquit = zegt (hij) | zei (hij)
maximus, maxima, maximum = grootste, zeer groot
insignis, insigne = opvallend, bijzonder, bekend
dico, dixi (dicĕre) = zeggen
ut = (zo)als
ipse, ipsa, ipsum = zelf
ardeo, arsi (ardēre) = branden, in brand staan
cognosco, cognovi (cognoscĕre) = leren kennen, vernemen, {perf.: vaak} kennen
amitto, amisi (amittĕre) = verliezen
accipio, accepi (accipĕre) = ontvangen, verkrijgen | vernemen
curro, cucurri (currĕre) = rennen
capio, cepi (capĕre) = pakken, nemen
convenio, conveni (convenire) = samenkomen
`},
{ id: "8C", chapter: 8, kind: "tekst", words: `
posco, poposci (poscĕre) = eisen, vragen
fero, tuli (ferre) = dragen, brengen | verdragen
mulier, mulierem = vrouw, echtgenote
liber, mv. libri = boek
pretium = prijs
rursus = weer, terug
puto (putare) = menen | {+ 2 acc.} vinden, beschouwen als
quaero, quaesivi (quaerĕre) = zoeken | vragen
nimius, nimia, nimium = te veel, te groot
venio, veni (venire) = komen
tandem = tenslotte, (uit)eindelijk
rideo, risi (ridēre) = lachen
divinus, divina, divinum = goddelijk
pono, posui (ponĕre) = plaatsen, neerleggen
impono, imposui (imponĕre) = plaatsen op, leggen op
idem = dezelfde, hetzelfde
reliquus, reliqua, reliquum = overig
tres = drie
emo, emi (emĕre) = kopen
magis [bijw.] = meer
alius, alia, aliud = ander
paratus, parata, paratum = voorbereid, gereed | bereid
incendo, incendi (incendĕre) = in brand steken
eam [acc. vrl. ev.] = haar | deze, die
nusquam = nergens
peto, peti(v)i (petĕre) = vragen | streven naar
`},
{ id: "8P", chapter: 8, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
dixi = zeggen ~ dico (dicĕre)
intellexi = begrijpen ~ intellego (intellegĕre)
cucurri = rennen ~ curro (currĕre)
vidi = zien ~ video (vidēre)
veni = komen ~ venio (venire)
cepi = pakken, nemen ~ capio (capĕre)
poposci = eisen, vragen ~ posco (poscĕre)
risi = lachen ~ rideo (ridēre)
conveni = samenkomen ~ convenio (convenire)
emi = kopen ~ emo (emĕre)
posui = plaatsen, neerleggen ~ pono (ponĕre)
vetui = verbieden ~ veto (vetare)
imposui = plaatsen op, leggen op ~ impono (imponĕre)
amisi = verliezen ~ amitto (amittĕre)
apparui = verschijnen ~ appareo (apparēre)
arsi = branden ~ ardeo (ardēre)
cognovi = leren kennen, vernemen, {perf.: vaak} kennen ~ cognosco (cognoscĕre)
peti(v)i = vragen | streven naar ~ peto (petĕre)
tuli = dragen, brengen | verdragen ~ fero (ferre)
incendi = in brand steken ~ incendo (incendĕre)
quaesivi = zoeken | vragen ~ quaero (quaerĕre)
`},
{ id: "8H", chapter: 8, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
autem = maar, echter
iam = al, reeds
perdo (perdĕre) = te gronde richten | verliezen
itaque = daarom
quia = omdat
expugno (expugnare) = veroveren
iuvenis, iuvenem = jongeman
postea [bijw.] = daarna, later
talis, tale = zo'n, zodanig(e), zulk(e)
spero (sperare) = hopen
pars, partem = deel
atque = en
clades, cladem = nederlaag
prope = bijna | {+ acc.} dichtbij
`},
{ id: "9A", chapter: 9, kind: "tekst", words: `
exclamo (exclamare) = uitroepen, uitschreeuwen
alter, altera, alterum = de één, de ander {van twee}
consul, consulis = consul {hoogste ambtenaar in Rome}
unus, una, unum = één
corpus, corporis [onz.] = lichaam
fugio, fugi (fugĕre) = vluchten
spes, acc. spem = hoop, verwachting
ubique = overal
salus, salutis [vrl.] = redding, behoud, gezondheid
impetus = aanval
murus = muur
defendo, defendi (defendĕre) = verdedigen, beschermen
pons, pontis [mnl.] = brug
custodio (custodire) = bewaken, passen op
erant = (zij) waren
arma, armorum [onz. mv.] = wapens
fortuna = lot | geluk | ongeluk
dies, acc. diem [mnl./vrl.] = dag
nox, noctis [vrl.] = nacht
sto, steti (stare) = staan
mons, montis [mnl.] = berg
fuit = (hij) is geweest, (hij) was {perf. van esse}
fuerunt = (zij) zijn geweest, (zij) waren {perf. van esse}
coepi [perf.] = beginnen
`},
{ id: "9B", chapter: 9, kind: "tekst", words: `
singuli [mv.] = één voor één
statua = standbeeld
comprehendo, comprehendi (comprehendĕre) = vastpakken
-que = en {staat altijd direct achter het woord}
consisto, constiti (consistĕre) = gaan staan, blijven staan
timor, timoris [mnl.] = angst
relinquo, reliqui (relinquĕre) = verlaten, achterlaten
erit = (hij) zal zijn
cupidus, cupida, cupidum [+ gen.] = begerig naar
acer, acris = scherp, fel, hevig
adiuvo, adiuvi (adiuvare) = helpen
necesse est = het is noodzakelijk
libertas, libertatis [vrl.] = vrijheid
simul = tegelijkertijd
eorum [gen. mnl./onz.] = van hen, hun, ervan
plenus, plena, plenum [+ gen.] = vol van
virtus, virtutis [vrl.] = deugd, goede eigenschap | moed
interea = ondertussen
armatus, armata, armatum = gewapend
possum, potui (posse) = kunnen
obsideo, obsedi (obsidēre) = bezetten, belegeren
civis, civis = burger
ignarus, ignara, ignarum [+ gen.] = onkundig van, onwetend, onbekend met
`},
{ id: "9P", chapter: 9, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
comprehendi = vastpakken ~ comprehendo (comprehendĕre)
adiuvi = helpen ~ adiuvo (adiuvare)
fugi = vluchten ~ fugio (fugĕre)
constiti = gaan staan, blijven staan ~ consisto (consistĕre)
coepi = beginnen ~ –
reliqui = verlaten, achterlaten ~ relinquo (relinquĕre)
defendi = verdedigen, beschermen ~ defendo (defendĕre)
steti = staan ~ sto (stare)
obsedi = bezetten, belegeren ~ obsideo (obsidēre)
potui = kunnen ~ possum (posse)
`},
{ id: "9H", chapter: 9, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
iterum = weer, opnieuw
-ne = …? {leidt een vraagzin in; niet vertalen}
malum = ramp
gero, gessi (gerĕre) = dragen | (oorlog) voeren
pario, peperi (parĕre) = voortbrengen
at = maar
denique = tenslotte
opprimo, oppressi (opprimĕre) = neerdrukken | overweldigen, overvallen
praeterea = bovendien
interficio, interfeci (interficĕre) = doden
statim = meteen
curro, cucurri (currĕre) = rennen
`},
{ id: "10A", chapter: 10, kind: "tekst", words: `
facio, feci (facĕre) = maken | doen
turba = menigte
do, dedi (dare) = geven
minus [bijw.] = minder
castra, castrorum [onz. mv.] = legerkamp
ideo = daarom
in castris = in het legerkamp
adsum, adfui (adesse) = aanwezig zijn | helpen
occido, occidi (occidĕre) = doden
via = weg
ut = (zo)als | zodra (als)
effugio, effugi (effugĕre) = ontvluchten, ontkomen
voco (vocare) = roepen, noemen
sedeo, sedi (sedēre) = zitten
erro (errare) = rondzwerven, dwalen | zich vergissen
quam = dan {na vergrotende trap}
caedes, caedis [vrl.] = moord, slachting
volo, volui (velle) = willen
`},
{ id: "10B", chapter: 10, kind: "tekst", words: `
mitto, misi (mittĕre) = sturen, zenden
iubeo, iussi (iubēre) = bevelen
addo, addidi (addĕre) = toevoegen
nihil = niets
nec = en niet, ook niet
longus, longa, longum = lang
id = het | dit
ordo, ordinis [mnl.] = rij
manus [vrl.] = hand
caveo, cavi (cavēre) [+ acc.] = op zijn hoede zijn voor, oppassen voor
accendo, accendi (accendĕre) = in brand steken, aansteken
dolor, doloris [mnl.] = pijn, verdriet
dimitto, dimisi (dimittĕre) = wegsturen, laten gaan
respondeo, respondi (respondēre) = antwoorden
moveo, movi (movēre) = bewegen, verplaatsen | indruk maken op, ontroeren
Romam = naar Rome {bij werkwoorden van ‘gaan’}
beneficium = weldaad
insidiae [mv.] = hinderlaag
tuus, tua, tuum = jouw
moneo, monui (monēre) = waarschuwen
perdo, perdidi (perdĕre) = te gronde richten | verliezen
dexter, dextra, dextrum = rechts, rechter-
paulo post = korte tijd later
me [acc.] = mij
`},
{ id: "10C", chapter: 10, kind: "tekst", words: `
eligo, elegi (eligĕre) = uitkiezen
virgo, virginis = meisje, maagd
libero (liberare) = bevrijden
nuntius = bode | bericht
constituo, constitui (constituĕre) = stellen, plaatsen | vaststellen, besluiten
duco, duxi (ducĕre) = leiden, brengen
ripa = oever
rumpo, rupi (rumpĕre) = breken, verbreken
eas [acc. vrl. mv.] = hen | deze, die
telum = werptuig, {mv.} wapens
non solum … sed etiam = niet alleen … maar ook
fuga = vlucht | verbanning
tamen = toch
flumen, fluminis [onz.] = rivier
pervenio, perveni (pervenire) = (aan)komen, bereiken
foedus, foederis [onz.] = verdrag, verbond
remitto, remisi (remittĕre) = terugsturen | loslaten
iniuria = onrecht
educo, eduxi (educĕre) = naar buiten leiden, wegleiden
promitto, promisi (promittĕre) = beloven
maxime [bijw.] = het meest, vooral
reddo, reddidi (reddĕre) = teruggeven
custos, custodis [mnl.] = bewaker
`},
{ id: "10P", chapter: 10, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
feci = maken | doen ~ facio (facĕre)
dedi = geven ~ do (dare)
sedi = zitten ~ sedeo (sedēre)
constitui = stellen, plaatsen | vaststellen, besluiten ~ constituo (constituĕre)
dimisi = wegsturen, laten gaan ~ dimitto (dimittĕre)
remisi = terugsturen | loslaten ~ remitto (remittĕre)
perveni = (aan)komen, bereiken ~ pervenio (pervenire)
addidi = toevoegen ~ addo (addĕre)
promisi = beloven ~ promitto (promittĕre)
elegi = uitkiezen ~ eligo (eligĕre)
iussi = bevelen ~ iubeo (iubēre)
eduxi = naar buiten leiden, wegleiden ~ educo (educĕre)
misi = sturen, zenden ~ mitto (mittĕre)
effugi = ontvluchten, ontkomen ~ effugio (effugĕre)
rupi = breken, verbreken ~ rumpo (rumpĕre)
duxi = leiden, brengen ~ duco (ducĕre)
respondi = antwoorden ~ respondeo (respondēre)
reddidi = teruggeven ~ reddo (reddĕre)
cavi = op zijn hoede zijn voor, oppassen voor ~ caveo (cavēre) + acc.
accendi = in brand steken, aansteken ~ accendo (accendĕre)
occidi = doden ~ occido (occidĕre)
movi = bewegen, verplaatsen | indruk maken op, ontroeren ~ moveo (movēre)
perdidi = te gronde richten | verliezen ~ perdo (perdĕre)
monui = waarschuwen ~ moneo (monēre)
volui = willen ~ volo (velle)
adfui = aanwezig zijn | helpen ~ adsum (adesse)
`},
{ id: "10H", chapter: 10, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
olim = ooit, eens, vroeger
excito (excitare) = (op)wekken | opjagen
soleo (solēre) = de gewoonte hebben, gewoonlijk doen
ut = zoals
veto, vetui (vetare) = verbieden
postquam = nadat
eos = hen | deze(n), die
ardeo, arsi (ardēre) = branden, in brand staan
insignis, insigne = opvallend, bijzonder, bekend
nusquam = nergens
liber, mv. libri = boek
nimius, nimia, nimium = te veel, te groot
pretium = prijs
quaero, quaesivi (quaerĕre) = zoeken | vragen
peto, peti(v)i (petĕre) = vragen | streven naar
tandem = eindelijk
rursus = weer, terug
`},
{ id: "11A", chapter: 11, kind: "tekst", words: `
scio (scire) = weten
licet [+ dat.] = het is toegestaan, het is mogelijk
iudex, iudicis = rechter
domum [acc.] = naar (het) huis {bij ww. van gaan}
suus, sua, suum = zijn (eigen), haar (eigen), hun (eigen)
mihi [dat.] = (aan) mij
taceo, tacui (tacēre) = zwijgen
iudicium = proces, vonnis, oordeel
natus, nata, natum = geboren
quidem … sed = weliswaar … maar
placeo, placui (placēre) [+ dat.] = bevallen, in de smaak vallen
exspecto (exspectare) = (af)wachten, verwachten
liber, libera, liberum = vrij
omnia [onz. mv.] = alles
aspicio, aspexi (aspicĕre) = kijken naar, aanschouwen
concedo, concessi (concedĕre) = toegeven, toestaan, zwichten
si = als
igitur = daarom, dus
narro (narrare) = vertellen
tibi [dat.] = (aan) jou
absum, afui (abesse) = afwezig zijn
adventus = (aan)komst
serva = slavin
ei [dat.] = (aan) hem, (aan) haar, eraan
`},
{ id: "11B", chapter: 11, kind: "tekst", words: `
pectus, pectoris [onz.] = borst
nuntio (nuntiare) = berichten, melden
ignosco, ignovi (ignoscĕre) [+ dat.] = vergeven
lux, lucis [vrl.] = licht
sermo, sermonis [mnl.] = gesprek
multitudo, multitudinis [vrl.] = menigte
procedo, processi (procedĕre) = voortgaan, naar voren lopen
ultimus, ultima, ultimum = laatste
accido, accidi (accidĕre) = gebeuren | {+ dat.} overkomen (aan)
propinquus, propinqua, propinquum = vlakbij gelegen
hoc modo = op deze manier
Forum, forum = markt(plein), Forum {in Rome}
tantum [bijw.] = alleen maar, slechts
sanguis, sanguinis [mnl.] = bloed
advenio, adveni (advenire) = (aan)komen, bereiken
terreo, terrui (terrēre) = bang maken
timeo, timui (timēre) = bang zijn voor, vrezen
debeo, debui (debēre) = moeten
iaceo, iacui (iacēre) = liggen
`},
{ id: "11P", chapter: 11, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
accidi = gebeuren ~ accido (accidĕre)
processi = voortgaan, naar voren lopen ~ procedo (procedĕre)
afui = afwezig zijn ~ absum (abesse)
iacui = liggen ~ iaceo (iacēre)
aspexi = kijken naar, aanschouwen ~ aspicio (aspicĕre)
ignovi = vergeven ~ ignosco (ignoscĕre) + dat.
concessi = toegeven, toestaan, zwichten ~ concedo (concedĕre)
placui = bevallen, in de smaak vallen ~ placeo (placēre) + dat.
adveni = (aan)komen, bereiken ~ advenio (advenire)
debui = moeten ~ debeo (debēre)
tacui = zwijgen ~ taceo (tacēre)
timui = bang zijn voor, vrezen ~ timeo (timēre)
terrui = bang maken ~ terreo (terrēre)
`},
{ id: "11H", chapter: 11, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
-que = en {staat altijd direct achter het woord}
virtus, virtutis [vrl.] = deugd, goede eigenschap | moed
ubique = overal
acer, acris = scherp, fel, hevig
salus, salutis [vrl.] = redding, behoud, gezondheid
singuli [mv.] = één voor één
spes, acc. spem = hoop, verwachting
ignarus [+ gen.] = onkundig van, onwetend, onbekend met
corpus, corporis [onz.] = lichaam
impetus = aanval
civis, civis = burger
arma, armorum [onz. mv.] = wapens
`},
{ id: "12A", chapter: 12, kind: "tekst", words: `
animus = geest
campus = veld, vlakte
in [+ acc.] = naar, naar binnen
non modo … sed etiam = niet alleen … maar ook
munus, muneris [onz.] = taak | geschenk
in [+ abl.] = in, op, bij
scelus, sceleris [onz.] = misdaad
porta = poort
ludus = spel
cum [+ abl.] = (samen) met
ager, agri = akker, land
in animo habeo (habēre) = van plan zijn
potestas, potestatis [vrl.] = macht | mogelijkheid, gelegenheid
toga = toga
a(b) [+ abl.] = weg van, van(af) | door (toedoen van)
imperator, imperatoris = opperbevelhebber
perduco, perduxi (perducĕre) = brengen tot/naar
ex, e [+ abl.] = uit, van(uit), vanaf
nobis [dat./abl.] = ons
tergum = rug
expello, expuli (expellĕre) = verdrijven
civitas, civitatis [vrl.] = staat, burgerij
ago, egi (agĕre) = voeren, drijven | doen, verrichten | (be)handelen
trado, tradidi (tradĕre) = overgeven, uitleveren, overleveren
`},
{ id: "12B", chapter: 12, kind: "tekst", words: `
matrona = (getrouwde) vrouw
habeo, habui (habēre) = hebben | houden
de [+ abl.] = over | wegens
silentium = stilte
fingo, finxi (fingĕre) = vormen | verzinnen
res, acc. rem, abl. re [vrl.] = zaak, ding
vox, vocis [vrl.] = stem | woord
senator, senatoris = senator {lid van de senaat}
duo, duae, duo, dat./abl. duobus = twee
excedo, excessi (excedĕre) = uitgaan, weggaan
postero die [abl.] = (op) de volgende dag
inter se = (onder) elkaar, onderling
res publica = staat
sine [+ abl.] = zonder
domo = van/uit huis
utrum … an = (of) … of
senatus = senaat
fides = trouw | vertrouwen
dolus = list, bedrog
praeter [+ acc.] = behalve
medium = het midden
perfero, pertuli (perferre) = overbrengen | verdragen
ex eis = van hen
ullus, ulla, ullum = enig(e)
ingenium = karakter, doen en laten | aanleg, talent
non iam = niet meer, niet langer
adulescens, adulescentis [mnl.] = jongeman
patres, patrum = vaders | senatoren
hoc [nom./acc. onz. ev.] = dit
vivo, vixi (vivĕre) = leven
iacio, ieci (iacĕre) = gooien
cupio, cupivi (cupĕre) = verlangen
incipio, incepi/coepi (incipĕre) = beginnen
`},
{ id: "12P", chapter: 12, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
perduxi = brengen tot/naar ~ perduco (perducĕre)
tradidi = overgeven, uitleveren, overleveren ~ trado (tradĕre)
vixi = leven ~ vivo (vivĕre)
finxi = vormen | verzinnen ~ fingo (fingĕre)
expuli = verdrijven ~ expello (expellĕre)
egi = voeren, drijven | doen, verrichten | (be)handelen ~ ago (agĕre)
ieci = gooien ~ iacio (iacĕre)
pertuli = overbrengen | verdragen ~ perfero (perferre)
incepi = beginnen ~ incipio (incipĕre)
excessi = uitgaan, weggaan ~ excedo (excedĕre)
habui = hebben | houden ~ habeo (habēre)
`},
{ id: "12H", chapter: 12, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
turba = menigte
foedus, foederis [onz.] = verdrag, verbond
moneo, monui (monēre) = waarschuwen
insidiae [mv.] = hinderlaag
tamen = toch
adsum, adfui (adesse) = aanwezig zijn | helpen
addo, addidi (addĕre) = toevoegen
ideo = daarom
caedes, caedis [vrl.] = moord, slachting
ut = (zo)als | zodra (als)
remitto, remisi (remittĕre) = terugsturen | loslaten
beneficium = weldaad
caveo, cavi (cavēre) [+ acc.] = op zijn hoede zijn voor, oppassen voor
nuntius = bode | bericht
reddo, reddidi (reddĕre) = teruggeven
telum = werptuig, {mv.} wapens
`},
{ id: "13A", chapter: 13, kind: "tekst", words: `
praeda = buit
nullus, nulla, nullum = geen (enkel)
nonnulli [mv.] = sommige(n)
sedes, sedis [vrl.] = (zit)plaats | woonplaats
malo, malui (malle) = liever willen
domi = thuis
quamquam = hoewel
dignus [+ abl.] = waard, waardig
cerno, crevi (cernĕre) = zien
senex, senis = oude man
similis, simile [+ gen./dat.] = gelijk aan | gelijkend op
vis, acc. vim, abl. vi [vrl.] = kracht, geweld
metuo, metui (metuĕre) = vrezen
invenio, inveni (invenire) = vinden, aantreffen
nolo, nolui (nolle) = niet willen
quidam = een zekere
cogo, coëgi (cogĕre) = dwingen | bijeenbrengen
specto (spectare) = kijken naar, zien
propter [+ acc.] = vanwege, door
tango, tetigi (tangĕre) = aanraken
egregius, egregia, egregium = uitstekend, voortreffelijk
dum = terwijl
deicio, deieci (deicĕre) = naar beneden werpen, laten vallen
ferox, ferocis = strijdlustig | woest, fel
teneo, tenui (tenēre) = (vast) houden
tremo, tremui (tremĕre) = trillen, beven
ceteri [mv.] = overige(n)
fames, famis [vrl.] = honger
saxum = steen, rots
affero, attuli (afferre) = (mee) brengen, ergens heen brengen
canis, canis = hond
gladius = zwaard
patria = vaderland
appello (appellare) = toespreken | noemen
despero (desperare) [+ acc.] = wanhopen (aan)
sacer, sacra, sacrum = heilig | {+ gen.} gewijd aan
`},
{ id: "13B", chapter: 13, kind: "tekst", words: `
mille = duizend
strepitus = lawaai
tempto (temptare) = proberen
ingens, ingentis = geweldig, enorm
ira = woede
brevis, breve = kort
quod = omdat
priusquam = voordat
nocte [abl.] = 's nachts
auxilium = hulp
peto, peti(v)i (petĕre) a(b) [+ abl.] = vragen aan
ne … quidem = zelfs niet
sentio, sensi (sentire) = voelen, bemerken
`},
{ id: "13P", chapter: 13, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
peti(v)i = vragen | streven naar ~ peto (petĕre)
tetigi = aanraken ~ tango (tangĕre)
deieci = neerwerpen, laten vallen ~ deicio (deicĕre)
crevi = onderscheiden, zien ~ cerno (cernĕre)
nolui = niet willen ~ nolo (nolle)
tremui = trillen, beven ~ tremo (tremĕre)
tenui = (vast)houden ~ teneo (tenēre)
coëgi = dwingen | bijeenbrengen ~ cogo (cogĕre)
sensi = voelen, bemerken ~ sentio (sentire)
malui = liever willen ~ malo (malle)
metui = vrezen ~ metuo (metuĕre)
inveni = vinden, aantreffen ~ invenio (invenire)
attuli = (mee)brengen, ergens heen brengen ~ affero (afferre)
`},
{ id: "13H", chapter: 13, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
ignosco, ignovi (ignoscĕre) = vergeven
sanguis, sanguinis [mnl.] = bloed
scio (scire) = weten
tantum [bijw.] = alleen maar, slechts
concedo, concessi (concedĕre) = toegeven, toestaan, zwichten
igitur = dus, daarom
propinquus = vlakbij gelegen
licet [+ dat.] = het is toegestaan, het is mogelijk
liber, libera, liberum = vrij
iudicium = proces, vonnis, oordeel
quidem … sed = weliswaar … maar
sermo, sermonis [mnl.] = gesprek
`},
{ id: "14A", chapter: 14, kind: "tekst", words: `
mox = weldra, snel daarna
posterus, postera, posterum = volgend
diu = lange tijd
fama = gerucht | reputatie
vacuus, vacua, vacuum = leeg
annus = jaar
infero, intuli (inferre) = brengen naar | veroorzaken, aandoen
primo [bijw.] = eerst
magnitudo, magnitudinis [vrl.] = grootte, omvang
lingua = tong | taal
pietas, pietatis [vrl.] = plichtsgevoel, liefde, trouw
se = {in A.c.I.} hij, zij (ev.), zij (mv.) | zich
iit [perf.] = (hij) is gegaan, (hij) ging
ostendo, ostendi (ostendĕre) = tonen, laten zien
it [praes.] = (hij) gaat
`},
{ id: "14B", chapter: 14, kind: "tekst", words: `
detraho, detraxi (detrahĕre) = ervan afrukken, wegnemen
terra = aarde, grond, land
nudus, nuda, nudum = naakt
collum = nek
tollo, sustuli (tollĕre) = optillen, opheffen | wegnemen
`},
{ id: "14C", chapter: 14, kind: "tekst", words: `
ferme [bijw.] = ongeveer
venenum = vergif, gif(drank)
quaedam [vrl.] = een zekere
haec [nom./acc. onz. mv.] = deze
refero, rettuli (referre) = terugbrengen | berichten, rapporteren
confirmo (confirmare) = bevestigen, verzekeren
auctor, auctoris = ontwerper | schrijver, zegsman
deprehendo, deprehendi (deprehendĕre) = grijpen, betrappen
nisi = als niet, tenzij | behalve
fere [bijw.] = bijna, ongeveer
deduco, deduxi (deducĕre) = (naar beneden) leiden, wegleiden
damno (damnare) = veroordelen
viginti [onverbuigbaar] = twintig
publicus, publica, publicum = openbaar, algemeen
ac = en
herba = gras, kruid
gero, gessi (gerĕre) = dragen
pario, peperi (parĕre) = baren, voortbrengen
opprimo, oppressi (opprimĕre) = onderdrukken
`},
{ id: "14P", chapter: 14, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
oppressi = onderdrukken ~ opprimo (opprimĕre)
sustuli = optillen, opheffen | wegnemen ~ tollo (tollĕre)
detraxi = ervan afrukken, wegnemen ~ detraho (detrahĕre)
gessi = dragen ~ gero (gerĕre)
intuli = brengen naar | veroorzaken, aandoen ~ infero (inferre)
rettuli = terugbrengen | berichten, rapporteren ~ refero (referre)
deprehendi = grijpen, betrappen ~ deprehendo (deprehendĕre)
ostendi = tonen, laten zien ~ ostendo (ostendĕre)
deduxi = (naar beneden) leiden, wegleiden ~ deduco (deducĕre)
peperi = voortbrengen ~ pario (parĕre)
`},
{ id: "14H", chapter: 14, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
hoc [nom./acc. onz. ev.] = dit
nobis [dat./abl.] = ons
a(b) [+ abl.] = weg van, van(af) | door (toedoen van)
scelus, sceleris [onz.] = misdaad
ingenium = karakter, doen en laten | aanleg, talent
ullus, ulla, ullum = enig
fingo, finxi (fingĕre) = vormen | verzinnen
dolus = list
praeter [+ acc.] = behalve
res publica = staat
munus, muneris [onz.] = taak | geschenk
non iam = niet meer, niet langer
tergum = rug
`},
{ id: "15A", chapter: 15, kind: "tekst", words: `
iuro (iurare) = zweren
adduco, adduxi (adducĕre) = brengen naar/in
exercitus = leger
vita = leven
induco, induxi (inducĕre) = brengen naar | brengen tot, verleiden tot
ara = altaar
insula = eiland
cum [+ conj.] = toen, nadat | omdat | hoewel
tunc [bijw.] = toen, dan
aetas, aetatis [vrl.] = leeftijd, leven, tijd
cum [+ ind.] = wanneer | toen
ut [+ conj.] = (op)dat, om te | (zo)dat
fraus, fraudis [vrl.] = bedrog
sub [+ abl.] = onder
numquam = nooit
amicitia = vriendschap
imperium = macht | rijk
ut [+ ind.] = (zo)als | zodra (als)
`},
{ id: "15B", chapter: 15, kind: "tekst", words: `
inde = daarvandaan | daarna
agmen, agminis [onz.] = stoet, kolonne
maneo, mansi (manēre) = blijven, wachten (op)
moenia, moeniorum [onz. mv.] = (stads)muren
fatigatus, fatigata, fatigatum = vermoeid
angustus, angusta, angustum = nauw, eng | beperkt
terror, terroris [mnl.] = angst
ne [+ conj.] = (op)dat niet, om niet te, om te voorkomen dat
multo [bijw.] = veel
incedo, incessi (incedĕre) = voortgaan | binnengaan
ferrum = ijzer | zwaard
fundo, fudi (fundĕre) = gieten
aegre [bijw.] = met moeite
iter, itineris [onz.] = weg | reis, mars
tam = zo
cado, cecidi (cadĕre) = vallen
arbor, arboris [vrl.] = boom
lignum = hout
infundo, infudi (infundĕre) [+ acc.] = gieten op/in
descendo, descendi (descendĕre) = afdalen
praeceps, praecipitis = hals over kop, snel | steil
caedo, cecidi (caedĕre) = vellen, doden
`},
{ id: "15P", chapter: 15, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
mansi = blijven, wachten op ~ maneo (manēre)
cecidi = vallen ~ cado (cadĕre)
fudi = gieten ~ fundo (fundĕre)
induxi = brengen naar | brengen tot, verleiden tot ~ induco (inducĕre)
cecidi = vellen, doden ~ caedo (caedĕre)
adduxi = brengen naar/in ~ adduco (adducĕre)
incessi = voortgaan | binnengaan ~ incedo (incedĕre)
descendi = afdalen ~ descendo (descendĕre)
infudi = gieten op/in ~ infundo (infundĕre) + acc.
`},
{ id: "15H", chapter: 15, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
quidam = een zekere
propter [+ acc.] = vanwege, door
quod = omdat
vis, acc. vim, abl. vi = kracht, geweld
quamquam = hoewel
nonnulli [mv.] = sommige(n)
ne … quidem = zelfs … niet
dum = terwijl
egregius, egregia, egregium = uitstekend, voortreffelijk
ferox = strijdlustig | woest, fel
ira = woede
strepitus = lawaai
peto, peti(v)i (petĕre) a(b) [+ abl.] = vragen aan
fames, famis [vrl.] = honger
`},
{ id: "16A", chapter: 16, kind: "tekst", words: `
ille, illa, illud = die/dat, deze/dit | hij, zij, het
aut = of
hic, haec, hoc = deze/dit
conspectus = (aan)blik, (uit)zicht
curia = senaatsgebouw
supersum, superfui (superesse) = over zijn, overblijven
pauci [mv.] = weinige(n), enkele(n)
interrogo (interrogare) = ondervragen
haud = (helemaal) niet
vinco, vici (vincĕre) = overwinnen, overtreffen
copia = voorraad, overvloed
gaudeo (gaudēre) = blij zijn | {+ abl.} zich verheugen over
rumor, rumoris [mnl.] = gerucht, gepraat
quisque = ieder
captivus = {zelfst. nw.} krijgsgevangene | {bijv. nw.} gevangen
copiae [mv.] = legermacht
gaudium = vreugde
ipse, ipsa, ipsum = zelf | juist, precies
et … et = en … en, zowel … als
iste, ista, istud = die/dat
doleo, dolui (dolēre) = pijn/verdriet hebben, treuren (om)
`},
{ id: "16B", chapter: 16, kind: "tekst", words: `
tumultus = rumoer, oproer
occasio, occasionis [vrl.] = gelegenheid
turbo (turbare) = in verwarring brengen, verwarren
opus, operis [onz.] = werk
accido, accidi (accidĕre) = gebeuren
scribo, scripsi (scribĕre) = schrijven
intentus, intenta, intentum = (in)gespannen, in gespannen verwachting, oplettend
doctus, docta, doctum = geleerd
studium = ijver | studie
bona, bonorum [onz. mv.] = goederen, bezittingen
factum = feit | daad
parco, peperci (parcĕre) [+ dat.] = sparen
quaero, quaesivi (quaerĕre) [+ ab/ex + abl.] = vragen aan
victoria = overwinning
`},
{ id: "16C", chapter: 16, kind: "tekst", words: `
libero (liberare) ab [+ abl.] = bevrijden van
septem [onverbuigbaar] = zeven
interficio, interfeci (interficĕre) = doden
legatus = gezant | onderbevelhebber
impedio (impedire) = verhinderen
plurimi [mv.] = de meeste(n), zeer vele(n)
ne [+ conj.] = (op)dat niet, om niet te, om te voorkomen dat | dat, om te {na werkwoorden van vrezen en verhinderen}
impero (imperare) [+ dat.] = bevelen
circum [soms + acc.] = rondom
sibi [dat.] = aan hem/haar/hen {dat. van se}
undique = van alle kanten
ius, iuris [onz.] = recht
aedificium = gebouw
exitus = uitgang | afloop, einde
cura = zorg
quoniam = aangezien, omdat
`},
{ id: "16P", chapter: 16, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
impedivi = verhinderen ~ impedio (impedire)
quaesivi = vragen aan ~ quaero (quaerĕre) + ab/ex + abl.
scripsi = schrijven ~ scribo (scribĕre)
interfeci = doden ~ interficio (interficĕre)
superfui = over zijn, overblijven ~ supersum (superesse)
vici = overwinnen, overtreffen ~ vinco (vincĕre)
peperci = sparen ~ parco (parcĕre) + dat.
accidi = gebeuren ~ accido (accidĕre)
`},
{ id: "16H", chapter: 16, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
refero, rettuli (referre) = terugbrengen | berichten, rapporteren
damno (damnare) = veroordelen
mox = weldra, snel daarna
collum = nek
fere = bijna, ongeveer
quaedam [vrl.] = een zekere
ferme [bijw.] = bijna, ongeveer
tollo, sustuli (tollĕre) = optillen, opheffen | wegnemen
nisi = als niet, tenzij | behalve
auctor, auctoris = ontwerper | schrijver, zegsman
infero, intuli (inferre) = brengen naar | veroorzaken, aandoen
diu = lange tijd
pietas, pietatis [vrl.] = plichtsgevoel, liefde, trouw
`},
{ id: "17A", chapter: 17, kind: "tekst", words: `
quondam = eens
idem, eadem, idem = dezelfde, hetzelfde
doceo, docui (docēre) = onderwijzen, leren
is, ea, id = hij, zij, het | deze/dit; die/dat
mos, moris [mnl.] = gewoonte, gebruik
praebeo, praebui (praebēre) = verschaffen, aanbieden
fatum = (nood)lot
amica = vriendin
dum [+ conj.] = totdat
mores [mv.] = karakter, levenswijze, gedrag
constat [+ A.c.I.] = het staat vast dat
felix, felicis = gelukkig, gezegend | voorspoedig
liberi, liberorum [mv.] = kinderen
modus = wijze, manier
exemplum = voorbeeld
postremo [bijw.] = tenslotte
dum [+ ind.] = terwijl
carus, cara, carum = dierbaar, geliefd
`},
{ id: "17B", chapter: 17, kind: "tekst", words: `
pro [+ abl.] = voor, ter verdediging van | in plaats van, in ruil voor
somnium = droom
pereo, perii (perire) = omkomen, te gronde gaan
plebs, plebem [vrl.] = volk
adeo, adii (adire) = gaan naar, komen naar
socius = bondgenoot | makker
dubito (dubitare) = aarzelen
intereo, interii (interire) = sterven
sui [mv.] = de zijnen (hunnen), zijn (hun) verwanten, zijn (hun) aanhangers
occupo (occupare) = bezetten, in bezit nemen
inimicus = {bijv. nw.} vijandig | {zelfst. nw.} vijand
eo, ii (ire) = gaan, komen
prius [bijw.] = eerder, vroeger, eerst | liever
`},
{ id: "17P", chapter: 17, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
ii = gaan, komen ~ eo (ire)
perii = omkomen ~ pereo (perire)
docui = onderwijzen, leren ~ doceo (docēre)
interii = sterven ~ intereo (interire)
adii = gaan naar, komen naar ~ adeo (adire)
praebui = verschaffen, aanbieden ~ praebeo (praebēre)
`},
{ id: "17H", chapter: 17, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
caedo, cecidi (caedĕre) = vellen, doden
iter, itineris [onz.] = weg | reis, mars
aetas, aetatis [vrl.] = leeftijd, leven, tijd
iuro (iurare) = zweren
aegre [bijw.] = met moeite
agmen, agminis [onz.] = stoet, kolonne
insula = eiland
numquam = nooit
praeceps, praecipitis = halsoverkop, snel | steil
tam = zo
fundo, fudi (fundĕre) = gieten
cado, cecidi (cadĕre) = vallen
`},
{ id: "18A", chapter: 18, kind: "tekst", words: `
deleo (delēre) = vernietigen, verwoesten
villa = landhuis
regio, regionis [vrl.] = streek, gebied
premo, pressi (premĕre) = drukken | in moeilijkheden brengen, in het nauw brengen
rapio, rapui (rapĕre) = grijpen, roven, meesleuren
exeo, exii (exire) = uitgaan, weggaan
quattuor [onverbuigbaar] = vier
equus = paard
qui, quae, quod [betr. voornw.] = die/dat, wie/wat
hinc = van hier, hiervandaan
`},
{ id: "18B", chapter: 18, kind: "tekst", words: `
solus, solius = alleen, (als) enige
decet = het past
invado, invasi (invadĕre) = binnenvallen, aanvallen
notus, nota, notum = bekend
unus, unius = één, (als) enige, alleen
restituo, restitui (restituĕre) = herstellen
navis, navis [vrl.] = schip
summus, summa, summum = grootste, hoogste
totus, totius = (ge)hele
`},
{ id: "18P", chapter: 18, kind: "perfecta", title: "Herhaling onregelmatige perfecta", words: `
invasi = binnenvallen, aanvallen ~ invado (invadĕre)
exii = uitgaan, weggaan ~ exeo (exire)
restitui = herstellen ~ restituo (restituĕre)
pressi = drukken | in moeilijkheden brengen, in het nauw brengen ~ premo (premĕre)
rapui = grijpen, roven, meesleuren ~ rapio (rapĕre)
`},
{ id: "18H", chapter: 18, kind: "herhaling", title: "Herhaling moeilijke woorden", words: `
quaero, quaesivi (quaerĕre) [+ ab/ex + abl.] = vragen aan
undique = van alle kanten
opus, operis [onz.] = werk
copia = voorraad, overvloed
copiae [mv.] = legermacht
sibi [dat.] = aan hem/haar/hen {dat. van se}
haud = (helemaal) niet
parco, peperci (parcĕre) [+ dat.] = sparen
quoniam = aangezien, omdat
gaudeo (gaudēre) = blij zijn | {+ abl.} zich verheugen over
quisque = ieder
ius, iuris [onz.] = recht
`},
];

var path = require('path')
var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = path.join(__dirname, "schermtijd.sqlite3")

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')

        db.run(`CREATE TABLE IF NOT EXISTS activiteit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titel text, 
            beschrijving text, 
            locatie text,
            tijdstip text,
            aantal_min INTEGER,
            aantal_max INTEGER,
            materiaal text
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM activiteit`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    var insert = 'INSERT INTO activiteit (titel, beschrijving, locatie, tijdstip, aantal_min, aantal_max, materiaal) VALUES (?,?,?,?,?,?,?)'
                    db.run(insert, ['vaatwas leegmaken ', 'alles op de plaats zetten ', 'binnen', 'altijd', '1', '3', 'vaatwas']);
                    db.run(insert, ['touwtje springen ', 'over een touw springen \nleuk om met meer te springen ', 'buiten', 'altijd', '1', '8', 'springtouw']);
                    db.run(insert, ['uno', 'deel de kaarten, elk 7\nwie als eerste geen kaarten meer heeft is gewonnen\nvergeet geen uno te zeggen bij de laatste kaart!!', 'overal', 'altijd', '2', '8', 'uno kaartspel']);
                    db.run(insert, ['bliklopen', 'haal per persoon 2 blikken, maak er 2 gaten in langs de zijkant op dezelfde hoogte. steek daar dan een lang genoeg touw door zodat als je op de blikken staat dat je de touwen in je hand kan nemen. maak daarna een start en een finish. 3 2 1 start!!', 'overal', 'overdag', '2', '8', 'blikken\ntouw\nstart\nfinish']);
                    db.run(insert, ['kaarten : manillen ', 'je zet je schuin over elkaar \nje deelt de kaarten 3 2 3 \nde gene die na de gene zit die deelt die mag troef kiezen \nde gene die na de gene die troef heeft gekozen \ndie mag de begin kaart opleggen \nde gene die de slag wint\n die mag de volgende kaart  opleggen \n', 'overal', 'altijd', '4', '4', 'Spel kaarten ']);
                    db.run(insert, ['met je huisdier spelen ', 'knuffelen, gooien met de bal, gaan wandelen ...', 'overal', 'altijd', '1', '8', 'huisdier']);
                    db.run(insert, ['naar technopolis gaan ', 'allerlei technologische dingen ontdekken', 'binnen', 'overdag', '1', '8', 'centjes']);
                    db.run(insert, ['kiekeboe ', 'spelletje waar de tikker tot 20 telt en je moet de tikker tikken en je naam zeggen. Ondertussen moet je je verstoppen.\nDe teller mag maar 3 stappen zetten.\nAls de tikker niemand vind roept hij KIEKEBOE', 'overal', 'altijd', '3', '8', 'vriendjes']);
                    db.run(insert, ['voetballen ', 'dat weet je wel ', 'buiten', 'overdag', '2', '8', 'bal\ngoal']);
                    db.run(insert, ['zwemmen', ' dat ken je', 'buiten', 'overdag', '1', '8', 'zwembad']);
                    db.run(insert, ['schaken ', 'Speel een spelletje schaak met zen tweeën.', 'overal', 'altijd', '2', '2', 'schaakbord']);
                    db.run(insert, ['tikkertje', 'er is 1 tikker en de rest loopt weg van de tikker.', 'overal', 'overdag', '3', '8', '']);
                    db.run(insert, ['muurklimmen ', 'met beveiliging van touwen \neen muur omhoog klimmen ', 'binnen', 'overdag', '1', '8', 'klimmuur \nbeveiligingstouw']);
                    db.run(insert, ['zelf een telefoon maken ', 'neem 2 plastieken bekertjes en maak in de bodem een gaatje.\nsteek het touw door de 2 gaatjes aan elke kant \nleg er nadien een knoopje in \nzo, nu kan je geheime boodschappen aan elkaar doorgeven.', 'overal', 'altijd', '2', '2', '2 wegwerpbekers\ntouw']);
                    db.run(insert, ['stofzuigen', 'neem de stofzuiger en begin er aan! ', 'binnen', 'altijd', '1', '1', 'stofzuiger']);
                    db.run(insert, ['cupcakes maken', 'Verwarm de oven alvast voor op 180 á 200ºC. Doe alles behalve de melk in een kom en meng dit door elkaar.\nVoeg tijdens het mengen/mixen de melk toe. Zet 12 papieren vormpjes klaar en verdeel het beslag evenredig over de vormpjes.\nBak de cupcakes 15 tot 20 minuten, totdat ze lichtbruin zijn. Daarna kan je ze eventueel met glazuur afmaken', 'binnen', 'overdag', '1', '8', '125 gram bloem\n125 gram boter\n125 gram witte suiker\n2 eieren\n1/2 zakje vanille suiker\n2à3 lepels melk']);
                    db.run(insert, ['auto wassen', 'Verras mama of papa en was de auto! ', 'buiten', 'altijd', '1', '8', 'auto\nemmer, spons, afwasmiddel\ntuinslang']);
                    db.run(insert, ['tafel dekken of afruimen', 'Maak mama/papa blij en dek de tafel of ruim de tafel af', 'binnen', 'altijd', '1', '8', '']);
                    db.run(insert, ['maak eens een verrassingsontbijt ', 'verras mama en papa en zorg voor een heerlijk ontbijt! ', 'overal', 'overdag', '1', '8', 'fruitsap, koffie, ontbijtkoekjes, eitjes, aardbeitjes, fruitsla, confituur, choco, kaas, een cavaatje? \nLaat je maar gaan!']);
                    db.run(insert, ['maak zelf een blotevoetenpad ', 'maak zelf een blotevoetenpad met: keitjes, boomschors, zand, modder of zoek eens op waar er in jouw buurt een blotevoetenpad is! ', 'buiten', 'overdag', '1', '8', '']);
                    db.run(insert, ['dweil race', 'neem een paar goedkope hotelsloffen per persoon en neem de dweil erbij. Knip de dweil in lange repen en plak ze aan de sloffen met een lijmpistool. neem een bak met warm water en zeep. Steek de sloffen in de emmer en racen maar!!', 'binnen', 'overdag', '2', '8', 'een paar goedkope hotelsloffen pp.\ndweilen\nemmer\nwarm water\nzeep']);
                    db.run(insert, ['fietsen ', 'een fiets tochtje maken ', 'buiten', 'altijd', '1', '8', 'fiets']);
                    db.run(insert, ['Kubb', 'de spelregels zitten bij de Kubb set\nAls je geen Kubb set hebt kan je ook binnen spelen met de vazen en het servies.\nOf je gebruikt knuffels als de soldaten en de koning.', 'buiten', 'altijd', '2', '8', 'Kubb set\n(of vazen en servies)']);
                    db.run(insert, ['pokemon kaarten ruilen ', 'je kan allemaal  kaarten ruilen  ', 'overal', 'altijd', '1', '8', 'pokemon kaarten']);
                    db.run(insert, ['maak papieren bloemen ', 'maak bloemen ', 'overal', 'altijd', '1', '8', 'stokjes\npapier\nplakband']);
                    console.log('activiteiten toegevoegd')
                }
            })
        });
        db.run(`CREATE TABLE IF NOT EXISTS toestel (
            id INTEGER PRIMARY KEY,
            avatar image,
            adres text,
            eigenaar text,
            score text
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM toestel`, (err, rows) => {
                if ((rows) && (rows[0].aantal == 0)) {
                    var insert = 'INSERT INTO toestel (avatar, adres, eigenaar, score) VALUES (?, ?, ?, 0)'
                    db.run(insert, ['/avatar/mona.jpg', 1, "Mona"])
                    db.run(insert, ['/avatar/camille.jpg', 2, "Camille"])
                    db.run(insert, ['/avatar/default.png', 3, "Juf Helga"])
                    db.run(insert, ['/avatar/lieven.png', 4, "Lieven"])
                    db.run(insert, ['/avatar/deepak.jpg', 5, "Deepak"])
                    db.run(insert, ['/avatar/default.png', 6, "Jos"])
                    console.log('toestellen toegevoegd')
                }
            })
        });
        db.run(`CREATE TABLE IF NOT EXISTS tijdslot (
            id INTEGER PRIMARY KEY,
            startuur INTEGER,
            gewicht INTEGER
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM tijdslot`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    var insert = 'INSERT INTO tijdslot (id, startuur, gewicht) VALUES (?, ?, ?)'
                    for (i = 1; i <= 24; i++) {
                        db.run(insert, [i, i, 3])
                    }
                    console.log('tijdslots toegevoegd')
                }
            })
        });
        db.run(`CREATE TABLE IF NOT EXISTS score (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            toestel_id INTEGER,
            score text,
            bericht text,
            datum INTEGER
            )`);
    }
});

module.exports = db
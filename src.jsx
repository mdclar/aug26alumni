import { useState, useRef, useMemo, useEffect, useLayoutEffect } from "react";
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, BorderStyle } from "docx";
import {
  Mountain, Waves, Church, Landmark, Footprints, MapPin, Home as HomeIcon,
  Star, ChevronLeft, ChevronUp, ChevronDown, Camera, ScanLine, Users, HelpCircle, Lock, Unlock,
  Download, Plus, X, BookOpen, Loader2, Trash2, Check, RotateCcw, UserPlus, Sparkles, Cloud,
  BookText, Image as ImageIcon, ListOrdered, ExternalLink, Compass, Map as MapIcon, MessageCircle, Send,
} from "lucide-react";

const C = {
  ink: "#233038", inkSoft: "#4a5a63", stone: "#f3ede2", card: "#fbf8f1",
  line: "#ddd2bf", brass: "#b0894a", brassDk: "#8f6e37", olive: "#6b7350",
  teal: "#2c5f61", clay: "#a9612f",
};
const APP_VERSION = "1.6.2";
const F_DISP = "'Cinzel', 'Trajan Pro', Georgia, serif";
const F_SERIF = "'Frank Ruhl Libre', 'Frank Ruehl', Georgia, serif";
function Fonts(){return(<style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Frank+Ruhl+Libre:wght@400;500;700&display=swap');`}</style>);}

function ArchArcade({ height = 96, stroke = C.brass }) {
  const w = 460, n = 11, r = 16, gap = 5, springY = 52, baseY = 82, top = 30;
  const step = 2 * r + gap; const totalW = n * step - gap; const startX = (w - totalW) / 2;
  const arches = Array.from({ length: n }, (_, i) => startX + r + i * step);
  const left = arches[0] - r, right = arches[n - 1] + r;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="xMidYMax meet" style={{ display: "block" }} aria-hidden="true">
      <line x1={left} y1={top} x2={right} y2={top} stroke={stroke} strokeOpacity={0.45} strokeWidth="1.5" />
      {arches.map((cx, i) => (<path key={i} d={`M ${cx - r} ${baseY} L ${cx - r} ${springY} A ${r} ${r} 0 0 1 ${cx + r} ${springY} L ${cx + r} ${baseY}`} fill="none" stroke={stroke} strokeOpacity={0.85} strokeWidth="1.6" strokeLinecap="round" />))}
      <line x1={left} y1={baseY} x2={right} y2={baseY} stroke={stroke} strokeOpacity={0.75} strokeWidth="1.6" />
    </svg>
  );
}
function TravelArt({ height = 96, stroke = C.brass }) {
  return (
    <svg viewBox="0 0 460 96" width="100%" height={height} preserveAspectRatio="xMidYMax meet" style={{ display: "block" }} aria-hidden="true">
      {/* horizon */}
      <line x1="24" y1="78" x2="436" y2="78" stroke={stroke} strokeOpacity="0.6" strokeWidth="1.6"/>
      {/* plane, single-stroke */}
      <g stroke={stroke} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9">
        <path d="M60 34 L118 26 L134 30 L120 38 L74 44 Z"/>
        <path d="M96 30 L108 16 L116 17 L106 29"/>
        <path d="M92 40 L100 50 L106 50 L100 39"/>
        <path d="M40 40 C46 36 54 35 60 34" strokeDasharray="3 4" strokeOpacity="0.5"/>
      </g>
      {/* train */}
      <g stroke={stroke} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9">
        <rect x="176" y="52" width="52" height="20" rx="4"/>
        <rect x="232" y="56" width="40" height="16" rx="3"/>
        <path d="M176 60 L166 60 C160 60 158 66 160 72 L176 72"/>
        <circle cx="184" cy="76" r="3"/><circle cx="212" cy="76" r="3"/><circle cx="240" cy="76" r="3"/><circle cx="262" cy="76" r="3"/>
        <line x1="184" y1="58" x2="220" y2="58"/>
      </g>
      {/* car */}
      <g stroke={stroke} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9">
        <path d="M320 72 L322 62 C330 54 356 54 366 62 L386 64 C392 65 394 68 394 72 Z"/>
        <path d="M334 62 L338 56 L354 56 L360 62"/>
        <circle cx="334" cy="74" r="4"/><circle cx="378" cy="74" r="4"/>
      </g>
      {/* compass dot trail */}
      <g fill={stroke} fillOpacity="0.5">
        <circle cx="412" cy="70" r="1.6"/><circle cx="420" cy="64" r="1.6"/><circle cx="428" cy="58" r="1.6"/>
      </g>
    </svg>
  );
}
function ArchMark({ size = 16, color = C.brass }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 22 L4 11 A8 8 0 0 1 20 11 L20 22" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg>);
}

const K = { water: "water", mount: "mount", church: "church", ruins: "ruins", walk: "walk", home: "home" };
const ICON = { water: Waves, mount: Mountain, church: Church, ruins: Landmark, walk: Footprints, home: HomeIcon };
const KIND_COLOR = { water: C.teal, mount: C.olive, church: C.brass, ruins: C.clay, walk: C.inkSoft, home: C.teal };
const KIND_OPTIONS = [["church","Church / temple"],["ruins","Ruins / museum"],["mount","Mount / overlook"],["water","Water"],["walk","Walk / city"]];
const FAITHS = {
  C: { label: "Christianity", color: "#A9822E" }, J: { label: "Judaism", color: "#2E5266" },
  M: { label: "Islam", color: "#4E7A5A" }, H: { label: "History & Archaeology", color: "#7A6A54" },
  L: { label: "Latter-day Saint focus", color: "#9c6b3f" },
};
const SITE_INFO = {"s1": {"name": "Seven Arches Overlook", "kind": "mount", "blurb": "Mount of Olives panorama across the Old City and Temple Mount.", "faiths": ["C", "J", "M"], "talmage": false, "lat": 31.7784, "lng": 35.2437, "desc": "From the summit of the <b>Mount of Olives</b>, by the terrace of the Seven Arches Hotel, the Old City opens up in one sweeping view. Below lies the largest and oldest Jewish cemetery in the world; across the Kidron Valley rise the Temple Mount, the golden Dome of the Rock, and the walled Old City. For <b>Jews</b> the ridge is where tradition holds the resurrection will begin, which is why so many sought burial here. For <b>Christians</b> the mount is bound to Jesus’ final week—He wept over the city here (Luke 19), taught the Olivet Discourse, and ascended from its summit. It is the single best orientation point for the whole trip.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/19?lang=eng", "t": "Luke 19:37–44 (Jesus weeps over Jerusalem)", "why": "Standing here, Jesus looked over this very view and wept over the city during His triumphal descent."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/zech/14?lang=eng", "t": "Zechariah 14:4 (the Mount of Olives)", "why": "Prophecy that this mount will cleave in two at the Lord's return."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/acts/1?lang=eng", "t": "Acts 1:9–12 (the Ascension)", "why": "The ascension took place from this summit — and angels promised He would return the same way."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0017-the-lords-triumphal-entry-into-jerusalem?lang=eng", "t": "▶The Lord’s Triumphal Entry into Jerusalem"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-final-events?lang=eng", "t": "▦Bible Videos – Final Events"}]}, "s2": {"name": "City of David", "kind": "ruins", "blurb": "The original core of ancient Jerusalem, south of the Temple Mount.", "faiths": ["J", "C", "H"], "talmage": false, "lat": 31.7735, "lng": 35.2353, "desc": "The original walled city that King <b>David</b> captured from the Jebusites (c. 1000 BC) and made his capital, on the narrow ridge south of today’s Temple Mount. This is the biblical Zion—where David danced before the ark and where Solomon was anointed at the Gihon Spring. For <b>Jews</b> and <b>Christians</b> alike it is the literal birthplace of Jerusalem as the holy city and the seat of the Davidic covenant from which the Messiah would come. Ongoing excavations have uncovered massive stone structures, the stepped-stone rampart, and dozens of clay bullae (seal impressions), some bearing names known from the book of Jeremiah.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/2-sam/5?lang=eng", "t": "2 Samuel 5:6–10 (David takes the stronghold of Zion)", "why": "David captured this exact ridge from the Jebusites and made it his capital."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/1-kgs/1?lang=eng", "t": "1 Kings 1:38–40 (Solomon anointed at Gihon)", "why": "Solomon was anointed king at the Gihon Spring at the foot of this hill."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/2-sam/6?lang=eng", "t": "2 Samuel 6 (the ark brought to the city)", "why": "David brought the ark up into this city, dancing before the Lord."}], "media": [{"href": "https://www.churchofjesuschrist.org/study/manual/gospel-topics/jerusalem?lang=eng", "t": "◆Gospel Topics: Jerusalem"}]}, "s3": {"name": "Hezekiah’s Tunnel", "kind": "water", "blurb": "Iron Age water tunnel you wade through to the pool.", "faiths": ["J", "H"], "talmage": false, "lat": 31.7726, "lng": 35.2354, "desc": "An engineering marvel of the Iron Age: a 533-metre (1,750-ft) water channel that King <b>Hezekiah</b> cut through solid bedrock around 701 BC to carry water from the Gihon Spring safely inside the walls, denying it to the besieging Assyrian army of Sennacherib. Two teams tunneling from opposite ends met in the middle—a feat recorded in the famous <b>Siloam Inscription</b>. Visitors can still wade the knee-deep, ankle-to-waist water in near-darkness end to end. Primarily a <b>Jewish</b> and <b>historical/archaeological</b> site, it is a vivid confirmation of the biblical narrative in 2 Kings and 2 Chronicles.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/2-kgs/20?lang=eng", "t": "2 Kings 20:20 (Hezekiah made the pool and conduit)", "why": "The verse crediting Hezekiah with the pool and conduit you wade through."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/2-chr/32?lang=eng", "t": "2 Chronicles 32:2–30 (Hezekiah stops the waters)", "why": "The Assyrian siege story that explains why the tunnel was cut — hiding the spring from the enemy."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/isa/22?lang=eng", "t": "Isaiah 22:9–11", "why": "Isaiah's rebuke over these very waterworks: trusting engineering more than God."}], "media": []}, "s4": {"name": "Pool of Siloam", "kind": "water", "blurb": "Where the spring water emerges; a New Testament healing site.", "faiths": ["C", "J", "H"], "talmage": true, "lat": 31.7701, "lng": 35.2354, "desc": "The outflow of Hezekiah’s Tunnel and the pool where, in <b>John 9</b>, Jesus sent a man born blind to wash after anointing his eyes with clay—“and he came seeing.” For <b>Christians</b> this is one of the Savior’s signature healing miracles, tied to His declaration “I am the light of the world.” In Jewish practice the pool supplied the water drawn in procession during the Feast of Tabernacles, the very festival at which Jesus cried, “If any man thirst, let him come unto me.” The large Second-Temple-period stepped pool was rediscovered in 2004 during sewer repairs and is being progressively excavated.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/9?lang=eng", "t": "John 9:1–11 (the man born blind)", "why": "Jesus sent the man born blind to wash in this pool — 'and he came seeing.'"}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/7?lang=eng", "t": "John 7:37–38 (the last day of the feast)", "why": "Feast water was drawn from this pool in procession; Jesus' 'living water' cry invoked that ceremony."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/neh/3?lang=eng", "t": "Nehemiah 3:15", "why": "The pool's rebuilt wall appears in Nehemiah's post-exile record."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0066-jesus-heals-a-man-born-blind?lang=eng", "t": "▶Jesus Heals a Man Born Blind"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0041-jesus-declares-i-am-the-light-of-the-world-the-truth-shall-make-you-free?lang=eng", "t": "▶I Am the Light of the World"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-miracles?lang=eng", "t": "▦Bible Videos – Miracles"}], "talmageRef": "Jesus the Christ · Chapter 25 — Jesus Again in Jerusalem", "talmageText": "As part of the temple service incident to the feast, the people went in procession to the Pool of Siloam where a priest filled a golden ewer, which he then carried to the altar and there poured out the water to the accompaniment of trumpet blasts and the acclamations of the assembled hosts. According to authorities on Jewish customs, this feature was omitted on the closing day of the feast. On this last or \"great day,\" which was marked by ceremonies of unusual solemnity and rejoicing, Jesus was again in the temple. It may have been with reference to the bringing of water from the pool, or to the omission of the ceremony from the ritualistic procedure of the great day, that Jesus cried aloud, His voice resounding through the courts and arcades of the temple: \"If any man thirst, let him come unto me, and drink. He that believeth on me, as the scripture hath said, out of his belly shall flow rivers of living water.\" John, the recorder, remarks parenthetically that this promise had reference to the bestowal of the Holy Ghost, which at that time had not been granted, nor was it to be until after the ascension of the risen Lord."}, "s5": {"name": "Pilgrim’s Road (Herodian Street)", "kind": "walk", "blurb": "Herodian street pilgrims climbed toward the Temple.", "faiths": ["J", "C", "H"], "talmage": false, "lat": 31.7713, "lng": 35.2356, "desc": "The stepped, stone-paved street from the Second Temple period that carried <b>Jewish pilgrims</b> up from the Pool of Siloam to the Temple Mount for the three great feasts. Buried under later rubble, it is now being excavated as a tunnel beneath the modern neighborhood of Silwan, running some 600 metres to the base of the Temple’s southern steps. Jesus and His family would have climbed this very ascent when they came up to Jerusalem “at the feast” (Luke 2). It is chiefly a <b>historical/archaeological</b> site that lets you literally walk in the footsteps of first-century worshippers.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/2?lang=eng", "t": "Luke 2:41–42 (they went up to the feast)", "why": "Jesus' family came up 'to the feast' — climbing this very ascent to the Temple."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/ps/122?lang=eng", "t": "Psalm 122 (a song of ascents)", "why": "A song of ascents pilgrims sang while climbing this road."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/deut/16?lang=eng", "t": "Deuteronomy 16:16 (three times a year)", "why": "The command behind the crowds: appear before the Lord three times a year."}], "media": []}, "s6": {"name": "The Galilee Region", "kind": "water", "blurb": "Rolling northern hills around the Sea of Galilee.", "faiths": ["C", "J", "L"], "talmage": true, "lat": 32.8, "lng": 35.5, "desc": "The green, hilly north of Israel—farms, basalt villages, and the harp-shaped freshwater lake—was the setting for most of Jesus’ mortal ministry. “Galilee of the nations” (Isaiah 9) was looked down on by Judeans, yet it is here that the Light dawned, the Twelve were called, and the great Galilean sermons and miracles unfolded. For <b>Latter-day Saints</b> the region carries special resonance: it is the backdrop for the Bread of Life, the calming of the sea, and the Sermon on the Mount. This day begins the transition from the political capital in the south to the pastoral world where the Savior taught “as one having authority.”", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/isa/9?lang=eng", "t": "Isaiah 9:1–2 (Galilee of the nations)", "why": "Prophecy that light would dawn on 'Galilee of the nations' — this region."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/4?lang=eng", "t": "Matthew 4:12–17 (Jesus begins in Galilee)", "why": "Jesus opens His ministry here, expressly fulfilling Isaiah's words."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-the-life-of-jesus-christ?lang=eng", "t": "▦Bible Videos – The Life of Jesus Christ"}], "talmageRef": "Jesus the Christ · Chapter 12 — Early Incidents in Our Lord's Public Ministry", "talmageText": "Soon after the marriage festivities in Cana, Jesus, accompanied by His disciples, as also by His mother and other members of the family, went to Capernaum, a town pleasantly situated near the northerly end of the Sea of Galilee or Lake of Gennesaret and the scene of many of our Lord's miraculous works; indeed it came to be known as His own city. Because of the unbelief of its people it became a subject of lamentation to Jesus when in sorrow He prefigured the judgment that would befall the place. The exact site of the city is at present unknown. On this occasion Jesus tarried but a few days at Capernaum; for the time of the annual Passover was near, and in compliance with Jewish law and custom He went up to Jerusalem. The synoptic Gospels, which are primarily devoted to the labors of Christ in Galilee, contain no mention of His attendance at the paschal festival between His twelfth year and the time of His death; to John alone are we indebted for the record of this visit at the beginning of Christ's public ministry. It is not improbable that Jesus had been present at other Passovers during the eighteen years over which the evangelists pass in complete and reverent silence; but at any or all such earlier visits, He, not being thirty years old, could not have assumed the right or privilege of a teacher without contravening established customs. It is worth our attention to note that on this, the first recorded appearance of Jesus in the temple subsequent to His visit as a Boy, He should resume His \"Father's business\" where He had before been engaged."}, "s7": {"name": "Nazareth Village", "kind": "ruins", "blurb": "Reconstructed first-century village life in Nazareth.", "faiths": ["C", "H"], "talmage": true, "lat": 32.6996, "lng": 35.2967, "desc": "A living-history museum on a preserved hillside farm inside modern Nazareth, reconstructing a first-century Galilean village—terraced vineyards, an olive press, a working watchtower, a synagogue, and costumed interpreters—to show the world in which the boy <b>Jesus of Nazareth</b> grew up. Nazareth was an obscure hamlet (“Can there any good thing come out of Nazareth?”), which is precisely the point: the Son of God “increased in wisdom and stature” in a village of laborers and farmers. This is a <b>Christian</b> educational site that makes the Gospels’ daily-life details tangible.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/2?lang=eng", "t": "Luke 2:39–52 (Jesus grows in Nazareth)", "why": "The 'hidden years' in this village — Jesus increases in wisdom and stature."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/2?lang=eng", "t": "Matthew 2:23 (He shall be called a Nazarene)", "why": "'He shall be called a Nazarene' — why the family settled here."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/1?lang=eng", "t": "John 1:46 (any good thing out of Nazareth?)", "why": "Nathanael's jab shows how obscure this little hamlet was."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2014-01-0003-young-jesus-teaches-in-the-temple?lang=eng", "t": "▶Young Jesus Teaches in the Temple"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-teachings?lang=eng", "t": "▦Bible Videos – Teachings"}], "talmageRef": "Jesus the Christ · Chapter 9 — The Boy of Nazareth", "talmageText": "What marvelous and sacred secrets were treasured in that mother's heart; and what new surprizes and grave problems were added day after day in the manifestations of unfolding wisdom displayed by her more than mortal Son! Though she could never have wholly forgotten, at times she seemingly lost sight of her Son's exalted personality. That such conditions should exist was perhaps divinely appointed. There could scarcely have been a full measure of truly human experience in the relationship between Jesus and His mother, or between Him and Joseph, had the fact of His divinity been always dominant or even prominently apparent. Mary appears never to have fully understood her Son; at every new evidence of His uniqueness she marveled and pondered anew. He was hers, and yet in a very real sense not wholly hers. There was about their relation to each other a mystery, awful yet sublime, a holy secret which that chosen and blessed mother hesitated even to tell over to herself. Fear must have contended with joy within her soul because of Him. The memory of Gabriel's glorious promises, the testimony of the rejoicing shepherds, and the adoration of the magi must have struggled with that of Simeon's portentous prophecy, directed to herself in person: \"Yea, a sword shall pierce through thy own soul also.\" As to the events of the eighteen years following the return of Jesus from Jerusalem to Nazareth, the scriptures are silent save for one rich sentence of greatest import: \"And Jesus increased in wisdom and stature, and in favor with God and man.\""}, "s8": {"name": "Church of the Annunciation", "kind": "church", "blurb": "Marks the traditional site of the angel's visit to Mary.", "faiths": ["C"], "talmage": true, "lat": 32.702, "lng": 35.2978, "desc": "The largest church in the Middle East, built over the traditional site of Mary’s home where the angel <b>Gabriel</b> announced she would bear the Son of God (Luke 1). The modern basilica (1969) encloses the ancient “Grotto of the Annunciation” and is ringed by mosaics of the Madonna donated by nations worldwide. For <b>Roman Catholic and Orthodox Christians</b> this is one of the holiest sites of the Incarnation—the moment “the Word was made flesh.” Mary is also deeply honored in <b>Islam</b> (Maryam), and the annunciation is recounted in the Qur’an.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/1?lang=eng", "t": "Luke 1:26–38 (the Annunciation)", "why": "The event this church marks: Gabriel's announcement to Mary, here in Nazareth."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/isa/7?lang=eng", "t": "Isaiah 7:14 (a virgin shall conceive)", "why": "The prophecy — 'a virgin shall conceive' — fulfilled in the Annunciation."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/1?lang=eng", "t": "Matthew 1:18–25", "why": "Joseph's side of the story: the angel reassures him about Mary."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0002-an-angel-foretells-christs-birth-to-mary?lang=eng", "t": "▶An Angel Foretells Christ’s Birth to Mary"}, {"href": "https://www.churchofjesuschrist.org/media/video/maria-a-mae-de-jesus?lang=eng", "t": "▶Mary, the Mother of Jesus"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-nativity?lang=eng", "t": "▦Bible Videos – Nativity"}], "talmageRef": "Jesus the Christ · Chapter 7 — Gabriel's Annunciation of John and of Jesus", "talmageText": "Six months after the visitation of Gabriel to Zacharias, and three months prior to the birth of John, the same heavenly messenger was sent to a young woman named Mary, who lived at Nazareth, a town in Galilee. She was of the lineage of David; and though unmarried was betrothed or espoused to a man named Joseph, who also was of royal descent through the Davidic line. The angel's salutation, while full of honor and blessing, caused Mary to wonder and to feel troubled. \"Hail, thou that art highly favoured, the Lord is with thee: blessed art thou among women\"; thus did Gabriel greet the virgin. In common with other daughters of Israel, specifically those of the tribe of Judah and of known descent from David, Mary had doubtless contemplated, with holy joy and ecstasy, the coming of the Messiah through the royal line; she knew that some Jewish maiden was yet to become the mother of the Christ. Was it possible that the angel's words to her had reference to this supreme expectation and hope of the nation? She had little time to turn these things in her mind, for the angel continued: \"Fear not, Mary: for thou hast found favour with God. And, behold, thou shalt conceive in thy womb, and bring forth a son, and shalt call his name JESUS. He shall be great, and shall be called the Son of the Highest: and the Lord God shall give unto him the throne of his father David: and he shall reign over the house of Jacob for ever; and of his kingdom there shall be no end.\" Even yet she comprehended but in part the import of this momentous visitation."}, "s9": {"name": "St. Joseph’s Church", "kind": "church", "blurb": "Nazareth church honoring Joseph the carpenter.", "faiths": ["C"], "talmage": true, "lat": 32.7027, "lng": 35.2981, "desc": "A Franciscan church a short walk from the Basilica, built over caves and cisterns traditionally identified as the <b>workshop and home of Joseph the carpenter</b>. While the identification is devotional rather than certain, the site honors the quiet, righteous foster-father who taught Jesus a trade and protected the Holy Family. It is a <b>Christian</b> pilgrimage chapel that pairs naturally with the Annunciation, rounding out the Nazareth of Jesus’ hidden years—the decades the Gospels pass over in near silence.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/13?lang=eng", "t": "Matthew 13:55 (is not this the carpenter’s son?)", "why": "'Is not this the carpenter's son?' — the trade honored at this workshop site."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/1?lang=eng", "t": "Matthew 1:18–24 (Joseph the just man)", "why": "Joseph the 'just man' obeys the angel and protects the family."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/2?lang=eng", "t": "Luke 2:51 (subject unto them)", "why": "Jesus 'subject unto them' — the quiet Nazareth home life remembered here."}], "media": [], "talmageRef": "Jesus the Christ · Chapter 9 — The Boy of Nazareth", "talmageText": "What marvelous and sacred secrets were treasured in that mother's heart; and what new surprizes and grave problems were added day after day in the manifestations of unfolding wisdom displayed by her more than mortal Son! Though she could never have wholly forgotten, at times she seemingly lost sight of her Son's exalted personality. That such conditions should exist was perhaps divinely appointed. There could scarcely have been a full measure of truly human experience in the relationship between Jesus and His mother, or between Him and Joseph, had the fact of His divinity been always dominant or even prominently apparent. Mary appears never to have fully understood her Son; at every new evidence of His uniqueness she marveled and pondered anew. He was hers, and yet in a very real sense not wholly hers. There was about their relation to each other a mystery, awful yet sublime, a holy secret which that chosen and blessed mother hesitated even to tell over to herself. Fear must have contended with joy within her soul because of Him. The memory of Gabriel's glorious promises, the testimony of the rejoicing shepherds, and the adoration of the magi must have struggled with that of Simeon's portentous prophecy, directed to herself in person: \"Yea, a sword shall pierce through thy own soul also.\" As to the events of the eighteen years following the return of Jesus from Jerusalem to Nazareth, the scriptures are silent save for one rich sentence of greatest import: \"And Jesus increased in wisdom and stature, and in favor with God and man.\""}, "s10": {"name": "Sepphoris (Zippori)", "kind": "ruins", "blurb": "Roman-era city with famed mosaics, near Nazareth.", "faiths": ["J", "H"], "talmage": false, "lat": 32.7521, "lng": 35.2792, "desc": "The glittering Roman-era capital of Galilee, just 6 km from Nazareth—famous for its theater and for the exquisite mosaic dubbed the “Mona Lisa of the Galilee.” Being rebuilt by Herod Antipas during Jesus’ youth, it is very plausible that Joseph and Jesus, as builders (Greek <i>tekton</i>), found work here. Later Sepphoris became a major center of <b>Jewish</b> learning where the Mishnah was compiled under Rabbi Judah ha-Nasi. It is a <b>historical/archaeological</b> site that illuminates the cosmopolitan, Greco-Roman world just over the hill from the Savior’s village.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/6?lang=eng", "t": "Mark 6:3 (Jesus the carpenter/builder)", "why": "Jesus the tekton (builder) — He and Joseph plausibly worked in this boom city an hour's walk from Nazareth."}], "media": []}, "s11": {"name": "Mount Arbel", "kind": "mount", "blurb": "Cliff-top overlook of the Sea of Galilee.", "faiths": ["C", "J", "H"], "talmage": false, "lat": 32.8244, "lng": 35.4986, "desc": "A dramatic 380-metre cliff plunging toward the northwest shore of the Sea of Galilee, offering perhaps the finest view of the entire ministry region—Capernaum, the Mount of Beatitudes, Magdala, and the lake all visible at once. The pass below was an ancient trade route; caves in the cliff face sheltered Jewish rebels in the first century BC (recorded by Josephus). While no specific Gospel event is fixed here, many pilgrims read the Great Commission (“into a mountain where Jesus had appointed them,” Matthew 28) against this sweeping backdrop. Chiefly a <b>scenic and historical</b> vantage point.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/28?lang=eng", "t": "Matthew 28:16–20 (into a mountain in Galilee)", "why": "The Great Commission was given 'into a mountain in Galilee' — often read against this panorama of the whole ministry region."}], "media": []}, "s12": {"name": "Ein Gev", "kind": "water", "blurb": "Kibbutz on the eastern shore of the Sea of Galilee.", "faiths": ["C", "H"], "talmage": false, "lat": 32.7736, "lng": 35.6428, "desc": "A kibbutz on the quieter <b>eastern shore</b> of the Sea of Galilee, known for its lakeside fish restaurants and as a base for boat crossings. The eastern side was the largely Gentile region of the <b>Decapolis</b>; nearby (at Kursi/Gergesa) tradition places the healing of the demon-possessed man and the herd of swine (Mark 5). It is mainly a <b>hospitality and geography</b> stop that helps you feel the scale of the lake the disciples rowed across by night.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/5?lang=eng", "t": "Mark 5:1–20 (the Gerasene/Gadarene man)", "why": "The demoniac and the herd of swine — on this eastern Decapolis shore, near Kursi just north of here."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/4?lang=eng", "t": "Matthew 4:25 (multitudes from Decapolis)", "why": "Crowds followed Jesus from Decapolis — the Gentile region you're standing in."}], "media": []}, "s13": {"name": "Mount of Beatitudes", "kind": "mount", "blurb": "Traditional hillside of the Sermon on the Mount.", "faiths": ["C", "L"], "talmage": true, "lat": 32.8807, "lng": 35.5556, "desc": "The gentle hillside above Tabgha traditionally honored as the place of the <b>Sermon on the Mount</b>—the Savior’s great charter of the kingdom, opening with the Beatitudes (“Blessed are the poor in spirit…”). A serene octagonal church (1938), one side for each Beatitude, crowns gardens overlooking the lake. For <b>Christians</b> and especially <b>Latter-day Saints</b> this is a cornerstone of discipleship; the Savior delivered a parallel sermon to the Nephites in 3 Nephi 12–14. The natural amphitheater of the slope carries a speaking voice remarkably well.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/5?lang=eng", "t": "Matthew 5–7 (the Sermon on the Mount)", "why": "The sermon this hillside commemorates, opening with the Beatitudes."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/6?lang=eng", "t": "Luke 6:20–49 (the Sermon on the Plain)", "why": "Luke's parallel 'Sermon on the Plain.'"}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/bofm/3-ne/12?lang=eng", "t": "3 Nephi 12–14 (the Nephite sermon)", "why": "The risen Lord delivered this same sermon to the Nephites."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0032-sermon-on-the-mount-the-beatitudes?lang=eng", "t": "▶Sermon on the Mount: The Beatitudes"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0035-sermon-on-the-mount-treasures-in-heaven?lang=eng", "t": "▶Sermon on the Mount: Treasures in Heaven"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-teachings?lang=eng", "t": "▦Bible Videos – Teachings"}], "talmageRef": "Jesus the Christ · Chapter 17 — The Sermon on the Mount", "talmageText": "The opening sentences are rich in blessing, and the first section of the discourse is devoted to an explanation of what constitutes genuine blessedness; the lesson, moreover, was made simple and unambiguous by specific application, each of the blessed being assured of recompense and reward in the enjoyment of conditions directly opposite to those under which he had suffered. The blessings particularized by the Lord on this occasion have been designated in literature of later time as the Beatitudes. The poor in spirit are to be made rich as rightful heirs to the kingdom of heaven; the mourner shall be comforted for he shall see the divine purpose in his grief, and shall again associate with the beloved ones of whom he has been bereft; the meek, who suffer spoliation rather than jeopardize their souls in contention, shall inherit the earth; those that hunger and thirst for the truth shall be fed in rich abundance; they that show mercy shall be judged mercifully; the pure in heart shall be admitted to the very presence of God; the peacemakers, who try to save themselves and their fellows from strife, shall be numbered among the children of God; they that suffer persecution for the sake of righteousness shall inherit the riches of the eternal kingdom. To the disciples the Lord spake directly, saying: \"Blessed are ye, when men shall revile you, and persecute you, and shall say all manner of evil against you falsely, for my sake. Rejoice, and be exceeding glad: for great is your reward in heaven: for so persecuted they the prophets which were before you.\""}, "s14": {"name": "Tabgha", "kind": "church", "blurb": "Site of the loaves-and-fishes miracle by the lake.", "faiths": ["C"], "talmage": true, "lat": 32.8731, "lng": 35.5478, "desc": "A lush spring-fed shore traditionally marking the <b>feeding of the 5,000</b>, where Jesus multiplied five loaves and two fishes. The Church of the Multiplication preserves a famous 5th-century mosaic of a basket of loaves flanked by two fish, set before the altar-stone said to be where the miracle occurred. It is a <b>Christian</b> pilgrimage site treasured for the lesson that the Bread of Life provides both physical and spiritual sustenance—the miracle that immediately preceded the “I am the bread of life” discourse.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/14?lang=eng", "t": "Matthew 14:13–21 (feeding the 5,000)", "why": "The feeding of the 5,000, commemorated by the mosaic before the altar here."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/6?lang=eng", "t": "John 6 (the Bread of Life)", "why": "The Bread of Life discourse that followed the miracle."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/6?lang=eng", "t": "Mark 6:30–44", "why": "Mark's detail: the crowd seated in fifties on the green grass."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2014-11-0023-the-feeding-of-the-5000?lang=eng", "t": "▶The Feeding of the 5,000"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0051-i-am-the-bread-of-life?lang=eng", "t": "▶I Am the Bread of Life"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-miracles?lang=eng", "t": "▦Bible Videos – Miracles"}], "talmageRef": "Jesus the Christ · Chapter 21 — The Apostolic Mission, and Events Related Thereto", "talmageText": "Such is John's account; the other writers state that the apostles reminded Jesus of the lateness of the hour, and urged that He send the people away to seek for themselves food and lodging in the nearest towns. It appears most probable that the conversation between Jesus and Philip occurred earlier in the afternoon; and that as the hours sped, the Twelve became concerned and advized that the multitude be dismissed. The Master's reply to the apostles was: \"They need not depart; give ye them to eat.\" In amazed wonder they replied: \"We have here but five loaves and two fishes;\" and Andrew's despairing comment is implied again--What are they among so many? Jesus gave command, and the people seated themselves on the grass in orderly array; they were grouped in fifties and hundreds; and it was found that the multitude numbered about five thousand men, beside women and children. Taking the loaves and the fishes, Jesus looked toward heaven and pronounced a blessing upon the food; then, dividing the provisions, He gave to the apostles severally, and they in turn distributed to the multitude. The substance of both fish and bread increased under the Master's touch; and the multitude feasted there in the desert, until all were satisfied. To the disciples Jesus said: \"Gather up the fragments that remain, that nothing be lost;\" and twelve baskets were filled with the surplus."}, "s15": {"name": "St. Peter’s Primacy (Mensa Christi)", "kind": "church", "blurb": "Lakeside chapel commemorating Christ's charge to Peter.", "faiths": ["C"], "talmage": true, "lat": 32.872, "lng": 35.5503, "desc": "A small black-basalt Franciscan chapel on the lakeshore built over the <b>Mensa Christi</b> (“Table of Christ”), the rock where tradition holds the resurrected Jesus prepared breakfast for the disciples and three times charged Peter, “Feed my sheep” (John 21). For <b>Christians</b>—and especially in Catholic tradition—this is where the Lord confirmed Peter’s pastoral commission. Steps lead right down into the water where fishermen still cast nets, evoking the miraculous catch of that morning.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/21?lang=eng", "t": "John 21:1–17 (breakfast; ‘feed my sheep’)", "why": "Breakfast on this shore and the thrice-repeated 'feed my sheep' — the event of this chapel."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/5?lang=eng", "t": "Luke 5:1–11 (the earlier miraculous catch)", "why": "The earlier miraculous catch on this lake, when Peter was first called."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2014-01-0010-the-risen-lord-appears-to-the-apostles?lang=eng", "t": "▶The Risen Lord Appears to the Apostles"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-final-events?lang=eng", "t": "▦Bible Videos – Final Events"}], "talmageRef": "Jesus the Christ · Chapter 37 — The Resurrection and the Ascension", "talmageText": "When the meal was finished, \"Jesus saith to Simon Peter, Simon, son of Jonas, lovest thou me more than these?\" The question, however tenderly put, must have wrung Peter's heart, coupled as it was with the reminder of his bold but undependable protestation, \"Though all men shall be offended because of thee, yet will I never be offended\", followed by his denial that he had ever known the Man. To the Lord's inquiry Peter answered humbly, \"Yea, Lord; thou knowest that I love thee.\" Then said Jesus, \"Feed my lambs.\" The question was repeated; and Peter replied in identical words, to which the Lord responded, \"Feed my sheep.\" And yet the third time Jesus asked, \"Simon, son of Jonas, lovest thou me?\" Peter was pained and grieved at this reiteration, thinking perhaps that the Lord mistrusted him; but as the man had three times denied, so now was he given opportunity for a triple confession. To the thrice repeated question, Peter answered: \"Lord, thou knowest all things; thou knowest that I love thee. Jesus saith unto him. Feed my sheep.\" The commission \"Feed my sheep\" was an assurance of the Lord's confidence, and of the reality of Peter's presidency among the apostles. He had emphatically announced his readiness to follow his Master even to prison and death. Now, the Lord who had died said unto him: \"Verily, verily; I say unto thee, When thou wast young, thou girdest thyself, and walkedst whither thou wouldst: but when thou shalt be old, thou shalt stretch forth thy hands, and another shall gird thee, and carry thee whither thou wouldst not.\""}, "s16": {"name": "Capernaum", "kind": "ruins", "blurb": "Ruined fishing town central to Jesus's Galilean ministry.", "faiths": ["C", "J", "L"], "talmage": true, "lat": 32.8807, "lng": 35.575, "desc": "Jesus’ adopted headquarters—“his own city”—a fishing town on the north shore where He called Peter, Andrew, James, John, and Matthew, healed Peter’s mother-in-law and the centurion’s servant, and taught in the synagogue. You can see the white-limestone synagogue (4th century, built over the basalt foundations of the one from Jesus’ day) and the octagonal church over the traditional <b>house of Peter</b>. A central <b>Christian</b> site of the Galilean ministry and, for <b>Latter-day Saints</b>, the setting of many recorded miracles and the Bread of Life sermon.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/4?lang=eng", "t": "Matthew 4:13–22 (Jesus dwells in Capernaum; calls disciples)", "why": "Jesus moves to Capernaum — 'his own city' — and calls the fishermen."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/1?lang=eng", "t": "Mark 1:21–34 (a day in Capernaum)", "why": "One full Sabbath of teaching and healing in this town."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/8?lang=eng", "t": "Matthew 8:5–13 (the centurion)", "why": "The centurion whose servant Jesus healed here — he loved Israel and built the synagogue."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0060-follow-me-and-i-will-make-you-fishers-of-men?lang=eng", "t": "▶Follow Me, and I Will Make You Fishers of Men"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0062-jesus-heals-a-lame-man-on-the-sabbath?lang=eng", "t": "▶Jesus Heals a Lame Man on the Sabbath"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-the-life-of-jesus-christ?lang=eng", "t": "▦Bible Videos – The Life of Jesus Christ"}], "talmageRef": "Jesus the Christ · Chapter 12 — Early Incidents in Our Lord's Public Ministry", "talmageText": "Soon after the marriage festivities in Cana, Jesus, accompanied by His disciples, as also by His mother and other members of the family, went to Capernaum, a town pleasantly situated near the northerly end of the Sea of Galilee or Lake of Gennesaret and the scene of many of our Lord's miraculous works; indeed it came to be known as His own city. Because of the unbelief of its people it became a subject of lamentation to Jesus when in sorrow He prefigured the judgment that would befall the place. The exact site of the city is at present unknown. On this occasion Jesus tarried but a few days at Capernaum; for the time of the annual Passover was near, and in compliance with Jewish law and custom He went up to Jerusalem. The synoptic Gospels, which are primarily devoted to the labors of Christ in Galilee, contain no mention of His attendance at the paschal festival between His twelfth year and the time of His death; to John alone are we indebted for the record of this visit at the beginning of Christ's public ministry. It is not improbable that Jesus had been present at other Passovers during the eighteen years over which the evangelists pass in complete and reverent silence; but at any or all such earlier visits, He, not being thirty years old, could not have assumed the right or privilege of a teacher without contravening established customs. It is worth our attention to note that on this, the first recorded appearance of Jesus in the temple subsequent to His visit as a Boy, He should resume His \"Father's business\" where He had before been engaged."}, "s17": {"name": "Magdala", "kind": "ruins", "blurb": "First-century town with a recently excavated synagogue.", "faiths": ["C", "J", "H"], "talmage": true, "lat": 32.8247, "lng": 35.5169, "desc": "The lakeside town that gave <b>Mary Magdalene</b> her name—the devoted disciple out of whom the Lord cast seven devils, who stood by the cross and was first to witness the risen Christ. Excavations since 2009 have revealed a remarkably preserved <b>first-century synagogue</b> (where Jesus may well have taught) and the carved “Magdala Stone,” plus a fishing-town harbor and market. A striking <b>Christian and archaeological</b> site, now with a modern spirituality center (Duc in Altum) on the shore.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/8?lang=eng", "t": "Luke 8:1–3 (Mary called Magdalene)", "why": "Mary 'called Magdalene' — named for this town."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/20?lang=eng", "t": "John 20:11–18 (Mary at the tomb)", "why": "Mary Magdalene, first witness of the risen Lord at the tomb."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/16?lang=eng", "t": "Mark 16:9", "why": "Mark confirms: He appeared first to Mary of Magdala."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0021-jesus-is-resurrected?lang=eng", "t": "▶Jesus Is Resurrected"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-final-events?lang=eng", "t": "▦Bible Videos – Final Events"}], "talmageRef": "Jesus the Christ · Chapter 21 — The Apostolic Mission, and Events Related Thereto", "talmageText": "The night voyage, in the course of which Jesus had reached the boat with its frightened occupants while \"in the midst of the sea,\" ended at some point within the district known as the land of Gennesaret, which, as generally believed, embraced the rich and fertile region in the vicinity of Tiberias and Magdala. Of the natural beauties, for which the region was famed much has been written. Word of our Lord's presence there spread rapidly, and, from \"all that country round about\" the people flocked to Him, bringing their afflicted to receive of His beneficence by word or touch. In the towns through which He walked, the sick were laid in the streets that the blessing of His passing might fall upon them; and many \"besought him that they might touch if it were but the border of his garment; and as many as touched him were made whole.\" Bounteously did He impart of His healing virtue to all who came asking with faith and confidence. Thus, accompanied by the Twelve, He wended His way northward to Capernaum, making the pathway bright by the plentitude of His mercies. IN SEARCH OF LOAVES AND FISHES. The multitude who, on the yesterday, had partaken of His bounty on the other side of the lake, and who dispersed for the night after their ineffectual attempt to force upon Him the dignity of earthly kingship, were greatly surprized in the morning to discover that He had departed. They had seen the disciples leave in the only boat there present, while Jesus had remained on shore; and they knew that the night tempest had precluded the possibility of other boats reaching the place."}, "s18": {"name": "Sea of Galilee", "kind": "water", "blurb": "The freshwater lake at the heart of the Gospels.", "faiths": ["C", "L"], "talmage": true, "lat": 32.8, "lng": 35.59, "desc": "The freshwater lake (also called Gennesaret or Tiberias) at the heart of Jesus’ ministry—where He called fishermen to be fishers of men, stilled the tempest with “Peace, be still,” walked upon the water, and taught crowds from a boat. Set 210 metres below sea level, it is prone to sudden violent squalls when cold air spills off the surrounding hills, exactly the conditions the Gospels describe. A boat ride across it is one of the most beloved moments of any <b>Christian</b> pilgrimage.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/4?lang=eng", "t": "Mark 4:35–41 (Peace, be still)", "why": "'Peace, be still' — the sudden squall calmed on these waters."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/14?lang=eng", "t": "Matthew 14:22–33 (walking on the water)", "why": "Walking on this water; Peter's few bold steps."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/5?lang=eng", "t": "Luke 5:1–11 (the miraculous draught)", "why": "The miraculous catch that called fishermen from these shores."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2014-01-0030-calming-the-tempest?lang=eng", "t": "▶Calming the Tempest"}, {"href": "https://www.churchofjesuschrist.org/media/video/2014-11-0024-wherefore-didst-thou-doubt?lang=eng", "t": "▶Wherefore Didst Thou Doubt? (Walking on Water)"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-miracles?lang=eng", "t": "▦Bible Videos – Miracles"}], "talmageRef": "Jesus the Christ · Chapter 20 — \"Peace, Be Still\"", "talmageText": "Near the close of the day on which Jesus had taught the multitudes for the first time by parables, He said to the disciples, \"Let us pass over unto the other side.\" The destination so indicated is the east side of the sea of Galilee. While the boat was being made ready, a certain scribe came to Jesus and said: \"Master, I will follow thee whithersoever thou goest.\" Prior to that time, few men belonging to the titled or ruling class had offered to openly ally themselves with Jesus. Had the Master been mindful of policy and desirous of securing official recognition, this opportunity to attach to Himself as influential a person as a scribe would have received careful consideration if not immediate acceptance; but He, who could read the minds and know the hearts of men, chose rather than accepted. He had called men who were to be thenceforth His own, from their fishing boats and nets, and had numbered one of the ostracized publicans among the Twelve; but He knew them, every one, and chose accordingly. The gospel was offered freely to all; but authority to officiate as a minister thereof was not to be had for the asking; for that sacred labor, one must be called of God. In this instance, Christ knew the character of the man, and, without wounding his feelings by curt rejection, pointed out the sacrifice required of one who would follow whithersoever the Lord went, saying: \"The foxes have holes, and the birds of the air have nests; but the Son of man hath not where to lay his head.\""}, "s19": {"name": "Northern Galilee Sites (Caesarea Philippi / Dan / Banias)", "kind": "mount", "blurb": "Caesarea Philippi, Dan, and Banias near the northern border.", "faiths": ["C", "J", "H"], "talmage": true, "lat": 33.2486, "lng": 35.6947, "desc": "At the foot of Mount Hermon, spring-fed <b>Banias</b> (Caesarea Philippi) sits before a great cliff and cave once dedicated to the Greek god Pan—a center of pagan worship. It was here, in this shadow of “the gates of hell,” that Peter confessed, “Thou art the Christ, the Son of the living God,” and Jesus promised the keys of the kingdom. Nearby <b>Tel Dan</b> preserves a Canaanite/Israelite city gate and the “House of David” inscription. A rich <b>Christian, Jewish, and archaeological</b> district and one of the sources of the Jordan River.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/16?lang=eng", "t": "Matthew 16:13–19 (Thou art the Christ; the keys)", "why": "Peter's great confession — 'Thou art the Christ' — was made here at Caesarea Philippi."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/8?lang=eng", "t": "Mark 8:27–30", "why": "Mark's account of the same confession on this road."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/judg/18?lang=eng", "t": "Judges 18 (the tribe of Dan)", "why": "The tribe of Dan settled at neighboring Tel Dan."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/tu-es-o-cristo?lang=eng", "t": "▶Thou Art the Christ"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-teachings?lang=eng", "t": "▦Bible Videos – Teachings"}], "talmageRef": "Jesus the Christ · Chapter 22 — A Period of Darkening Opposition", "talmageText": "With deep solemnity, and as a soul-searching test for which the Twelve had been in unconscious preparation through many months of close and privileged companionship with their Lord, Jesus asked of them: \"But whom say ye that I am?\" Answering for all, but more particularly testifying as to his own conviction, Peter, with all the fervor of his soul, voiced the great confession: \"Thou art the Christ, the Son of the living God.\" This was no avowal of mere belief, no expression of a result at which he had arrived by mental process, no solution of a problem laboriously worked out, no verdict based on the weighing of evidence; he spoke in the sure knowledge that knows no question and from which doubt and reservation are as far removed as is the sky from the ground. \"And Jesus answered and said unto him, Blessed art thou, Simon Barjona: for flesh and blood hath not revealed it unto thee, but my Father which is in heaven.\" Peter's knowledge, which was also that of his brethren, was of a kind apart from all that man may find out for himself; it was a divine bestowal, in comparison with which human wisdom is foolishness and the treasure of earth but dross, Addressing Himself further to the first of the apostles, Jesus continued: \"And I say also unto thee, That thou art Peter, and upon this rock I will build my church; and the gates of hell shall not prevail against it. And I will give unto thee the keys of the kingdom of heaven: and whatsoever thou shalt bind on earth shall be bound in heaven: and whatsoever thou shalt loose on earth shall be loosed in heaven.\""}, "s20": {"name": "Mount Tabor", "kind": "mount", "blurb": "Traditional site of the Transfiguration.", "faiths": ["C", "J"], "talmage": true, "lat": 32.687, "lng": 35.3903, "desc": "A rounded, isolated dome rising 588 metres above the Jezreel Valley, honored since the 4th century as the traditional Mount of the <b>Transfiguration</b>, where Jesus’ face shone “as the sun” and Moses and Elijah appeared with Him before Peter, James, and John. The Church of the Transfiguration crowns the summit. (Talmage and many scholars note the higher slopes of Mount Hermon as an alternative location.) In the Hebrew Bible, Tabor is also where <b>Deborah and Barak</b> mustered Israel against Sisera. A <b>Christian and Jewish</b> mountain of revelation.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/17?lang=eng", "t": "Matthew 17:1–9 (the Transfiguration)", "why": "The Transfiguration, traditionally on this summit."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/9?lang=eng", "t": "Mark 9:2–10", "why": "Mark's account: raiment 'exceeding white as snow.'"}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/judg/4?lang=eng", "t": "Judges 4 (Deborah and Barak at Tabor)", "why": "Deborah and Barak mustered Israel on this same mountain."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-the-life-of-jesus-christ?lang=eng", "t": "▦Bible Videos – The Life of Jesus Christ"}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/gs/transfiguration?lang=eng", "t": "◆Guide to the Scriptures: Transfiguration"}], "talmageRef": "Jesus the Christ · Chapter 23 — The Transfiguration", "talmageText": "One purpose of the Lord's retirement was that of prayer, and a transcendent investiture of glory came upon Him as He prayed. The apostles had fallen asleep, but were awakened by the surpassing splendor of the scene, and gazed with reverent awe upon their glorified Lord. \"The fashion of his countenance was altered, and his raiment was white and glistering.\" His garments, though made of earth-woven fabric, \"became shining, exceeding white as snow; so as no fuller on earth can white them;\" \"and his face did shine as the sun.\" Thus was Jesus transfigured before the three privileged witnesses. With Him were two other personages, who also were in a state of glorified radiance, and who conversed with the Lord. These, as the apostles learned by means not stated though probably as gathered from the conversation in progress, were Moses and Elias, or more literally to us, Elijah; and the subject of their conference with Christ was \"his decease which he should accomplish at Jerusalem.\" As the prophet visitants were about to depart, \"Peter said unto Jesus, Master, it is good for us to be here: and let us make three tabernacles; one for thee, and one for Moses, and one for Elias: not knowing what he said.\" Undoubtedly Peter and his fellow apostles were bewildered, \"sore afraid\" indeed; and this condition may explain the suggestion respecting the three tabernacles."}, "s21": {"name": "Beit She’an (Scythopolis)", "kind": "ruins", "blurb": "Extensive Roman and Byzantine city ruins.", "faiths": ["J", "H"], "talmage": false, "lat": 32.5036, "lng": 35.5011, "desc": "One of the most spectacular archaeological parks in Israel: a vast Roman-Byzantine city (Scythopolis, chief city of the Decapolis) with a colonnaded main street, bathhouse, and a 7,000-seat theater—all overlooked by an ancient <b>tel</b> occupied for millennia. In the Hebrew Bible this is where the Philistines fastened the bodies of <b>King Saul and his sons</b> to the city wall after the battle of Mount Gilboa. Primarily a <b>Jewish-historical and archaeological</b> site conveying the grandeur of the Greco-Roman world Jesus’ generation knew.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/1-sam/31?lang=eng", "t": "1 Samuel 31:8–13 (Saul’s body on the wall of Beth-shan)", "why": "The Philistines fastened Saul's body to the wall of this very city."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/josh/17?lang=eng", "t": "Joshua 17:11", "why": "Beth-shean in the tribal allotment of Manasseh."}], "media": []}, "s22": {"name": "Gan HaShlosha (Sachne)", "kind": "water", "blurb": "Warm spring-fed pools (Sachne) for swimming.", "faiths": ["H"], "talmage": false, "lat": 32.5058, "lng": 35.4525, "desc": "A warm, spring-fed natural pool and park in the Harod Valley—turquoise water at a constant ~28°C beneath palms and small waterfalls, often ranked among the world’s most beautiful natural swimming spots. This is a <b>recreation and rest</b> stop rather than a religious site: a chance to swim and refresh in the same valley where Gideon famously tested his men at the spring of Harod (Judges 7).", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/judg/7?lang=eng", "t": "Judges 7:1–7 (the spring of Harod)", "why": "Gideon tested his men at the spring of Harod in this same valley."}], "media": []}, "s23": {"name": "Tomb of Lazarus & Church (Bethany)", "kind": "church", "blurb": "Bethany site of the raising of Lazarus.", "faiths": ["C", "M"], "talmage": true, "lat": 31.7714, "lng": 35.2603, "desc": "In Bethany (Arabic <b>al-Eizariya</b>, “place of Lazarus”) on the eastern slope of the Mount of Olives stands the traditional tomb where Jesus raised <b>Lazarus</b> after four days, declaring, “I am the resurrection, and the life.” This was the home of Mary, Martha, and Lazarus, a refuge the Savior loved during His final week. The greatest of the public miracles, it hardened the Sanhedrin’s resolve against Him. Honored by <b>Christians</b>; Lazarus is also remembered in <b>Islamic</b> tradition. A Franciscan church stands beside the rock-cut tomb.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/11?lang=eng", "t": "John 11:1–44 (the raising of Lazarus)", "why": "The raising of Lazarus at this tomb — 'I am the resurrection, and the life.'"}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/12?lang=eng", "t": "John 12:1–11 (supper at Bethany)", "why": "Supper at Bethany, days before the crucifixion, in this village."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/10?lang=eng", "t": "Luke 10:38–42 (Mary and Martha)", "why": "Mary and Martha's home — 'the good part' chosen here."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2014-11-0026-lazarus-is-raised-from-the-dead?lang=eng", "t": "▶Lazarus Is Raised from the Dead"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-miracles?lang=eng", "t": "▦Bible Videos – Miracles"}], "talmageRef": "Jesus the Christ · Chapter 28 — The Last Winter", "talmageText": "The sight of the two women so overcome by grief, and of the people wailing with them, caused Jesus to sorrow, so that He groaned in spirit and was deeply troubled. \"Where have ye laid him?\" He asked; and Jesus wept. As the sorrowing company went toward the tomb, some of the Jews, observing the Lord's emotion and tears, said: \"Behold how he loved him!\" but others, less sympathetic because of their prejudice against Christ, asked critically and reproachfully: \"Could not this man, which opened the eyes of the blind, have caused that even this man should not have died?\" The miracle by which a man blind from birth had been made to see was very generally known, largely because of the official investigation that had followed the healing. The Jews had been compelled to admit the actuality of the astounding occurrence; and the question now raised as to whether or why One who could accomplish such a wonder could not have preserved from death a man stricken with an ordinary illness, and that man one whom He seemed to have dearly loved, was an innuendo that the power possessed by Jesus was after all limited, and of uncertain or capricious operation. This manifestation of malignant unbelief caused Jesus again to groan with sorrow if not indignation. The body of Lazarus had been interred in a cave, the entrance to which was closed by a great block of stone. Such burial-places were common in that country, natural caves or vaults hewn in the solid rock being used as sepulchres by the better classes of people. Jesus directed that the tomb be opened."}, "s24": {"name": "Bethlehem (Overview)", "kind": "church", "blurb": "Overview of Bethlehem and its churches.", "faiths": ["C", "J", "M"], "talmage": true, "lat": 31.7054, "lng": 35.2024, "desc": "“The city of David,” 8 km south of Jerusalem, birthplace of King David and, as Micah foretold, of the Messiah. For <b>Christians</b> worldwide it is the place of the Nativity; for <b>Jews</b> it is bound to David and to Rachel’s tomb at its edge; it holds significance in <b>Islam</b> as well. Today a Palestinian city, its old center clusters around Manger Square. This overview stop frames the churches you will visit—the Nativity, the Milk Grotto, and Shepherd’s Field just outside town.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/micah/5?lang=eng", "t": "Micah 5:2 (out of Bethlehem shall come a ruler)", "why": "The prophecy naming Bethlehem as the Messiah's birthplace."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/ruth/1?lang=eng", "t": "Ruth 1–4 (set in Bethlehem)", "why": "Ruth's story unfolds in these fields — she is David's great-grandmother."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/2?lang=eng", "t": "Matthew 2:1–6", "why": "Herod's scribes cite Micah: the Christ is born here."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0067-the-nativity?lang=eng", "t": "▶The Nativity"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-nativity?lang=eng", "t": "▦Bible Videos – Nativity"}], "talmageRef": "Jesus the Christ · Chapter 8 — The Babe of Bethlehem", "talmageText": "The little town was crowded at the time, most likely by the multitude that had come in obedience to the same summons; and, in consequence, Joseph and Mary failed to find the most desirable accommodations and had to be content with the conditions of an improvised camp, as travelers unnumbered had done before, and as uncounted others have done since, in that region and elsewhere. We cannot reasonably regard this circumstance as evidence of extreme destitution; doubtless it entailed inconvenience, but it gives us no assurance of great distress or suffering. It was while she was in this situation that Mary the Virgin gave birth to her firstborn, the Son of the Highest, the Only Begotten of the Eternal Father, Jesus the Christ. But few details of attendant circumstances are furnished us. We are not told how soon the birth occurred after the arrival of Mary and her husband at Bethlehem. It may have been the purpose of the evangelist who made the record to touch upon matters of purely human interest as lightly as was consistent with the narration of fact, in order that the central truth might neither be hidden nor overshadowed by unimportant incident. We read in Holy Writ this only of the actual birth: \"And so it was, that, while they were there, the days were accomplished that she should be delivered. And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a manger; because there was no room for them at the inn.\""}, "s25": {"name": "Church of the Nativity", "kind": "church", "blurb": "Built over the traditional birthplace of Jesus.", "faiths": ["C", "M"], "talmage": true, "lat": 31.7042, "lng": 35.2073, "desc": "One of the oldest continuously used churches on earth (originally built by Constantine’s mother Helena, c. 339; rebuilt by Justinian), enclosing the <b>Grotto of the Nativity</b>, where a fourteen-pointed silver star marks the traditional birthplace of Jesus: <i>Hic de Virgine Maria Jesus Christus natus est</i>. A UNESCO World Heritage Site shared by Greek Orthodox, Armenian, and Roman Catholic communities, pilgrims enter through the humbling waist-high “Door of Humility.” The supreme <b>Christian</b> site of the Incarnation.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/2?lang=eng", "t": "Luke 2:1–20 (the birth of Jesus)", "why": "The birth narrative the grotto beneath this church commemorates."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/2?lang=eng", "t": "Matthew 2:1–11 (the wise men)", "why": "The wise men come to the house in Bethlehem."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/micah/5?lang=eng", "t": "Micah 5:2", "why": "The Micah prophecy fulfilled at this spot."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0067-the-nativity?lang=eng", "t": "▶The Nativity"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0043-glad-tidings-of-great-joy-the-birth-of-jesus-christ?lang=eng", "t": "▶Glad Tidings of Great Joy: The Birth of Jesus Christ"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0007-the-wise-men-seek-jesus?lang=eng", "t": "▶The Wise Men Seek Jesus"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-nativity?lang=eng", "t": "▦Bible Videos – Nativity"}], "talmageRef": "Jesus the Christ · Chapter 8 — The Babe of Bethlehem", "talmageText": "The little town was crowded at the time, most likely by the multitude that had come in obedience to the same summons; and, in consequence, Joseph and Mary failed to find the most desirable accommodations and had to be content with the conditions of an improvised camp, as travelers unnumbered had done before, and as uncounted others have done since, in that region and elsewhere. We cannot reasonably regard this circumstance as evidence of extreme destitution; doubtless it entailed inconvenience, but it gives us no assurance of great distress or suffering. It was while she was in this situation that Mary the Virgin gave birth to her firstborn, the Son of the Highest, the Only Begotten of the Eternal Father, Jesus the Christ. But few details of attendant circumstances are furnished us. We are not told how soon the birth occurred after the arrival of Mary and her husband at Bethlehem. It may have been the purpose of the evangelist who made the record to touch upon matters of purely human interest as lightly as was consistent with the narration of fact, in order that the central truth might neither be hidden nor overshadowed by unimportant incident. We read in Holy Writ this only of the actual birth: \"And so it was, that, while they were there, the days were accomplished that she should be delivered. And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a manger; because there was no room for them at the inn.\""}, "s26": {"name": "Milk Grotto", "kind": "church", "blurb": "Bethlehem grotto tied to the Holy Family's flight.", "faiths": ["C", "M"], "talmage": false, "lat": 31.704, "lng": 35.2078, "desc": "A soft white chalk cave-chapel steps from the Church of the Nativity, where tradition says the Holy Family sheltered during the flight into Egypt and a drop of <b>Mary’s milk</b> turned the rock white. Pilgrims—both <b>Christian and Muslim</b>, and famously couples hoping for children—venerate it as a place of prayer for fertility and safe childbirth. A quiet, devotional counterpoint to the grandeur of the neighboring basilica.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/2?lang=eng", "t": "Matthew 2:13–15 (the flight into Egypt)", "why": "The flight into Egypt — tradition holds the family sheltered in this grotto first."}], "media": []}, "s27": {"name": "Shepherd’s Field", "kind": "walk", "blurb": "Fields where shepherds heard the Nativity announcement.", "faiths": ["C"], "talmage": true, "lat": 31.7036, "lng": 35.2261, "desc": "On the edge of Beit Sahour, east of Bethlehem, the fields honored as the place where <b>the angel announced the Savior’s birth to shepherds</b> keeping watch by night: “Fear not… unto you is born this day… a Saviour.” A tent-shaped chapel and ancient cave-folds recall the humble first witnesses of the Good News. A tender <b>Christian</b> site—the message of “peace, good will toward men” given first to laborers in a field.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/2?lang=eng", "t": "Luke 2:8–20 (the shepherds and the angels)", "why": "The angelic announcement to shepherds keeping watch in these fields."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0005-shepherds-learn-of-the-birth-of-christ?lang=eng", "t": "▶Shepherds Learn of the Birth of Christ"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-nativity?lang=eng", "t": "▦Bible Videos – Nativity"}], "talmageRef": "Jesus the Christ · Chapter 8 — The Babe of Bethlehem", "talmageText": "From the period of its beginning, Bethlehem had been the home of people engaged mostly in pastoral and agricultural pursuits. It is quite in line with what is known of the town and its environs to find at the season of Messiah's birth, which was in the springtime of the year, that flocks were in the field both night and day under the watchful care of their keepers. Unto certain of these humble shepherds came the first proclamation that the Savior had been born. Thus runs the simple record: \"And there were in the same country shepherds abiding in the field, keeping watch over their flock by night. And, lo, the angel of the Lord came upon them, and the glory of the Lord shone round about them: and they were sore afraid. And the angel said unto them, Fear not: for, behold, I bring you good tidings of great joy, which shall be to all people. For unto you is born this day in the city of David a Saviour, which is Christ the Lord. And this shall be a sign unto you: Ye shall find the babe wrapped in swaddling clothes, lying in a manger. And suddenly there was with the angel a multitude of the heavenly host praising God, and saying, Glory to God in the highest, and on earth peace, good will toward men.\" Tidings of such import had never before been delivered by angel or received by man--good tidings of great joy, given to but few and those among the humblest of earth, but destined to spread to all people."}, "s28": {"name": "Western Wall (Kotel)", "kind": "walk", "blurb": "The great retaining wall of the Temple Mount; a place of prayer.", "faiths": ["J", "C", "M"], "talmage": true, "lat": 31.7767, "lng": 35.2345, "desc": "The exposed section of the massive retaining wall Herod the Great built to enlarge the Temple Mount—the holiest accessible place of prayer in <b>Judaism</b>, the closest point to where the Holy of Holies once stood. Jews have wept and prayed here for centuries (hence “Wailing Wall”), tucking written prayers between its ancient stones. Jesus worshipped and taught within this very Temple complex, and foretold its destruction, fulfilled in AD 70. It borders the Muslim-administered Haram al-Sharif above. A profound <b>Jewish</b> site of continuity and longing.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/21?lang=eng", "t": "Luke 21:5–6 (not one stone upon another)", "why": "'Not one stone upon another' — fulfilled in AD 70; these massive retaining stones survived."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/21?lang=eng", "t": "Matthew 21:12–14 (Jesus in the temple)", "why": "Jesus taught and healed in the temple courts that stood above this wall."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/1-kgs/6?lang=eng", "t": "1 Kings 6 (Solomon’s temple)", "why": "Solomon's temple — the first sanctuary on the mount behind these stones."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0039-jesus-cleanses-the-temple?lang=eng", "t": "▶Jesus Cleanses the Temple"}, {"href": "https://www.churchofjesuschrist.org/study/manual/gospel-topics/temples?lang=eng", "t": "◆Gospel Topics: Temples"}], "talmageRef": "Jesus the Christ · Chapter 30 — Jesus Returns to the Temple Daily", "talmageText": "Within the temple grounds Jesus was filled with indignation at the scene of tumult and desecration which the place presented. Three years before, at Passover time, He had been wrought up to a high state of righteous anger by a similar exhibition of sordid chaffering within the sacred precincts, and had driven out the sheep and oxen and forcibly expelled the traders and the money-changers and all who were using His Father's house as a house of merchandize. That was near the beginning of His public labor, and the vigorous action was among the first of His works to attract general attention; now, within four days of the cross, He cleared the courts again by casting out all \"them that sold and bought in the temple, and overthrew the tables of the moneychangers, and the seats of them that sold doves\"; nor would He suffer any to carry their buckets and baskets through the enclosure, as many were in the habit of doing, and so making the way a common thoroughfare. \"Is it not written,\" He demanded of them in wrath, \"My house shall be called of all nations the house of prayer? but ye have made it a den of thieves.\" On the former occasion, before He had declared or even confessed His Messiahship, He had designated the temple as \"My Father's house\"; now that He had openly avowed Himself to be the Christ, He called it \"My house.\" The expressions are in a sense synonymous; He and the Father were and are one in possession and dominion."}, "s29": {"name": "The Garden Tomb", "kind": "church", "blurb": "Quiet garden and rock tomb, an alternate site of the burial.", "faiths": ["C", "L"], "talmage": true, "lat": 31.784, "lng": 35.2296, "desc": "A peaceful walled garden outside the north wall of the Old City containing a rock-hewn first-century tomb and, nearby, a skull-shaped escarpment (“Gordon’s Calvary”). Proposed in the 19th century as an alternative site of the <b>crucifixion and burial</b>, it is cherished especially by <b>Protestants and Latter-day Saints</b> for its quiet, garden setting—“in the place where he was crucified there was a garden; and in the garden a new sepulchre.” Latter-day Saint groups often hold reverent services here to testify, “He is not here: for he is risen.”", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/19?lang=eng", "t": "John 19:41–42 (a garden; a new sepulchre)", "why": "'A garden; a new sepulchre' — the verses that inspired this site's identification."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/28?lang=eng", "t": "Matthew 28:1–8 (He is risen)", "why": "'He is not here: for he is risen' — the message of the empty tomb."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/20?lang=eng", "t": "John 20:1–18 (Mary in the garden)", "why": "Mary meets the risen Lord in the garden."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0025-he-is-risen?lang=eng", "t": "▶He Is Risen"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0021-jesus-is-resurrected?lang=eng", "t": "▶Jesus Is Resurrected"}, {"href": "https://www.churchofjesuschrist.org/media/video/2014-01-0010-the-risen-lord-appears-to-the-apostles?lang=eng", "t": "▶The Risen Lord Appears to the Apostles"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-final-events?lang=eng", "t": "▦Bible Videos – Final Events"}], "talmageRef": "Jesus the Christ · Chapter 37 — The Resurrection and the Ascension", "talmageText": "At the earliest indication of dawn, the devoted Mary Magdalene and other faithful women set out for the tomb, bearing spices and ointments which they had prepared for the further anointing of the body of Jesus. Some of them had been witnesses of the burial, and were conscious of the necessary haste with which the corpse had been wrapped with spicery and laid away by Joseph and Nicodemus, just before the beginning of the Sabbath; and now these adoring women came early to render loving service in a more thorough anointing and external embalmment of the body. On the way as they sorrowfully conversed, they seemingly for the first time thought of the difficulty of entering the tomb. \"Who shall roll us away the stone from the door of the sepulchre?\" they asked one of another. Evidently they knew nothing of the seal and the guard of soldiery. At the tomb they saw the angel, and were afraid; but he said unto them: \"Fear not ye: for I know that ye seek Jesus, which was crucified. He is not here: for he is risen, as he said. Come, see the place where the Lord lay. And go quickly, and tell his disciples that he is risen from the dead; and, behold, he goeth before you into Galilee; there shall ye see him: lo, I have told you.\" The women, though favored by angelic visitation and assurance, left the place amazed and frightened. Mary Magdalene appears to have been the first to carry word to the disciples concerning the empty tomb."}, "s30": {"name": "St. Peter in Gallicantu", "kind": "church", "blurb": "Church marking Peter's denial, on Mount Zion's slope.", "faiths": ["C"], "talmage": true, "lat": 31.7716, "lng": 35.2294, "desc": "A church on the eastern slope of Mount Zion (Latin <i>gallicantu</i>, “cock-crow”) marking the traditional <b>palace of the high priest Caiaphas</b>, where Jesus was interrogated the night of His arrest—and where <b>Peter denied Him three times</b> before the cock crew. Beneath the church are ancient cisterns and a pit that may have served as a holding cell; a first-century stepped street outside is one Jesus likely walked between Gethsemane and trial. A poignant <b>Christian</b> site of human weakness and later restoration.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/26?lang=eng", "t": "Matthew 26:57–75 (Caiaphas; Peter’s denial)", "why": "Caiaphas's night interrogation and Peter's three denials — the events this church marks."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/22?lang=eng", "t": "Luke 22:54–62", "why": "The Lord turned and looked at Peter as the cock crew."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/18?lang=eng", "t": "John 18:15–27", "why": "John's account — the 'other disciple' gets Peter into the courtyard."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0016-jesus-is-tried-by-caiaphas-peter-denies-knowing-him?lang=eng", "t": "▶Jesus Is Tried by Caiaphas; Peter Denies Knowing Him"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-final-events?lang=eng", "t": "▦Bible Videos – Final Events"}], "talmageRef": "Jesus the Christ · Chapter 34 — The Trial and Condemnation", "talmageText": "When Jesus was taken into custody in the Garden of Gethsemane, all the Eleven forsook Him and fled. This is not to be accounted as certain evidence of cowardice, for the Lord had indicated that they should go. Peter and at least one other disciple followed afar off; and, after the armed guard had entered the palace of the high priest with their Prisoner, Peter \"went in, and sat with the servants to see the end.\" He was assisted in securing admittance by the unnamed disciple, who was on terms of acquaintanceship with the high priest. That other disciple was in all probability John, as may be inferred from the fact that he is mentioned only in the fourth Gospel, the author of which characteristically refers to himself anonymously. While Jesus was before the Sanhedrists, Peter remained below with the servants. The attendant at the door was a young woman; her feminine suspicions had been aroused when she admitted Peter, and as he sat with a crowd in the palace court she came up, and having intently observed him, said: \"Thou also wast with Jesus of Galilee.\" But Peter denied, averring he did not know Jesus. Peter was restless; his conscience and the fear of identification as one of the Lord's disciples troubled him. He left the crowd and sought partial seclusion in the porch; but there another maid spied him out, and said to those nearby: \"This fellow was also with Jesus of Nazareth\"; to which accusation Peter replied with an oath: \"I do not know the man.\""}, "s31": {"name": "The Cenacle (Upper Room)", "kind": "church", "blurb": "Traditional Upper Room of the Last Supper.", "faiths": ["C", "J"], "talmage": true, "lat": 31.7717, "lng": 35.2292, "desc": "A vaulted hall on Mount Zion venerated as the site of the <b>Upper Room</b>—where Jesus ate the Last Supper with the Twelve, washed their feet, and instituted the sacrament, and where the disciples later gathered at <b>Pentecost</b> when the Holy Ghost descended. The current Gothic room sits above the traditional <b>Tomb of David</b>, making the building sacred to both <b>Christians</b> and <b>Jews</b>. A cornerstone site of the institution of the sacrament and the birth of the New Testament Church.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/22?lang=eng", "t": "Luke 22:7–20 (the Last Supper)", "why": "The Last Supper in the 'large upper room' this hall commemorates."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/13?lang=eng", "t": "John 13–17 (the upper-room discourse)", "why": "The washing of feet and the farewell discourse, given at that supper."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/acts/2?lang=eng", "t": "Acts 2:1–4 (Pentecost)", "why": "Pentecost — the Spirit descends on the disciples gathered in the upper room."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0013-the-last-supper?lang=eng", "t": "▶The Last Supper"}, {"href": "https://www.churchofjesuschrist.org/media/video/2014-01-0007-to-this-end-was-i-born?lang=eng", "t": "▶To This End Was I Born"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-final-events?lang=eng", "t": "▦Bible Videos – Final Events"}], "talmageRef": "Jesus the Christ · Chapter 33 — The Last Supper and the Betrayal", "talmageText": "The day preceding the eating of the passover lamb had come to be known among the Jews as the first day of the feast of unleavened bread, since on that day all leaven had to be removed from their dwellings, and thereafter for a period of eight days the eating of anything containing leaven was unlawful. On the afternoon of this day, the paschal lambs were slain within the temple court, by the representatives of families or companies who were to eat together; and a portion of the blood of each lamb was sprinkled at the foot of the altar of sacrifice by one of the numerous priests on duty for the day. The slain lamb, then said to have been sacrificed, was borne away to the appointed gathering place of those by whom it was to be eaten. During the first of the days of unleavened bread, which in the year of our Lord's death appears to have fallen on Thursday, some of the Twelve inquired of Jesus where they should make preparations for the paschal meal. He instructed Peter and John to return to Jerusalem, and added: \"Behold, when ye are entered into the city, there shall a man meet you, bearing a pitcher of water; follow him into the house where he entereth in. And ye shall say unto the goodman of the house, The Master saith unto thee, Where is the guest chamber, where I shall eat the passover with my disciples? And he shall shew you a large upper room furnished: there make ready. And they went, and found as he had said unto them: and they made ready the passover.\""}, "s32": {"name": "Dormition Abbey", "kind": "church", "blurb": "Mount Zion abbey marking Mary's repose.", "faiths": ["C"], "talmage": false, "lat": 31.7715, "lng": 35.2286, "desc": "A striking German Benedictine basilica on Mount Zion (consecrated 1910) honoring the tradition of the <b>Dormition</b>—the “falling asleep” (death) of the Virgin Mary. Its cone-topped tower is a landmark of the skyline; inside, a crypt holds a carved effigy of Mary at rest, ringed by chapels donated by nations. A <b>Christian</b> (Catholic) site of Marian devotion, next door to the Cenacle.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/19?lang=eng", "t": "John 19:25–27 (behold thy mother)", "why": "'Behold thy mother' — Jesus entrusts Mary to John from the cross."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/acts/1?lang=eng", "t": "Acts 1:14 (Mary with the disciples)", "why": "Mary's last scriptural mention: praying with the disciples in Jerusalem."}], "media": []}, "s33": {"name": "Church of the Holy Sepulchre", "kind": "church", "blurb": "Church over the traditional Golgotha and the tomb.", "faiths": ["C"], "talmage": true, "lat": 31.7784, "lng": 35.2297, "desc": "The most sacred church in <b>Christianity</b> for the majority of the world’s Christians—built over the sites traditionally identified as <b>Golgotha (Calvary)</b>, where Jesus was crucified, and the nearby rock-cut <b>tomb</b> where He was buried and rose again. Established by Constantine in the 4th century, it shelters under one roof the last Stations of the Cross, the Stone of Anointing, and the <b>Aedicule</b> enclosing the empty tomb. It is shared, by ancient arrangement, among Greek Orthodox, Armenian, Roman Catholic, Coptic, Syriac, and Ethiopian communities.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/19?lang=eng", "t": "John 19:16–42 (crucifixion and burial)", "why": "Crucifixion and burial — the two sites sheltered under this one roof."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/23?lang=eng", "t": "Luke 23:33–56", "why": "Luke's account of Calvary and the borrowed tomb."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/28?lang=eng", "t": "Matthew 28:1–6 (the empty tomb)", "why": "The empty tomb — the Aedicule encloses the traditional site."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0019-jesus-is-scourged-and-crucified?lang=eng", "t": "▶Jesus Is Scourged and Crucified"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0020-jesus-is-laid-in-a-tomb?lang=eng", "t": "▶Jesus Is Laid in a Tomb"}, {"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0025-he-is-risen?lang=eng", "t": "▶He Is Risen"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-final-events?lang=eng", "t": "▦Bible Videos – Final Events"}], "talmageRef": "Jesus the Christ · Chapter 35 — Death and Burial", "talmageText": "Then they crucified Him, on the central cross of three, and placed one of the condemned malefactors on His right hand, the other on His left. Thus was realized Isaiah's vision of the Messiah numbered among the transgressors. But few details of the actual crucifixion are given us. We know however that our Lord was nailed to the cross by spikes driven through the hands and feet, as was the Roman method, and not bound only by cords as was the custom in inflicting this form of punishment among some other nations. Death by crucifixion was at once the most lingering and most painful of all forms of execution. The victim lived in ever increasing torture, generally for many hours, sometimes for days. The spikes so cruelly driven through hands and feet penetrated and crushed sensitive nerves and quivering tendons, yet inflicted no mortal wound. The welcome relief of death came through the exhaustion caused by intense and unremitting pain, through localized inflammation and congestion of organs incident to the strained and unnatural posture of the body. As the crucifiers proceeded with their awful task, not unlikely with roughness and taunts, for killing was their trade and to scenes of anguish they had grown callous through long familiarity, the agonized Sufferer, void of resentment but full of pity for their heartlessness and capacity for cruelty, voiced the first of the seven utterances delivered from the cross."}, "s34": {"name": "Masada", "kind": "mount", "blurb": "Herod's desert fortress above the Dead Sea.", "faiths": ["J", "H"], "talmage": false, "lat": 31.3157, "lng": 35.3539, "desc": "Herod the Great’s cliff-top desert palace-fortress above the Dead Sea, reached by cable car or the winding Snake Path. After the fall of Jerusalem in AD 70, it became the last stronghold of <b>Jewish zealots</b>, who—according to Josephus—chose death over Roman enslavement when the legion finally breached the wall in AD 73. The Roman siege ramp is still visible. A powerful <b>Jewish-national and historical</b> site symbolizing freedom and resolve; sunrise from the summit is unforgettable.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/ps/18?lang=eng", "t": "Psalm 18:2 (the Lord is my rock and fortress)", "why": "'The Lord is my rock and my fortress' — the desert-stronghold image this mesa embodies."}], "media": []}, "s35": {"name": "Dead Sea Float", "kind": "water", "blurb": "The lowest point on earth; float in mineral water.", "faiths": ["H"], "talmage": false, "lat": 31.5, "lng": 35.45, "desc": "The lowest point on the surface of the earth (~430 m below sea level) and, at roughly ten times the salinity of the ocean, so buoyant that swimmers float effortlessly. Mineral-rich mud is prized for the skin. Biblically this is the region of Sodom and Gomorrah and near the caves of <b>Qumran</b>, where the Dead Sea Scrolls were found. A <b>geographical and recreational</b> highlight—float, don’t swim, and keep the water out of your eyes.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/gen/19?lang=eng", "t": "Genesis 19 (the cities of the plain)", "why": "Sodom and Gomorrah — the cities of this plain."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/ezek/47?lang=eng", "t": "Ezekiel 47:8–10 (healing of the waters)", "why": "Ezekiel's vision of these very waters healed and teeming with fish."}], "media": []}, "s36": {"name": "Qasr al-Yahud Baptismal Site", "kind": "water", "blurb": "Jordan River site of Jesus's baptism.", "faiths": ["C", "J"], "talmage": true, "lat": 31.837, "lng": 35.535, "desc": "The traditional site on the <b>Jordan River</b>, near Jericho, where John baptized Jesus—“and straightway coming up out of the water… the Spirit like a dove descending upon him.” By tradition it is also where Israel crossed into the Promised Land under Joshua and where Elijah was taken up. Pilgrims descend stone steps to be baptized or renew covenants in the river. A deeply meaningful <b>Christian</b> site of the Savior’s baptism—fulfilling “all righteousness”—with strong <b>Jewish</b> resonance as well.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/3?lang=eng", "t": "Matthew 3:13–17 (the baptism of Jesus)", "why": "Jesus baptized by John in this stretch of the Jordan — 'to fulfil all righteousness.'"}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/1?lang=eng", "t": "Mark 1:9–11", "why": "The dove descends and the Father's voice is heard."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/josh/3?lang=eng", "t": "Joshua 3–4 (crossing the Jordan)", "why": "Israel crossed the Jordan near here into the promised land."}], "media": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/gs/baptism-baptize?lang=eng", "t": "◆Guide to the Scriptures: Baptism"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-the-life-of-jesus-christ?lang=eng", "t": "▦Bible Videos – The Life of Jesus Christ"}], "talmageRef": "Jesus the Christ · Chapter 10 — In the Wilderness of Judea", "talmageText": "When Jesus \"began to be about thirty years of age,\" He journeyed from His home in Galilee \"to Jordan unto John, to be baptized of him. But John forbad him, saying, I have need to be baptized of thee, and comest thou to me? And Jesus answering said unto him, Suffer it to be so now; for thus it becometh us to fulfil all righteousness. Then he suffered him.\" John and Jesus were second cousins; as to whether there had existed any close companionship between the two as boys or men we are not told. It is certain, however, that when Jesus presented Himself for baptism, John recognized in Him a sinless Man who stood in no need of repentance; and, as the Baptist had been commissioned to baptize for the remission of sins, he saw no necessity of administering the ordinance to Jesus. He who had received the confessions of multitudes now reverently confessed to One whom he knew was more righteous than himself. In the light of later events it appears that at this time John did not know that Jesus was the Christ, the Mightier One for whom he waited and whose forerunner he knew himself to be. When John expressed his conviction that Jesus needed no baptismal cleansing, our Lord, conscious of His own sinlessness, did not deny the Baptist's imputation, but nevertheless pressed His application for baptism with the significant explanation: \"Thus it becometh us to fulfil all righteousness.\""}, "s37": {"name": "Jericho", "kind": "ruins", "blurb": "One of the world's oldest continuously settled towns.", "faiths": ["J", "C", "H"], "talmage": true, "lat": 31.8667, "lng": 35.4441, "desc": "“The oldest city in the world” and the lowest, in the Jordan Valley near the Dead Sea. In the Hebrew Bible its walls fell before <b>Joshua</b> and Israel; in the Gospels Jesus passed through on His last journey to Jerusalem, healing blind <b>Bartimaeus</b> (“thy faith hath made thee whole”) and calling the tax collector <b>Zacchaeus</b> down from the sycamore tree (“today is salvation come to this house”). The traditional <b>Mount of Temptation</b> rises above the city. Rich in <b>Jewish and Christian</b> history.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/josh/6?lang=eng", "t": "Joshua 6 (the walls of Jericho)", "why": "The walls fell at this ancient tel."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/19?lang=eng", "t": "Luke 19:1–10 (Zacchaeus)", "why": "Zacchaeus climbed the sycamore here — 'today is salvation come to this house.'"}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/10?lang=eng", "t": "Mark 10:46–52 (blind Bartimaeus)", "why": "Blind Bartimaeus healed on the Jericho road — 'thy faith hath made thee whole.'"}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2014-01-0005-christ-and-the-rich-young-ruler?lang=eng", "t": "▶Christ and the Rich Young Ruler"}, {"href": "https://www.churchofjesuschrist.org/media/collection/bible-videos-the-life-of-jesus-christ?lang=eng", "t": "▦Bible Videos – The Life of Jesus Christ"}], "talmageRef": "Jesus the Christ · Chapter 29 — On to Jerusalem", "talmageText": "In the course of His journey Jesus came to Jericho, at or near which city He again exerted His wondrous power in opening the eyes of the blind. Matthew states that two sightless men were made to see, and that the miracle was enacted as Jesus was leaving Jericho; Mark mentions but one blind man, whom he names Bartimeus or the son of Timeus, and agrees with Matthew in saying that the healing was effected when Jesus was departing from the city; Luke specifies but one subject of the Lord's healing mercy, \"a certain blind man,\" and chronicles the miracle as an incident of Christ's approach to Jericho. These slight variations attest the independent authorship of each of the records, and the apparent discrepancies have no direct bearing upon the main facts, nor do they detract from the instructional value of the Lord's work. As we have found to be the case on an earlier occasion, two men were mentioned though but one figures in the circumstantial accounts. The man who is more particularly mentioned, Bartimeus, sat by the wayside, asking alms. Jesus approached, accompanied by the apostles, many other disciples, and a great multitude of people, probably made up largely of travelers on their way to Jerusalem to attend the Passover festival, the time for which was about a week ahead. Hearing the tramp of so great a company the sightless beggar inquired what it all meant, and was answered, \"Jesus of Nazareth passeth by.\" Eager lest the opportunity of gaining the Master's attention be lost, he immediately cried in a loud voice: \"Jesus, thou son of David, have mercy on me.\""}, "s38": {"name": "Haram al-Sharif (Temple Mount)", "kind": "walk", "blurb": "The Temple Mount platform and Dome of the Rock.", "faiths": ["M", "J", "C"], "talmage": true, "lat": 31.778, "lng": 35.2354, "desc": "The great raised platform sacred to three faiths. To <b>Jews</b> it is <b>Har HaBayit</b>, site of Solomon’s and Herod’s Temples and the Holy of Holies—the most sacred place in Judaism. To <b>Muslims</b> it is the <b>Haram al-Sharif</b> (“Noble Sanctuary”), third-holiest site in Islam, crowned by the golden <b>Dome of the Rock</b> and the <b>Al-Aqsa Mosque</b>, from which tradition holds Muhammad ascended (the Night Journey). To <b>Christians</b> it is where Jesus taught, overturned the money-changers’ tables, and foretold the Temple’s fall. Non-Muslims may visit the platform at set hours but may not enter the shrines or pray publicly.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/21?lang=eng", "t": "Matthew 21:12–16 (cleansing the temple)", "why": "Jesus cleansed the temple on this platform in His final week."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/2?lang=eng", "t": "John 2:13–22", "why": "The first cleansing — 'destroy this temple, and in three days I will raise it up.'"}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/2-chr/3?lang=eng", "t": "2 Chronicles 3 (Solomon builds on Mount Moriah)", "why": "Solomon built the first temple on this hill, Mount Moriah."}], "media": [{"href": "https://www.churchofjesuschrist.org/media/video/2011-10-0039-jesus-cleanses-the-temple?lang=eng", "t": "▶Jesus Cleanses the Temple"}, {"href": "https://www.churchofjesuschrist.org/study/manual/gospel-topics/jerusalem?lang=eng", "t": "◆Gospel Topics: Jerusalem"}], "talmageRef": "Jesus the Christ · Chapter 30 — Jesus Returns to the Temple Daily", "talmageText": "Within the temple grounds Jesus was filled with indignation at the scene of tumult and desecration which the place presented. Three years before, at Passover time, He had been wrought up to a high state of righteous anger by a similar exhibition of sordid chaffering within the sacred precincts, and had driven out the sheep and oxen and forcibly expelled the traders and the money-changers and all who were using His Father's house as a house of merchandize. That was near the beginning of His public labor, and the vigorous action was among the first of His works to attract general attention; now, within four days of the cross, He cleared the courts again by casting out all \"them that sold and bought in the temple, and overthrew the tables of the moneychangers, and the seats of them that sold doves\"; nor would He suffer any to carry their buckets and baskets through the enclosure, as many were in the habit of doing, and so making the way a common thoroughfare. \"Is it not written,\" He demanded of them in wrath, \"My house shall be called of all nations the house of prayer? but ye have made it a den of thieves.\" On the former occasion, before He had declared or even confessed His Messiahship, He had designated the temple as \"My Father's house\"; now that He had openly avowed Himself to be the Christ, He called it \"My house.\" The expressions are in a sense synonymous; He and the Father were and are one in possession and dominion."}, "s39": {"name": "Davidson Center / Southern Temple Steps", "kind": "ruins", "blurb": "Excavations at the southern Temple Mount steps.", "faiths": ["J", "C", "H"], "talmage": false, "lat": 31.7758, "lng": 35.2353, "desc": "The Jerusalem Archaeological Park at the southern wall of the Temple Mount, where the broad <b>Hulda-gate steps</b> that pilgrims (including Jesus) climbed to enter the Temple survive largely intact. You can see <b>Robinson’s Arch</b>, the fallen stones toppled by Rome in AD 70, ritual immersion baths (<i>mikva’ot</i>), and the paved street below. A superb <b>archaeological and Jewish-Christian</b> site that brings the Temple of Jesus’ day vividly to life—these are literally the steps of Second-Temple worship.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/2?lang=eng", "t": "Luke 2:41–46 (Jesus in the temple courts)", "why": "The boy Jesus was found in the temple courts, entered by these very steps."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/acts/3?lang=eng", "t": "Acts 3:1–10 (Peter and John at the temple)", "why": "Peter and John heal the lame man at the temple gate."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/ps/24?lang=eng", "t": "Psalm 24 (who shall ascend the hill of the Lord?)", "why": "'Who shall ascend the hill of the Lord?' — sung on this ascent."}], "media": []}, "s40": {"name": "Notre Dame of Jerusalem", "kind": "church", "blurb": "Landmark guesthouse and church near the New Gate.", "faiths": ["C"], "talmage": false, "lat": 31.7797, "lng": 35.2276, "desc": "A grand stone pilgrim guesthouse and cultural center built by French Catholics in the late 19th century, just outside the New Gate of the Old City. Owned today by the Vatican, it offers a rooftop with sweeping views, a well-known restaurant, and the <b>Shroud of Turin</b> exhibition center. Primarily a <b>Christian hospitality and cultural</b> stop—a comfortable vantage from which to take in the Old City walls.", "scriptures": [], "media": []}, "s41": {"name": "Mahane Yehuda Market to Jaffa Gate", "kind": "walk", "blurb": "Market walk from Machane Yehuda into the Old City.", "faiths": ["J", "H"], "talmage": false, "lat": 31.7857, "lng": 35.2125, "desc": "A walk through <b>living Jerusalem</b>: from the bustling <b>Mahane Yehuda</b> (“the shuk”)—a sensory feast of spices, produce, bakeries, and cafes that turns to nightlife after dark—down Jaffa Road toward the historic <b>Jaffa Gate</b>, the main western entrance to the Old City since Ottoman times. This is chiefly a <b>cultural and civic</b> stroll, a chance to feel the pulse of the modern city and the Friday pre-Sabbath rush before it grows quiet at sundown.", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/ps/122?lang=eng", "t": "Psalm 122 (Jerusalem, whither the tribes go up)", "why": "'Whither the tribes go up' — pilgrims still stream along this route toward the gates."}], "media": []}, "s42": {"name": "Pools of Bethesda", "kind": "ruins", "faiths": ["C"], "lat": 31.7815, "lng": 35.2363, "blurb": "Twin pools by the Sheep Gate where Jesus healed the man infirm 38 years.", "desc": "Beside the Church of St. Anne near Lions' Gate lie the excavated twin pools of Bethesda, with their five porticoes noted by John. Here Jesus asked a man crippled for thirty-eight years, 'Wilt thou be made whole?' — and healed him on the sabbath, igniting the first open conflict with the Jerusalem authorities over His divine authority. The adjacent Crusader church of St. Anne, famed for its long echo, honors the traditional birthplace of Mary.", "talmage": true, "talmageRef": "Jesus the Christ · Chapter 15 — The 'Man' Who Was Healed", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/5?lang=eng", "t": "John 5:1–16 (Wilt thou be made whole?)", "why": "The healing of the infirm man happened at these twin pools by the Sheep Gate."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/5?lang=eng&id=p17-p30#p17", "t": "John 5:17–30 (The Son and the Father)", "why": "The sabbath healing here sparked Jesus' great discourse on His divine authority."}], "media": [], "talmageText": "The Bethesda pool was wholly or partly enclosed; and five porches had been built for the shelter of those who waited at the spring for the intermittent bubbling up of the water.\n\nOn a certain Sabbath day, Jesus visited the pool and saw many afflicted folk thus waiting. Among them lay a man who for thirty-eight years had been grievously afflicted. From the man’s statement of his helplessness we may infer that his malady was paralysis, or possibly an extreme form of rheumatism; whatever his affliction, it was so disabling as to give him little chance of getting into the pool at the critical time, for others less crippled crowded him away.\n\nJesus recognized in the man a fit subject for blessing, and said to him: “Wilt thou be made whole?” … The man’s attention was drawn to Him, fixed upon Him; the question aroused in the sufferer’s heart renewed yearning for the health and strength of which he had been bereft since the days of his youth. His answer was pitiful, and revealed his almost hopeless state of mind; he thought only of the rumored virtues of Bethesda pool, as he said: “Sir, I have no man, when the water is troubled, to put me into the pool: but while I am coming, another steppeth down before me.” Then spake Jesus: “Rise, take up thy bed, and walk.” Immediately strength returned to the man, who for nearly four decades had been a helpless invalid; he obeyed the Master, and, taking up the little mattress or pallet on which he had rested, walked away."}, "s43": {"name": "Via Dolorosa", "kind": "walk", "faiths": ["C"], "lat": 31.78, "lng": 35.231, "blurb": "The traditional Way of Sorrows from Pilate's judgment to Golgotha.", "desc": "Winding from the site of the Antonia Fortress through the Old City's markets to the Church of the Holy Sepulchre, the Via Dolorosa traces the traditional route Jesus walked under the cross. Its fourteen stations — some scriptural, some traditional — have been walked by pilgrims for centuries. The route today threads a living, noisy city, much as it would have on that Friday morning.", "talmage": true, "talmageRef": "Jesus the Christ · Chapter 35 — Death and Burial", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/19?lang=eng", "t": "John 19:16–17 (Bearing his cross)", "why": "The route commemorates this walk — from Pilate's judgment hall out to Golgotha."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/23?lang=eng", "t": "Luke 23:26–31 (Simon of Cyrene; daughters of Jerusalem)", "why": "The events along the way — Simon compelled to carry the cross, the women who mourned."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/15?lang=eng", "t": "Mark 15:16–22 (From the Praetorium to Golgotha)", "why": "Mark traces the same path from the soldiers' hall to the place of the skull."}], "media": [], "talmageText": "The sentence of death by crucifixion required that the condemned person carry the cross upon which he was to suffer. Jesus started on the way bearing His cross. The terrible strain of the preceding hours, the agony in Gethsemane, the barbarous treatment He had suffered in the palace of the high priest, the humiliation and cruel usage to which He had been subjected before Herod, the frightful scourging under Pilate’s order, the brutal treatment by the inhuman soldiery, together with the extreme humiliation and the mental agony of it all, had so weakened His physical organism that He moved but slowly under the burden of the cross. The soldiers, impatient at the delay, peremptorily impressed into service a man whom they met coming into Jerusalem from the country, and him they compelled to carry the cross of Jesus. … The man so forced to walk in the footsteps of Jesus, bearing the cross upon which the Savior of the world was to consummate His glorious mission, was Simon, a native of Cyrene.\n\nAlong the city streets, out through the portal of the massive wall, and thence to a place beyond but yet nigh unto Jerusalem, the cortege advanced. The destination was a spot called Golgotha, or Calvary, meaning “the place of a skull.”"}, "s44": {"name": "Valley of Elah", "kind": "mount", "faiths": ["J", "C"], "lat": 31.6906, "lng": 34.9631, "blurb": "The brook-cut valley where David felled Goliath.", "desc": "In this broad valley of the Shephelah the armies of Israel and Philistia faced each other across the brook, and a shepherd boy from Bethlehem answered the giant of Gath with five smooth stones and the name of the Lord of Hosts. The terrain still reads exactly as 1 Samuel describes it — two ridgelines, the valley floor, and the stream bed between.", "talmage": false, "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/1-sam/17?lang=eng", "t": "1 Samuel 17 (David and Goliath)", "why": "The battle happened in this valley — the brook here supplied the five smooth stones."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/1-sam/21?lang=eng", "t": "1 Samuel 21:8–9 (Goliath's sword at Nob)", "why": "The giant's sword taken in this valley resurfaces later in David's story."}], "media": []}, "s45": {"name": "Bell Caves (Beit Guvrin)", "kind": "ruins", "faiths": ["J", "C"], "lat": 31.6111, "lng": 34.8989, "blurb": "Vast bell-shaped quarry caverns of ancient Maresha.", "desc": "Hundreds of bell-shaped caverns, quarried from the soft chalk over centuries, honeycomb the ground at Beit Guvrin–Maresha. The biblical city of Mareshah guarded this corner of the Shephelah — fortified by Rehoboam and named by the prophet Micah, whose hometown lay nearby. Light falls through the quarry openings above; the acoustics invite a hymn.", "talmage": false, "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/2-chr/11?lang=eng", "t": "2 Chronicles 11:5–12 (Rehoboam fortifies Mareshah)", "why": "Mareshah — this site — was one of Rehoboam's fortified cities of Judah."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/micah/1?lang=eng", "t": "Micah 1:15 (Micah names Mareshah)", "why": "The prophet from the neighboring Shephelah wove this town into his prophecy."}], "media": []}, "s46": {"name": "Lachish", "kind": "ruins", "faiths": ["J"], "lat": 31.5647, "lng": 34.8486, "blurb": "Judah's great fortress city, besieged by Sennacherib.", "desc": "Second only to Jerusalem in the kingdom of Judah, Lachish fell to Sennacherib's siege ramp in 701 BC — an assault the Assyrians carved in stone relief for the palace at Nineveh, and the excavated ramp still climbs the tel. A century later the Babylonians took it again; the famous Lachish Letters, scratched on pottery in the city's final days, mention the signal fires of a kingdom going dark.", "talmage": false, "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/2-kgs/18?lang=eng", "t": "2 Kings 18:13–17 (Sennacherib at Lachish)", "why": "From his siege camp at this city the Assyrian king sent his envoys up to threaten Jerusalem."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/jer/34?lang=eng", "t": "Jeremiah 34:6–7 (Lachish and Azekah, last to stand)", "why": "In Judah's final days only this fortress and Azekah still held out against Babylon."}], "media": []}, "s47": {"name": "Bethphage", "kind": "church", "faiths": ["C"], "lat": 31.7778, "lng": 35.2519, "blurb": "Where the triumphal entry began — the colt was fetched here.", "desc": "At this village on the eastern shoulder of the Mount of Olives, Jesus sent two disciples to bring the donkey colt 'whereon never man sat,' and from here the procession of palms began its descent toward the city. The Franciscan chapel preserves a medieval mounting stone long associated with the event, and Palm Sunday processions still begin here each year.", "talmage": true, "talmageRef": "Jesus the Christ · Chapter 29 — On to Jerusalem", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/21?lang=eng", "t": "Matthew 21:1–9 (The triumphal entry begins)", "why": "The colt was fetched from this village, and the procession of palms started here."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/zech/9?lang=eng", "t": "Zechariah 9:9 (Thy King cometh, riding upon a colt)", "why": "The prophecy Jesus deliberately fulfilled by mounting the colt at this spot."}], "media": [], "talmageText": "While still in Bethany or in the neighboring village of Bethphage, and according to John’s account on the next day after the supper at Simon’s house, Jesus directed two of His disciples to go to a certain place, where, He told them, they would find an ass tied, and with her a colt on which no man had ever sat. These they were to bring to Him. If stopped or questioned they were to say the Lord had need of the animals. … The disciples found all to be as the Lord had said. They brought the colt to Jesus, spread their coats on the gentle creature’s back, and set the Master thereon. The company started toward Jerusalem, Jesus riding in their midst.\n\nThe people were jubilant over the spectacle of Jesus riding toward the holy city; they spread out their garments, and cast palm fronds and other foliage in His path, thus carpeting the way as for the passing of a king. For the time being He was their king, and they His adoring subjects. The voices of the multitude sounded in reverberating harmony: “Blessed be the King that cometh in the name of the Lord: peace in heaven, and glory in the highest”; and again: “Hosanna to the son of David: Blessed is he that cometh in the name of the Lord; Hosanna in the highest.”"}, "s48": {"name": "Dominus Flevit", "kind": "church", "faiths": ["C"], "lat": 31.7778, "lng": 35.2439, "blurb": "'The Lord wept' — the teardrop chapel over the city view.", "desc": "Halfway down the Mount of Olives, the tear-shaped chapel of Dominus Flevit marks where Jesus, descending amid the hosannas of the triumphal entry, looked across at the city and wept over it, foretelling the siege to come. The window behind the altar frames the very view — Temple Mount and Old City — that drew His tears.", "talmage": true, "talmageRef": "Jesus the Christ · Chapter 29 — On to Jerusalem", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/19?lang=eng", "t": "Luke 19:41–44 (He beheld the city, and wept)", "why": "The chapel marks this moment on the descent — its altar window frames the view He wept over."}], "media": [], "talmageText": "But amidst all this jubilation, Jesus was sad as He came in sight of the great city wherein stood the House of the Lord; and He wept, because of the wickedness of His people, and of their refusal to accept Him as the Son of God; moreover He foresaw the awful scenes of destruction before which both city and temple were soon to fall. In anguish and tears, He thus apostrophized the doomed city: “If thou hadst known, even thou, at least in this thy day, the things which belong unto thy peace! but now they are hid from thine eyes. For the days shall come upon thee, that thine enemies shall cast a trench about thee, and compass thee round, and keep thee in on every side, And shall lay thee even with the ground, and thy children within thee; and they shall not leave in thee one stone upon another; because thou knewest not the time of thy visitation.”"}, "s49": {"name": "Gethsemane Private Garden", "kind": "walk", "faiths": ["C", "L"], "lat": 31.7794, "lng": 35.2399, "blurb": "A quiet olive grove for reflection near the place of the Atonement.", "desc": "Apart from the crowds at the basilica, this quieter grove on the Mount of Olives' lower slope offers time among ancient olive trees near where Jesus suffered in Gethsemane — 'the oil press.' Here the Savior took upon Himself the weight of the Atonement, sweating as it were great drops of blood, before His betrayal and arrest. A place for unhurried pondering; consider reading the accounts aloud quietly.", "talmage": true, "talmageRef": "Jesus the Christ · Chapter 33 — The Last Supper and the Betrayal", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/matt/26?lang=eng", "t": "Matthew 26:36–46 (The agony in the garden)", "why": "'My soul is exceeding sorrowful' — the suffering of Gethsemane happened among olives like these."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/luke/22?lang=eng", "t": "Luke 22:39–46 (Great drops of blood)", "why": "Luke the physician records the bloody sweat and the strengthening angel."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/19?lang=eng", "t": "D&C 19:16–19 (The Savior describes His suffering)", "why": "The risen Lord's own first-person account of what Gethsemane cost Him."}], "media": [], "talmageText": "Christ’s agony in the garden is unfathomable by the finite mind, both as to intensity and cause. The thought that He suffered through fear of death is untenable. Death to Him was preliminary to resurrection and triumphal return to the Father from whom He had come, and to a state of glory even beyond what He had before possessed; and, moreover, it was within His power to lay down His life voluntarily. He struggled and groaned under a burden such as no other being who has lived on earth might even conceive as possible. It was not physical pain, nor mental anguish alone, that caused Him to suffer such torture as to produce an extrusion of blood from every pore; but a spiritual agony of soul such as only God was capable of experiencing.\n\nIn some manner, actual and terribly real though to man incomprehensible, the Savior took upon Himself the burden of the sins of mankind from Adam to the end of the world.\n\nFrom the terrible conflict in Gethsemane, Christ emerged a victor. Though in the dark tribulation of that fearful hour He had pleaded that the bitter cup be removed from His lips, the request, however oft repeated, was always conditional; the accomplishment of the Father’s will was never lost sight of as the object of the Son’s supreme desire."}, "s50": {"name": "Church of All Nations", "kind": "church", "faiths": ["C"], "lat": 31.7793, "lng": 35.2395, "blurb": "Basilica of the Agony, enclosing the traditional rock of Gethsemane.", "desc": "The Basilica of the Agony, built by contributions from many nations, shelters the bedrock where tradition holds Jesus prayed in Gethsemane. Its alabaster windows keep the nave in violet twilight even at noon — a deliberate echo of that night. Beside it stand olive trees whose root lines have been dated many centuries back.", "talmage": true, "talmageRef": "Jesus the Christ · Chapter 33 — The Last Supper and the Betrayal", "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/mark/14?lang=eng", "t": "Mark 14:32–52 (Gethsemane and the arrest)", "why": "The basilica encloses the traditional rock of the agony; the arrest followed in this garden."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/nt/john/18?lang=eng", "t": "John 18:1–12 (Betrayal in the garden)", "why": "Judas knew the place, 'for Jesus ofttimes resorted thither' — the garden across the Kidron."}], "media": [], "talmageText": "Jesus and the eleven apostles went forth from the house in which they had eaten, passed through the city gate, which was usually left open at night during a public festival, crossed the ravine of the Cedron, or more accurately Kidron, brook, and entered an olive orchard known as Gethsemane, on the slope of Mount Olivet. Eight of the apostles He left at or near the entrance, with the instruction: “Sit ye here, while I go and pray yonder” … Accompanied by Peter, James and John, He went farther; and was soon enveloped by deep sorrow. … “Saith he unto them, My soul is exceeding sorrowful, even unto death: tarry ye here, and watch with me. And he went a little farther, and fell on his face, and prayed, saying, O my Father, if it be possible, let this cup pass from me: nevertheless not as I will, but as thou wilt.”\n\nLuke tells us that “there appeared an angel unto him from heaven, strengthening him”; but not even the presence of this super-earthly visitant could dispel the awful anguish of His soul. “And being in an agony he prayed more earnestly: and his sweat was as it were great drops of blood falling down to the ground.”"}, "s51": {"name": "Orson Hyde Memorial Garden", "kind": "walk", "faiths": ["L", "J"], "lat": 31.7811, "lng": 35.2453, "blurb": "Terraced garden honoring Orson Hyde's 1841 dedicatory prayer.", "desc": "On the upper slope of the Mount of Olives, this terraced garden commemorates Elder Orson Hyde, who climbed this mount in October 1841 and dedicated the land for the gathering of Judah. His prayer asked that Jerusalem be rebuilt and the land bloom — themes that echo Psalmists' pleas for the peace of Jerusalem. The garden's walkways overlook the same city he prayed over.", "talmage": false, "scriptures": [{"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/ps/122?lang=eng", "t": "Psalm 122:6–9 (Pray for the peace of Jerusalem)", "why": "The petition at the heart of Orson Hyde's dedicatory prayer on this mount."}, {"href": "https://www.churchofjesuschrist.org/study/scriptures/ot/ps/137?lang=eng", "t": "Psalm 137:5–6 (If I forget thee, O Jerusalem)", "why": "The exiles' vow of remembrance — the spirit of this garden's dedication."}], "media": []}};
const BACKBONE = [{"date": "Sunday, August 2", "sids": ["s1", "s2", "s3", "s4", "s5"]}, {"date": "Monday, August 3", "sids": ["s6", "s7", "s8", "s9", "s10", "s11", "s12"]}, {"date": "Tuesday, August 4", "sids": ["s13", "s14", "s15", "s16", "s17", "s18"]}, {"date": "Wednesday, August 5", "sids": ["s19"]}, {"date": "Thursday, August 6", "sids": ["s20", "s21", "s22"]}, {"date": "Friday, August 7", "sids": ["s23", "s24", "s25", "s26", "s27", "s28"]}, {"date": "Saturday, August 8", "sids": ["s29", "s30", "s31", "s32", "s33"]}, {"date": "Sunday, August 9", "sids": ["s34", "s35", "s36", "s37"]}, {"date": "Monday, August 10", "sids": ["s38", "s39", "s40", "s41"]}, {"date": "Tuesday, August 11", "sids": ["s42", "s43", "s44", "s45", "s46"]}, {"date": "Wednesday, August 12", "sids": ["s47", "s48", "s49", "s50", "s51"]}];
const REGION_IMG = "maps/region.jpg";
const REGION_AR = 1.44167;
const RCU = [0.700706,-0.045917,-22.723705];
const RCV = [-0.077447,-0.229011,10.538785];
const OLDCITY_IMG = "maps/oldcity.jpg";
const OLDCITY_AR = 1.00192;
const JCU = [68.821769,0.678371,-2445.750387];
const JCV = [0.004483,-71.088719,2259.416111];

const TRIP_FACTS = `LODGING: The group stays at the BYU Jerusalem Center for Near Eastern Studies ("the JC" / "Mormon University"), 1 Hadassah Lampel St, Mount Scopus, Jerusalem (near Hebrew University). Center phone: 011-972-2-626-5666 — if a taxi driver is lost, call and the Center will direct them. Aug 3-6 the group stays at Ein Gev resort on the Sea of Galilee (pack 3 days/nights; free wifi there; beach towels provided).
TOUR CONTACT: April is the tour contact and organizer. She also speaks on the History of the Jerusalem Center the evening of Aug 10.
DATES: Trip runs Aug 2-13, 2026. Optional early check-in Aug 1 at 8pm (extra cost; church services 10:30am but no staying at the Center between church and 8pm). Check out by 5pm Aug 13 (only breakfast served that day).
DRESS CODE (applies at the Center and throughout Jerusalem): No shorts or capris in Jerusalem; pants loose and near the ankle; tops loose with sleeves halfway to the elbow (no cap sleeves), covering to the collarbone; skirts/dresses below the knee; no tight/torn/stained clothing; no USA flags, political slogans or camo (brand/school logos fine); shoes always on inside the Center (protects limestone floors); no hats in dining area or upper auditorium; modest swimsuits that cover the stomach. Men without established beards should shave daily. Knee-length non-athletic shorts allowed only: evenings inside the JC after dinner, the Galilee free day (Aug 5), and the Judean desert day (Aug 9) once away from Jerusalem. TEMPLE MOUNT (Aug 10, Haram al-Sharif): strictest — knees, shoulders, elbows covered; women's pants/skirts to the ankle; loose-fitting; no non-Islamic religious items (no scriptures).
SABBATH (Sat Aug 8): church clothing until after dinner (no suit coats needed; sandals fine); no lunch served at the JC that day.
DAILY NOTES: Aug 2 (Jerusalem walk, Hezekiah's Tunnel): lots of walking, you WILL get wet — wear pants/skirts that roll up and shoes that can get wet, bring headlamp/flashlight, water, TP, shekels, hat, receiver; changing rooms at tunnel start; no swimsuit needed. Aug 3 (to Galilee): bring PASSPORT on the bus, luggage for 3 days. Aug 4 (Galilee churches + boat ride): no shorts. Aug 5 (northern Galilee, TBD): knee-length shorts OK. Aug 6 (Mt Tabor, Beit She'an, Gan HaShlosha swimming — towels provided; back to JC; evening jazz concert optional): bring swimsuit and PASSPORT. Aug 7 (Lazarus, Bethlehem, lunch at Tent Restaurant, Shepherd's Field; evening: Shabbat at the Western Wall): PASSPORT, no shorts. Aug 8 (Sabbath: Garden Tomb, church at JC, Gallicantu, Cenacle, Dormition, Holy Sepulchre; evening organ demonstration). Aug 9 (HOT Judean desert: Masada, Dead Sea float, Qasr al-Yahud baptismal site, Jericho): swimsuit + PASSPORT; evening Mozart/Brahms concert optional. Aug 10 (Haram al-Sharif, Davidson, Notre Dame, free time Mahane Yehuda to Jaffa Gate, YMCA carillon demo): PASSPORT, strict dress. Aug 11 (Pools of Bethesda, Via Dolorosa, Valley of Elah, Bell Caves, Lachish if time): sack lunch, no passport needed. Aug 12 (Bethpage, Dominus Flevit, Gethsemane private garden, Church of All Nations, Orson Hyde Garden, free time; evening closing testimonies): sack lunch. Aug 13: free day, check out by 5pm.
BUS: Be 5 minutes early; the bus may leave without latecomers (catch a cab and rejoin).
MONEY: ATMs give the best rates — get shekels ASAP (airport). ~$200/person is a safe start; plus bring $400/person cash for program cost. Taxis are cash only; no Uber in Israel. Credit cards work for train/bus from airport and larger shops; small vendors need shekels. Tips for guide, boat crew, and bus driver are included in trip cost — extra tipping optional, never required.
PRACTICAL: Jerusalem Aug daytime ~81-86°F, Galilee to ~97°F — hats, sunscreen, water bottle. Wifi free at the JC (strongest levels 5-8) and Ein Gev. Israel power is 230V, plug types C & H — bring adapters; blow dryers provided at JC and Ein Gev. Free laundry with soap at the JC (bring dryer sheets). No package deliveries to the Center. Bring wired 3.5mm headphones + 2 AA batteries for the tour receiver, flashlight for Hezekiah's Tunnel, modest swimsuit, comfortable broken-in shoes, earplugs (dawn prayer call), passport + ETA-IL copy. Don't bring valuables/expensive jewelry (pickpockets), fancy church clothes, or excess luggage.
RESPECT THE STUDENT PROGRAM: Don't pull JC students away from required activities or hang out in the student commons; eating with students in the Oasis and chatting in halls is welcome.
SHOPPING (Old City favorites — spread business around): Omar (Shaban's son), Christian Quarter Rd 14 — souvenirs, mosaics, fair set prices, also changes money. Jimmy's Bizarre, Al-Zahra St 9 — olive wood (call ahead). St. Patrick's Store, Bethlehem (between Nativity and Milk Grotto) — olive wood, set prices. Yasser T. Barakat, Suq Aftemos/Muristan — trustworthy antiquities.
IF ARRIVING EARLY/LATE, nearby hotels: Austrian Hospice (Old City), Jerusalem Hotel (by Garden Tomb), The Olive Tree, New Imperial (Old City); budget: National Hotel, Commodore (across from JC lower gate).`;

const HOME_SITE = { name: "Home", kind: K.home, blurb: "A sandbox stop for trying photos, tagging, and journaling. Reset it anytime.", custom: true, test: true };
const JER_ID = "jerusalem2026";
const JER_META = { id: JER_ID, name: "In the Steps of the Master", sub: "BYU Jerusalem Alumni Tour · August 2–13, 2026", builtin: true };
const JER_MEMBERS = [
  { id: "m1", name: "Marshall Clark", starred: true, photo: null },
  { id: "m2", name: "Jodi Clark", starred: true, photo: null },
  { id: "m3", name: "April Cobb", starred: false, photo: null },
  { id: "m4", name: "Richard Sheffield", starred: false, photo: null },
  { id: "m5", name: "Amy Christensen", starred: false, photo: null },
  { id: "m6", name: "Stephanie Marshall", starred: false, photo: null },
  { id: "m7", name: "Lance von Bracht", starred: false, photo: null },
];

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "id" + Math.random().toString(36).slice(2));
function fileToDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error("read failed"));r.readAsDataURL(file);});}
// Re-encode any photo to a right-side-up JPEG capped at maxDim, so HEIC and EXIF
// rotation never reach the export. Returns {dataUrl, w, h, portrait}.
function b64ToBytes(b64){const bin=atob(b64);const n=bin.length;const a=new Uint8Array(n);for(let i=0;i<n;i++)a[i]=bin.charCodeAt(i);return a;}
async function processPhoto(file, maxDim = 1400){
  const rawUrl = await fileToDataURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Couldn't read that image.")); i.src = rawUrl; });
  let w = img.naturalWidth, h = img.naturalHeight;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  w = Math.round(w * scale); h = Math.round(h * scale);
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  cv.getContext("2d").drawImage(img, 0, 0, w, h);
  const dataUrl = cv.toDataURL("image/jpeg", 0.85);
  return { dataUrl, w, h, portrait: h > w };
}
async function transcribeHandwriting(file){
  const ok=["image/jpeg","image/png","image/webp","image/gif"];
  if(!ok.includes(file.type)) throw new Error("Use a JPEG or PNG of your notes (HEIC isn't supported for transcription).");
  const dataUrl=await fileToDataURL(file); const base64=dataUrl.split(",")[1];
  const res=await fetch("/.netlify/functions/transcribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({media_type:file.type,data:base64})});
  if(!res.ok) throw new Error("Transcription service unavailable — check the OCR setup in Netlify.");
  const data=await res.json(); const out=(data.text||"").trim();
  if(!out) throw new Error("No text came back — try a clearer, well-lit photo of the page.");
  return out;
}
const sortMembers=(m)=>[...m].sort((a,b)=>(a.starred===b.starred?a.name.localeCompare(b.name):a.starred?-1:1));
const initials=(name)=>name.split(" ").map((p)=>p[0]).slice(0,2).join("").toUpperCase();
function stamp(){const d=new Date();const p=(n)=>String(n).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;}
function visitSig(e){if(!e)return "";const ph=(e.photos||[]).map((p)=>`${p.caption}~${(p.people||[]).join(",")}~${(p.dataUrl||"").length}`).join(";");return `${(e.text||"").length}:${e.text||""}|${ph}`;}
function nowLabel(){const now=new Date();const p=(n)=>String(n).padStart(2,"0");let h=now.getHours();const ap=h<12?"AM":"PM";h=h%12||12;return `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()]}, ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][now.getMonth()]} ${now.getDate()} · ${h}:${p(now.getMinutes())} ${ap}`;}

// ---------- on-device persistence (IndexedDB) ----------
const DB_NAME="jerusalem-journal", DB_STORE="state";
function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{r.result.createObjectStore(DB_STORE);};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function idbGet(key){try{const db=await idbOpen();return await new Promise((res,rej)=>{const tx=db.transaction(DB_STORE,"readonly").objectStore(DB_STORE).get(key);tx.onsuccess=()=>res(tx.result);tx.onerror=()=>rej(tx.error);});}catch(e){return undefined;}}
async function idbSet(key,val){try{const db=await idbOpen();return await new Promise((res,rej)=>{const tx=db.transaction(DB_STORE,"readwrite").objectStore(DB_STORE).put(val,key);tx.onsuccess=()=>res(true);tx.onerror=()=>rej(tx.error);});}catch(e){return false;}}

function jerInitItinerary(){return BACKBONE.map((d)=>({id:uid(),date:d.date,sids:[...d.sids]}));}
function emptyTripState(){return {members:[],journal:{},itinerary:[{id:uid(),date:"Day 1",sids:[]}],customSites:{},impromptu:[],buildLog:{},drive:{connected:false,folder:""},version:0,mapImage:null};}
function jerTripState(){return {...emptyTripState(),members:JER_MEMBERS,itinerary:jerInitItinerary()};}

// merge legacy split study notes into the single notes box
function mergeBackbone(s){
  // bring new BACKBONE days/stops to previously saved Jerusalem itineraries
  if(!s||!Array.isArray(s.itinerary)) return s;
  const have=new Set(); s.itinerary.forEach((d)=>(d.sids||[]).forEach((x)=>have.add(x)));
  BACKBONE.forEach((bd,bi)=>{
    let day=s.itinerary.find((d)=>d.date===bd.date);
    if(!day){
      day={id:uid(),date:bd.date,sids:[]};
      const prev=bi>0?s.itinerary.findIndex((d)=>d.date===BACKBONE[bi-1].date):-1;
      if(prev>=0) s.itinerary.splice(prev+1,0,day); else s.itinerary.push(day);
    }
    bd.sids.forEach((sid)=>{ if(!have.has(sid)){ day.sids.push(sid); have.add(sid); } });
  });
  return s;
}
function migrateTripState(s){
  if(!s) return s;
  if(s.study){
    const j={...(s.journal||{})};
    Object.entries(s.study).forEach(([sid,st])=>{
      if(st&&st.note&&st.note.trim()){
        const cur=j[sid]||{text:"",photos:[]};
        if(!(cur.text||"").includes(st.note.trim())) j[sid]={...cur,text:cur.text?cur.text.trimEnd()+"\n\n"+st.note.trim():st.note.trim(),photos:cur.photos||[]};
      }
    });
    s={...s,journal:j}; delete s.study;
  }
  if(!s.itinerary||!s.itinerary.length) s.itinerary=[{id:uid(),date:"Day 1",sids:[]}];
  return s;
}

export default function App(){
  const [trips,setTrips]=useState([JER_META]);           // registry
  const [homeChat,setHomeChat]=useState(false);
  const [tripId,setTripId]=useState(null);                // null = landing
  const [trip,setTrip]=useState(null);                    // active trip state
  const [view,setView]=useState("home");
  const [activeSite,setActiveSite]=useState(null);
  const [activeImp,setActiveImp]=useState(null);
  const [showExport,setShowExport]=useState(false);
  const [hydrated,setHydrated]=useState(false);
  const [saveState,setSaveState]=useState("idle");

  // registry load
  useEffect(()=>{(async()=>{
    const reg=await idbGet("trips");
    if(reg&&Array.isArray(reg)) setTrips([JER_META,...reg.filter((t)=>t.id!==JER_ID)]);
  })();},[]);
  const saveRegistry=async(list)=>{setTrips(list);await idbSet("trips",list.filter((t)=>!t.builtin));};

  // open a trip: hydrate its state
  async function openTrip(id){
    setHydrated(false); setTripId(id); setView("home"); setActiveSite(null); setActiveImp(null);
    let s=await idbGet("trip:"+id);
    if(!s&&id===JER_ID){ const legacy=await idbGet("v1"); s=legacy?{...jerTripState(),...legacy}:jerTripState(); }
    if(!s) s=emptyTripState();
    s=migrateTripState(s);
    if(id===JER_ID) s=mergeBackbone(s);
    setTrip(s); setHydrated(true); window.scrollTo(0,0);
  }
  function closeTrip(){ setTripId(null); setTrip(null); setView("home"); }

  // debounced per-trip autosave
  const saveTimer=useRef(null);
  useEffect(()=>{
    if(!hydrated||!tripId||!trip) return;
    setSaveState("saving"); clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{const ok=await idbSet("trip:"+tripId,trip);setSaveState(ok?"saved":"error");},600);
    return()=>clearTimeout(saveTimer.current);
  },[hydrated,tripId,trip]);

  const patch=(p)=>setTrip((t)=>({...t,...p}));
  const meta=trips.find((t)=>t.id===tripId)||JER_META;
  const isJer=tripId===JER_ID;

  const getSite=(sid)=>{ if(sid==="home")return HOME_SITE; if(isJer&&SITE_INFO[sid])return SITE_INFO[sid]; return trip?.customSites?.[sid]||null; };
  const dateForSite=(sid)=>{const d=trip?.itinerary?.find((day)=>day.sids.includes(sid));return d?d.date:"";};
  const openSite=(sid)=>{setActiveSite(sid);setView("site");window.scrollTo(0,0);};
  const resetSite=(sid)=>patch({journal:(({[sid]:_,...rest})=>rest)(trip.journal)});
  const addImp=()=>{const id="imp_"+uid();patch({impromptu:[...trip.impromptu,{id,title:"",date:nowLabel(),ts:Date.now(),text:"",photos:[],locked:false}]});setActiveImp(id);setView("impromptu");window.scrollTo(0,0);};
  const openImp=(id)=>{setActiveImp(id);setView("impromptu");window.scrollTo(0,0);};

  if(!tripId) return (<div style={{background:C.stone,color:C.ink,minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
    <Fonts/><Landing trips={trips} onOpen={openTrip} onCreate={async(name,sub)=>{const id="t_"+uid();await saveRegistry([...trips,{id,name,sub}]);await idbSet("trip:"+id,emptyTripState());openTrip(id);}} onDelete={async(id)=>{await saveRegistry(trips.filter((t)=>t.id!==id));await idbSet("trip:"+id,undefined);}}/>
  </div>);

  if(!hydrated||!trip) return (<div style={{background:C.stone,minHeight:"100vh"}}/>);

  return (
    <div style={{background:C.stone,color:C.ink,minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      <Fonts/>
      <TopBar meta={meta} view={view} setView={setView} saveState={saveState} onTrips={closeTrip}/>
      <div className="max-w-3xl mx-auto px-4 pb-24 pt-4">
        {view==="home"&&(<Home meta={meta} isJer={isJer} trip={trip} patch={patch} getSite={getSite} openSite={openSite} onEditItinerary={()=>setView("itinerary")} openImp={openImp} addImp={addImp} onAsk={()=>setHomeChat(true)} onPrep={()=>setView("prep")}/>)}
        <StudyChat open={homeChat} onClose={()=>setHomeChat(false)} ctx={{facts:isJer?TRIP_FACTS:"",trip:meta.name,dates:meta.sub||"",day:"",site:"",about:"",talmage:"",scriptures:"",itinerary:(trip.itinerary||[]).map((d)=>`${d.label||d.date||""}: ${(d.sids||[]).map((x)=>getSite(x)?.name).filter(Boolean).join(", ")}`).join(" | ")}}/>
        {view==="site"&&(<SitePage sid={activeSite} isJer={isJer} site={getSite(activeSite)} date={dateForSite(activeSite)} tripName={meta.name} tripSub={meta.sub||""} itinerary={trip.itinerary} getSite={getSite}
          visit={trip.journal[activeSite]||{text:"",photos:[],locked:false}} setVisit={(e)=>patch({journal:{...trip.journal,[activeSite]:e}})}
          customSite={trip.customSites[activeSite]} setCustomSite={(cs)=>patch({customSites:{...trip.customSites,[activeSite]:cs}})}
          members={trip.members} back={()=>setView("home")} onReset={activeSite==="home"?()=>resetSite("home"):null}/>)}
        {view==="impromptu"&&(()=>{const e=trip.impromptu.find((x)=>x.id===activeImp);return e?(<ImpromptuPage entry={e} setEntry={(ne)=>patch({impromptu:trip.impromptu.map((x)=>x.id===activeImp?ne:x)})} members={trip.members} back={()=>setView("home")} onDelete={()=>{patch({impromptu:trip.impromptu.filter((x)=>x.id!==activeImp)});setView("home");}}/>):null;})()}
        {view==="roster"&&(<Roster members={trip.members} setMembers={(m)=>patch({members:typeof m==="function"?m(trip.members):m})}/>)}
        {view==="help"&&(<Help isJer={isJer}/>)}
        {view==="prep"&&(<PrepPage back={()=>setView("home")}/>)}
        {view==="itinerary"&&(<Itinerary trip={trip} patch={patch} getSite={getSite} isJer={isJer} back={()=>setView("home")}/>)}
      </div>
      <ExportBar trip={trip} onOpen={()=>setShowExport(true)}/>
      {showExport&&(<ExportModal meta={meta} isJer={isJer} trip={trip} patch={patch} getSite={getSite} onClose={()=>setShowExport(false)}/>)}
    </div>
  );
}

function Landing({trips,onOpen,onCreate,onDelete}){
  const [adding,setAdding]=useState(false);
  const [name,setName]=useState(""); const [sub,setSub]=useState("");
  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 pt-6">
      <div className="mb-1"><TravelArt height={104}/></div>
      <h1 style={{fontFamily:F_DISP,fontSize:28,letterSpacing:2,color:C.ink,textAlign:"center"}}>TRIPS &amp; EVENTS</h1>
      <p style={{color:C.inkSoft,fontSize:14.5,marginTop:8,textAlign:"center",marginBottom:26}}>A personal Study and Journaling assistant</p>
      <div className="flex flex-col gap-3">
        {trips.map((t)=>(
          <div key={t.id} className="flex items-center gap-3 p-4 rounded-2xl" style={{background:C.card,border:`1px solid ${C.line}`}}>
            <ArchMark size={26}/>
            <button onClick={()=>onOpen(t.id)} className="flex-1 text-left">
              <div style={{fontFamily:F_SERIF,fontSize:19,fontWeight:700,color:C.ink}}>{t.name}</div>
              {t.sub&&<div style={{fontSize:12.5,color:C.inkSoft,marginTop:2}}>{t.sub}</div>}
            </button>
            {!t.builtin&&<button onClick={()=>{if(window.confirm(`Delete "${t.name}" and all its journal data on this device?`))onDelete(t.id);}}><Trash2 size={16} style={{color:C.inkSoft}}/></button>}
            <ChevronLeft size={18} style={{color:C.inkSoft,transform:"rotate(180deg)"}}/>
          </div>
        ))}
      </div>
      {adding?(
        <div className="mt-4 p-4 rounded-2xl flex flex-col gap-2" style={{background:C.card,border:`1.5px dashed ${C.brass}`}}>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Trip name (e.g. Greece 2027)" className="p-2.5 rounded-xl text-sm" style={{background:C.stone,border:`1px solid ${C.line}`,color:C.ink,outline:"none"}}/>
          <input value={sub} onChange={(e)=>setSub(e.target.value)} placeholder="Subtitle / dates (optional)" className="p-2.5 rounded-xl text-sm" style={{background:C.stone,border:`1px solid ${C.line}`,color:C.ink,outline:"none"}}/>
          <div className="flex gap-2">
            <button onClick={()=>{if(name.trim()){onCreate(name.trim(),sub.trim());setName("");setSub("");setAdding(false);}}} className="flex-1 py-2.5 rounded-full text-sm font-semibold" style={{background:C.brass,color:"#fff"}}>Create trip</button>
            <button onClick={()=>setAdding(false)} className="px-4 py-2.5 rounded-full text-sm" style={{border:`1px solid ${C.line}`,color:C.inkSoft}}>Cancel</button>
          </div>
          <p style={{fontSize:11.5,color:C.inkSoft}}>You'll add days and stops from Edit Itinerary inside the trip. A map image can be added there too.</p>
        </div>
      ):(
        <button onClick={()=>setAdding(true)} className="mt-4 w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2" style={{border:`1.5px dashed ${C.brass}`,color:C.brassDk,background:"transparent"}}><Plus size={16}/> New trip</button>
      )}
      <div style={{textAlign:"center",marginTop:28,fontSize:11,color:C.inkSoft,opacity:0.7}}>In the Steps of the Master · v{APP_VERSION}</div>
    </div>
  );
}

function TopBar({meta,view,setView,saveState,onTrips}){
  const tab=(id,label,Icon)=>{const on=view===id;return(<button onClick={()=>setView(id)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition" style={{background:on?C.ink:"transparent",color:on?C.stone:C.inkSoft}}><Icon size={16}/> <span className="hidden sm:inline">{label}</span></button>);};
  return (
    <div style={{borderBottom:`1px solid ${C.line}`,background:C.card}} className="sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onTrips} title="All trips" className="flex items-center gap-1 shrink-0" style={{color:C.inkSoft,fontSize:12}}><ChevronLeft size={15}/><Compass size={16}/></button>
          <button onClick={()=>setView("home")} className="min-w-0 text-left">
            <div style={{fontFamily:F_SERIF,fontSize:15.5,fontWeight:700,color:C.ink}} className="truncate">{meta.name}</div>
          </button>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {saveState==="saved"&&<span title="All changes saved on this device" style={{fontSize:10,color:C.olive,marginRight:4}} className="hidden sm:inline">Saved</span>}
          {saveState==="error"&&<span title="Could not save — storage may be full or blocked" style={{fontSize:10,color:C.clay,marginRight:4}}>Not saved!</span>}
          {tab("home","Map",MapPin)}{tab("roster","Group",Users)}{tab("help","Guide",HelpCircle)}
        </div>
      </div>
    </div>
  );
}

function Home({meta,isJer,trip,patch,getSite,openSite,onEditItinerary,openImp,addImp, onAsk, onPrep}){
  const mapInput=useRef(null);
  return (
    <div>
      {onAsk&&<button onClick={onAsk} className="fixed bottom-24 right-4 z-40 flex items-center gap-1.5 px-4 py-2.5 rounded-full shadow-lg" style={{background:C.teal,color:"#fff",fontSize:13,fontWeight:600}}><MessageCircle size={15}/> Ask</button>}
      {isJer&&onPrep&&(
        <button onClick={onPrep} className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-4" style={{background:C.card,border:`1px solid ${C.line}`}}>
          <span className="flex items-center gap-2.5"><BookOpen size={17} style={{color:C.brassDk}}/><span style={{fontFamily:F_SERIF,fontSize:15.5,fontWeight:700,color:C.ink}}>Trip Prep & Need-to-Know</span></span>
          <span style={{fontSize:12,color:C.inkSoft}}>Study · dress code · packing</span>
        </button>
      )}
      <header className="pt-2 pb-4">
        <div className="mb-1"><ArchArcade height={92}/></div>
        <h1 style={{fontFamily:F_SERIF,fontSize:30,fontWeight:700,lineHeight:1.15,color:C.ink,marginTop:8,textAlign:"center"}}>{meta.name}</h1>
        <p style={{color:C.inkSoft,fontSize:14.5,marginTop:8,textAlign:"center"}}>{meta.sub||"A personal Study and Journaling assistant"}</p>
      </header>

      {isJer?(<TripMap onOpen={openSite}/>):(
        <div className="mb-5">
          {trip.mapImage?(
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <h2 style={{fontFamily:F_SERIF,fontSize:20,fontWeight:700,color:C.ink}}>Where you'll walk</h2>
                <button onClick={()=>patch({mapImage:null})} style={{fontSize:11.5,color:C.clay}}>Remove map</button>
              </div>
              <img src={trip.mapImage} alt="Trip map" style={{display:"block",width:"100%",borderRadius:14,border:`1px solid ${C.line}`}}/>
            </div>
          ):(
            <button onClick={()=>mapInput.current?.click()} className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2" style={{border:`1.5px dashed ${C.line}`,color:C.inkSoft,background:"transparent"}}><MapIcon size={16}/> Add a map image (optional)</button>
          )}
          <input ref={mapInput} type="file" accept="image/*" hidden onChange={async(e)=>{const f=e.target.files[0];if(f){const d=await fileToDataURL(f);patch({mapImage:d});}e.target.value="";}}/>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div style={{fontSize:12.5,color:C.inkSoft}}>Tap a stop to read, journal, and add photos.</div>
        <button onClick={onEditItinerary} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{border:`1px solid ${C.line}`,color:C.inkSoft,background:C.card}}><ListOrdered size={13}/> Edit itinerary</button>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <span style={{fontSize:13,color:C.olive,width:24,textAlign:"center"}}>✦</span>
            <h2 style={{fontSize:15,fontWeight:600,color:C.ink}}>Impromptu entries</h2>
            <div style={{flex:1,height:1,background:C.line}}/>
          </div>
          <button onClick={addImp} className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{background:C.olive,color:"#fff"}}><Plus size={13}/> Add</button>
        </div>
        <p style={{fontSize:12,color:C.inkSoft,marginBottom:10}}>For moments that aren't a stop — a devotional, a meal, free time. They export at the end of their day.</p>
        {trip.impromptu.length>0&&(
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {trip.impromptu.map((e)=>(
              <button key={e.id} onClick={()=>openImp(e.id)} className="text-left flex gap-3 p-3 rounded-2xl w-full" style={{background:C.card,border:`1px solid ${(e.text?.trim()||e.photos?.length)?C.brass:C.line}`}}>
                <SiteTile kind="walk" photo={e.photos?.[0]?.dataUrl||null} size={56}/>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5"><h3 style={{fontFamily:F_SERIF,fontSize:16,fontWeight:500,color:C.ink}} className="truncate">{e.title?.trim()||"Untitled entry"}</h3>{e.locked&&<Lock size={13} style={{color:C.brassDk}} className="shrink-0"/>}</div>
                  {e.date&&<p style={{fontSize:12,color:C.inkSoft,marginTop:2}}>{e.date}</p>}
                  {e.photos?.length>0&&<div style={{fontSize:11,color:C.brass,marginTop:4}} className="flex items-center gap-1"><Camera size={11}/> {e.photos.length}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {trip.itinerary.map((day,di)=>{
        const sids=day.sids.filter((sid)=>getSite(sid));
        return (
          <section key={day.id} className="mb-7">
            <SectionHead label={day.date} num={String(di+1).padStart(2,"0")}/>
            {sids.length===0&&<p style={{fontSize:12.5,color:C.inkSoft,marginLeft:36}}>No stops yet — add some in Edit Itinerary.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sids.map((sid)=>(<SiteCard key={sid} site={getSite(sid)} onOpen={()=>openSite(sid)} visit={trip.journal[sid]}/>))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SectionHead({label,num,mark,color}){
  return (
    <div className="flex items-center gap-3 mb-3">
      {num?(<span style={{fontFamily:F_DISP,fontSize:13,color:C.brass,width:24}}>{num}</span>):(<span style={{fontSize:13,color:color||C.brass,width:24,textAlign:"center"}}>{mark}</span>)}
      <h2 style={{fontSize:15,fontWeight:600,color:C.ink}}>{label}</h2>
      <div style={{flex:1,height:1,background:C.line}}/>
    </div>
  );
}
function SiteTile({kind,photo,size=64}){
  const Icon=ICON[kind]||MapPin;const col=KIND_COLOR[kind]||C.inkSoft;
  if(photo)return <img src={photo} alt="" className="shrink-0" style={{width:size,height:size,borderRadius:12,objectFit:"cover",border:`1px solid ${C.line}`}}/>;
  return(<div className="flex items-center justify-center shrink-0" style={{width:size,height:size,borderRadius:12,background:`linear-gradient(135deg, ${col}22, ${col}0d)`,border:`1px solid ${col}33`}}><Icon size={size*0.4} style={{color:col}} strokeWidth={1.6}/></div>);
}
function FaithBadges({faiths,size=15}){
  if(!faiths||!faiths.length)return null;
  return(<span className="flex gap-1">{faiths.map((f)=>{const m=FAITHS[f];if(!m)return null;return(<span key={f} title={m.label} className="flex items-center justify-center" style={{width:size,height:size,borderRadius:4,background:m.color,color:"#fff",fontSize:size*0.6,fontWeight:700}}>{f}</span>);})}</span>);
}
function SiteCard({site,onOpen,visit}){
  const count=visit?.photos?.length||0;
  const filled=visit&&(visit.text?.trim()||count);
  const cover=visit?.photos?.[0]?.dataUrl||null;
  return (
    <button onClick={onOpen} className="text-left flex gap-3 p-3 rounded-2xl transition hover:-translate-y-0.5 w-full" style={{background:C.card,border:`1px solid ${filled?C.brass:C.line}`,boxShadow:"0 1px 2px rgba(0,0,0,0.03)"}}>
      <SiteTile kind={site.kind} photo={cover}/>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 style={{fontFamily:F_SERIF,fontSize:16,fontWeight:500,color:C.ink}} className="truncate">{site.name}</h3>
          {visit?.locked?<Lock size={13} style={{color:C.brassDk}} className="shrink-0"/>:filled?<Check size={14} style={{color:C.brass}} className="shrink-0"/>:null}
        </div>
        <p style={{fontSize:12.5,color:C.inkSoft,lineHeight:1.35,marginTop:2}} className="line-clamp-2">{site.blurb}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <FaithBadges faiths={site.faiths}/>
          {site.talmage&&<span style={{fontSize:10,color:FAITHS.L.color,fontWeight:700,letterSpacing:0.5}}>TALMAGE</span>}
          {count>0&&(<span style={{fontSize:11,color:C.brass}} className="flex items-center gap-1"><Camera size={11}/> {count}</span>)}
          {site.custom&&!site.test&&<span style={{fontSize:10,color:C.olive,fontWeight:600}}>ADDED</span>}
        </div>
      </div>
    </button>
  );
}

function jbox(lat,lng){ return lat>=31.75 && lat<=31.79 && lng>=35.20 && lng<=35.27; }
function fanPositions(sids, px, py){
  const buckets={};
  sids.forEach((s)=>{ const k=`${SITE_INFO[s].lat.toFixed(2)},${SITE_INFO[s].lng.toFixed(2)}`; (buckets[k]=buckets[k]||[]).push(s); });
  const pos={};
  Object.values(buckets).forEach((g)=>{
    if(g.length===1){ const s=g[0]; pos[s]={x:px(SITE_INFO[s].lng),y:py(SITE_INFO[s].lat)}; return; }
    const cx=px(SITE_INFO[g[0]].lng), cy=py(SITE_INFO[g[0]].lat), rad=13+g.length*2.6;
    g.forEach((s,i)=>{ const a=(i/g.length)*Math.PI*2-Math.PI/2; pos[s]={x:cx+rad*Math.cos(a),y:cy+rad*Math.sin(a)}; });
  });
  return pos;
}
function FlagChip({x,y,stripes,label}){
  const w=18,h=12;
  return (<g>
    {stripes.map((c,i)=>(<rect key={i} x={x} y={y+i*(h/stripes.length)} width={w} height={h/stripes.length} fill={c}/>))}
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#fff" strokeWidth="1"/>
    <text x={x+w+4} y={y+h-1.5} fontSize="9" fill="#4a5a63" style={{fontWeight:600,letterSpacing:1}}>{label}</text>
  </g>);
}
function Pin({p,name,color,on,onEnter,onLeave,onClick}){
  const w=on?22:17, h=w*1.3;
  return (<g onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} style={{cursor:'pointer'}}>
    <g transform={`translate(${p.x-w/2} ${p.y-h}) scale(${w/24})`}>
      <path d="M12 1 C6 1 2 5.4 2 11 c0 7 10 20 10 20 s10-13 10-20 C22 5.4 18 1 12 1 z" fill="#fff" stroke="#1a1a1a" strokeWidth="2.2"/>
      <circle cx="12" cy="11" r="3.6" fill="#1a1a1a"/>
    </g>
    {on && (<g><rect x={p.x+8} y={p.y-h-6} width={name.length*6.1+12} height="18" rx="4" fill="#233038"/><text x={p.x+14} y={p.y-h+7} fontSize="10.5" fill="#fff">{name}</text></g>)}
  </g>);
}

function TripMap({ onOpen }) {
  const [region, setRegion] = useState("region"); // region | jerusalem
  const [hover, setHover] = useState(null);
  const pinColor = C.brass;
  const allSids = Object.keys(SITE_INFO);
  const jSids = allSids.filter((s)=>jbox(SITE_INFO[s].lat,SITE_INFO[s].lng));
  const rSids = allSids.filter((s)=>!jbox(SITE_INFO[s].lat,SITE_INFO[s].lng));

  // ---------- REGION MAP (real image, calibrated) ----------
  const proj=(lat,lng)=>({ u: RCU[0]*lng+RCU[1]*lat+RCU[2], v: RCV[0]*lng+RCV[1]*lat+RCV[2] });
  // fan overlapping region pins in fractional space
  const rBuckets={}; rSids.forEach((s)=>{ const k=`${SITE_INFO[s].lat.toFixed(2)},${SITE_INFO[s].lng.toFixed(2)}`; (rBuckets[k]=rBuckets[k]||[]).push(s); });
  const rUV={};
  Object.values(rBuckets).forEach((g)=>{
    const b=proj(SITE_INFO[g[0]].lat,SITE_INFO[g[0]].lng);
    if(g.length===1){ rUV[g[0]]=b; return; }
    const rad=0.028+g.length*0.006;
    g.forEach((s,i)=>{ const a=(i/g.length)*Math.PI*2-Math.PI/2; rUV[s]={u:b.u+rad*Math.cos(a),v:b.v+rad*REGION_AR*Math.sin(a)}; });
  });
  const jHubUV=proj(31.778,35.234);
  // absolute placements tuned to the drawn map (Galilee cluster, Nazareth, Bethlehem)
  const ROVERRIDE={
    s18:{u:0.710,v:0.280}, s13:{u:0.710,v:0.225}, s16:{u:0.665,v:0.235},
    s14:{u:0.635,v:0.255}, s15:{u:0.660,v:0.272}, s17:{u:0.640,v:0.300},
    s11:{u:0.600,v:0.330}, s12:{u:0.755,v:0.300}, s6:{u:0.600,v:0.250},
    s8:{u:0.525,v:0.312}, s9:{u:0.503,v:0.330}, s25:{u:0.492,v:0.588},
  };
  Object.entries(ROVERRIDE).forEach(([s,p])=>{ if(rUV[s]) rUV[s]=p; });

  // ---------- OLD CITY MAP (real image, calibrated) ----------
  const ocRaw=(lat,lng)=>({ u: JCU[0]*lng+JCU[1]*lat+JCU[2], v: JCV[0]*lng+JCV[1]*lat+JCV[2] });
  const jUV={};
  { const IN=[0.06,0.94];
    const inside=[], edges={top:[],bottom:[],left:[],right:[]};
    jSids.forEach((s)=>{ const r=ocRaw(SITE_INFO[s].lat,SITE_INFO[s].lng); r.s=s;
      const outX=r.u<IN[0]||r.u>IN[1], outY=r.v<IN[0]||r.v>IN[1];
      if(!outX&&!outY){ inside.push(r); }
      else { const dx=Math.max(IN[0]-r.u, r.u-IN[1], 0), dy=Math.max(IN[0]-r.v, r.v-IN[1], 0);
        if(dy>=dx){ (r.v<IN[0]?edges.top:edges.bottom).push(r); } else { (r.u<IN[0]?edges.left:edges.right).push(r); } }
    });
    inside.forEach((r)=>{ jUV[r.s]={u:r.u,v:r.v}; });
    const spread=(arr,along,fixed,val)=>{ arr.sort((a,b)=>a[along]-b[along]);
      const n=arr.length, lo=0.09, hi=0.91;
      arr.forEach((r,i)=>{ const t=n===1?0.5:(lo+(hi-lo)*i/(n-1)); jUV[r.s]= fixed==="v"?{u:t,v:val}:{u:val,v:t}; }); };
    spread(edges.bottom,"u","v",0.955); spread(edges.top,"u","v",0.045);
    spread(edges.left,"v","u",0.045); spread(edges.right,"v","u",0.955);
  }

  const OverlayPin=({s,uv})=>{
    const nm=SITE_INFO[s].name; const w=18;
    const bottom=uv.v>0.9, leftSide=uv.u>0.5, rightEdge=uv.u>0.9;
    let lab;
    if(bottom) lab={ left:"50%", bottom:"108%", transform:"translateX(-50%)", textAlign:"center" };
    else if(rightEdge||leftSide) lab={ right:"118%", top:"-2px", textAlign:"right" };
    else lab={ left:"118%", top:"-2px", textAlign:"left" };
    return (
      <div style={{ position:"absolute", left:`${uv.u*100}%`, top:`${uv.v*100}%`, transform:"translate(-50%,-100%)", zIndex:5, cursor:"pointer" }} onClick={()=>onOpen(s)}>
        <svg width={w} height={w*1.3} viewBox="0 0 24 32" style={{ display:"block", filter:"drop-shadow(0 1px 1.5px rgba(0,0,0,0.5))" }}>
          <path d="M12 1 C6 1 2 5.4 2 11 c0 7 10 20 10 20 s10-13 10-20 C22 5.4 18 1 12 1 z" fill="#fff" stroke="#1a1a1a" strokeWidth="2.2"/>
          <circle cx="12" cy="11" r="3.6" fill="#1a1a1a"/>
        </svg>
        <div style={{ position:"absolute", ...lab, background:"rgba(251,248,241,0.9)", color:C.ink, fontSize:9.5, lineHeight:1.12, fontWeight:600, padding:"1px 4px", borderRadius:3, maxWidth:96, boxShadow:"0 1px 2px rgba(0,0,0,0.2)", pointerEvents:"none" }}>{nm}</div>
      </div>
    );
  };

  const RegionPin=({s})=>{
    const uv=rUV[s]; const on=hover===s; const nm=SITE_INFO[s].name; const w=on?22:17;
    return (
      <div style={{ position:"absolute", left:`${uv.u*100}%`, top:`${uv.v*100}%`, transform:"translate(-50%,-100%)", zIndex:on?60:5, cursor:"pointer" }}
        onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(null)} onClick={()=>onOpen(s)}>
        <svg width={w} height={w*1.3} viewBox="0 0 24 32" style={{ display:"block", filter:"drop-shadow(0 1px 1.5px rgba(0,0,0,0.5))" }}>
          <path d="M12 1 C6 1 2 5.4 2 11 c0 7 10 20 10 20 s10-13 10-20 C22 5.4 18 1 12 1 z" fill="#fff" stroke="#1a1a1a" strokeWidth="2.2"/>
          <circle cx="12" cy="11" r="3.6" fill="#1a1a1a"/>
        </svg>
        {on && <div style={{ position:"absolute", left:"50%", bottom:"115%", transform:"translateX(-50%)", background:C.ink, color:"#fff", fontSize:11, padding:"3px 7px", borderRadius:5, whiteSpace:"nowrap", pointerEvents:"none" }}>{nm}</div>}
      </div>
    );
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h2 style={{ fontFamily: F_SERIF, fontSize: 20, fontWeight: 700, color: C.ink }}>Where you'll walk</h2>
        <div className="flex gap-1 p-0.5 rounded-full" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          {[["region","Region"],["jerusalem","Jerusalem"]].map(([id,l])=>(
            <button key={id} onClick={()=>{setRegion(id);setHover(null);}} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: region===id?C.ink:"transparent", color: region===id?C.stone:C.inkSoft }}>{l}</button>
          ))}
        </div>
      </div>

      {region==="region" ? (
        <div className="rounded-2xl relative" style={{ border: `1px solid ${C.line}` }}>
          <img src={REGION_IMG} alt="Map of Judea and surrounding regions" style={{ display:"block", width:"100%", borderRadius:14 }} />
          <div style={{ position:"absolute", inset:0 }}>
            {rSids.map((s)=>(<RegionPin key={s} s={s} />))}
            {/* invisible hotspot over Jerusalem Old City → city view */}
            {(() => { const on = hover === "__oc"; return (
              <div onClick={()=>{setRegion("jerusalem");setHover(null);}} onMouseEnter={()=>setHover("__oc")} onMouseLeave={()=>setHover(null)}
                style={{ position:"absolute", left:`${jHubUV.u*100}%`, top:`${(jHubUV.v-0.05)*100}%`, transform:"translate(-50%,-100%)", zIndex:on?60:9, cursor:"pointer" }}>
                <svg width={on?22:17} height={(on?22:17)*1.3} viewBox="0 0 24 32" style={{ display:"block", filter:"drop-shadow(0 1px 1.5px rgba(0,0,0,0.5))" }}>
                  <path d="M12 1 C6 1 2 5.4 2 11 c0 7 10 20 10 20 s10-13 10-20 C22 5.4 18 1 12 1 z" fill="#fff" stroke="#1a1a1a" strokeWidth="2.2"/>
                  <circle cx="12" cy="11" r="3.6" fill="#1a1a1a"/>
                </svg>
                {on && <div style={{ position:"absolute", left:"50%", bottom:"115%", transform:"translateX(-50%)", background:C.ink, color:"#fff", fontSize:11, padding:"3px 7px", borderRadius:5, whiteSpace:"nowrap", pointerEvents:"none" }}>Old City Sites</div>}
              </div>
            ); })()}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl relative" style={{ border: `1px solid ${C.line}` }}>
          <img src={OLDCITY_IMG} alt="Map of the Old City of Jerusalem" style={{ display:"block", width:"100%", borderRadius:14 }} />
          <div style={{ position:"absolute", inset:0 }}>
            {jSids.map((s)=>(<OverlayPin key={s} s={s} uv={jUV[s]} />))}
          </div>
        </div>
      )}
      <p style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 6 }}>Tap a pin to open its journal. {region==="region"?"Tap “Old City sites” to zoom into Jerusalem.":"Sites just outside the walls sit at the map edge nearest their real location."}</p>
    </div>
  );
}

function AutoTextarea({value,onChange,placeholder,minRows=8,style}){
  const ref=useRef(null);
  const resize=()=>{const el=ref.current;if(el){el.style.height="auto";el.style.height=el.scrollHeight+"px";}};
  useLayoutEffect(resize,[value]);
  return(<textarea ref={ref} value={value} onChange={onChange} onInput={resize} placeholder={placeholder} rows={minRows} className="w-full mt-1.5 p-3 rounded-xl" style={{...style,overflow:"hidden",resize:"none"}}/>);
}
function ActionBtn({onClick,icon:Icon,label,loading}){
  return(<button onClick={onClick} disabled={loading} className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition" style={{background:C.card,border:`1px solid ${C.line}`,color:C.ink,opacity:loading?0.6:1}}>{loading?<Loader2 size={15} className="animate-spin"/>:<Icon size={15} style={{color:C.brass}}/>} {label}</button>);
}
function Avatar({member,size=20,on}){
  if(member.photo)return <img src={member.photo} alt="" style={{width:size,height:size,borderRadius:999,objectFit:"cover"}}/>;
  return(<span className="flex items-center justify-center" style={{width:size,height:size,borderRadius:999,background:on?C.stone:C.line,color:on?C.ink:C.inkSoft,fontSize:size*0.42,fontWeight:700}}>{initials(member.name)}</span>);
}

function PrepSection({title,children,defaultOpen}){
  const [open,setOpen]=useState(!!defaultOpen);
  return (
    <div className="mb-3 rounded-2xl overflow-hidden" style={{background:C.card,border:`1px solid ${C.line}`}}>
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3.5">
        <span style={{fontFamily:F_SERIF,fontSize:16,fontWeight:700,color:C.ink}}>{title}</span>
        {open?<ChevronUp size={17} style={{color:C.inkSoft}}/>:<ChevronDown size={17} style={{color:C.inkSoft}}/>}
      </button>
      {open&&<div className="px-4 pb-4" style={{fontSize:14,color:C.ink,lineHeight:1.65}}>{children}</div>}
    </div>
  );
}
function PLink({href,children}){ return <a href={href} target="_blank" rel="noopener noreferrer" style={{color:C.teal,textDecoration:"underline",textUnderlineOffset:2}}>{children}</a>; }
function PH({children}){ return <div style={{fontSize:11,letterSpacing:1,color:C.brassDk,textTransform:"uppercase",fontWeight:700,margin:"12px 0 4px"}}>{children}</div>; }
function PrepPage({back}){
  return (
    <div>
      <button onClick={back} className="flex items-center gap-1 text-sm mb-4" style={{color:C.inkSoft}}><ChevronLeft size={16}/> Back</button>
      <h1 style={{fontFamily:F_DISP,fontSize:22,color:C.ink,letterSpacing:1,marginBottom:4}}>Trip Prep & Need-to-Know</h1>
      <p style={{fontSize:13.5,color:C.inkSoft,lineHeight:1.6,marginBottom:16}}>Study before you go, and the practical details for while you're there. The Study Companion (Ask button) knows all of this too.</p>

      <PrepSection title="Things to Read, Listen to & Watch" defaultOpen>
        <p style={{fontSize:13,color:C.inkSoft,marginBottom:8}}>Understanding the land, people, and history before arriving will make everything more meaningful.</p>
        <PH>Read</PH>
        <p><b>The Scriptures</b> — most sites center on the life of Christ in the Gospels, with several Old Testament sites too. Use the itinerary to study each site's biblical significance (each stop in this app lists its passages with context).</p>
        <p className="mt-2"><b>Elder Holland's 30th Anniversary talk</b>, "If I Forget Thee, O Jerusalem" — <PLink href="https://byujerusalemalumni.com/wp-content/uploads/2021/04/BYUSQ-59.4-Jerusalem-Center-30th-Anniversary-Conference-Volume-full-version-1.pdf">read it here</PLink> (the same volume holds all talks from that event).</p>
        <p className="mt-2"><b>Alumni Field Trip Manual</b> — mailed a few weeks before departure. Condensed by permission from the student manuals; bring it along. It is not to be copied or shared as a PDF.</p>
        <p className="mt-2"><b>Church & Center history timeline</b> in the Holy Land — <PLink href="https://byujerusalemalumni.com/jerusalem-timeline/">fascinating timeline here</PLink>.</p>
        <PH>Listen</PH>
        <p>Elder Holland's talk as narrated audio — <PLink href="https://youtu.be/lIQXXpVoQQ8?si=lAFVP87AjCnE4S40">listen here</PLink> (a reader's voice, not his own).</p>
        <PH>Watch</PH>
        <p><b>Holy Land Site Devotionals</b> — <PLink href="https://byujerusalemalumni.com/upcoming-events/holy-land-site-devotional-series/">alumni devotional recordings</PLink> covering sites we'll visit: Bethlehem, Nazareth, Orson Hyde Garden, Caesarea Philippi, Magdala, Pools of Bethesda, and Kursi.</p>
        <p className="mt-2"><b>Alumni Conference videos</b> — <PLink href="https://byujerusalemalumni.com/upcoming-events/alumni-conference-2022/">Center history, humanitarian work</PLink>, and Jeff Chadwick on the sites of the crucifixion and tomb.</p>
        <p className="mt-2"><b>Art & Ideas event</b> — <PLink href="https://byujerusalemalumni.com/art-ideas-2023-2/">Holy Land–inspired alumni art</PLink>, Jenet Erickson on returning after 30 years, and Daniel Smith's 3D Temple Mount reconstruction.</p>
      </PrepSection>

      <PrepSection title="Dress Code">
        <p style={{fontSize:13,color:C.inkSoft,marginBottom:8}}>More than appearance — the Jerusalem Center "brand" brings recognition, respect, and safety in the community. These standards apply inside the Center and throughout Jerusalem.</p>
        <p><b>Everywhere in Jerusalem:</b> no shorts or capris. Pants loose-fitting, reaching near the ankle. Tops loose, covering to the collarbone, sleeves halfway to the elbow (no cap sleeves). Skirts and dresses below the knee. Nothing tight, torn, or shabby. No U.S. flags, political slogans, or camo — brand names and school logos are fine.</p>
        <p className="mt-2"><b>Inside the Center:</b> shoes on at all times outside your room (the limestone floors). No hats in the dining area or upper auditorium. Men without established beards shave daily.</p>
        <p className="mt-2"><b>Shorts exception:</b> knee-length, non-athletic shorts only — evenings in the Center after dinner, the northern Galilee day, and the Judean desert day once away from Jerusalem.</p>
        <p className="mt-2"><b>Temple Mount day (strictest):</b> knees, shoulders, and elbows covered; women's pants or skirts to the ankle; loose-fitting; no non-Islamic religious items (including scriptures).</p>
        <p className="mt-2"><b>Swimsuits:</b> modest coverage including the stomach.</p>
        <p className="mt-2"><b>Sabbath:</b> church clothing until after dinner — no suit coats needed, sandals fine.</p>
      </PrepSection>

      <PrepSection title="Good to Know">
        <PH>Weather</PH>
        <p>Jerusalem in August: days 81–86°F, nights 61–67°F. Galilee: up to ~97°F, evenings ~70°F. Hats, sunscreen, and a water bottle daily.</p>
        <PH>Wifi</PH>
        <p>Free at the Jerusalem Center — strongest on levels 5–8, spotty in some lower rooms. Free everywhere at Ein Gev.</p>
        <PH>Money</PH>
        <p>ATMs give the best rates — get shekels ASAP (airport). Money changers do better with $100 bills. Visa/Mastercard for larger purchases; small vendors need shekels. Taxis are cash-only and there's no Uber. About $200/person is a safe starting amount, plus $400/person cash for the program cost. Tips for the guide, boat crew, and driver are included in the trip cost.</p>
        <PH>Electricity</PH>
        <p>Israel runs 230V with plug types C & H — bring adapters (hair appliances are the usual casualty). Blow dryers are provided at the Center and Ein Gev.</p>
        <PH>Laundry & deliveries</PH>
        <p>Free washers/dryers with soap at the Center — bring dryer sheets. No package deliveries accepted at the Center; ship purchases home.</p>
      </PrepSection>

      <PrepSection title="What to Bring (and Not)">
        <PH>Essentials</PH>
        <p>Passport + copy of ETA-IL and itinerary · sunscreen · flashlight or headlamp (Hezekiah's Tunnel is pitch black) · modest swimsuit · church clothing (nothing fancy; sandals fine) · field trip manual (mailed to you) · insulated water bottle · comfortable broken-in shoes with good traction · $400/person cash for program cost · <b>wired headphones with a round 3.5mm plug</b> for the receiver · 2 AA batteries for the receiver · earplugs (dawn prayer call) · adapters (types C & H) · fanny pack or neck wallet · charging block and cords · personal medication · toiletries (not provided in student rooms).</p>
        <PH>Skip</PH>
        <p>Laundry detergent (provided) · fancy clothes · excessive luggage (free laundry — pack light, and keep a change of clothes in your carry-on) · towels (provided when needed; Ein Gev provides beach towels) · valuables and expensive jewelry (pickpocketing happens) · excessive snacks · Four Seasons expectations — the Center is a dormitory: student life!</p>
        <PH>Clothing checklist</PH>
        <p>Loose ankle-length pants · loose tops with sleeves (no cap sleeves) · church clothes · modest swimsuit · one warm layer · knee-length shorts only if you'll want them on the two allowed days · women: one wrist-to-ankle outfit for Temple Mount, plus below-knee skirts/dresses · closed-toe walkers, strapped sandals, water shoes for the tunnel.</p>
      </PrepSection>

      <PrepSection title="Getting There & Getting Around">
        <PH>The Jerusalem Center</PH>
        <p>Brigham Young University Jerusalem Center for Near Eastern Studies, 1 Hadassah Lampel St, Mount Scopus, Jerusalem. Tell taxi drivers the <b>"Mormon University" on Mount Scopus near Hebrew University</b> — and make sure they can pinpoint it before you set off. If they get lost, call the Center at <b>011-972-2-626-5666</b> and staff will direct them.</p>
        <PH>The bus</PH>
        <p>Be at least 5 minutes early — the bus may leave without latecomers (catch a cab and rejoin; you'll be welcomed with open arms).</p>
        <PH>Respect the student program</PH>
        <p>Student activities are mandatory — don't tempt students away on free days or hang out in the student commons. Eating with them in the Oasis, chatting in the halls, and shared activities are all welcome.</p>
        <PH>Arriving early or leaving late</PH>
        <p>Nearby hotels: Austrian Hospice (Old City) · Jerusalem Hotel (by the Garden Tomb) · The Olive Tree · New Imperial (Old City) · budget: National Hotel, or the Commodore across from the Center's lower gate.</p>
        <PH>Shopping favorites</PH>
        <p>Spread the love around: Omar (Shaban's son), Christian Quarter Rd 14 — souvenirs, mosaics, fair set prices, changes money · Jimmy's Bizarre, Al-Zahra St 9 — olive wood (call ahead) · St. Patrick's Store, Bethlehem — olive wood, set prices · Yasser T. Barakat, Suq Aftemos — trustworthy antiquities.</p>
      </PrepSection>
    </div>
  );
}

function StudyChat({open,onClose,ctx}){
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  const boxRef=useRef(null);
  useEffect(()=>{ if(boxRef.current) boxRef.current.scrollTop=boxRef.current.scrollHeight; },[msgs,busy]);
  useEffect(()=>{ if(open){ setErr(""); } },[open]);
  if(!open) return null;
  const send=async()=>{
    const q=input.trim(); if(!q||busy) return;
    const next=[...msgs,{role:"user",content:q}];
    setMsgs(next); setInput(""); setBusy(true); setErr("");
    try{
      const res=await fetch("/.netlify/functions/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next,ctx})});
      if(!res.ok) throw new Error("offline");
      const data=await res.json();
      if(!data.reply) throw new Error("empty");
      setMsgs([...next,{role:"assistant",content:data.reply}]);
    }catch(e){ setErr("Couldn't reach the study companion — check your connection and try again."); setMsgs(msgs); setInput(q); }
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{background:"rgba(35,48,56,0.45)"}} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} className="w-full sm:max-w-lg flex flex-col" style={{background:C.stone,borderRadius:"20px 20px 0 0",maxHeight:"85vh",height:"85vh"}}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2"><MessageCircle size={18} style={{color:C.brassDk}}/><span style={{fontFamily:F_DISP,fontSize:16,color:C.ink,letterSpacing:1}}>Study Companion</span></div>
          <button onClick={onClose} aria-label="Close"><X size={20} style={{color:C.inkSoft}}/></button>
        </div>
        <div ref={boxRef} className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2.5">
          <div className="p-3 rounded-xl" style={{background:C.card,border:`1px solid ${C.line}`,fontSize:12.5,color:C.inkSoft,lineHeight:1.55}}>
            Ask about the sites, scriptures, history, or your itinerary — I know this trip{ctx.site?` and the stop you have open (${ctx.site})`:""}. Your journal entries and photos stay private on your device and are never shared with me. I need an internet connection to answer.
          </div>
          {msgs.map((m,i)=>(
            <div key={i} className={m.role==="user"?"self-end":"self-start"} style={{maxWidth:"85%"}}>
              <div className="px-3.5 py-2.5 rounded-2xl" style={m.role==="user"
                ?{background:C.teal,color:"#fff",fontSize:14.5,lineHeight:1.5,borderBottomRightRadius:6}
                :{background:C.card,border:`1px solid ${C.line}`,color:C.ink,fontSize:14.5,lineHeight:1.6,borderBottomLeftRadius:6,whiteSpace:"pre-wrap"}}>{m.content}</div>
            </div>
          ))}
          {busy&&<div className="self-start px-3.5 py-2.5 rounded-2xl flex items-center gap-2" style={{background:C.card,border:`1px solid ${C.line}`,color:C.inkSoft,fontSize:13}}><Loader2 size={14} className="animate-spin"/> Thinking…</div>}
          {err&&<div className="p-2.5 rounded-lg text-xs" style={{background:"#fbeeea",color:C.clay,border:`1px solid ${C.clay}44`}}>{err}</div>}
        </div>
        <div className="flex items-end gap-2 px-4 pb-4 pt-2" style={{borderTop:`1px solid ${C.line}`}}>
          <textarea value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }} rows={1} placeholder="Ask about this site, the trip, scriptures…" className="flex-1 px-3.5 py-2.5 rounded-xl resize-none" style={{background:C.card,border:`1px solid ${C.line}`,fontSize:14.5,color:C.ink,outline:"none",maxHeight:110}}/>
          <button onClick={send} disabled={busy||!input.trim()} aria-label="Send" className="p-2.5 rounded-xl" style={{background:busy||!input.trim()?C.line:C.brass,color:"#fff"}}><Send size={17}/></button>
        </div>
      </div>
    </div>
  );
}

function SitePage({sid,isJer,site,date,tripName,tripSub,itinerary,getSite,visit,setVisit,customSite,setCustomSite,members,back,onReset}){
  const [chatOpen,setChatOpen]=useState(false);
  if(!site)return(<div><button onClick={back} className="flex items-center gap-1 text-sm" style={{color:C.inkSoft}}><ChevronLeft size={16}/> Back</button><p className="mt-4" style={{color:C.inkSoft}}>This stop no longer exists.</p></div>);
  const info=isJer?SITE_INFO[sid]:null;
  const col=KIND_COLOR[site.kind];
  const about=isJer?(info?.blurb||""):(customSite?.about||site.blurb||"");
  const chatCtx={
    facts:isJer?TRIP_FACTS:"",
    trip:tripName, dates:tripSub, day:date||"", site:site.name,
    about,
    talmage:(info&&info.talmageText)?`${info.talmageRef||""}: ${info.talmageText}`:"",
    scriptures:(info?.scriptures||[]).map((s)=>s.t+(s.why?` — ${s.why}`:"")).join("; "),
    itinerary:(itinerary||[]).map((d)=>`${d.label||d.date||""}: ${(d.sids||[]).map((x)=>getSite&&getSite(x)?.name).filter(Boolean).join(", ")}`).join(" | "),
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={back} className="flex items-center gap-1 text-sm" style={{color:C.inkSoft}}><ChevronLeft size={16}/> All stops</button>
        <button onClick={()=>setChatOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{background:C.teal,color:"#fff"}}><MessageCircle size={13}/> Ask</button>
        {onReset&&(<button onClick={()=>onReset()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{background:"transparent",border:`1px solid ${C.clay}66`,color:C.clay}}><RotateCcw size={13}/> Reset Home</button>)}
      </div>
      <div className="flex items-center gap-3 mb-2">
        <SiteTile kind={site.kind} photo={visit.photos?.[0]?.dataUrl||null} size={52}/>
        <div className="min-w-0">
          <div style={{fontSize:11,letterSpacing:1,color:col,textTransform:"uppercase",fontWeight:600}}>{date||(site.test?"Test stop":"")}</div>
          <h1 style={{fontFamily:F_SERIF,fontSize:24,fontWeight:700,color:C.ink,lineHeight:1.1}}>{site.name}</h1>
        </div>
      </div>
      {info&&(
        <div className="flex items-center gap-2 mb-3">
          <FaithBadges faiths={info.faiths} size={17}/>
          {info.talmage&&<span title={info.talmageRef||"Jesus the Christ"} className="px-2 py-0.5 rounded-full" style={{fontSize:10,color:"#fff",background:FAITHS.L.color,fontWeight:700,letterSpacing:0.5}}>TALMAGE</span>}
          <a href={`https://www.google.com/maps/search/?api=1&query=${info.lat},${info.lng}`} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs" style={{color:C.teal}}><MapPin size={12}/> Map</a>
        </div>
      )}

      <VisitPanel visit={visit} setVisit={setVisit} members={members} isTest={!!site.test} siteName={site.name}/>

      {info&&(
        <div className="mt-8">
          <SectionHead label="About this site" mark="§"/>
          <div className="p-4 rounded-2xl mb-4" style={{background:C.card,border:`1px solid ${C.line}`}}>
            <div style={{fontSize:15,lineHeight:1.65,color:C.ink}} dangerouslySetInnerHTML={{__html:info.desc}}/>
          </div>
          {info.talmageRef&&(
            <details className="mb-3 rounded-2xl" style={{background:C.card,border:`1px solid ${C.line}`}}>
              <summary className="p-3.5 cursor-pointer list-none">
                <div className="flex items-center gap-1.5" style={{fontSize:11,fontWeight:700,color:FAITHS.L.color,textTransform:"uppercase",letterSpacing:1}}><BookOpen size={13}/> {info.talmageText?"From James E. Talmage — tap to read":"In James E. Talmage — tap for the chapter"}</div>
                <div style={{fontSize:13.5,color:C.inkSoft,marginTop:3}}>{info.talmageRef}</div>
              </summary>
              <div className="px-3.5 pb-3.5">
                {info.talmageText&&<p style={{fontSize:14.5,color:C.ink,lineHeight:1.65,whiteSpace:"pre-wrap",fontFamily:F_SERIF}}>{info.talmageText}</p>}
                {(()=>{ const ch=(info.talmageRef.match(/Chapter\s+(\d+)/)||[])[1]; const url=ch?`https://www.gutenberg.org/files/22542/22542-h/22542-h.htm#chapter_${ch}`:"https://www.gutenberg.org/ebooks/22542"; return <a href={url} target="_blank" rel="noopener noreferrer" style={{fontSize:12.5,color:C.teal}}>Read this chapter free on Project Gutenberg (public domain) ↗</a>; })()}
              </div>
            </details>
          )}
          {info.scriptures?.length>0&&<StudyLinks title="In the scriptures" items={info.scriptures} icon={BookText}/>}
          {info.media?.length>0&&<StudyLinks title="Watch & study · Gospel Library" items={info.media} icon={ExternalLink}/>}
        </div>
      )}

      {!isJer&&!site.test&&customSite&&(
        <CustomAbout sid={sid} site={customSite} setSite={setCustomSite} tripName={tripName}/>
      )}
      <StudyChat open={chatOpen} onClose={()=>setChatOpen(false)} ctx={chatCtx}/>
    </div>
  );
}

function CustomAbout({sid,site,setSite,tripName}){
  const [gen,setGen]=useState({loading:false,error:""});
  async function generate(){
    setGen({loading:true,error:""});
    try{
      const res=await fetch("/.netlify/functions/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({site:site.name,trip:tripName})});
      if(!res.ok)throw new Error("Research service unavailable — check the setup in Netlify.");
      const data=await res.json();
      setSite({...site,about:(data.about||"").trim(),refs:Array.isArray(data.refs)?data.refs.slice(0,6):[]});
      setGen({loading:false,error:""});
    }catch(e){setGen({loading:false,error:e.message||"Generation failed."});}
  }
  return (
    <div className="mt-8">
      <SectionHead label="About this site" mark="§"/>
      <AutoTextarea value={site.about||""} onChange={(e)=>setSite({...site,about:e.target.value})} minRows={4}
        placeholder="A short background for this stop — write your own, or generate a draft below."
        style={{background:C.card,border:`1px solid ${C.line}`,color:C.ink,fontSize:14.5,lineHeight:1.6,outline:"none"}}/>
      <div className="mt-2 flex items-center gap-2">
        <ActionBtn onClick={generate} icon={Sparkles} label="Generate background" loading={gen.loading}/>
        {site.about&&<span style={{fontSize:11,color:C.inkSoft}}>AI drafts can contain mistakes — give it a quick read.</span>}
      </div>
      {gen.error&&<div className="mt-2 p-2.5 rounded-lg text-sm" style={{background:"#fbeeea",color:C.clay,border:`1px solid ${C.clay}44`}}>{gen.error}</div>}
      {site.refs?.length>0&&(
        <div className="mt-3 p-3.5 rounded-2xl" style={{background:C.card,border:`1px solid ${C.line}`}}>
          <div className="flex items-center gap-1.5 mb-2" style={{fontSize:11,fontWeight:700,color:C.brassDk,textTransform:"uppercase",letterSpacing:1}}><BookText size={13}/> For further study</div>
          <ul className="flex flex-col gap-1.5">{site.refs.map((r,i)=>(<li key={i} style={{fontSize:14,color:C.ink,lineHeight:1.4}}>• {r.t||r}</li>))}</ul>
        </div>
      )}
    </div>
  );
}

function StudyLinks({title,items,icon:Icon}){
  return (
    <div className="mb-3 p-3.5 rounded-2xl" style={{background:C.card,border:`1px solid ${C.line}`}}>
      <div className="flex items-center gap-1.5 mb-2" style={{fontSize:11,fontWeight:700,color:C.brassDk,textTransform:"uppercase",letterSpacing:1}}><Icon size={13}/> {title}</div>
      <ul className="flex flex-col gap-1.5">
        {items.map((it,i)=>(<li key={i}><a href={it.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1.5" style={{fontSize:14,color:C.teal,lineHeight:1.4}}><ExternalLink size={12} className="mt-1 shrink-0" style={{opacity:0.7}}/> {it.t}</a>{it.why&&<div style={{fontSize:12.5,color:C.inkSoft,lineHeight:1.5,margin:"2px 0 4px 19px",fontStyle:"italic"}}>{it.why}</div>}</li>))}
      </ul>
    </div>
  );
}

function VisitPanel({visit,setVisit,members,isTest,siteName}){
  const photoInput=useRef(null);const ocrInput=useRef(null);
  const setVisitRef=useRef(null);
  // functional-update bridge so late caption arrivals never clobber newer edits
  setVisitRef.current=(fn)=>setVisit(fn(visitLatest.current));
  const visitLatest=useRef(visit); visitLatest.current=visit;
  const [ocrState,setOcrState]=useState({loading:false,error:""});
  const sorted=sortMembers(members);
  const setText=(text)=>setVisit({...visit,text});
  const setPhotos=(photos)=>setVisit({...visit,photos});
  const locked=!!visit.locked;
  async function addPhotos(files){
    const added=[];
    for(const f of files){
      try{
        const p=await processPhoto(f);
        added.push({id:uid(),dataUrl:p.dataUrl,w:p.w,h:p.h,portrait:p.portrait,caption:"",people:[],suggested:sorted.filter((m)=>m.starred).map((m)=>m.id)});
      }catch(e){/* skip unreadable file */}
    }
    if(!added.length) return;
    added.forEach((p)=>{p.captioning=true;});
    setPhotos([...visit.photos,...added]);
    // fire-and-forget AI caption drafts; never blocks, never overwrites a user's edit
    added.forEach((ph)=>{
      fetch("/.netlify/functions/caption",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:ph.dataUrl.split(",")[1],context:siteName||""})})
        .then((r)=>r.ok?r.json():null)
        .then((d)=>{const cap=(d&&d.text||"").trim();
          setVisitRef.current((v)=>({...v,photos:v.photos.map((p)=>p.id===ph.id?{...p,captioning:false,caption:(!p.caption&&cap)?cap:p.caption}:p)}));})
        .catch(()=>{setVisitRef.current((v)=>({...v,photos:v.photos.map((p)=>p.id===ph.id?{...p,captioning:false}:p)}));});
    });
  }
  const updatePhoto=(id,patch)=>setPhotos(visit.photos.map((p)=>(p.id===id?{...p,...patch}:p)));
  const removePhoto=(id)=>setPhotos(visit.photos.filter((p)=>p.id!==id));
  const togglePerson=(pid,mid)=>{const p=visit.photos.find((x)=>x.id===pid);const people=p.people.includes(mid)?p.people.filter((x)=>x!==mid):[...p.people,mid];updatePhoto(pid,{people});};
  async function runOCR(file){
    setOcrState({loading:true,error:""});
    try{const out=await transcribeHandwriting(file);setText(visit.text?visit.text.trimEnd()+"\n\n"+out:out);setOcrState({loading:false,error:""});}
    catch(e){setOcrState({loading:false,error:e.message||"Transcription failed."});}
  }
  return (
    <div>
      {!isTest&&(
        <div className="flex justify-end mb-2">
          <button onClick={()=>setVisit({...visit,locked:!locked})} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{background:locked?C.brass:"transparent",border:`1px solid ${locked?C.brass:C.line}`,color:locked?"#fff":C.inkSoft}}>{locked?<Lock size={13}/>:<Unlock size={13}/>} {locked?"Locked":"Lock entry"}</button>
        </div>
      )}
      {locked&&(<div className="mb-3 p-2.5 rounded-lg text-xs flex items-center gap-2" style={{background:`${C.brass}14`,color:C.brassDk,border:`1px solid ${C.brass}44`}}><Lock size={13}/> Locked — future exports mark it finalized so you can keep any hand-edits.</div>)}
      <label style={{fontSize:12,fontWeight:600,color:C.ink}}>Site Visit Notes &amp; Reflections</label>
      <AutoTextarea value={visit.text} onChange={(e)=>setText(e.target.value)} minRows={10}
        placeholder="Type here, or paste from Apple Notes / Google Keep. Use your keyboard's mic button to dictate."
        style={{background:C.card,border:`1px solid ${C.line}`,color:C.ink,fontSize:15,lineHeight:1.55,outline:"none"}}/>
      <div className="flex flex-wrap gap-2 mt-3">
        <ActionBtn onClick={()=>photoInput.current?.click()} icon={Camera} label="Add photos"/>
        <ActionBtn onClick={()=>ocrInput.current?.click()} icon={ScanLine} label="Transcribe handwriting" loading={ocrState.loading}/>
        <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e)=>{addPhotos([...e.target.files]);e.target.value="";}}/>
        <input ref={ocrInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e)=>{const f=e.target.files[0];if(f)runOCR(f);e.target.value="";}}/>
      </div>
      {ocrState.error&&<div className="mt-2 p-2.5 rounded-lg text-sm" style={{background:"#fbeeea",color:C.clay,border:`1px solid ${C.clay}44`}}>{ocrState.error}</div>}
      {ocrState.loading&&<div className="mt-2 flex items-center gap-2 text-sm" style={{color:C.inkSoft}}><Loader2 size={15} className="animate-spin"/> Reading your handwriting…</div>}
      {visit.photos.length>0&&(
        <div className="mt-6">
          <div style={{fontSize:12,fontWeight:600,color:C.ink,marginBottom:10}}>Photos ({visit.photos.length}) — confirm who's in each</div>
          <div className="grid grid-cols-1 gap-4">
            {visit.photos.map((p)=>(<PhotoRow key={p.id} photo={p} members={sorted} onCaption={(caption)=>updatePhoto(p.id,{caption})} onToggle={(mid)=>togglePerson(p.id,mid)} onRemove={()=>removePhoto(p.id)}/>))}
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoRow({photo,members,onCaption,onToggle,onRemove}){
  const suggestedSet=new Set(photo.suggested||[]);
  const suggested=members.filter((m)=>suggestedSet.has(m.id)&&!photo.people.includes(m.id));
  const others=members.filter((m)=>!suggestedSet.has(m.id));
  const chip=(m)=>{const on=photo.people.includes(m.id);return(<button key={m.id} onClick={()=>onToggle(m.id)} className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full text-xs transition" style={{background:on?C.ink:"transparent",color:on?C.stone:C.inkSoft,border:`1px solid ${on?C.ink:C.line}`}}><Avatar member={m} on={on}/> {m.name.split(" ")[0]}</button>);};
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl" style={{background:C.card,border:`1px solid ${C.line}`}}>
      <div className="relative shrink-0"><img src={photo.dataUrl} alt="" style={{width:"100%",maxWidth:180,height:130,objectFit:"cover",borderRadius:10}}/><button onClick={onRemove} className="absolute top-1.5 right-1.5 p-1 rounded-full" style={{background:"rgba(0,0,0,0.55)"}}><Trash2 size={13} color="#fff"/></button></div>
      <div className="flex-1 min-w-0">
        {photo.captioning?(
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{background:C.stone,border:`1px solid ${C.line}`}}><Loader2 size={14} className="animate-spin" style={{color:C.brass}}/><span style={{fontSize:12.5,color:C.inkSoft}}>Drafting a caption…</span></div>
        ):(
          <AutoTextarea value={photo.caption} onChange={(e)=>onCaption(e.target.value)} minRows={1} placeholder="Caption (shown beneath the photo)" style={{background:C.stone,border:`1px solid ${C.line}`,color:C.ink,fontSize:14,lineHeight:1.4,outline:"none"}}/>
        )}
        {suggested.length>0&&(<><div style={{fontSize:11,color:C.teal,margin:"9px 0 5px",fontWeight:600}} className="flex items-center gap-1"><Sparkles size={11}/> Suggested — tap to confirm</div><div className="flex flex-wrap gap-1.5">{suggested.map(chip)}</div></>)}
        <div style={{fontSize:11,color:C.inkSoft,margin:"9px 0 5px"}}>Everyone in the group</div>
        <div className="flex flex-wrap gap-1.5">{photo.people.map((id)=>members.find((m)=>m.id===id)).filter(Boolean).map(chip)}{others.filter((m)=>!photo.people.includes(m.id)).map(chip)}</div>
      </div>
    </div>
  );
}

function ImpromptuPage({entry,setEntry,members,back,onDelete}){
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={back} className="flex items-center gap-1 text-sm" style={{color:C.inkSoft}}><ChevronLeft size={16}/> All stops</button>
        <button onClick={()=>setChatOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{background:C.teal,color:"#fff"}}><MessageCircle size={13}/> Ask</button>
        <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{border:`1px solid ${C.clay}66`,color:C.clay}}><Trash2 size={13}/> Delete</button>
      </div>
      <div className="flex items-center gap-2 mb-1"><span style={{fontSize:11,letterSpacing:1,color:C.olive,textTransform:"uppercase",fontWeight:600}}>Impromptu entry</span></div>
      <input value={entry.title} onChange={(e)=>setEntry({...entry,title:e.target.value})} placeholder="Title (e.g. Sunday devotional)" className="w-full mb-2" style={{fontFamily:F_SERIF,fontSize:24,fontWeight:700,color:C.ink,background:"transparent",border:"none",outline:"none"}}/>
      <input value={entry.date} onChange={(e)=>setEntry({...entry,date:e.target.value})} placeholder="When" className="w-full mb-4 p-2 rounded-lg text-sm" style={{background:C.card,border:`1px solid ${C.line}`,color:C.inkSoft,outline:"none"}}/>
      <VisitPanel visit={entry} setVisit={setEntry} members={members} isTest={false} siteName={entry.title}/>
    </div>
  );
}

function Roster({members,setMembers}){
  const [name,setName]=useState("");const photoInputs=useRef({});
  const sorted=sortMembers(members);
  const add=()=>{if(!name.trim())return;setMembers([...members,{id:uid(),name:name.trim(),starred:false,photo:null}]);setName("");};
  const toggle=(id)=>setMembers(members.map((m)=>(m.id===id?{...m,starred:!m.starred}:m)));
  const remove=(id)=>setMembers(members.filter((m)=>m.id!==id));
  const setPhoto=async(id,file)=>{const photo=await fileToDataURL(file);setMembers(members.map((m)=>(m.id===id?{...m,photo}:m)));};
  return (
    <div>
      <h1 style={{fontFamily:F_DISP,fontSize:24,letterSpacing:1,color:C.ink}}>Travel Group</h1>
      <p style={{color:C.inkSoft,fontSize:14,marginTop:6,marginBottom:18}}>Add a face photo for each person — those become the tag candidates. Star the people you tag most to keep them at the top.</p>
      <div className="flex gap-2 mb-5">
        <input value={name} onChange={(e)=>setName(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&add()} placeholder="Add a group member" className="flex-1 p-2.5 rounded-xl text-sm" style={{background:C.card,border:`1px solid ${C.line}`,color:C.ink,outline:"none"}}/>
        <button onClick={add} className="px-4 rounded-xl flex items-center gap-1.5 text-sm font-medium" style={{background:C.ink,color:C.stone}}><Plus size={16}/> Add</button>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map((m)=>(
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:C.card,border:`1px solid ${C.line}`}}>
            <button onClick={()=>toggle(m.id)}><Star size={18} style={{color:m.starred?C.brass:C.line,fill:m.starred?C.brass:"transparent"}}/></button>
            <Avatar member={m} size={34}/>
            <span style={{flex:1,fontSize:15,color:C.ink}}>{m.name}</span>
            <button onClick={()=>photoInputs.current[m.id]?.click()} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs" style={{border:`1px solid ${C.line}`,color:C.inkSoft}}><UserPlus size={13}/> {m.photo?"Change":"Photo"}</button>
            <input ref={(el)=>(photoInputs.current[m.id]=el)} type="file" accept="image/*" hidden onChange={(e)=>{const f=e.target.files[0];if(f)setPhoto(m.id,f);e.target.value="";}}/>
            <button onClick={()=>remove(m.id)}><X size={16} style={{color:C.inkSoft}}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Itinerary({trip,patch,getSite,isJer,back}){
  const [addTo,setAddTo]=useState(null);
  const [name,setName]=useState("");const [kind,setKind]=useState("church");
  const itinerary=trip.itinerary;
  const setItinerary=(a)=>patch({itinerary:a});
  const moveDay=(i,dir)=>{const j=i+dir;if(j<0||j>=itinerary.length)return;const a=[...itinerary];[a[i],a[j]]=[a[j],a[i]];setItinerary(a);};
  const setDate=(id,date)=>setItinerary(itinerary.map((d)=>(d.id===id?{...d,date}:d)));
  const addDay=()=>setItinerary([...itinerary,{id:uid(),date:`Day ${itinerary.length+1}`,sids:[]}]);
  const removeDay=(id)=>{const d=itinerary.find((x)=>x.id===id);if(d&&d.sids.length){window.alert("Move or remove this day's stops first.");return;}setItinerary(itinerary.filter((x)=>x.id!==id));};
  const moveSite=(di,si,dir)=>{const a=itinerary.map((d)=>({...d,sids:[...d.sids]}));const day=a[di];const sj=si+dir;if(sj>=0&&sj<day.sids.length){[day.sids[si],day.sids[sj]]=[day.sids[sj],day.sids[si]];setItinerary(a);}};
  const moveSiteToDay=(di,si,dir)=>{const dj=di+dir;if(dj<0||dj>=itinerary.length)return;const a=itinerary.map((d)=>({...d,sids:[...d.sids]}));const [sid]=a[di].sids.splice(si,1);a[dj].sids.push(sid);setItinerary(a);};
  const addSite=(dayId)=>{
    if(!name.trim())return;
    const sid="c_"+uid();
    patch({customSites:{...trip.customSites,[sid]:{name:name.trim(),kind,blurb:isJer?"Added stop (journal only).":"",custom:true,about:"",refs:[]}},
      itinerary:itinerary.map((d)=>(d.id===dayId?{...d,sids:[...d.sids,sid]}:d))});
    setName("");setAddTo(null);
  };
  const removeCustom=(di,si,sid)=>{
    const a=itinerary.map((d)=>({...d,sids:[...d.sids]}));a[di].sids.splice(si,1);
    const cs={...trip.customSites};delete cs[sid];
    patch({itinerary:a,customSites:cs});
  };
  return (
    <div>
      <button onClick={back} className="flex items-center gap-1 text-sm mb-4" style={{color:C.inkSoft}}><ChevronLeft size={16}/> Done</button>
      <h1 style={{fontFamily:F_DISP,fontSize:22,letterSpacing:1,color:C.ink}}>Edit Itinerary</h1>
      <div className="p-3 rounded-xl my-3 text-xs leading-relaxed" style={{background:`${C.teal}12`,border:`1px solid ${C.teal}44`,color:C.ink}}>
        Reorder days and stops, rename days, or add your own. Photos and notes stay attached to their stop, so moving a stop keeps everything linked — just re-export afterward since the document order will change.
      </div>
      <div className="flex flex-col gap-4">
        {itinerary.map((day,di)=>(
          <div key={day.id} className="p-3 rounded-2xl" style={{background:C.card,border:`1px solid ${C.line}`}}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex flex-col">
                <button onClick={()=>moveDay(di,-1)} disabled={di===0} style={{opacity:di===0?0.3:1}}><ChevronUp size={16} style={{color:C.inkSoft}}/></button>
                <button onClick={()=>moveDay(di,1)} disabled={di===itinerary.length-1} style={{opacity:di===itinerary.length-1?0.3:1}}><ChevronDown size={16} style={{color:C.inkSoft}}/></button>
              </div>
              <span style={{fontFamily:F_DISP,fontSize:12,color:C.brass}}>{String(di+1).padStart(2,"0")}</span>
              <input value={day.date} onChange={(e)=>setDate(day.id,e.target.value)} className="flex-1 p-2 rounded-lg text-sm font-medium" style={{background:C.stone,border:`1px solid ${C.line}`,color:C.ink,outline:"none"}}/>
              {day.sids.length===0&&itinerary.length>1&&<button onClick={()=>removeDay(day.id)} title="Remove empty day"><Trash2 size={15} style={{color:C.clay}}/></button>}
            </div>
            <div className="flex flex-col gap-1.5">
              {day.sids.map((sid,si)=>{
                const s=getSite(sid);if(!s)return null;
                return (
                  <div key={sid} className="flex items-center gap-2 p-2 rounded-lg" style={{background:C.stone,border:`1px solid ${C.line}`}}>
                    <div className="flex flex-col">
                      <button onClick={()=>moveSite(di,si,-1)} disabled={si===0} style={{opacity:si===0?0.25:1}}><ChevronUp size={14} style={{color:C.inkSoft}}/></button>
                      <button onClick={()=>moveSite(di,si,1)} disabled={si===day.sids.length-1} style={{opacity:si===day.sids.length-1?0.25:1}}><ChevronDown size={14} style={{color:C.inkSoft}}/></button>
                    </div>
                    <span style={{fontSize:13.5,color:C.ink,flex:1}} className="truncate">{s.name}{s.custom&&<span style={{color:C.olive,fontSize:10,fontWeight:700}}> · ADDED</span>}</span>
                    <button onClick={()=>moveSiteToDay(di,si,-1)} disabled={di===0} title="Move to previous day" style={{opacity:di===0?0.25:1}}><ChevronUp size={15} style={{color:C.teal}}/></button>
                    <button onClick={()=>moveSiteToDay(di,si,1)} disabled={di===itinerary.length-1} title="Move to next day" style={{opacity:di===itinerary.length-1?0.25:1}}><ChevronDown size={15} style={{color:C.teal}}/></button>
                    {s.custom&&<button onClick={()=>removeCustom(di,si,sid)}><Trash2 size={14} style={{color:C.clay}}/></button>}
                  </div>
                );
              })}
            </div>
            {addTo===day.id?(
              <div className="mt-2.5 p-2.5 rounded-lg flex flex-col gap-2" style={{background:C.stone,border:`1px dashed ${C.brass}`}}>
                <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New stop name" className="p-2 rounded-lg text-sm" style={{background:C.card,border:`1px solid ${C.line}`,color:C.ink,outline:"none"}}/>
                <div className="flex flex-wrap gap-1.5">{KIND_OPTIONS.map(([k,l])=>(<button key={k} onClick={()=>setKind(k)} className="px-2.5 py-1 rounded-full text-xs" style={{background:kind===k?C.ink:"transparent",color:kind===k?C.stone:C.inkSoft,border:`1px solid ${kind===k?C.ink:C.line}`}}>{l}</button>))}</div>
                <div className="flex gap-2">
                  <button onClick={()=>addSite(day.id)} className="flex-1 py-2 rounded-full text-sm font-medium" style={{background:C.brass,color:"#fff"}}>Add stop</button>
                  <button onClick={()=>{setAddTo(null);setName("");}} className="px-3 py-2 rounded-full text-sm" style={{border:`1px solid ${C.line}`,color:C.inkSoft}}>Cancel</button>
                </div>
              </div>
            ):(
              <button onClick={()=>setAddTo(day.id)} className="mt-2.5 flex items-center gap-1.5 text-xs font-medium" style={{color:C.teal}}><Plus size={13}/> Add a stop to this day</button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addDay} className="mt-4 w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2" style={{border:`1.5px dashed ${C.brass}`,color:C.brassDk,background:"transparent"}}><Plus size={16}/> Add a day</button>
    </div>
  );
}

function Help({isJer}){
  const Step=({n,children})=>(<li className="flex gap-3 mb-3"><span className="shrink-0 flex items-center justify-center" style={{width:24,height:24,borderRadius:999,background:C.ink,color:C.stone,fontSize:12,fontWeight:600}}>{n}</span><span style={{fontSize:14.5,color:C.ink,lineHeight:1.5}}>{children}</span></li>);
  const Card=({title,children})=>(<section className="mb-6 p-4 rounded-2xl" style={{background:C.card,border:`1px solid ${C.line}`}}><h2 style={{fontFamily:F_SERIF,fontSize:18,fontWeight:700,color:C.ink,marginBottom:10}}>{title}</h2>{children}</section>);
  return (
    <div>
      <h1 style={{fontFamily:F_DISP,fontSize:24,letterSpacing:1,color:C.ink,marginBottom:16}}>How to Use This</h1>
      <Card title="One page per stop">
        <p style={{fontSize:14.5,color:C.ink,lineHeight:1.6}}>Every stop has one page: your <b>notes and photos</b> at the top, and the <b>background, scriptures, and study links</b> below. Read, reflect, and journal in the same place.</p>
      </Card>
      <Card title="The daily rhythm">
        <ol><Step n={1}>Take photos on your phone as normal all day.</Step><Step n={2}>In the evening, open each stop — jot your notes, add the day's photos, caption them, tag who's in them.</Step><Step n={3}>Use an Impromptu entry for moments that aren't a stop; it lands at the end of that day in the export.</Step><Step n={4}>Lock a stop when you're happy, then <b>Export</b> to one Word document.</Step></ol>
      </Card>
      <Card title="Handwritten notes">
        <p style={{fontSize:14.5,color:C.ink,lineHeight:1.6}}>Snap a photo of the page and tap <b>Transcribe handwriting</b> — it reads cursive far better than built-in copy-text tools. Use a well-lit JPEG or PNG.</p>
      </Card>
      <Card title="Your data stays yours">
        <p style={{fontSize:14.5,color:C.ink,lineHeight:1.6}}>Everything saves automatically on <b>this device</b> — no account, no server. Clearing the browser's site data erases it, so export your journal now and then. Cross-device sync via your own Google Drive is coming.</p>
      </Card>
      <Card title="Add it to your home screen">
        <p style={{fontSize:14.5,color:C.ink,lineHeight:1.6}}>iPhone: Share button in Safari → <b>Add to Home Screen</b>. Android: menu → <b>Install app</b>. It gets an icon, opens full-screen, and works offline.</p>
      </Card>
      {!isJer&&(
      <Card title="Building a new trip">
        <p style={{fontSize:14.5,color:C.ink,lineHeight:1.6}}>Use <b>Edit Itinerary</b> to add days and stops. On each stop's page, write a short background or tap <b>Generate background</b> for an AI draft with further-reading suggestions. A map image can be added on the trip's home page.</p>
      </Card>)}
    </div>
  );
}

const STATUS_META={new:{label:"New",color:C.teal},updated:{label:"Updated",color:C.clay},current:{label:"Up to date",color:C.inkSoft},locked:{label:"Locked",color:C.brassDk}};

function ExportModal({meta,isJer,trip,patch,getSite,onClose}){
  const [connecting,setConnecting]=useState(false);
  const [saved,setSaved]=useState(null);
  const {journal,impromptu,itinerary,buildLog,drive,version,members}=trip;
  const memberName=(id)=>members.find((m)=>m.id===id)?.name||"";
  const isImp=(id)=>id.startsWith("imp_");
  const impById=(id)=>impromptu.find((x)=>x.id===id);
  const entryOf=(id)=>(isImp(id)?impById(id):journal[id]);
  const hasVisit=(id)=>{const e=entryOf(id);return e&&(e.text?.trim()||e.photos?.length);};
  const orderedSids=itinerary.flatMap((d)=>d.sids).filter((sid)=>sid!=="home");
  const impIds=impromptu.filter((e)=>e.text?.trim()||e.photos?.length).slice().sort((a,b)=>(a.ts||0)-(b.ts||0)).map((e)=>e.id);
  const started=[...orderedSids.filter((sid)=>hasVisit(sid)),...impIds];
  const statusOf=(id)=>{const e=entryOf(id)||{};if(e.locked)return "locked";const last=buildLog[id];const cur=visitSig(e);if(last===undefined)return "new";return last===cur?"current":"updated";};
  const nameOf=(id)=>(isImp(id)?(impById(id)?.title?.trim()||"Impromptu entry"):getSite(id)?.name);
  const rows=started.map((id)=>({sid:id,name:nameOf(id),status:statusOf(id),locked:!!entryOf(id)?.locked,imp:isImp(id)}));
  const counts=rows.reduce((a,r)=>((a[r.status]=(a[r.status]||0)+1),a),{});
  const buildable=rows.filter((r)=>r.status==="new"||r.status==="updated");
  const onToggleLock=(sid)=>patch({journal:{...journal,[sid]:{...(journal[sid]||{text:"",photos:[]}),locked:!(journal[sid]?.locked)}}});

  const INK="233038", BRASS="8f6e37", OLIVE="6b7350", SLATE="4a5a63";
  function normalizeBlocks(text){ return (text||"").replace(/\r/g,"").split(/\n\s*\n/).map((b)=>b.replace(/\n/g," ").replace(/\s+/g," ").trim()).filter(Boolean); }
  function paraOf(t){ return new Paragraph({ spacing:{after:160}, children:[ new TextRun({ text:t, size:23, color:INK, font:"Georgia" }) ] }); }
  function notesParas(text){ return normalizeBlocks(text).map(paraOf); }
  const NOB={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
  const NO_BORDERS={top:NOB,bottom:NOB,left:NOB,right:NOB,insideHorizontal:NOB,insideVertical:NOB};
  function photoB64(p){ const s=(p&&p.dataUrl)||""; const i=s.indexOf(","); const b=i>=0?s.slice(i+1):""; return b.length>32?b:null; }
  function photoCap(p){ const names=(p.people||[]).map(memberName).filter(Boolean).join(", "); return [p.caption, names&&`(${names})`].filter(Boolean).join(" "); }
  function dims(p,wPx){ const ratio=(p.w&&p.h)?(p.h/p.w):(p.portrait?1.4:0.7); return { wPx, hPx:Math.round(wPx*ratio) }; }
  // one centered figure (photo WITH caption already baked in), sized by orientation
  function singleFigure(p, baked){ const b=baked&&baked[p.id]; if(!b) return []; const dispW=p.portrait?250:380; const dispH=Math.max(1,Math.round(dispW*(b.h/b.w)));
    return [ new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:140,after:180}, children:[ new ImageRun({ type:"jpg", data:b64ToBytes(b.dataUrl.split(",")[1]), transformation:{width:dispW,height:dispH} }) ] }) ]; }
  function entryChildren(text, photos, baked){
    const ph=(photos||[]).filter((p)=>photoB64(p)&&baked&&baked[p.id]);
    const blocks=normalizeBlocks(text); const out=[];
    if(!ph.length){ if(blocks.length) blocks.forEach((b)=>out.push(paraOf(b))); else out.push(new Paragraph({children:[new TextRun({text:""})]})); return out; }
    if(!blocks.length){ ph.forEach((p)=>out.push(...singleFigure(p,baked))); return out; }
    const per=Math.max(1,Math.ceil(blocks.length/ph.length)); let pi=0;
    blocks.forEach((b,i)=>{ out.push(paraOf(b)); if((i+1)%per===0 && pi<ph.length){ out.push(...singleFigure(ph[pi++],baked)); } });
    while(pi<ph.length){ out.push(...singleFigure(ph[pi++],baked)); }
    return out;
  }

  function dayHeading(t){ return new Paragraph({ spacing:{before:280,after:60}, border:{ bottom:{ color:"b0894a", space:4, size:12, style:BorderStyle.SINGLE } }, children:[ new TextRun({ text:t, bold:true, size:30, color:INK, font:"Georgia" }) ] }); }
  function siteHeading(t,locked){ return new Paragraph({ spacing:{before:200,after:20}, children:[ new TextRun({ text:t+(locked?"  \uD83D\uDD12":""), bold:true, size:26, color:BRASS, font:"Georgia" }) ] }); }
  function blurbPara(t){ return new Paragraph({ spacing:{after:80}, children:[ new TextRun({ text:t, italics:true, size:20, color:OLIVE, font:"Georgia" }) ] }); }
  function impBlock(e, baked){
    const out=[ new Paragraph({ spacing:{before:200,after:0}, children:[ new TextRun({ text:(e.title||"Untitled entry")+(e.locked?"  \uD83D\uDD12":""), bold:true, size:26, color:BRASS, font:"Georgia" }), new TextRun({ text:"  \u2014 impromptu", size:18, color:OLIVE, font:"Georgia" }) ] }) ];
    if(e.date) out.push(new Paragraph({ spacing:{after:80}, children:[ new TextRun({ text:e.date, italics:true, size:20, color:OLIVE, font:"Georgia" }) ] }));
    out.push(...entryChildren(e.text, e.photos, baked));
    return out;
  }

  // draw the caption onto the photo so the two become ONE image -> caption always
  // stays with the photo (even when the user wraps text around it in Google Docs)
  function loadImg(url){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=()=>rej(new Error("img")); i.src=url; }); }
  function wrapLines(ctx,text,maxW){ const words=(text||"").split(/\s+/); const lines=[]; let line=""; for(const w of words){ const t=line?line+" "+w:w; if(ctx.measureText(t).width>maxW && line){ lines.push(line); line=w; } else line=t; } if(line) lines.push(line); return lines; }
  async function bakeFigure(p){
    const cap=photoCap(p);
    let img; try{ img=await loadImg(p.dataUrl); }catch(e){ return null; }
    const maxDim=1000, iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
    const s=Math.min(1, maxDim/Math.max(iw,ih)); const w=Math.max(1,Math.round(iw*s)), h=Math.max(1,Math.round(ih*s));
    const fpx=Math.max(14, Math.round(w*0.032)), pad=Math.round(fpx*0.7), lh=Math.round(fpx*1.28);
    const cv=document.createElement("canvas"); const mctx=cv.getContext("2d"); mctx.font=`italic ${fpx}px Georgia, serif`;
    const lines=cap?wrapLines(mctx,cap,w-2*pad):[]; const capH=cap?(pad+lines.length*lh+pad):0;
    cv.width=w; cv.height=h+capH; const c=cv.getContext("2d");
    c.fillStyle="#ffffff"; c.fillRect(0,0,cv.width,cv.height); c.drawImage(img,0,0,w,h);
    if(cap){ c.font=`italic ${fpx}px Georgia, serif`; c.fillStyle="#4a5a63"; c.textAlign="center"; c.textBaseline="alphabetic";
      let y=h+pad+fpx*0.82; for(const ln of lines){ c.fillText(ln,w/2,y); y+=lh; } }
    return { dataUrl:cv.toDataURL("image/jpeg",0.85), w:cv.width, h:cv.height, portrait:p.portrait };
  }
  // pre-bake every selected photo (by id) so figure building stays synchronous
  async function bakeAll(ids){
    const map={}; const jobs=[];
    const collect=(photos)=>{ (photos||[]).forEach((p)=>{ if(photoB64(p)) jobs.push([p.id,p]); }); };
    itinerary.forEach((day)=>{ day.sids.filter((sid)=>ids.includes(sid)).forEach((sid)=>collect((journal[sid]||{}).photos)); });
    impromptu.filter((e)=>ids.includes(e.id)).forEach((e)=>collect(e.photos));
    await Promise.all(jobs.map(async ([id,p])=>{ const b=await bakeFigure(p); if(b) map[id]=b; }));
    return map;
  }

  async function buildAndSave(ids, tag){
    const baked=await bakeAll(ids);
    const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
    const impSel=impromptu.filter((e)=>ids.includes(e.id)).slice().sort((a,b)=>(a.ts||0)-(b.ts||0));
    const impByDay={}, impLeftover=[];
    impSel.forEach((e)=>{ let placed=false; if(e.ts){ const d=new Date(e.ts); const key=`${MONTHS[d.getMonth()]} ${d.getDate()}`; const day=itinerary.find((dy)=>(dy.date||"").includes(key)); if(day){ (impByDay[day.id]=impByDay[day.id]||[]).push(e); placed=true; } } if(!placed) impLeftover.push(e); });

    const kids=[];
    kids.push(new Paragraph({ alignment:AlignmentType.CENTER, children:[ new TextRun({ text:(isJer?"BYU JERUSALEM CENTER \u00B7 ALUMNI RETURN":"TRAVEL JOURNAL"), size:18, color:"b0894a", font:"Georgia", allCaps:true }) ] }));
    kids.push(new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:40}, children:[ new TextRun({ text:(isJer?"Jerusalem Journal":meta.name), bold:true, size:48, color:INK, font:"Georgia" }) ] }));
    if(meta.sub||isJer) kids.push(new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:200}, children:[ new TextRun({ text:(isJer?"August 2\u201310, 2026":(meta.sub||"")), size:22, color:OLIVE, font:"Georgia" }) ] }));

    itinerary.forEach((day)=>{
      const daySids=day.sids.filter((sid)=>ids.includes(sid));
      const dayImps=impByDay[day.id]||[];
      if(!daySids.length && !dayImps.length) return;
      kids.push(dayHeading(day.date));
      daySids.forEach((sid)=>{
        const site=getSite(sid); const e=journal[sid]||{};
        kids.push(siteHeading(site.name, e.locked));
        if(site.blurb) kids.push(blurbPara(site.blurb));
        kids.push(...entryChildren(e.text, e.photos, baked));
      });
      dayImps.forEach((e)=>{ kids.push(...impBlock(e, baked)); });
    });
    if(impLeftover.length){ kids.push(dayHeading("Other Moments")); impLeftover.forEach((e)=>{ kids.push(...impBlock(e, baked)); }); }
    if(kids.length<=3) kids.push(new Paragraph({ children:[ new TextRun({ text:"No entries yet.", color:SLATE }) ] }));

    const doc=new Document({ sections:[{ properties:{ page:{ margin:{ top:900, bottom:900, left:1000, right:1000 } } }, children:kids }] });
    const blob=await Packer.toBlob(doc);
    const v=version+1;
    const fname=`${(meta.name||"Journal").replace(/[^A-Za-z0-9]+/g,"-")}_v${v}${tag}_${stamp()}.docx`;
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=fname;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    const nbl={...buildLog}; ids.forEach((id)=>(nbl[id]=visitSig(entryOf(id)))); patch({version:v,buildLog:nbl}); setSaved(fname);
  }
  const [building,setBuilding]=useState(false);
  const [buildErr,setBuildErr]=useState("");
  const runBuild=async(ids,tag)=>{ setBuilding(true); setBuildErr(""); setSaved(null); try{ await buildAndSave(ids,tag); }catch(e){ console.error("export build failed:",e); setSaved("ERROR"); setBuildErr((e&&e.message)?String(e.message):"Unknown error"); } setBuilding(false); };
  const buildFull=()=>runBuild(started,"");
  const buildNew=()=>runBuild(buildable.map((r)=>r.sid),"-new");

  function connectDrive(){setConnecting(true);setTimeout(()=>{patch({drive:{connected:true,folder:(meta.name||"Journal")+" exports"}});setConnecting(false);},900);}
  function changeFolder(){const f=window.prompt("Save exports to which Drive folder?",drive.folder||"Journal exports");if(f&&f.trim())patch({drive:{...drive,folder:f.trim()}});}

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center" style={{background:"rgba(35,48,56,0.45)"}} onClick={onClose}>
      <div className="w-full sm:max-w-lg max-h-[85vh] overflow-auto rounded-t-2xl sm:rounded-2xl" style={{background:C.stone}} onClick={(e)=>e.stopPropagation()}>
        <div className="sticky top-0 px-5 py-4 flex items-center justify-between" style={{background:C.stone,borderBottom:`1px solid ${C.line}`}}>
          <h2 style={{fontFamily:F_DISP,fontSize:18,letterSpacing:1,color:C.ink}}>Export Journal</h2>
          <button onClick={onClose}><X size={20} style={{color:C.inkSoft}}/></button>
        </div>
        <div className="px-5 py-4">
          <div className="p-3 rounded-xl mb-3" style={{background:C.card,border:`1px solid ${C.line}`}}>
            <div style={{fontSize:11,fontWeight:600,color:C.inkSoft,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Save to</div>
            {drive.connected?(
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0"><Cloud size={17} style={{color:C.teal}} className="shrink-0"/><div className="min-w-0"><div style={{fontSize:13.5,color:C.ink}} className="truncate">Google Drive · {drive.folder}</div><div style={{fontSize:11,color:C.olive}}>Connected — next file saves here as v{version+1}</div></div></div>
                <button onClick={changeFolder} className="px-2.5 py-1.5 rounded-full text-xs shrink-0" style={{border:`1px solid ${C.line}`,color:C.inkSoft}}>Change folder</button>
              </div>
            ):(
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2"><Download size={17} style={{color:C.inkSoft}}/><span style={{fontSize:13.5,color:C.ink}}>This device (download)</span></div>
                <button onClick={connectDrive} disabled={connecting} className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shrink-0" style={{background:C.teal,color:"#fff",opacity:connecting?0.6:1}}>{connecting?<Loader2 size={13} className="animate-spin"/>:<Cloud size={13}/>} Connect Google Drive</button>
              </div>
            )}
          </div>
          {saved==="ERROR"&&(<div className="p-2.5 rounded-lg mb-3 text-xs" style={{background:"#fbeeea",color:C.clay,border:`1px solid ${C.clay}44`}}>Couldn't build the document.<br/><span style={{opacity:0.85}}>Reason: {buildErr||"unknown"}</span></div>)}
          {saved&&saved!=="ERROR"&&(<div className="p-2.5 rounded-lg mb-3 text-xs" style={{background:`${C.olive}18`,color:C.olive,border:`1px solid ${C.olive}44`}}>
            <div className="flex items-center gap-2"><Check size={13}/> <span>Saved <b>{saved}</b>{drive.connected?` to Drive · ${drive.folder}`:" to this device"}.</span></div>
            {!drive.connected&&<div style={{marginTop:6,color:C.ink,lineHeight:1.5}}>
              <b>Where is it?</b> iPhone/iPad: <b>Files app → Downloads</b> (or tap the ↓ in Safari's address bar). Android: <b>Files → Downloads</b>. Computer: your Downloads folder.<br/>
              <b>To Google Drive:</b> in Files, long-press the file → <b>Share → Drive</b>. Open it there with Google Docs and edit away. Opening directly in the Word app can fail from previews — go through Files or Drive instead.
            </div>}
          </div>)}
          <div className="p-3 rounded-xl mb-4 text-xs leading-relaxed" style={{background:`${C.clay}12`,border:`1px solid ${C.clay}44`,color:C.ink}}>
            Each export saves a new versioned file (v1, v2, …) with date and time — earlier versions stay put. <b>Lock</b> any entry you've hand-arranged in Word so the manifest flags it before you rebuild.
          </div>
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {["new","updated","current","locked"].map((k)=>counts[k]?(<span key={k} className="px-2.5 py-1 rounded-full" style={{background:`${STATUS_META[k].color}18`,color:STATUS_META[k].color,border:`1px solid ${STATUS_META[k].color}44`}}>{counts[k]} {STATUS_META[k].label}</span>):null)}
          </div>
          {rows.length===0&&<p style={{color:C.inkSoft,fontSize:14}}>Nothing started yet — add notes or photos at a stop first.</p>}
          <div className="flex flex-col gap-1.5 mb-5">
            {rows.map(({sid,name,status,locked,imp})=>{const m=STATUS_META[status];return(
              <div key={sid} className="flex items-center gap-2 p-2.5 rounded-lg" style={{background:C.card,border:`1px solid ${C.line}`}}>
                <span style={{width:6,height:6,borderRadius:999,background:m.color}} className="shrink-0"/>
                <span style={{fontSize:13.5,color:C.ink,flex:1}} className="truncate">{name}{imp&&<span style={{color:C.olive,fontSize:10,fontWeight:700}}> · IMPROMPTU</span>}</span>
                <span style={{fontSize:10.5,color:m.color,fontWeight:600}}>{m.label}</span>
                {!imp&&<button onClick={()=>onToggleLock(sid)} title={locked?"Unlock":"Lock"}>{locked?<Lock size={14} style={{color:C.brassDk}}/>:<Unlock size={14} style={{color:C.line}}/>}</button>}
              </div>
            );})}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={buildFull} disabled={!started.length||building} className="w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2" style={{background:C.brass,color:"#fff",opacity:(started.length&&!building)?1:0.5}}>{building?<Loader2 size={16} className="animate-spin"/>:<Download size={16}/>} Build full journal ({started.length})</button>
            <button onClick={buildNew} disabled={!buildable.length||building} className="w-full py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2" style={{background:"transparent",color:C.ink,border:`1px solid ${C.line}`,opacity:(buildable.length&&!building)?1:0.5}}>New &amp; updated only ({buildable.length}) — for appending</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportBar({trip,onOpen}){
  const total=trip.itinerary.flatMap((d)=>d.sids).filter((s)=>s!=="home").length;
  const filled=trip.itinerary.flatMap((d)=>d.sids).filter((sid)=>{const e=trip.journal[sid];return sid!=="home"&&e&&(e.text?.trim()||e.photos?.length);}).length;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10" style={{background:C.card,borderTop:`1px solid ${C.line}`}}>
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <span style={{fontSize:13,color:C.inkSoft}}>{filled} of {total} stops journaled</span>
        <button onClick={onOpen} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold" style={{background:C.brass,color:"#fff"}}><Download size={16}/> Export</button>
      </div>
    </div>
  );
}

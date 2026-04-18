(function() {
    'use strict';

    // ========== ADULT CONTENT BLOCKING ==========
    const adultKeywords = {
        // English adult/pornography terms
        english: [
            'porn', 'porno', 'pornography', 'xxx', 'sex', 'sexy', 'nude', 'naked', 'nudity',
            'adult', 'erotic', 'erotica', 'hentai', 'blowjob', 'handjob', 'anal', 'oral',
            'vagina', 'penis', 'cock', 'dick', 'pussy', 'tits', 'boobs', 'breasts', 'ass',
            'fuck', 'fucking', 'milf', 'gilf', 'teen', 'amateur', 'webcam', 'camgirl',
            'escort', 'prostitute', 'brothel', 'bdsm', 'bondage', 'fetish', 'kink',
            'masturbation', 'masturbate', 'orgasm', 'ejaculation', 'cum', 'sperm',
            'hardcore', 'softcore', 'lesbian', 'gay porn', 'trans porn', 'shemale',
            'deepthroat', 'gangbang', 'threesome', 'foursome', 'orgy', 'swinger',
            'creampie', 'facial', 'cumshot', 'bukkake', 'gape', 'fisting', 'squirt',
            'interracial', 'incest', 'taboo', 'stepmom', 'stepsis', 'stepbro',
            'onlyfans', 'fansly', 'manyvids', 'pornhub', 'xvideos', 'xhamster',
            'redtube', 'youporn', 'tube8', 'spankbang', 'chaturbate', 'myfreecams',
            'brazzers', 'bangbros', 'realitykings', 'naughtyamerica', 'playboy',
            'penthouse', 'hustler', 'vivid', 'kink', 'nubiles', 'metart', 'femjoy',
            'twistys', 'digitalplayground', 'elegantangel', 'wicked', 'private',
            'dorcel', 'marc dorcel', 'legalporno', 'tushy', 'blacked', 'vixen',
            'mofos', 'mofosex', 'beeg', 'spankwire', 'sunporno', 'pornicom',
            'pornhat', 'porntrex', 'pornmz', 'pornhubs', 'pornheed', 'pornburst',
            'pornito', 'pornjam', 'pornkay', 'pornlib', 'pornone', 'pornoxo',
            'pornper', 'pornrox', 'pornsocket', 'pornstar', 'pornsteep',
            'porntop', 'porntube', 'pornuru', 'pornwild', 'pornworld'
        ],
        // Polish adult/pornography terms
        polish: [
            'porno', 'sex', 'seks', 'nagie', 'nagi', 'naga', 'nagich', 'nago',
            'erotyka', 'erotyczny', 'erotyczna', 'erotyczne', 'erotyk',
            'gwiazda porno', 'gwiazdy porno', 'film porno', 'filmy porno',
            'wideo porno', 'sex kamerki', 'sex telefon', 'sex anonse',
            'anonse erotyczne', 'ogłoszenia towarzyskie', 'seks oferty',
            'dziwka', 'dziwki', 'kurwa', 'kurewka', 'szmata', 'fetysz',
            'bdsm', 'pederasta', 'pedał', 'lesbijka', 'lesbijki', 'gej',
            'masturbacja', 'masturbowac', 'orgazm', 'wytrysk', 'sperma',
            'penis', 'członek', 'kutas', 'fiut', 'cipa', 'pizda', 'wagina',
            'cycki', 'cycuszki', 'biust', 'piersi', 'tyłek', 'dupa', 'dupcia',
            'ujawniacz', 'nudesy', 'nudes', 'nude', 'naked', 'nagość',
            'striptiz', 'striptizerka', 'tancerka erotyczna', 'tancerka go-go',
            'klub go-go', 'klub nocny', 'burdel', 'dom publiczny', 'agencja towarzyska',
            'prostytutka', 'prostytutki', 'seks praca', 'praca w seksie',
            'seks za pieniadze', ' sponsoring', 'sugar daddy', 'sugar baby',
            'układ', 'układzik', 'sex spotkania', 'sex randki', 'sex anonse',
            'sex ogłoszenia', 'sex oferty', 'sex priv', 'sex privy',
            'sex warszawa', 'sex krakow', 'sex wroclaw', 'sex gdansk',
            'sex katowice', 'sex poznan', 'sex lodz', 'sex szczecin',
            'sex bydgoszcz', 'sex lublin', 'sex bialystok', 'sex gdynia',
            'sex sopot', 'sex zakopane', 'sex polska', 'polskie porno',
            'polski sex', 'polskie dziewczyny', 'polskie amatorki'
        ]
    };

    // Adult/pornographic domains to block
    const adultDomains = [
        'pornhub.com', 'xvideos.com', 'xhamster.com', 'redtube.com', 'youporn.com',
        'tube8.com', 'spankbang.com', 'chaturbate.com', 'myfreecams.com',
        'brazzers.com', 'bangbros.com', 'realitykings.com', 'naughtyamerica.com',
        'playboy.com', 'penthouse.com', 'hustler.com', 'vivid.com',
        'onlyfans.com', 'fansly.com', 'manyvids.com', 'justfor.fans',
        'porn.com', 'porno.com', 'sex.com', 'xxx.com', 'xvideo.com',
        'beeg.com', 'spankwire.com', 'sunporno.com', 'pornicom.com',
        'pornhat.com', 'porntrex.com', 'pornmz.com', 'pornheed.com',
        'pornburst.com', 'pornito.com', 'pornjam.com', 'pornkay.com',
        'pornlib.com', 'pornone.com', 'pornoxo.com', 'pornper.com',
        'pornrox.com', 'pornsocket.com', 'pornstar.com', 'porntop.com',
        'porntube.com', 'pornuru.com', 'pornwild.com', 'pornworld.com',
        'xhamsterlive.com', 'stripchat.com', 'bongacams.com', 'cam4.com',
        'livejasmin.com', 'imlive.com', 'streamate.com', 'flirt4free.com',
        'camsoda.com', 'jerkmate.com', 'slutroulette.com', 'lucky crush',
        'omegle.com', 'ome.tv', 'chatroulette.com', 'bazoocam.org',
        'redtube.com.pl', 'youporn.pl', 'pornhub.pl', 'sex.pl', 'erotyka.pl',
        'sexkamerki.pl', 'polskieporno.pl', 'pornopolskie.pl'
    ];

    // Check if we're on an adult site
    function isAdultSite() {
        const hostname = window.location.hostname.toLowerCase();
        const pathname = window.location.pathname.toLowerCase();
        
        // Check domain
        for (const domain of adultDomains) {
            if (hostname.includes(domain)) return true;
        }
        
        return false;
    }

    // Check if Google search contains adult terms
    function checkGoogleSearchForAdultContent() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q') || '';
        
        // Check if on Google
        if (!hostname.includes('google')) return false;
        
        // Check if it's a search page
        if (!pathname.includes('/search') && !pathname.includes('/webhp')) return false;
        
        // Check search query for adult terms
        const queryLower = query.toLowerCase();
        const allAdultTerms = [...adultKeywords.english, ...adultKeywords.polish];
        
        for (const term of allAdultTerms) {
            if (queryLower.includes(term.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }

    // Create full-screen blocker
    function createBlockerScreen() {
        // Remove any existing blocker
        const existing = document.getElementById('fakeless-blocker');
        if (existing) existing.remove();
        
        const blocker = document.createElement('div');
        blocker.id = 'fakeless-blocker';
        blocker.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            text-align: center;
            color: white;
        `;
        
        blocker.innerHTML = `
            <div style="max-width: 600px; padding: 40px;">
                <h1 style="font-size: 48px; margin-bottom: 20px; color: #e94560;">
                    🚫 ACCESS DENIED
                </h1>
                <p style="font-size: 24px; margin-bottom: 30px; line-height: 1.6;">
                    You can't get here<br>
                    Go back to safe seas
                </p>
                <p style="font-size: 16px; margin-bottom: 40px; color: #a0a0a0;">
                    This content has been blocked by FakeLess<br>
                    to keep your browsing safe and family-friendly.
                </p>
                <button id="fakeless-go-back" style="
                    background: linear-gradient(135deg, #e94560, #ff6b6b);
                    color: white;
                    padding: 15px 40px;
                    font-size: 18px;
                    border: none;
                    border-radius: 30px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
                    transition: transform 0.2s;
                ">Return to Safety</button>
            </div>
        `;
        
        document.body.appendChild(blocker);
        
        // Add click handler for the button
        document.getElementById('fakeless-go-back').addEventListener('click', function() {
            window.location.href = 'https://www.google.com';
        });
        
        // Auto-redirect after 5 seconds
        setTimeout(() => {
            window.location.href = 'https://www.google.com';
        }, 5000);
    }

    // Main blocking function
    function blockIfAdultContent() {
        // Check for adult site
        if (isAdultSite()) {
            createBlockerScreen();
            return true;
        }
        
        // Check for adult Google search
        if (checkGoogleSearchForAdultContent()) {
            createBlockerScreen();
            return true;
        }
        
        return false;
    }

    // Run blocking check immediately
    if (blockIfAdultContent()) {
        // If blocked, stop here
        return;
    }

    // Continue with rest of content filtering...

    // Comprehensive dictionary of Polish swear words, insults and negative terms
    const offensiveWords = [
        // Basic swear words
        'kurwa', 'kurwe', 'kurwy', 'kurw', 'kurwo', 'kurwu',
        'ja pierdol', 'jebac', 'jeba', 'jebie', 'jebali', 'jebal', 'jebany', 'jebana', 'jebane',
        'pierdol', 'pierdole', 'pierdoli', 'pierdolil', 'pierdolila', 'pierdolone', 'pierdolony', 'pierdolna',
        'pierdolnic', 'pierdziel', 'pierdzielona', 'pierdzielony',
        'pizda', 'pizde', 'pizdy', 'pizdzie', 'pizdo',
        'chuj', 'chuja', 'chuje', 'chujem', 'chujowy', 'chujowa', 'chujowe',
        'sra', 'sral', 'srac', 'sraja', 'sraj', 'srane', 'srany',
        'gówno', 'gówna', 'gównem', 'gówno', 'gówniany', 'gówniana',
        'skurwysyn', 'skurwysyna', 'skurwysynie', 'skurwysyny', 'skurwieli',
        
        // Insults directed at people
        'debil', 'debila', 'debilu', 'debile', 'debilski', 'debilska', 'debilskie',
        'idiot', 'idiota', 'idiotce', 'idioci', 'idiotka', 'idiotki', 'idiotyczny', 'idiotyczna', 'idiotyczne',
        'gupiec', 'gupca', 'gupcowi', 'gupcy', 'gupie', 'gupi',
        'kretyn', 'kretyna', 'kretynie', 'kretyni', 'kretynski', 'kretynska', 'kretynskie',
        'baran', 'barana', 'baranie', 'barany', 'barani',
        'osio', 'osla', 'oslu', 'osly', 'oslowie',
        'pajac', 'pajaca', 'pajacem', 'pajace', 'pajacy',
        'gnojek', 'gnojka', 'gnojkom', 'gnojki', 'gnojku',
        'szmata', 'szmaty', 'szmato', 'szmatom', 'szmatach',
        'suka', 'suki', 'suko', 'sukom', 'sukach',
        'kurwa', 'kurwy', 'kurwo', 'kurwom', 'kurwach',
        'pierdolona', 'pierdolony', 'pierdolone',
        
        // Negative adjectives describing people
        'szajsowy', 'szajsowa', 'szajsowe',
        'sra', 'sraca', 'sracy',
        'rozjebany', 'rozjebana', 'rozjebane',
        'spierdolony', 'spierdolona', 'spierdolone',
        'zjebany', 'zjebana', 'zjebane',
        'pierdolnity', 'pierdolnita', 'pierdolnite',
        'ojebany', 'ojebana', 'ojebane',
        'przejebany', 'przejebana', 'przejebane',
        'wyjebany', 'wyjebana', 'wyjebane',
        'dojebany', 'dojebana', 'dojebane',
        'najebany', 'najebana', 'najebane',
        'obrzerdalny', 'obrzerdalna', 'obrzerdalne',
        'obrzerdal', 'obrzerdala', 'obrzerdalo',
        
        // Verbs with negative connotations
        'jebac', 'jebie', 'jebal', 'jebala', 'jebali', 'jebaly',
        'pierdolic', 'pierdoli', 'pierdolil', 'pierdolila', 'pierdolili', 'pierdolily',
        'sra', 'sral', 'srala', 'srali', 'sraly',
        'srac', 'sraj', 'srali', 'sraly',
        
        // Common insults and negative terms
        'cwel', 'cwla', 'cwlu', 'cwle', 'cwli',
        'pedal', 'pedala', 'pedalu', 'pedale', 'pedaly',
        'ciota', 'cioty', 'ciocie', 'ciotom',
        'gej', 'geja', 'gejem', 'geje', 'gejow',
        'lesba', 'lesby', 'lesbie', 'lesbom',
        'zjeb', 'zjeba', 'zjebie', 'zjebi',
        'frajer', 'frajera', 'frajerowi', 'frajerzy', 'frajerow',
        'kujon', 'kujona', 'kujonowi', 'kujony', 'kujonow',
        'nerd', 'nerda', 'nerdowi', 'nerdzi', 'nerdow',
        'leszcz', 'leszcza', 'leszczowi', 'leszcze', 'leszczy',
        
        // More vulgar terms
        'pierdzielony', 'pierdzielona', 'pierdzielone',
        'skurwiel', 'skurwiela', 'skurwielowi', 'skurwiele', 'skurwielow',
        'srajto', 'srajta', 'srajtom', 'srajtach',
        'gówniarz', 'gówniarza', 'gówniarzowi', 'gówniarze', 'gówniarzow',
        'srajcop', 'srajcopa', 'srajcopowi', 'srajcopy', 'srajcopow',
        
        // Additional offensive terms
        'chamski', 'chamska', 'chamskie',
        'paskudny', 'paskudna', 'paskudne',
        'brudny', 'brudna', 'brudne',
        'szpetny', 'szpetna', 'szpetne',
        'brzydki', 'brzydka', 'brzydkie',
        'obrzydliwy', 'obrzydliwa', 'obrzydliwe',
        'wstrzety', 'wstrzeta', 'wstrzetne',
        'odpychajacy', 'odpychajaca', 'odpychajace',
        
        // Racial and ethnic slurs (Polish context)
        'ciemniak', 'ciemniaka', 'ciemniakowi', 'ciemniacy', 'ciemniakow',
        'murzyn', 'murzyna', 'murzynowi', 'murzynie', 'murzynow',
        'zyd', 'zyda', 'zydowi', 'zydzi', 'zydow',
        'ruski', 'ruskiego', 'ruskiemu', 'ruscy', 'ruskich',
        'niemiec', 'niemca', 'niemcowi', 'niemcy', 'niemcow',
        'ukrainiec', 'ukrainca', 'ukraincowi', 'ukraincy', 'ukraincow',
        
        // Gender-based insults
        'baba', 'baby', 'babo', 'babom', 'babach',
        'babochlop', 'babochlopa', 'babochlopowi', 'babochlopy', 'babochlopow',
        'ciota', 'cioty', 'ciocie', 'ciotom',
        'leszcz', 'leszcza', 'leszczowi', 'leszcze', 'leszczy',
        
        // Additional vulgar expressions
        'pierdolnik', 'pierdolnika', 'pierdolnikowi', 'pierdolniki', 'pierdolnikow',
        'jebnik', 'jebnika', 'jebnikowi', 'jebniki', 'jebnikow',
        'srajbus', 'srajbusa', 'srajbusowi', 'srajbusy', 'srajbusow',
        'gównojad', 'gównojada', 'gównojadowi', 'gównojady', 'gównojadow',
        
        // More insults
        'gagatek', 'gatka', 'gatku', 'gatki', 'gatkow',
        'gnoj', 'gnoja', 'gnojowi', 'gnoje', 'gnojow',
        'szwindel', 'szwindla', 'szwindlowi', 'szwindle', 'szwindlow',
        'szwindlarz', 'szwindlarza', 'szwindlarzowi', 'szwindlarze', 'szwindlarzow',
        'oszust', 'oszusta', 'oszustom', 'oszu', 'oszuci',
        
        // Negative characteristics
        'leniwy', 'leniwa', 'leniwe',
        'tchórz', 'tchórza', 'tchórzowi', 'tchórze', 'tchórzy',
        'slabeusz', 'slabeusza', 'slabeuszowi', 'slabeusze', 'slabeuszow',
        'tchórzliwy', 'tchórzliwa', 'tchórzliwe',
        'zastraszy', 'zastrasza', 'zastraszyli', 'zastraszyly',
        
        // More offensive terms
        'pierdol', 'pierdola', 'pierdole', 'pierdolom', 'pierdolach',
        'skurw', 'skurwy', 'skurwom', 'skurwach',
        'jeb', 'jeba', 'jebom', 'jebach',
        
        // Additional vulgar words
        'kutas', 'kutasa', 'kutasowi', 'kutasy', 'kutasow',
        'cipa', 'cipy', 'cipie', 'cipom', 'cipach',
        'pizda', 'pizdy', 'pizdzie', 'pizdom', 'pizdach',
        'fiut', 'fiuta', 'fiutowi', 'fiuty', 'fiutow',
        'srom', 'sromu', 'sromowi', 'sromy', 'sromow',
        
        // More insults
        'debilizm', 'debilizmu', 'debilizmom', 'debilizmach',
        'idiotyzm', 'idiotyzmu', 'idiotyzmom', 'idiotyzmach',
        'gupota', 'gupoty', 'gupocie', 'gupotom', 'gupotach',
        'kretynizm', 'kretynizmu', 'kretynizmom', 'kretynizmach',
        
        // Additional negative terms
        'brudas', 'brudasa', 'brudasowi', 'brudasy', 'brudasow',
        'smrod', 'smrodu', 'smrodowi', 'smrody', 'smrodow',
        'smierdziec', 'smierdzi', 'smierdzial', 'smierdziala', 'smierdzieli', 'smierdziely',
        'cuchnacy', 'cuchnaca', 'cuchnace',
        'smierdzacy', 'smierdzaca', 'smierdzace',
        
        // More vulgar expressions
        'pierdolnac', 'pierdolna', 'pierdolneli', 'pierdolnelly',
        'jebnac', 'jebna', 'jebneli', 'jebnely',
        'srac', 'sraja', 'srali', 'sraly',
        
        // Additional insults
        'baranina', 'baraniny', 'baraninie', 'baraninom', 'baraninach',
        'owloglowy', 'owloglowa', 'owloglowe',
        'krowi', 'krowiej', 'krowimi',
        'swinski', 'swinska', 'swinskie',
        'psie', 'psiego', 'psiemu', 'psie', 'psich',
        
        // More offensive terms
        'gówno', 'gówna', 'gównem', 'gównie', 'gównach',
        'szajs', 'szajsa', 'szajsem', 'szajsy', 'szajsow',
        'kiszka', 'kiszki', 'kiszce', 'kiszkom', 'kiszkach',
        'sraczka', 'sraczki', 'sraczce', 'sraczkom', 'sraczkach',
        
        // Additional negative characteristics
        'brzydota', 'brzydoty', 'brzydocie', 'brzydotom', 'brzydotach',
        'paskudztwo', 'paskudztwa', 'paskudztwu', 'paskudztwa', 'paskudztwach',
        'obrzydlistwo', 'obrzydlistwa', 'obrzydlistwu', 'obrzydlistwa', 'obrzydlistwach',
        'wstrret', 'wstrretu', 'wstretem', 'wstrety', 'wstretow',
        
        // More insults
        'gagar', 'gagara', 'gagarowi', 'gagary', 'gagarow',
        'gagatek', 'gatka', 'gatku', 'gatki', 'gatkow',
        'glup', 'glupa', 'glupi', 'glupich',
        'prostak', 'prostaka', 'prostakowi', 'prostacy', 'prostakow',
        'burak', 'buraka', 'burakowi', 'buraki', 'burakow',
        
        // Additional vulgar terms
        'pierdol', 'pierdola', 'pierdole', 'pierdolom', 'pierdolach',
        'jeb', 'jeba', 'jebie', 'jebom', 'jebach',
        'kurw', 'kurwy', 'kurwie', 'kurwom', 'kurwach',
        'pizd', 'pizdy', 'pizdzie', 'pizdom', 'pizdach',
        
        // More negative terms
        'beznadziejny', 'beznadziejna', 'beznadziejne',
        'okropny', 'okropna', 'okropne',
        'straszny', 'straszna', 'straszne',
        'okropliwy', 'okropliwa', 'okropliwe',
        'straszliwy', 'straszliwa', 'straszliwe',
        
        // Additional insults
        'debil', 'debila', 'debilu', 'debile', 'debilski', 'debilska', 'debilskie',
        'idiot', 'idiota', 'idiotce', 'idioci', 'idiotka', 'idiotki', 'idiotyczny', 'idiotyczna', 'idiotyczne',
        'gupiec', 'gupca', 'gupcowi', 'gupcy', 'gupie', 'gupi',
        'kretyn', 'kretyna', 'kretynie', 'kretyni', 'kretynski', 'kretynska', 'kretynskie'
    ];

    // Function to replace offensive words with #
    function replaceOffensiveWords(text) {
        let result = text;
        
        // Sort by length (longest first) to avoid partial matches
        const sortedWords = [...offensiveWords].sort((a, b) => b.length - a.length);
        
        sortedWords.forEach(word => {
            // Create regex that matches the word in various forms
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            result = result.replace(regex, (match) => {
                return '#'.repeat(match.length);
            });
        });
        
        return result;
    }

    // Function to process text nodes
    function processTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const filteredText = replaceOffensiveWords(text);
            
            if (text !== filteredText) {
                node.textContent = filteredText;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip script, style, and input elements
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
                return;
            }
            
            // Process child nodes
            for (let i = 0; i < node.childNodes.length; i++) {
                processTextNodes(node.childNodes[i]);
            }
        }
    }

    // Function to observe DOM changes
    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
                            processTextNodes(node);
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    processTextNodes(mutation.target);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // Initial processing
    function initializeFilter() {
        if (document.body) {
            processTextNodes(document.body);
            observeChanges();
        } else {
            // If body is not ready, wait for it
            setTimeout(initializeFilter, 100);
        }
    }


    // Listen for messages from background script
    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === 'updateSettings') {
            // Update Gemini AI scanner settings if available
            if (window.geminiScanner) {
                window.geminiScanner.updateSettings(message.settings);
            }
        } else if (message.action === 'manualScan') {
            // Trigger manual Gemini AI scan
            if (window.geminiScanner) {
                window.geminiScanner.manualScan();
            }
        }
    });

    // Load settings and initialize Gemini AI scanner
    browser.storage.sync.get({
        geminiEnabled: true,
        geminiApiKey: '',
        geminiScanInterval: 10000,
        geminiShowWarnings: true
    }, function(settings) {
        if (window.geminiScanner) {
            window.geminiScanner.updateSettings(settings);
        }
    });

})();

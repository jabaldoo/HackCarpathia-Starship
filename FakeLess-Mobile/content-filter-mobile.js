// FakeLess Mobile - Content Filter
// Mobile-optimized: Adult blocking + word filtering

(function() {
    'use strict';

    // ========== ADULT CONTENT BLOCKING ==========
    const adultKeywords = {
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
            'twistys', 'digitalplayground', 'tushy', 'blacked', 'vixen',
            'mofos', 'beeg', 'spankwire', 'sunporno'
        ],
        polish: [
            'porno', 'sex', 'seks', 'nagie', 'nagi', 'naga', 'nagich', 'nago',
            'erotyka', 'erotyczny', 'erotyczna', 'erotyczne', 'erotyk',
            'gwiazda porno', 'gwiazdy porno', 'film porno', 'filmy porno',
            'wideo porno', 'sex kamerki', 'sex telefon', 'sex anonse',
            'anonse erotyczne', 'ogłoszenia towarzyskie', 'seks oferty',
            'dziwka', 'dziwki', 'fetysz', 'bdsm',
            'masturbacja', 'masturbowac', 'orgazm', 'wytrysk', 'sperma',
            'penis', 'członek', 'kutas', 'fiut', 'cipa', 'pizda', 'wagina',
            'cycki', 'cycuszki', 'biust', 'piersi', 'tyłek', 'dupa', 'dupcia',
            'ujawniacz', 'nudesy', 'nudes', 'nude', 'naked', 'nagość',
            'striptiz', 'striptizerka', 'tancerka erotyczna',
            'klub go-go', 'burdel', 'dom publiczny', 'agencja towarzyska',
            'prostytutka', 'prostytutki', 'seks praca',
            'seks za pieniadze', 'sponsoring', 'sugar daddy', 'sugar baby',
            'sex spotkania', 'sex randki', 'sex anonse',
            'sex ogłoszenia', 'sex oferty',
            'sex warszawa', 'sex krakow', 'sex wroclaw', 'sex gdansk',
            'sex katowice', 'sex poznan', 'sex lodz', 'sex szczecin',
            'sex bydgoszcz', 'sex lublin', 'sex bialystok', 'sex gdynia',
            'polskie porno', 'polski sex'
        ]
    };

    const adultDomains = [
        'pornhub.com', 'xvideos.com', 'xhamster.com', 'redtube.com', 'youporn.com',
        'tube8.com', 'spankbang.com', 'chaturbate.com', 'myfreecams.com',
        'brazzers.com', 'bangbros.com', 'realitykings.com', 'naughtyamerica.com',
        'playboy.com', 'penthouse.com', 'hustler.com', 'vivid.com',
        'onlyfans.com', 'fansly.com', 'manyvids.com',
        'porn.com', 'porno.com', 'sex.com', 'xxx.com',
        'beeg.com', 'spankwire.com', 'sunporno.com',
        'xhamsterlive.com', 'stripchat.com', 'bongacams.com',
        'livejasmin.com', 'camsoda.com', 'jerkmate.com',
        'redtube.com.pl', 'sex.pl', 'erotyka.pl',
        'sexkamerki.pl', 'polskieporno.pl'
    ];

    function isAdultSite() {
        const hostname = window.location.hostname.toLowerCase();
        for (const domain of adultDomains) {
            if (hostname.includes(domain)) return true;
        }
        return false;
    }

    function checkGoogleSearchForAdultContent() {
        const hostname = window.location.hostname;
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q') || '';
        
        if (!hostname.includes('google')) return false;
        if (!window.location.pathname.includes('/search')) return false;
        
        const queryLower = query.toLowerCase();
        const allAdultTerms = [...adultKeywords.english, ...adultKeywords.polish];
        
        for (const term of allAdultTerms) {
            if (queryLower.includes(term.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    function createBlockerScreen() {
        const existing = document.getElementById('fakeless-mobile-blocker');
        if (existing) existing.remove();
        
        const blocker = document.createElement('div');
        blocker.id = 'fakeless-mobile-blocker';
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
            padding: 20px;
        `;
        
        blocker.innerHTML = `
            <div style="max-width: 90%;">
                <h1 style="font-size: 36px; margin-bottom: 20px; color: #e94560;">
                    🚫 ZABLOKOWANO
                </h1>
                <p style="font-size: 20px; margin-bottom: 20px; line-height: 1.5;">
                    You can't get here<br>
                    Go back to safe seas
                </p>
                <p style="font-size: 14px; margin-bottom: 30px; color: #a0a0a0;">
                    Ta treść została zablokowana przez FakeLess<br>
                    dla Twojego bezpieczeństwa.
                </p>
                <button id="fakeless-mobile-back" style="
                    background: linear-gradient(135deg, #e94560, #ff6b6b);
                    color: white;
                    padding: 15px 40px;
                    font-size: 16px;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
                    touch-action: manipulation;
                ">Powrót do bezpieczeństwa</button>
            </div>
        `;
        
        document.body.appendChild(blocker);
        
        document.getElementById('fakeless-mobile-back').addEventListener('click', function() {
            window.location.href = 'https://www.google.com';
        });
        
        setTimeout(() => {
            window.location.href = 'https://www.google.com';
        }, 5000);
    }

    // ========== WORD FILTERING ==========
    const offensiveWords = [
        'kurwa', 'kurwe', 'kurwy', 'kurw', 'kurwo', 'kurwu',
        'jebac', 'jeba', 'jebie', 'jebali', 'jebal', 'jebany', 'jebana', 'jebane',
        'pierdol', 'pierdole', 'pierdoli', 'pierdolil', 'pierdolila', 'pierdolone', 'pierdolony',
        'pizda', 'pizde', 'pizdy', 'pizdzie', 'pizdo',
        'chuj', 'chuja', 'chuje', 'chujem', 'chujowy', 'chujowa', 'chujowe',
        'sra', 'sral', 'srac', 'sraja', 'sraj', 'srane', 'srany',
        'gówno', 'gówna', 'gównem', 'gówniany', 'gówniana',
        'skurwysyn', 'skurwysyna', 'skurwysynie', 'skurwysyny',
        'debil', 'debila', 'debilu', 'debile', 'debilski', 'debilska',
        'idiot', 'idiota', 'idiotce', 'idioci', 'idiotka', 'idiotki',
        'kretyn', 'kretyna', 'kretynie', 'kretyni',
        'baran', 'barana', 'baranie', 'barany',
        'pajac', 'pajaca', 'pajacem', 'pajace',
        'gnojek', 'gnojka', 'gnojkom', 'gnojki',
        'szmata', 'szmaty', 'szmato', 'szmatom',
        'suka', 'suki', 'suko', 'sukom',
        'cwel', 'cwla', 'cwlu', 'cwle',
        'pedal', 'pedala', 'pedalu', 'pedale',
        'ciota', 'cioty', 'ciocie', 'ciotom',
        'frajer', 'frajera', 'frajerowi', 'frajerzy',
        'chamski', 'chamska', 'chamskie'
    ];

    let replacementChar = '#';
    let filterEnabled = true;
    let adultBlockEnabled = true;

    function replaceOffensiveWords(text) {
        if (!filterEnabled) return text;
        
        let result = text;
        offensiveWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            result = result.replace(regex, match => replacementChar.repeat(match.length));
        });
        return result;
    }

    function processTextNodes(node) {
        if (!filterEnabled) return;
        
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const filteredText = replaceOffensiveWords(text);
            if (text !== filteredText) {
                node.textContent = filteredText;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
                return;
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                processTextNodes(node.childNodes[i]);
            }
        }
    }

    // Mobile-optimized observer (less aggressive)
    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldProcess = true;
                }
            });
            
            if (shouldProcess && filterEnabled) {
                // Debounce for mobile performance
                clearTimeout(window.filterTimeout);
                window.filterTimeout = setTimeout(() => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
                                processTextNodes(node);
                            }
                        });
                    });
                }, 500);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: false // Less intensive for mobile
        });
    }

    function initializeFilter() {
        if (document.body && filterEnabled) {
            processTextNodes(document.body);
            observeChanges();
        }
    }

    // ========== INITIALIZATION ==========
    function initBlocking() {
        if (adultBlockEnabled) {
            if (isAdultSite()) {
                createBlockerScreen();
                return true;
            }
            if (checkGoogleSearchForAdultContent()) {
                createBlockerScreen();
                return true;
            }
        }
        return false;
    }

    // Listen for messages
    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === 'updateSettings') {
            if (message.settings) {
                adultBlockEnabled = message.settings.enableAdultBlock !== false;
                filterEnabled = message.settings.enableFilter !== false;
                replacementChar = message.settings.replacementChar || '#';
                
                if (window.geminiScannerMobile) {
                    window.geminiScannerMobile.updateSettings(message.settings);
                }
            }
        } else if (message.action === 'manualScan') {
            if (window.geminiScannerMobile) {
                window.geminiScannerMobile.manualScan();
            }
        }
    });

    // Load settings and initialize
    browser.storage.sync.get({
        enableAdultBlock: true,
        enableFilter: true,
        replacementChar: '#',
        geminiEnabled: true
    }, function(settings) {
        adultBlockEnabled = settings.enableAdultBlock !== false;
        filterEnabled = settings.enableFilter !== false;
        replacementChar = settings.replacementChar || '#';
        
        // Run adult blocking check first
        if (initBlocking()) {
            return;
        }
        
        // Initialize word filtering if enabled
        if (filterEnabled && document.body) {
            initializeFilter();
        }
    });
})();

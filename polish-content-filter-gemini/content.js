(function() {
    'use strict';

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

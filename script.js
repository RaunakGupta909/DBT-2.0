document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Icons and Date
    lucide.createIcons();
    document.getElementById('dateTime').innerText = new Date().toDateString();

    // 2. Language Dictionary
    const i18n = {
        en: {
            nav: { title: "DBT Saarthi", sub: "Direct Benefit Transfer", home: "Home", gramin: "Rural Awareness", check: "Check Status", generate: "Letter Generator", roles: "Roles", cta: "Link Aadhaar", saarthi: "Digital Saarthi" },
            hero: { title: "Linking is Identity.\nSeeding is Payment.", subtitle: "Just giving your Aadhaar to the bank is NOT enough. Your account must be 'Seeded' in the NPCI Mapper.", btn1: "Check Status", btn2: "Create Bank Letter" },
            gramin: {
                title: "Gramin Jagrukta Abhiyan", sub: "Special initiatives for rural citizens to ensure DBT benefits reach the last mile.",
                c1: { title: "Bank Mitra / BC", desc: "In villages without bank branches, contact your 'Bank Mitra'. They carry a Micro-ATM device." },
                c2: { title: "Common Service Center", desc: "Visit your nearest CSC (Jan Seva Kendra). The VLE can help you check status." },
                c3: { title: "Gram Sabha Awareness", desc: "Raise the issue of 'Pending Scholarships' in the next Gram Sabha meeting." }
            },
            check: { title: "No Internet? Check Offline.", desc: "Use the USSD service *99*99*1# from your Aadhaar-linked mobile.", step1: "Dial *99*99*1#", step2: "Enter Aadhaar Number", step3: "Confirm Number", step4: "Receive SMS", btn: "Start Simulation" },
            gen: { title: "Bank Seeding Letter Generator", desc: "Generate a precise technical mandate form here.", name: "Student Name", bank: "Bank Name", branch: "Branch Name", acc: "Account Number", uid: "Aadhaar Number", print: "Print PDF" },
            role: { title: "Select Your Role", student: "Check status & scholarships", parent: "Manage children's benefits", teacher: "Track school students", volunteer: "Help the community" },
            saarthi: {
                title: "Digital Saarthi: Awareness & Guidance", sub: "Interactive tools for non-digital savvy parents, bridging literacy gaps.",
                voice: { title: "Parent Voice Guide", desc: "Click to listen to short, clear audio clips explaining the process in Hindi/Local Dialects.", btn1: "Listen: What is Seeding?", btn2: "Listen: How to Check Status?" },
                quiz: { title: "DBT Learning Zone (Quiz)" },
                chat: { title: "DBT Guide Bot (WhatsApp Style)", welcome: "Hello! I am DBT Saarthi. Ask me anything about Aadhaar Seeding, NPCI mapping, or scholarships.", options: "Try typing: What is Seeding? or Scholarship status." }
            }
        },
        hi: {
            nav: { title: "डीबीटी सारथी", sub: "प्रत्यक्ष लाभ हस्तांतरण", home: "होम", gramin: "ग्रामीण जागरूकता", check: "स्थिति जांचें", generate: "पत्र जेनरेटर", roles: "भूमिकाएं", cta: "आधार लिंक करें", saarthi: "डिजिटल सारथी" },
            hero: { title: "लिंकिंग पहचान है।\nसीडिंग भुगतान है।", subtitle: "बैंक को केवल आधार देना पर्याप्त नहीं है। आपका खाता एनपीसीआई (NPCI) में 'सीड' होना अनिवार्य है।", btn1: "स्थिति जांचें", btn2: "पत्र बनाएं" },
            gramin: {
                title: "ग्रामीण जागरूकता अभियान", sub: "ग्रामीण नागरिकों के लिए विशेष पहल ताकि डीबीटी का लाभ अंतिम व्यक्ति तक पहुंचे।",
                c1: { title: "बैंक मित्र / बीसी", desc: "जिन गांवों में बैंक शाखा नहीं है, वहां अपने 'बैंक मित्र' से संपर्क करें। उनके पास माइक्रो-एटीएम होता है।" },
                c2: { title: "जन सेवा केंद्र (CSC)", desc: "अपने निकटतम CSC पर जाएं। वीएलई (VLE) आपको स्थिति जांचने में मदद कर सकते हैं।" },
                c3: { title: "ग्राम सभा जागरूकता", desc: "अगली ग्राम सभा बैठक में 'रुकी हुई छात्रवृत्ति' का मुद्दा उठाएं। पंचायत सचिव के पास सूची होती है।" }
            },
            check: { title: "इंटरनेट नहीं है? ऑफलाइन जांचें।", desc: "अपने आधार से जुड़े मोबाइल से *99*99*1# सेवा का उपयोग करें।", step1: "*99*99*1# डायल करें", step2: "आधार नंबर दर्ज करें", step3: "पुष्टि करें", step4: "एसएमएस प्राप्त करें", btn: "सिमुलेशन शुरू करें" },
            gen: { title: "बैंक सीडिंग पत्र जेनरेटर", desc: "बैंकरों के लिए सटीक जनादेश फॉर्म यहां तैयार करें।", name: "छात्र का नाम", bank: "बैंक का नाम", branch: "शाखा का नाम", acc: "खाता संख्या", uid: "आधार संख्या", print: "पीडीएफ प्रिंट करें" },
            role: { title: "अपनी भूमिका चुनें", student: "स्थिति और छात्रवृत्ति जांचें", parent: "बच्चों के लाभ प्रबंधित करें", teacher: "स्कूली छात्रों को ट्रैक करें", volunteer: "समुदाय की मदद करें" },
            saarthi: {
                title: "डिजिटल सारथी: जागरूकता और मार्गदर्शन", sub: "गैर-डिजिटल-प्रेमी माता-पिता के लिए इंटरैक्टिव उपकरण, साक्षरता अंतराल को पाटना।",
                voice: { title: "अभिभावक वॉयस गाइड", desc: "हिंदी/स्थानीय बोलियों में प्रक्रिया समझाने वाले छोटे, स्पष्ट ऑडियो क्लिप सुनने के लिए क्लिक करें।", btn1: "सुनें: सीडिंग क्या है?", btn2: "सुनें: स्थिति कैसे जांचें?" },
                quiz: { title: "डीबीटी लर्निंग ज़ोन (क्विज़)" },
                chat: { title: "डीबीटी गाइड बॉट (व्हाट्सएप स्टाइल)", welcome: "नमस्ते! मैं डीबीटी सारथी हूं। मुझसे आधार सीडिंग, एनपीसीआई मैपिंग या छात्रवृत्ति के बारे में कुछ भी पूछें।", options: "टाइप करके देखें: **सीडिंग क्या है?** या **छात्रवृत्ति स्थिति**।" }
            }
        }
    };

    let currentLang = 'en';

    // 3. Language Toggle Function
    window.toggleLanguage = function() {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        document.getElementById('langLabel').textContent = currentLang === 'en' ? 'हिंदी' : 'English';

        const getVal = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = getVal(i18n[currentLang], key);
            if (text) el.innerText = text;
        });
    }

    // 4. USSD Simulation Logic
    window.runUSSDSimulation = function() {
        const screens = document.querySelectorAll('.ussd-state');
        screens.forEach(s => s.classList.remove('active'));

        document.getElementById('screen-calling').classList.add('active');

        setTimeout(() => {
            document.getElementById('screen-calling').classList.remove('active');
            document.getElementById('screen-input').classList.add('active');
        }, 2000);

        setTimeout(() => {
            document.getElementById('screen-input').classList.remove('active');
            document.getElementById('screen-confirm').classList.add('active');
        }, 4000);

        setTimeout(() => {
            document.getElementById('screen-confirm').classList.remove('active');
            document.getElementById('screen-result').classList.add('active');
        }, 6000);
    }

    window.resetUSSD = function() {
        document.querySelectorAll('.ussd-state').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-default').classList.add('active');
    }

    // 5. Letter Generator Logic
    window.updateLetter = function() {
        const inputs = ['inputName', 'inputBank', 'inputBranch', 'inputAadhaar'];
        inputs.forEach(id => {
            const targetId = id.replace('input', 'letter');
            const el = document.getElementById(id);
            const val = el.value;
            
            // Validation for Aadhaar
            if (id === 'inputAadhaar') {
                if (val.length > 0 && val.length !== 12) {
                    el.style.borderColor = 'red';
                } else {
                    el.style.borderColor = '#cbd5e1'; // Default border color
                }
            }

            document.getElementById(targetId).innerText = val || '...................';
        });

        const acc = document.getElementById('inputAccount').value || '...................';
        document.getElementById('letterAccount1').innerText = acc;
        document.getElementById('letterAccount2').innerText = acc;
    }

    window.printLetter = function() {
        const printContent = document.getElementById('print-letter').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>DBT Seeding Letter</title>');
        printWindow.document.write('<style>body{font-family:"Times New Roman",serif; padding:40px; line-height:1.6;} h4{text-align:center;text-decoration:underline;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    // 6. Feature 9: Gamified Awareness Quiz Logic
    window.checkAnswer = function(isCorrect) {
        const feedbackEl = document.getElementById('quiz-feedback');
        const optionsEl = document.getElementById('quiz-options');

        if (isCorrect === false) {
            feedbackEl.innerHTML = '<span style="color: #10b981; font-weight: bold;">Correct!</span> Linking is KYC, Seeding is enabling the account to receive government funds (NPCI Mapping).';
            optionsEl.innerHTML = '<span style="color: #10b981;">Awareness Completed!</span> 🥳';
        } else {
            feedbackEl.innerHTML = '<span style="color: #ef4444; font-weight: bold;">Incorrect.</span> Linking is identity verification (KYC). Seeding is connecting your bank account to the NPCI Mapper for DBT payments.';
        }
    }

    // 7. Feature 7: Parent Voice Guide Logic (Text-to-Speech)
    window.playAudio = function(topic) {
        // Stop any current speech
        window.speechSynthesis.cancel();

        const btn = document.getElementById('audio-btn-' + topic);
        const isPlaying = btn.classList.contains('playing');

        // Reset all buttons visual state
        document.querySelectorAll('.audio-btn').forEach(b => {
            b.classList.remove('playing');
            const originalText = b.getAttribute('data-original-text');
            if (originalText) {
                b.querySelector('span').innerText = originalText;
            }
            // Reset icon to play (using simple text/emoji to avoid SVG complexity issues)
            // Or better, just keep the icon as is and toggle class
        });

        if (!isPlaying) {
            // Store original text if not stored
            if (!btn.getAttribute('data-original-text')) {
                btn.setAttribute('data-original-text', btn.querySelector('span').innerText);
            }

            let textToSpeak = "";
            if (currentLang === 'hi') {
                if (topic === 'seeding') {
                    textToSpeak = "सीडिंग वह प्रक्रिया है जहां आपका बैंक आपके आधार को एनपीसीआई मैपर से जोड़ता है। सरकार इसी का उपयोग करके आपकी छात्रवृत्ति भेजती है। केवल लिंकिंग (केवाईसी) पर्याप्त नहीं है, भुगतान के लिए सीडिंग आवश्यक है।";
                } else if (topic === 'status') {
                    textToSpeak = "अपनी स्थिति जांचने के लिए, अपने मोबाइल से स्टार 99 स्टार 99 स्टार 1 हैश डायल करें। या यूआईडीएआई की वेबसाइट पर जाएं।";
                }
            } else {
                if (topic === 'seeding') {
                    textToSpeak = "Seeding is the process where your bank links your Aadhaar to the NPCI Mapper. This is what the government uses to send your scholarship. Linking is just KYC, but Seeding is for payment.";
                } else if (topic === 'status') {
                    textToSpeak = "To check your status, dial star 99 star 99 star 1 hash from your mobile. Or visit the UIDAI website.";
                }
            }

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
            
            utterance.onend = () => {
                btn.classList.remove('playing');
                btn.querySelector('span').innerText = btn.getAttribute('data-original-text');
            };

            btn.classList.add('playing');
            btn.querySelector('span').innerText = currentLang === 'hi' ? "बोल रहा है..." : "Speaking...";
            
            window.speechSynthesis.speak(utterance);
        }
    }

    // 8. Feature 2: DBT Guide Chatbot Logic (Enhanced)
    const chatResponses = {
        'seeding': "Seeding is the process where your bank links your Aadhaar to the **NPCI Mapper**. This is what the government uses to send your scholarship. Linking (KYC) is not enough!",
        'scholarship': "To check your scholarship status, you must visit the official **National Scholarship Portal** (NSP) and use your application ID.",
        'status': "You can check status by dialing *99*99*1# or visiting the UIDAI website.",
        'npci': "NPCI (National Payments Corporation of India) maintains the central mapping service. If your Aadhaar is mapped here, you will receive DBT funds.",
        'aadhaar': "Aadhaar is your 12-digit unique identity. For DBT, it must be seeded with your bank account.",
        'money': "If your money hasn't arrived, check if your account is seeded. If seeded, check with the department sending the money.",
        'hello': "Hello! How can I help you with DBT today?",
        'hi': "Hi there! Ask me about Aadhaar Seeding or Scholarships.",
        'help': "I can explain what Seeding is, how to check your status, or where to find scholarship info. Just ask!",
        'default': "I'm sorry, I don't have that information. Please try simplifying your question, like 'What is seeding?' or 'How to link Aadhaar?'"
    };

    window.sendMessage = function() {
        const input = document.getElementById('chat-input-text');
        const messageText = input.value.trim();
        const messagesContainer = document.getElementById('chat-messages');

        if (messageText === "") return;

        // 1. Add user message
        messagesContainer.innerHTML += `<div class="chat-message user-message">${messageText}</div>`;
        input.value = '';

        // 2. Determine bot response
        const lowerCaseMsg = messageText.toLowerCase();
        let response = chatResponses.default;

        // Check for keywords
        const keywords = Object.keys(chatResponses);
        for (let i = 0; i < keywords.length; i++) {
            if (keywords[i] !== 'default' && lowerCaseMsg.includes(keywords[i])) {
                response = chatResponses[keywords[i]];
                break;
            }
        }

        // 3. Add bot response (with slight delay for effect)
        setTimeout(() => {
            messagesContainer.innerHTML += `<div class="chat-message bot-message">${response}</div>`;
            messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
        }, 500);

        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom after user message
    }

    // Allow pressing Enter to send
    document.getElementById('chat-input-text').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 9. Role Login Simulation (Removed to allow actual links)
    /*
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const role = e.target.parentElement.querySelector('h3').innerText;
            alert(`Login feature for ${role} is coming soon! This will allow ${role}s to access their specific dashboard.`);
        });
    });
    */

    // 10. PWA Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('SW Failed', err));
    }

    // 11. Gamification Logic
    let userPoints = 0;
    window.updatePoints = function(pts) {
        userPoints += pts;
        document.getElementById('userPoints').innerText = userPoints;
        // Simple animation
        const badge = document.querySelector('.gamification-badge');
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }

    // 12. Voice Input Logic (Web Speech API)
    window.startVoiceInput = function() {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice input is not supported in this browser. Try Chrome.");
            return;
        }
        const recognition = new webkitSpeechRecognition();
        recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
        recognition.start();

        const micBtn = document.querySelector('button[onclick="startVoiceInput()"]');
        micBtn.style.color = 'red';

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input-text').value = transcript;
            sendMessage();
            micBtn.style.color = 'var(--primary)';
        };
        recognition.onerror = function() {
            micBtn.style.color = 'var(--primary)';
        };
        recognition.onend = function() {
            micBtn.style.color = 'var(--primary)';
        };
    }

    // 13. Geo-Dashboard AI Report
    window.generateAIReport = function() {
        const output = document.getElementById('ai-report-output');
        output.classList.remove('hidden');
        output.innerHTML = "<strong>AI Analysis:</strong><br>Processing district data... <span class='animate-pulse'>█</span>";
        
        setTimeout(() => {
            output.innerHTML = `
                <strong>AI Report Summary (District: Varanasi)</strong><br>
                1. <strong>Critical Gap:</strong> Village B has only 45% seeding. Immediate camp required.<br>
                2. <strong>Trend:</strong> 15% increase in seeding after last week's Gram Sabha.<br>
                3. <strong>Recommendation:</strong> Deploy 'Bank Mitra' to Village B on priority.
            `;
            updatePoints(50);
        }, 2000);
    }

    // 14. OCR Verification Simulation
    window.handleOCR = function(input) {
        if (input.files && input.files[0]) {
            const resDiv = document.getElementById('ocr-result');
            resDiv.innerHTML = "Scanning document... <span class='animate-pulse'>Please wait...</span>";
            
            setTimeout(() => {
                // Random simulation
                const isSuccess = Math.random() > 0.3;
                if (isSuccess) {
                    resDiv.innerHTML = `<span style="color:green">✔ Verified: Aadhaar is SEEDED.</span><br>Bank: SBI<br>Last Active: 2 days ago`;
                    updatePoints(20);
                } else {
                    resDiv.innerHTML = `<span style="color:red">✘ Alert: Account NOT Seeded.</span><br>Please visit bank immediately.`;
                }
            }, 2500);
        }
    }

    // 15. PTM Link Generator
    window.generatePTMLink = function() {
        const id = Math.random().toString(36).substring(7);
        const link = `https://dbt-saarthi.gov.in/meet/${id}`;
        document.getElementById('ptm-result').innerHTML = `
            Meeting Link Created:<br>
            <a href="#" style="color:blue; text-decoration:underline;">${link}</a><br>
            <button class="btn btn-glass" style="margin-top:5px; font-size:0.7rem; color:green;" onclick="alert('Sent to WhatsApp!')">Share on WhatsApp</button>
        `;
        updatePoints(10);
    }

    // 16. Awareness Poster Generator (Canvas)
    window.generatePoster = function() {
        const canvas = document.getElementById('posterCanvas');
        const ctx = canvas.getContext('2d');
        const name = document.getElementById('posterName').value || "My Village";

        // Background
        ctx.fillStyle = "#eff6ff";
        ctx.fillRect(0, 0, 300, 200);
        
        // Border
        ctx.strokeStyle = "#1e3a8a";
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, 300, 200);

        // Text
        ctx.fillStyle = "#1e3a8a";
        ctx.font = "bold 16px Arial";
        ctx.fillText("DBT AWARENESS CAMP", 60, 40);
        
        ctx.fillStyle = "#f97316";
        ctx.font = "bold 20px Arial";
        ctx.fillText(name.toUpperCase(), 150 - (ctx.measureText(name.toUpperCase()).width / 2), 80);

        ctx.fillStyle = "#334155";
        ctx.font = "12px Arial";
        ctx.fillText("Link Aadhaar Today!", 90, 120);
        ctx.fillText("Visit your Panchayat Bhawan", 70, 140);

        canvas.style.display = 'block';
        
        const link = document.getElementById('downloadPoster');
        link.href = canvas.toDataURL();
        link.download = 'dbt-poster.png';
        link.style.display = 'block';
        link.innerText = "Download Image";
        
        updatePoints(30);
    }

    // 17. Grievance Redressal
    window.submitGrievance = function() {
        const name = document.getElementById('g-name').value;
        const type = document.getElementById('g-type').value;
        
        if(!name || !type) {
            alert("Please fill details");
            return;
        }

        const list = document.getElementById('grievance-items');
        const id = Math.floor(Math.random() * 10000);
        
        const li = document.createElement('li');
        li.className = 'g-item';
        li.innerHTML = `<span><strong>#${id}</strong> - ${type.toUpperCase()}</span> <span class="status-badge pending">Pending</span>`;
        
        list.prepend(li);
        
        // Clear inputs
        document.getElementById('g-name').value = '';
        document.getElementById('g-desc').value = '';
        
        alert("Grievance Submitted Successfully! Tracking ID: " + id);
        updatePoints(15);
    }

    // 18. Dark Mode Toggle
    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark');
        const btn = document.getElementById('darkToggle');
        const isDark = document.body.classList.contains('dark');
        
        // Update icon
        if (isDark) {
            btn.innerHTML = '<i data-lucide="sun" style="width:14px; display:inline;"></i>';
        } else {
            btn.innerHTML = '<i data-lucide="moon" style="width:14px; display:inline;"></i>';
        }
        lucide.createIcons();
    }

    // 19. Carousel Logic
    const sliderLine = document.querySelector(".carousel-track");
    if (sliderLine) {
        const slides = document.querySelectorAll(".carousel-track a");
        
        if (slides.length > 0) {
            let index = 1;
            let width = sliderLine.clientWidth; // Use container width instead of slide width for safety

            // Clone first + last slide for infinite loop
            const firstClone = slides[0].cloneNode(true);
            const lastClone = slides[slides.length - 1].cloneNode(true);

            sliderLine.appendChild(firstClone);
            sliderLine.insertBefore(lastClone, slides[0]);

            // Set initial position
            const updateWidth = () => {
                width = sliderLine.clientWidth; // Update width based on container
                sliderLine.style.transform = `translateX(${-width * index}px)`;
            };

            // Initial set
            updateWidth();

            // Resize update
            window.addEventListener("resize", updateWidth);

            // Next slide
            const nextSlide = () => {
                if (index >= slides.length + 1) return;
                index++;
                sliderLine.style.transition = "0.5s ease";
                sliderLine.style.transform = `translateX(${-width * index}px)`;
            };

            document.querySelector(".next").addEventListener("click", nextSlide);

            // Previous slide
            document.querySelector(".prev").addEventListener("click", () => {
                if (index <= 0) return;
                index--;
                sliderLine.style.transition = "0.5s ease";
                sliderLine.style.transform = `translateX(${-width * index}px)`;
            });

            // Infinite Loop Fix
            sliderLine.addEventListener("transitionend", () => {
                if (index === slides.length + 1) {
                    sliderLine.style.transition = "none";
                    index = 1;
                    sliderLine.style.transform = `translateX(${-width * index}px)`;
                }
                if (index === 0) {
                    sliderLine.style.transition = "none";
                    index = slides.length;
                    sliderLine.style.transform = `translateX(${-width * index}px)`;
                }
            });

            // Auto Slide
            setInterval(nextSlide, 4000);
        }
    }
});
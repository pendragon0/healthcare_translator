// Check if the browser supports the Web Speech API
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure recognition settings
    recognition.interimResults = false;
    recognition.continuous = true;

    // DOM Elements
    const originalTranscriptDiv = document.getElementById('originalTranscript');
    const translatedTranscriptDiv = document.getElementById('translatedTranscript');
    const inputLanguageSelect = document.getElementById('inputLanguageSelect');
    const languageSelect = document.getElementById("languageSelect");
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const playAudioButton = document.getElementById('playAudio');
    const historyContainer = document.getElementById('historyContainer');

    // Update recognition language dynamically
    inputLanguageSelect.addEventListener('change', () => {
        recognition.lang = inputLanguageSelect.value;
        console.log(`Input language changed to: ${recognition.lang}`);
    });

    // Start recognition
    startButton.addEventListener('click', () => {
        recognition.start();
        originalTranscriptDiv.innerText = "Listening...";
        console.log("Speech recognition started...");
    });

    // Stop recognition
    stopButton.addEventListener('click', () => {
        recognition.stop();
        originalTranscriptDiv.innerText = "Stopped listening.";
        console.log("Speech recognition stopped.");
    });

    // Handle recognition results
    recognition.addEventListener('result', (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        originalTranscriptDiv.innerText = transcript;
        console.log(`Recognized: ${transcript}`);
        translateText(transcript);
    });

    // Handle translation
    function translateText(transcript) {
        const csrfToken = document.getElementById('csrfToken').value;
        const targetLanguage = languageSelect.value;
    
        showSpinner(); // Show spinner when translation starts
    
        fetch('/translate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
            },
            body: new URLSearchParams({
                text: transcript,
                target_language: targetLanguage,
            }),
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.translated_text) {
                translatedTranscriptDiv.innerText = data.translated_text;
                console.log(`Translated: ${data.translated_text}`);
                

                addToHistory(transcript, data.translated_text);
            } else {
                translatedTranscriptDiv.innerText = `Translation Error: ${data.error}`;
            }
        })
        .catch(error => {
            console.error('Translation error:', error);
            translatedTranscriptDiv.innerText = `Translation Error: ${error.message}`;
        })
        .finally(() => {
            hideSpinner(); // Hide spinner when translation completes
        });
    }
    function showSpinner() {
        document.getElementById('loadingSpinner').style.display = 'block';
    }
    
    function hideSpinner() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
    
    function addToHistory(originalText, translatedText) {
        // Create a history item
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
    
        // Add original text
        const originalDiv = document.createElement('div');
        originalDiv.classList.add('original');
        originalDiv.innerText = `Original: ${originalText}`;
        historyItem.appendChild(originalDiv);
    
        // Add translated text
        const translatedDiv = document.createElement('div');
        translatedDiv.classList.add('translated');
        translatedDiv.innerText = `Translated: ${translatedText}`;
        historyItem.appendChild(translatedDiv);
    
        // Add the history item to the container
        historyContainer.appendChild(historyItem);
    
        // Auto-scroll to the bottom of the history
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }
    
    
    // Handle Text-to-Speech (TTS)
    function speakText(text, language) {
        if ('speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            // const voices = synth.getVoices();
            // const selectedVoice = voices.find(voice => voice.lang === language);
            // if (selectedVoice) {
            //     utterance.voice = selectedVoice;
            // } else {
            //     alert(`Sorry, the selected language (${language}) is not supported for speech.`);
            // }

            utterance.onstart = () => console.log("Speech started...");
            utterance.onend = () => console.log("Speech ended.");
            synth.speak(utterance);
            console.log('spoken already')
        } else {
            alert("Text-to-Speech is not supported in your browser.");
        }
    }

    // Play Translated Text Audio
    playAudioButton.addEventListener('click', () => {
        const translatedText = translatedTranscriptDiv.innerText;
        const targetLanguage = languageSelect.value;
        const languageCode = getLanguageCode(targetLanguage);

        if (translatedText && translatedText !== "Translation will appear here...") {
            speakText(translatedText, languageCode);
        } else {
            alert("No translated text available to play.");
        }
    });

    // Map dropdown languages to Web Speech API language codes
    function getLanguageCode(language) {
        const languageMap = {
            "Spanish": "es-ES",
            "French": "fr-FR",
            "German": "de-DE",
            "Chinese": "zh-CN",
            "Hindi": "hi-IN",
            "Arabic": "ar-SA",
            "Russian": "ru-RU",
            "Urdu": "ur-PK",
            "Italian": "it-IT",
            "English": "en-US",
        };
        return languageMap[language] || "en-US";
    }
} else {
    alert("Web Speech API is not supported in this browser. Please use Chrome or Edge.");
}

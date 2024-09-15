require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// List of words to generate audio for
const words = [
    "l'homme", "la femme", "la fille", "le garçon", "le chien",
  "marcher", "courir", "manger", "boire", "dormir",
  "le chat", "la maison", "la voiture", "l'arbre", "le livre",
  "grand", "petit", "heureux", "triste", "rapide",
  "la pomme", "la banane", "le pain", "l'eau", "le lait",
  "lire", "écrire", "écouter", "parler", "apprendre",
  "la mère", "le père", "la sœur", "le frère", "le professeur",
  "chaud", "froid", "nouveau", "vieux", "jeune",
  "l'école", "l'élève", "la classe", "le bureau", "la chaise",
  "sauter", "nager", "voler", "conduire", "grimper"
];

const englishWords = [
    "man", "woman", "girl", "boy", "dog",
  "walk", "run", "eat", "drink", "sleep",
  "cat", "house", "car", "tree", "book",
  "big", "small", "happy", "sad", "fast",
  "apple", "banana", "bread", "water", "milk",
  "read", "write", "listen", "speak", "learn",
  "mother", "father", "sister", "brother", "teacher",
  "hot", "cold", "new", "old", "young",
  "school", "student", "class", "desk", "chair",
  "jump", "swim", "fly", "drive", "climb"
];

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';
const VOICE_NAME = 'Guillaume - Narration'; // You can change this to any available voice name

// Function to fetch available voices
const fetchVoices = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/voices`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        return response.data.voices;
    } catch (error) {
        console.error('Error fetching voices:', error.response?.data || error.message);
        process.exit(1);
    }
};

// Function to generate audio for a single word
const generateAudio = async (voiceId, word, englishWord) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/text-to-speech/${voiceId}`,
            {
                text: word,
                language_code: 'fr',
                model_id: 'eleven_turbo_v2_5',
                voice_settings: {
                    stability: 0.8,
                    similarity_boost: 0.5,
                },
            },
            {
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',
            }
        );

        const filePath = path.join(__dirname, "audio", `fr_${englishWord}.mp3`);
        fs.writeFileSync(filePath, response.data);
        console.log(`✅ Saved ${filePath}`);
    } catch (error) {
        console.error(`❌ Error generating audio for "${word}":`, error.response?.data || error.message);
    }
};

// Main function to execute the script
const main = async () => {
    console.log('🔍 Fetching available voices...');
    const voices = await fetchVoices();

    const selectedVoice = voices.find((voice) => voice.name.toLowerCase() === VOICE_NAME.toLowerCase());

    if (!selectedVoice) {
        console.error(`Voice "${VOICE_NAME}" not found. Available voices are:`);
        voices.forEach((voice) => console.log(`- ${voice.name}`));
        process.exit(1);
    }

    console.log(`🎤 Using voice: ${selectedVoice.name} (ID: ${selectedVoice.voice_id})`);

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const englishWord = englishWords[i];
        console.log(`🔊 Generating audio for: "${word}"`);
        await generateAudio(selectedVoice.voice_id, word, englishWord);
    }

    console.log('🏁 All audio files have been generated successfully!');
};

main();

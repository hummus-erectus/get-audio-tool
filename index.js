require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// List of words to generate audio for
const words = ["man", "woman", "girl", "boy"];

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';
const VOICE_NAME = 'Harry - Proper and Academic'; // You can change this to any available voice name

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
const generateAudio = async (voiceId, word) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/text-to-speech/${voiceId}`,
            {
                text: word,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
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

        const filePath = path.join(__dirname, "audio", `en_${word}.mp3`);
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

    for (const word of words) {
        console.log(`🔊 Generating audio for: "${word}"`);
        await generateAudio(selectedVoice.voice_id, word);
    }

    console.log('🏁 All audio files have been generated successfully!');
};

main();

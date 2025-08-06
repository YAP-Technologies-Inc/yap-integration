// azurePronunciation.js
const fs = require('fs');
const fetch = require('node-fetch'); // v2

const AZURE_KEY = '3QUz8EdkVk1oK0VY9DHs3RNTCL1lIOxNBcqMWYsKncKNDr2P6ezjJQQJ99BGACYeBjFXJ3w3AAAYACOGjBhM';
const REGION = 'eastus';

/**
 * Assess pronunciation using Azure API
 * @param {string} audioPath - Path to the WAV file
 * @param {string} referenceText - The reference text to assess against
 * @returns {Promise<object>} - Parsed Azure response
 */
async function assessPronunciation(audioPath, referenceText) {
  // Build config and base64 encode
  const config = {
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark', // Changed from 'HundredMark' for more granular scoring
    Granularity: 'Phoneme',
    Dimension: 'Comprehensive',
  };
  const configB64 = Buffer.from(JSON.stringify(config)).toString('base64');
  const audio = fs.readFileSync(audioPath);

  const res = await fetch(`https://${REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=es-ES`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_KEY,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Pronunciation-Assessment': configB64,
    },
    body: audio,
  });

  // Check for non-JSON response (Azure error)
  const contentType = res.headers.get('content-type');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure error: ${res.status} ${res.statusText} - ${text}`);
  }
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Azure did not return JSON: ${text}`);
  }
  const result = await res.json();
  console.log('Azure response:', JSON.stringify(result, null, 2));

  // After parsing phonemeFeedback
  const words = result.NBest?.[0]?.Words || [];
  const wordFeedback = words.map(w => ({
    word: w.Word,
    accuracy: w.AccuracyScore,
    errorType: w.ErrorType || 'None'
  }));
  // setWordFeedback(wordFeedback); // This line was removed as per the edit hint.

  return result;
}

module.exports = { assessPronunciation };

/**
 * VernacularVoiceAssistantService — ICJ Enterprise Platform
 * Provides Vernacular Voice-First Audio Guidance & Text-to-Speech (TTS)
 * for illiterate and semi-literate citizens. Allows 1-click listening of
 * all UI actions and instructions in Hindi without typing!
 */

export const VernacularVoiceAssistantService = {
  isSpeaking: false,

  /**
   * Speak text in Hindi using browser Web Speech API
   */
  speakInHindi(textToSpeak = "", onEndCallback = null) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert(textToSpeak);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any active speech

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "hi-IN"; // Hindi Voice Accent
      utterance.rate = 0.95; // Slightly slower pace for clear legal understanding
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed", e);
    }
  },

  /**
   * Stop any active audio guide speech
   */
  stopSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  },

  /**
   * Standardized Audio Prompts for Illiterate & Rural Litigants
   */
  prompts: {
    WELCOME: "आई सी जे लीगल पोर्टल में आपका स्वागत है। अपनी समस्या बताने के लिए नीचे माइक बटन दबाएं और बोलें।",
    DOCUMENT_VAULT: "यह आपका सुरक्षित फाइल वॉल्ट है। यहाँ आपके सभी पुराने कोर्ट के कागज़ात कानूनी क्रम में सुरक्षित हैं।",
    ADVOCATE_ASSIGNED: "आपके केस के लिए वकील साहब नियुक्त कर दिए गए हैं। आप उनसे सीधे बात कर सकते हैं।",
    THREAT_ALERT: "सावधान! आपके केस में तत्काल स्टे या अर्जी लगाने की जरूरत है। नीचे लाल रंग का बटन दबाएं।",
  },
};

export default VernacularVoiceAssistantService;

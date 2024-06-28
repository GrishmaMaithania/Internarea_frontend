/* global googleTranslateElementInit */
import React, { useEffect } from 'react';

const GoogleTranslate = () => {
  useEffect(() => {
    const addScript = () => {
      const script = document.createElement('script');
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    if (!window.google || !window.google.translate) {
      addScript();
    } else {
      googleTranslateElementInit();
    }
  }, []);

  window.googleTranslateElementInit = () => {
   
    const googleTranslateElement = document.querySelector('.goog-te-banner');
    if (googleTranslateElement) {
      googleTranslateElement.style.display = 'none';
    }
  
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
    }, 'google_translate_element');
  };

  return (
    <div id="google_translate_element" style={{ display: 'none' }}></div>
  );
};

export default GoogleTranslate;

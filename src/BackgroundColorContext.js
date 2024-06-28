import React, { createContext, useState } from 'react';

// Create the context
export const BackgroundColorContext = createContext();

export const BackgroundColorProvider = ({ children }) => {
  const [backgroundColor, setBackgroundColor] = useState('white');

  return (
    <BackgroundColorContext.Provider value={{ backgroundColor, setBackgroundColor }}>
      {children}
    </BackgroundColorContext.Provider>
  );
};

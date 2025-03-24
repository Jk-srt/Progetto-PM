//// filepath: c:\Users\feder\Desktop\Progetto-PM\frontend\src\components\ui\card.js
import React from 'react';

export function Card({ children }) {
  return <div className="custom-card">{children}</div>;
}

export function CardContent({ children }) {
  return <div className="custom-card-content">{children}</div>;
}
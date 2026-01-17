import React from "react";
import "../styles/animated-background.css";

interface AnimatedBackgroundSimpleProps {
  mode: "dark" | "light";
  children?: React.ReactNode;
}

export const AnimatedBackgroundSimple: React.FC<AnimatedBackgroundSimpleProps> = ({ mode, children }) => (
  <div className={`animated-bg ${mode}`}>
    <div className="animated-bg-blobs" />
    {children}
  </div>
);

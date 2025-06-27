import React, { useState, useEffect } from 'react';

interface WelcomeAnimationProps {
  onComplete: () => void;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    { text: "欢迎来到智学卡片", icon: "🎓" },
    { text: "AI驱动的个性化学习", icon: "🤖" },
    { text: "开始你的学习之旅", icon: "🚀" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }, 1000);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [steps.length, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="welcome-animation">
      <div className="welcome-overlay">
        <div className="welcome-content">
          <div className="welcome-icon">
            {steps[currentStep].icon}
          </div>
          <h1 className="welcome-text">
            {steps[currentStep].text}
          </h1>
          <div className="welcome-progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index <= currentStep ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnimation; 
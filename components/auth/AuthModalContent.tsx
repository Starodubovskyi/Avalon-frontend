'use client';

import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa'; // Импорт иконки закрытия
import AuthBanner from './AuthBanner';
import AuthForm from './AuthForm';

// 1. Объявляем интерфейс
interface AuthModalContentProps {
  onCloseModal: () => void;
}

// 2. Деструктурируем props
export default function AuthModalContent({ onCloseModal }: AuthModalContentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`
      relative z-0 flex transition-all duration-700 overflow-hidden bg-[#0f0f11]
      w-full h-full 
      lg:max-w-6xl lg:h-[720px] lg:rounded-[3rem] lg:shadow-2xl
      flex-col lg:flex-row
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `}>
      
      {/* 3. Кнопка "Закрыть" (X) */}
      <button 
        onClick={onCloseModal}
        className="absolute top-4 right-4 z-50 p-2 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full transition-all duration-300"
      >
        <FaTimes size={20} />
      </button>

      <AuthBanner />
      
      {/* 4. Передаем onClose вниз */}
      <AuthForm onClose={onCloseModal} />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        /* Улучшение тапа на мобильных */
        input, select, button {
            touch-action: manipulation;
        }
      `}</style>
    </div>
  );
}
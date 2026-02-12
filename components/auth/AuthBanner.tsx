'use client';

import React, { useState } from 'react';
import { Testimonial } from '../types/auth';

const testimonials: Testimonial[] = [
  {
    text: "Avalon changed how I discover the city. Seeing live pins and heatmaps is incredible.",
    author: "Alex Varga",
    role: "Owner, NightSky Lounge",
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    text: "The ability to drop a pin and instantly share updates with customers is a game changer.",
    author: "Elena Cross",
    role: "Marketing Lead, UrbanPoint",
    avatar: "https://i.pravatar.cc/150?img=5"
  }
];

export default function AuthBanner() {
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);

  return (
    // Mobile: w-full, h-auto (по контенту), padding поменьше
    // Desktop: w-[50%], h-full, padding большой
    <div className="w-full lg:w-[50%] bg-transparent p-8 lg:p-12 flex flex-col relative overflow-hidden text-white shrink-0">
      
      {/* Blobs: уменьшаем их на мобильных, чтобы не мешали чтению */}
      <div className="absolute top-[-20%] left-[-20%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-blue-600/20 rounded-full blur-[60px] lg:blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-indigo-600/10 rounded-full blur-[40px] lg:blur-[80px] pointer-events-none"></div>

      <div className="mb-6 lg:mb-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-xl lg:text-2xl font-bold tracking-tight">Avalon</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {/* Адаптивный размер шрифта: text-3xl на моб, text-5xl на десктопе */}
        <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 animate-fade-in">
          Pin Your Spot.<br />
          Map Your World.
        </h1>
        
        {/* Скрываем длинное описание на очень маленьких экранах, если нужно место */}
        <p className="text-gray-400 text-sm lg:text-lg mb-8 lg:mb-12 leading-relaxed max-w-md animate-fade-in animation-delay-200 hidden sm:block">
          Join the social mapping revolution. Let users discover your business through live pins.
        </p>

        {/* Отзывы скрываем на мобильных (hidden), показываем только на Desktop (lg:block), чтобы не загромождать экран */}
        <div className="hidden lg:block bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl mb-8 transform transition-all duration-500 hover:scale-105 shadow-2xl">
          <div className="transition-all duration-500">
            <p className="text-gray-200 text-sm italic mb-4 leading-relaxed">
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="flex items-center gap-4">
              <img 
                src={testimonials[currentTestimonial].avatar} 
                alt={testimonials[currentTestimonial].author}
                className="w-10 h-10 rounded-full border border-gray-700"
              />
              <div>
                <p className="text-white font-semibold text-sm">
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="text-gray-500 text-xs">
                  {testimonials[currentTestimonial].role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Точки слайдера тоже только для десктопа, раз мы скрыли отзывы */}
        <div className="hidden lg:flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentTestimonial 
                  ? 'w-8 bg-gradient-to-r from-blue-600 to-sky-600' 
                  : 'w-2 bg-gray-700 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
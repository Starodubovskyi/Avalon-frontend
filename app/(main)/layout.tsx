"use client"; 
import React from "react"; 
import { motion } from "framer-motion"; 
import Bot from "@/components/Bot/ChatBot"; 
import Navbar from "@/components/main/Navbar";
const MainLayout = ({ children }: { children: React.ReactNode }) => { 
  return ( 
  <div className="relative min-h-screen flex flex-col items-center text-white"> 
   <div className="relative z-10 w-full max-w-[1600px] flex flex-col px-4 md:px-8 lg:px-10 py-6"> 
    <Navbar /> 
    <Bot /> 
    <main className="flex-1 w-full">{children}
      </main> 
      </div> 
      </div> 
      ); 
    }; 
    export default MainLayout; 
   
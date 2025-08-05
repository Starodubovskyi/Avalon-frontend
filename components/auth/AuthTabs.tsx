'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';

interface AuthTabsProps {
  onCloseModal: () => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ onCloseModal }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState<'email' | 'details'>('email');

  const toggleTab = () =>
    setActiveTab((prev) => (prev === 'login' ? 'register' : 'login'));

  return (
    <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
      {/* Кнопка переключения — скрыта, если registerStep === 'details' */}
      {!(activeTab === 'register' && registerStep === 'details') && (
        <div className="absolute top-4 right-6 sm:right-8 z-50">
          <button
            onClick={toggleTab}
            className="px-5 py-2 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-700 transition-all"
          >
            {activeTab === 'login' ? 'Register' : 'Sign in'}
          </button>
        </div>
      )}

      <div className="w-full h-full flex items-center justify-center px-4 py-6 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl absolute"
            >
              <LoginForm onCloseModal={onCloseModal} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl absolute"
            >
              <RegisterForm
                onCloseModal={onCloseModal}
                onStepChange={setRegisterStep}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthTabs;

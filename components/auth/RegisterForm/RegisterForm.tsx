'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import RegisterStepEmail from './RegisterStepEmail';
import RegisterStepDetails from './RegisterStepDetails';

interface RegisterFormProps {
  onCloseModal: () => void;
  onStepChange?: (step: 'email' | 'details') => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onCloseModal,
  onStepChange,
}) => {
  const [step, setStep] = useState<'email' | 'details'>('email');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'email' ? (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <RegisterStepEmail
              onContinue={(email) => {
                setEmail(email);
                setStep('details');
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="details-step"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <RegisterStepDetails
              email={email}
              onEditEmail={() => setStep('email')}
              onCloseModal={onCloseModal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterForm;

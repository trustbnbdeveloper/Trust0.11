import React, { useEffect, useState } from 'react';
import { Shield, Lock, Fingerprint, CheckCircle, Server, Smartphone } from 'lucide-react';

interface SecurityGatewayProps {
  onComplete: () => void;
  targetRole: 'OWNER' | 'ADMIN';
}

export const SecurityGateway: React.FC<SecurityGatewayProps> = ({ onComplete, targetRole }) => {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  
  // 0: Zero Trust Handshake
  // 1: Hardware MFA Challenge
  // 2: Decrypting Vault
  // 3: Access Granted

  useEffect(() => {
    // Sequence Automation
    const timer1 = setTimeout(() => setStep(1), 2500); // Handshake
    const timer2 = setTimeout(() => setStep(2), 5500); // MFA (Simulated)
    const timer3 = setTimeout(() => setStep(3), 7500); // Decryption
    const timer4 = setTimeout(() => onComplete(), 8500); // Redirect

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B1C2D] text-white font-sans flex flex-col items-center justify-center p-6">
      
      {/* Brand Watermark */}
      <div className="absolute top-8 left-8 opacity-20 flex items-center gap-2">
         <Shield size={24} />
         <span className="font-bold tracking-widest text-sm">TRUSTBNB SECURE VAULT</span>
      </div>

      <div className="max-w-md w-full space-y-8">
        
        {/* Central Iconography */}
        <div className="flex justify-center mb-12 relative">
           <div className="w-24 h-24 rounded-full border border-trust-green/20 flex items-center justify-center relative">
              {/* Spinner Ring */}
              <div className="absolute inset-0 border-t-2 border-trust-green rounded-full animate-spin"></div>
              
              {step === 0 && <Server size={32} className="text-trust-green animate-pulse" />}
              {step === 1 && <Smartphone size={32} className="text-trust-green animate-bounce" />}
              {step === 2 && <Lock size={32} className="text-trust-green" />}
              {step === 3 && <CheckCircle size={40} className="text-trust-green" />}
           </div>
        </div>

        {/* Text Status */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-serif font-bold tracking-wide">
            {step === 0 && "Establishing Secure Tunnel"}
            {step === 1 && "Verifying Hardware Token"}
            {step === 2 && "Decrypting Financial Ledger"}
            {step === 3 && "Access Granted"}
          </h2>
          <p className="text-sm text-gray-400 font-mono h-6">
            {step === 0 && "Zero-Trust Handshake: 192.168.1.X -> Core..."}
            {step === 1 && "Requesting biometric signature..."}
            {step === 2 && "AES-256-GCM Key Exchange..."}
            {step === 3 && "Session ID: 0x82...99A"}
          </p>
        </div>

        {/* Security Badges */}
        <div className="grid grid-cols-2 gap-4 pt-8 opacity-60">
           <div className="flex items-center gap-2 bg-white/5 p-3 rounded border border-white/10">
              <Lock size={14} className="text-trust-green" />
              <div className="text-xs">
                 <div className="text-gray-400">Encryption</div>
                 <div className="font-mono">E2EE Enabled</div>
              </div>
           </div>
           <div className="flex items-center gap-2 bg-white/5 p-3 rounded border border-white/10">
              <Fingerprint size={14} className="text-trust-green" />
              <div className="text-xs">
                 <div className="text-gray-400">MFA</div>
                 <div className="font-mono">Hardware Level</div>
              </div>
           </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-8">
          <div 
            className="h-full bg-trust-green transition-all duration-500 ease-out"
            style={{ width: step === 0 ? '25%' : step === 1 ? '50%' : step === 2 ? '80%' : '100%' }}
          ></div>
        </div>
        
        <p className="text-[10px] text-center text-gray-500 mt-4">
          Powered by TrustBnB Swiss-Grade Infrastructure. <br/>
          Un-authorized access attempts are logged and immutably recorded.
        </p>

      </div>
    </div>
  );
};
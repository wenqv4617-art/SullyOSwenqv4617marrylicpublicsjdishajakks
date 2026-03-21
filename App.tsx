
import React from 'react';
import { OSProvider } from './context/OSContext';
import PhoneShell from './components/PhoneShell';
import { isIOSStandaloneWebApp } from './utils/iosStandalone';

const App: React.FC = () => {
  const useAbsoluteShell = typeof window !== 'undefined' && isIOSStandaloneWebApp();
  const shellClassName = useAbsoluteShell
    ? 'fixed inset-0 w-full h-full bg-black overflow-hidden'
    : 'relative w-full bg-black overflow-hidden';
  const shellStyle = useAbsoluteShell
    ? { minHeight: '100dvh' }
    : { height: 'var(--app-height, 100dvh)', minHeight: 'var(--app-height, 100dvh)' };

  return (
    <div
      className={shellClassName}
      style={shellStyle}
    >
      <div
        className={`${useAbsoluteShell ? 'absolute' : 'fixed'} inset-0 w-full h-full z-0 bg-black`}
        style={{ transform: 'translateZ(0)' }}
      >
        <OSProvider>
          <PhoneShell />
        </OSProvider>
      </div>
    </div>
  );
};

export default App;

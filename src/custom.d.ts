declare module '*.svg' {
  import * as React from 'react';
  
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

// Petra Wallet type definitions
interface PetraWallet {
  connect: () => Promise<{ address: string, publicKey: string }>;
  account: () => Promise<{ address: string, publicKey: string }>;
  disconnect: () => Promise<void>;
  network: () => Promise<string>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction: (transaction: any) => Promise<{ hash: string }>;
  signTransaction: (transaction: any) => Promise<any>;
}

interface AptosWindow extends Window {
  aptos?: PetraWallet;
}

declare global {
  interface Window {
    aptos?: PetraWallet;
  }
} 
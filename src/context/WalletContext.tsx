import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from '@chakra-ui/react';

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  sendTransaction: (to: string, amount: string) => Promise<string>;
  networkName: string;
  account: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => '',
  disconnectWallet: () => {},
  sendTransaction: async () => '',
  networkName: 'Aptos',
  account: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkName, setNetworkName] = useState('Polygon MATIC Testnet');
  const toast = useToast();

  // Gets the Petra wallet from window object
  const getAptosWallet = () => {
    if ('aptos' in window) {
      return (window as AptosWindow).aptos;
    }
    return null;
  };

  useEffect(() => {
    // Check if user was previously connected
    const checkConnection = async () => {
      const wallet = getAptosWallet();
      if (!wallet) return;

      try {
        const storedAccount = localStorage.getItem('goldchain_wallet_account');
        
        if (storedAccount) {
          // Check if wallet is still connected
          const isConnected = await wallet.isConnected();
          
          if (isConnected) {
            const accountInfo = await wallet.account();
            
            if (accountInfo && accountInfo.address && accountInfo.address === storedAccount) {
              setAddress(accountInfo.address);
              setIsConnected(true);
              
              // Set mock balance since Aptos doesn't provide straightforward balance info
              // In a real app, you'd query the blockchain for the token balance
              const mockBalance = localStorage.getItem('goldchain_wallet_balance') || '1000';
              setBalance(mockBalance);

              toast({
                title: 'Wallet Connected',
                description: `Connected to ${accountInfo.address.substring(0, 6)}...${accountInfo.address.substring(accountInfo.address.length - 4)}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'bottom-right',
              });
            }
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkConnection();
  }, [toast]);

  const connectWallet = async () => {
    const wallet = getAptosWallet();
    
    if (wallet) {
      try {
        setIsConnecting(true);
        
        // Connect to Petra wallet with popup
        const response = await wallet.connect();
        const accountInfo = await wallet.account();
        
        if (accountInfo && accountInfo.address) {
          setAddress(accountInfo.address);
          setIsConnected(true);
          
          // Store wallet info
          localStorage.setItem('goldchain_wallet_account', accountInfo.address);
          
          // Set mock balance
          const mockBalance = '1000';
          localStorage.setItem('goldchain_wallet_balance', mockBalance);
          setBalance(mockBalance);
          
          toast({
            title: 'Wallet Connected',
            description: `Connected to Polygon MATIC Testnet`,
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'bottom-right',
          });
          
          return accountInfo.address;
        } else {
          throw new Error('Failed to get account address');
        }
      } catch (error: any) {
        console.error("Error connecting to Petra wallet:", error);
        
        toast({
          title: 'Connection Failed',
          description: error.message || 'Could not connect to Petra wallet',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
        
        throw error;
      } finally {
        setIsConnecting(false);
      }
    } else {
      toast({
        title: 'Petra Wallet Not Found',
        description: 'Please install Petra wallet extension to connect to Polygon MATIC',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      
      // Open Petra wallet installation page
      window.open('https://petra.app/', '_blank');
      throw new Error('Polygon wallet is not installed');
    }
  };

  const disconnectWallet = async () => {
    const wallet = getAptosWallet();
    
    if (wallet) {
      try {
        await wallet.disconnect();
        setAddress(null);
        setIsConnected(false);
        localStorage.removeItem('goldchain_wallet_account');
        
        toast({
          title: 'Wallet Disconnected',
          description: 'Your wallet has been disconnected',
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      } catch (error) {
        console.error("Error disconnecting wallet:", error);
        
        toast({
          title: 'Disconnection Failed',
          description: 'Could not disconnect from the wallet',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    }
  };

  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    const wallet = getAptosWallet();
    
    if (!wallet || !address) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Example transaction for Aptos
      const transaction = {
        arguments: [to, amount],
        function: '0x1::coin::transfer',
        type: 'entry_function_payload',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
      };
      
      const pendingTransaction = await wallet.signAndSubmitTransaction(transaction);
      
      toast({
        title: 'Transaction Sent',
        description: `Transaction hash: ${pendingTransaction.hash.substring(0, 10)}...`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      
      // Update mock balance after transaction
      const currentBalance = parseFloat(balance);
      const newBalance = (currentBalance - parseFloat(amount)).toString();
      setBalance(newBalance);
      localStorage.setItem('goldchain_wallet_balance', newBalance);
      
      return pendingTransaction.hash;
    } catch (error: any) {
      console.error("Transaction error:", error);
      
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Could not complete transaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        sendTransaction,
        networkName,
        account: address,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Add TypeScript definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
} 
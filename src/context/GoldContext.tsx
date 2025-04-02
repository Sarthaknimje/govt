import React, { createContext, useState, useEffect, useContext } from 'react';
import { useWallet } from './WalletContext';
import { useToast } from '@chakra-ui/react';

// Define transaction types
export type TransactionType = 'buy' | 'sell' | 'lend' | 'borrow' | 'repay' | 'claim';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  maticAmount?: number;
  duration?: number;
  interest?: number;
  collateral?: number;
  txHash?: string;
}

export interface LendPosition {
  id: string;
  amount: number;
  startDate: number;
  endDate: number;
  interest: number;
  status: 'active' | 'completed';
}

export interface BorrowPosition {
  id: string;
  amount: number;
  collateral: number;
  startDate: number;
  endDate: number;
  interest: number;
  status: 'active' | 'repaid';
}

interface GoldContextType {
  vGoldBalance: number;
  vGoldPrice: number;
  transactions: Transaction[];
  lendPositions: LendPosition[];
  borrowPositions: BorrowPosition[];
  buyGold: (amount: number) => Promise<Transaction>;
  sellGold: (amount: number) => Promise<Transaction>;
  lendGold: (amount: number, days: number) => Promise<Transaction>;
  borrowGold: (amount: number, days: number) => Promise<Transaction>;
  repayLoan: (borrowId: string) => Promise<Transaction>;
  claimLendReturns: (lendId: string) => Promise<Transaction>;
}

const GoldContext = createContext<GoldContextType>({
  vGoldBalance: 0,
  vGoldPrice: 0.05, // Default price in MATIC
  transactions: [],
  lendPositions: [],
  borrowPositions: [],
  buyGold: async () => ({ id: '', type: 'buy', amount: 0, status: 'pending', timestamp: 0 }),
  sellGold: async () => ({ id: '', type: 'sell', amount: 0, status: 'pending', timestamp: 0 }),
  lendGold: async () => ({ id: '', type: 'lend', amount: 0, status: 'pending', timestamp: 0 }),
  borrowGold: async () => ({ id: '', type: 'borrow', amount: 0, status: 'pending', timestamp: 0 }),
  repayLoan: async () => ({ id: '', type: 'repay', amount: 0, status: 'pending', timestamp: 0 }),
  claimLendReturns: async () => ({ id: '', type: 'claim', amount: 0, status: 'pending', timestamp: 0 }),
});

export const useGold = () => useContext(GoldContext);

export const GoldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, sendTransaction } = useWallet();
  const toast = useToast();
  
  const [vGoldBalance, setVGoldBalance] = useState(0);
  const [vGoldPrice, setVGoldPrice] = useState(0.05); // Default price in MATIC
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lendPositions, setLendPositions] = useState<LendPosition[]>([]);
  const [borrowPositions, setBorrowPositions] = useState<BorrowPosition[]>([]);

  // Mock contract address for transactions
  const CONTRACT_ADDRESS = '0x1';

  // Load data from localStorage when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserData(address);
    } else {
      // Reset state when disconnected
      resetState();
    }
  }, [isConnected, address]);

  const loadUserData = (address: string) => {
    // Load vGold balance
    const storedBalance = localStorage.getItem(`goldchain_balance_${address}`);
    if (storedBalance) {
      setVGoldBalance(parseFloat(storedBalance));
    }

    // Load transactions
    const storedTransactions = localStorage.getItem(`goldchain_transactions_${address}`);
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions);
        // Ensure the transactions have the correct status type
        const typedTransactions: Transaction[] = parsedTransactions.map((tx: any) => ({
          ...tx,
          status: tx.status as 'pending' | 'completed' | 'failed'
        }));
        setTransactions(typedTransactions);
      } catch (error) {
        console.error('Error parsing transactions from localStorage:', error);
        setTransactions([]);
      }
    }

    // Load lending positions
    const storedLendPositions = localStorage.getItem(`goldchain_lend_positions_${address}`);
    if (storedLendPositions) {
      try {
        const parsedLendPositions = JSON.parse(storedLendPositions);
        // Ensure the positions have the correct status type
        const typedLendPositions: LendPosition[] = parsedLendPositions.map((pos: any) => ({
          ...pos,
          status: pos.status as 'active' | 'completed'
        }));
        setLendPositions(typedLendPositions);
      } catch (error) {
        console.error('Error parsing lending positions from localStorage:', error);
        setLendPositions([]);
      }
    }

    // Load borrowing positions
    const storedBorrowPositions = localStorage.getItem(`goldchain_borrow_positions_${address}`);
    if (storedBorrowPositions) {
      try {
        const parsedBorrowPositions = JSON.parse(storedBorrowPositions);
        // Ensure the positions have the correct status type
        const typedBorrowPositions: BorrowPosition[] = parsedBorrowPositions.map((pos: any) => ({
          ...pos,
          status: pos.status as 'active' | 'repaid'
        }));
        setBorrowPositions(typedBorrowPositions);
      } catch (error) {
        console.error('Error parsing borrowing positions from localStorage:', error);
        setBorrowPositions([]);
      }
    }

    // Load vGold price (global)
    const storedPrice = localStorage.getItem('goldchain_vgold_price');
    if (storedPrice) {
      setVGoldPrice(parseFloat(storedPrice));
    }
  };

  const resetState = () => {
    setVGoldBalance(0);
    setTransactions([]);
    setLendPositions([]);
    setBorrowPositions([]);
  };

  const saveUserData = (address: string) => {
    localStorage.setItem(`goldchain_balance_${address}`, vGoldBalance.toString());
    localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(transactions));
    localStorage.setItem(`goldchain_lend_positions_${address}`, JSON.stringify(lendPositions));
    localStorage.setItem(`goldchain_borrow_positions_${address}`, JSON.stringify(borrowPositions));
  };

  // Helper function to generate unique IDs
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Buy vGold
  const buyGold = async (amount: number): Promise<Transaction> => {
    if (!address) throw new Error('Wallet not connected');
    
    const maticAmount = amount * vGoldPrice;
    
    // Create transaction object
    const transaction: Transaction = {
      id: generateId(),
      type: 'buy',
      amount,
      maticAmount,
      status: 'pending',
      timestamp: Date.now(),
    };

    // Update state with pending transaction
    setTransactions(prev => [transaction, ...prev]);
    
    try {
      // Trigger Petra wallet for transaction
      const aptosWallet = (window as AptosWindow).aptos;
      
      if (!aptosWallet) {
        throw new Error('Petra wallet not available');
      }
      
      // Example Aptos transaction for buying vGold tokens
      const txPayload = {
        arguments: [address, amount.toString()], 
        function: '0x1::coin::transfer', // Example function
        type: 'entry_function_payload',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
      };
      
      const pendingTransaction = await aptosWallet.signAndSubmitTransaction(txPayload);
      const txHash = pendingTransaction.hash;
      
      // Update transaction status
      const updatedTransaction: Transaction = { 
        ...transaction, 
        status: 'completed',
        txHash 
      };
      
      // Update balances
      setVGoldBalance(prevBalance => prevBalance + amount);
      
      // Update transaction list with correct typing
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? updatedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_balance_${address}`, (vGoldBalance + amount).toString());
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? updatedTransaction : t)
        ));
      }
      
      // Show success toast
      toast({
        title: 'Purchased vGold',
        description: `Successfully bought ${amount} vGold`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return updatedTransaction;
    } catch (error: any) {
      // Update transaction as failed
      const failedTransaction: Transaction = {
        ...transaction,
        status: 'failed'
      };
      
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? failedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? failedTransaction : t)
        ));
      }
      
      // Show error toast
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Failed to buy vGold',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      throw error;
    }
  };

  // Sell vGold
  const sellGold = async (amount: number): Promise<Transaction> => {
    if (!address) throw new Error('Wallet not connected');
    if (amount > vGoldBalance) throw new Error('Insufficient vGold balance');
    
    const maticAmount = amount * vGoldPrice;
    
    // Create transaction object
    const transaction: Transaction = {
      id: generateId(),
      type: 'sell',
      amount,
      maticAmount,
      status: 'pending',
      timestamp: Date.now(),
    };

    // Update state with pending transaction
    setTransactions(prev => [transaction, ...prev]);
    
    try {
      // Get Petra wallet
      const aptosWallet = (window as AptosWindow).aptos;
      
      if (!aptosWallet) {
        throw new Error('Petra wallet not available');
      }
      
      // Example Aptos transaction for selling vGold tokens
      const txPayload = {
        arguments: [CONTRACT_ADDRESS, amount.toString()], 
        function: '0x1::coin::transfer',
        type: 'entry_function_payload',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
      };
      
      const pendingTransaction = await aptosWallet.signAndSubmitTransaction(txPayload);
      const txHash = pendingTransaction.hash;
      
      // Update transaction status
      const updatedTransaction: Transaction = { 
        ...transaction, 
        status: 'completed',
        txHash
      };
      
      // Update balances
      setVGoldBalance(prevBalance => prevBalance - amount);
      
      // Update transaction list
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? updatedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_balance_${address}`, (vGoldBalance - amount).toString());
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? updatedTransaction : t)
        ));
      }
      
      // Show success toast
      toast({
        title: 'Sold vGold',
        description: `Successfully sold ${amount} vGold for ${maticAmount.toFixed(4)} MATIC`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return updatedTransaction;
    } catch (error: any) {
      // Update transaction as failed
      const failedTransaction: Transaction = {
        ...transaction,
        status: 'failed'
      };
      
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? failedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? failedTransaction : t)
        ));
      }
      
      // Show error toast
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Failed to sell vGold',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      throw error;
    }
  };

  // Lend vGold
  const lendGold = async (amount: number, days: number): Promise<Transaction> => {
    if (!address) throw new Error('Wallet not connected');
    if (amount > vGoldBalance) throw new Error('Insufficient vGold balance');
    
    // Calculate interest rate based on days (simplified formula)
    const interestRate = days <= 30 ? 0.04 : days <= 90 ? 0.055 : 0.07;
    
    // Create transaction object
    const transaction: Transaction = {
      id: generateId(),
      type: 'lend',
      amount,
      duration: days,
      interest: interestRate,
      status: 'pending',
      timestamp: Date.now(),
    };

    // Update state with pending transaction
    setTransactions(prev => [transaction, ...prev]);
    
    try {
      // Get Petra wallet
      const aptosWallet = (window as AptosWindow).aptos;
      
      if (!aptosWallet) {
        throw new Error('Petra wallet not available');
      }
      
      // Example Aptos transaction for lending vGold tokens
      const txPayload = {
        arguments: [address, amount.toString()], 
        function: '0x1::coin::transfer',
        type: 'entry_function_payload',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
      };
      
      const pendingTransaction = await aptosWallet.signAndSubmitTransaction(txPayload);
      const txHash = pendingTransaction.hash;
      
      // Update transaction status
      const updatedTransaction: Transaction = { 
        ...transaction, 
        status: 'completed',
        txHash
      };
      
      // Create a new lending position
      const lendPosition: LendPosition = {
        id: generateId(),
        amount,
        startDate: Date.now(),
        endDate: Date.now() + days * 24 * 60 * 60 * 1000,
        interest: interestRate,
        status: 'active' as const,
      };
      
      // Update vGold balance
      setVGoldBalance(prevBalance => prevBalance - amount);
      
      // Update lending positions
      setLendPositions(prev => [...prev, lendPosition]);
      
      // Update transaction list
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? updatedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_balance_${address}`, (vGoldBalance - amount).toString());
        localStorage.setItem(`goldchain_lend_positions_${address}`, JSON.stringify([...lendPositions, lendPosition]));
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? updatedTransaction : t)
        ));
      }
      
      // Show success toast
      toast({
        title: 'Lend Successful',
        description: `Successfully lent ${amount} vGold for ${days} days at ${(interestRate * 100).toFixed(2)}% APY`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return updatedTransaction;
    } catch (error: any) {
      // Update transaction as failed
      const failedTransaction: Transaction = {
        ...transaction,
        status: 'failed'
      };
      
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? failedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? failedTransaction : t)
        ));
      }
      
      // Show error toast
      toast({
        title: 'Lending Failed',
        description: error.message || 'Failed to lend vGold',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      throw error;
    }
  };

  // Borrow vGold
  const borrowGold = async (amount: number, days: number): Promise<Transaction> => {
    if (!address) throw new Error('Wallet not connected');
    
    // Calculate interest rate (for borrowing, it's higher than lending)
    const interestRate = days <= 30 ? 0.06 : days <= 90 ? 0.075 : 0.09;
    
    // Calculate collateral required (simplified, in a real app this would be more complex)
    const collateralRatio = 1.5; // 150% collateralization
    const collateralAmount = amount * vGoldPrice * collateralRatio;
    
    // Create transaction object
    const transaction: Transaction = {
      id: generateId(),
      type: 'borrow',
      amount,
      duration: days,
      interest: interestRate,
      collateral: collateralAmount,
      status: 'pending',
      timestamp: Date.now(),
    };

    // Update state with pending transaction
    setTransactions(prev => [transaction, ...prev]);
    
    try {
      // Get Petra wallet
      const aptosWallet = (window as AptosWindow).aptos;
      
      if (!aptosWallet) {
        throw new Error('Petra wallet not available');
      }
      
      // Example Aptos transaction for borrowing vGold tokens with collateral
      const txPayload = {
        arguments: [address, amount.toString()], 
        function: '0x1::coin::transfer',
        type: 'entry_function_payload',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
      };
      
      const pendingTransaction = await aptosWallet.signAndSubmitTransaction(txPayload);
      const txHash = pendingTransaction.hash;
      
      // Update transaction status
      const updatedTransaction: Transaction = { 
        ...transaction, 
        status: 'completed',
        txHash
      };
      
      // Create a new borrowing position
      const borrowPosition: BorrowPosition = {
        id: generateId(),
        amount,
        collateral: collateralAmount,
        startDate: Date.now(),
        endDate: Date.now() + days * 24 * 60 * 60 * 1000,
        interest: interestRate,
        status: 'active' as const,
      };
      
      // Update vGold balance
      setVGoldBalance(prevBalance => prevBalance + amount);
      
      // Update borrowing positions
      setBorrowPositions(prev => [...prev, borrowPosition]);
      
      // Update transaction list
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? updatedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_balance_${address}`, (vGoldBalance + amount).toString());
        localStorage.setItem(`goldchain_borrow_positions_${address}`, JSON.stringify([...borrowPositions, borrowPosition]));
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? updatedTransaction : t)
        ));
      }
      
      // Show success toast
      toast({
        title: 'Borrow Successful',
        description: `Successfully borrowed ${amount} vGold with ${collateralAmount.toFixed(2)} MATIC collateral`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return updatedTransaction;
    } catch (error: any) {
      // Update transaction as failed
      const failedTransaction: Transaction = {
        ...transaction,
        status: 'failed'
      };
      
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? failedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? failedTransaction : t)
        ));
      }
      
      throw error;
    }
  };

  // Repay borrowed vGold
  const repayLoan = async (borrowId: string): Promise<Transaction> => {
    if (!address) throw new Error('Wallet not connected');
    
    // Find the borrow position
    const borrowPosition = borrowPositions.find(p => p.id === borrowId);
    if (!borrowPosition) throw new Error('Borrow position not found');
    if (borrowPosition.status !== 'active') throw new Error('Loan is not active');
    
    // Calculate total repayment amount with interest
    const loanDuration = (Date.now() - borrowPosition.startDate) / (24 * 60 * 60 * 1000); // in days
    const interestFactor = 1 + (borrowPosition.interest * Math.min(loanDuration, borrowPosition.endDate - borrowPosition.startDate) / (365 * 24 * 60 * 60 * 1000));
    const repaymentAmount = borrowPosition.amount * interestFactor;
    
    // Check if user has enough vGold
    if (vGoldBalance < repaymentAmount) throw new Error(`Insufficient vGold balance. Need ${repaymentAmount.toFixed(2)} vGold.`);
    
    // Create transaction object
    const transaction: Transaction = {
      id: generateId(),
      type: 'repay',
      amount: repaymentAmount,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    // Update state with pending transaction
    setTransactions(prev => [transaction, ...prev]);
    
    try {
      // Get Petra wallet
      const aptosWallet = (window as AptosWindow).aptos;
      
      if (!aptosWallet) {
        throw new Error('Petra wallet not available');
      }
      
      // Example Aptos transaction for repaying a loan
      const txPayload = {
        arguments: [address, repaymentAmount.toString()], 
        function: '0x1::coin::transfer',
        type: 'entry_function_payload',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
      };
      
      const pendingTransaction = await aptosWallet.signAndSubmitTransaction(txPayload);
      const txHash = pendingTransaction.hash;
      
      // Update transaction status
      const updatedTransaction: Transaction = { 
        ...transaction, 
        status: 'completed',
        txHash
      };
      
      // Update vGold balance
      setVGoldBalance(prevBalance => prevBalance - repaymentAmount);
      
      // Update the borrow position
      const updatedPosition: BorrowPosition = {
        ...borrowPosition,
        status: 'repaid' as const,
      };
      
      // Update borrowing positions
      setBorrowPositions(prev => 
        prev.map(p => p.id === borrowId ? updatedPosition : p)
      );
      
      // Update transaction list
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? updatedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_balance_${address}`, (vGoldBalance - repaymentAmount).toString());
        localStorage.setItem(`goldchain_borrow_positions_${address}`, JSON.stringify(
          borrowPositions.map(p => p.id === borrowId ? updatedPosition : p)
        ));
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? updatedTransaction : t)
        ));
      }
      
      // Show success toast
      toast({
        title: 'Loan Repaid',
        description: `Successfully repaid ${repaymentAmount.toFixed(2)} vGold. Your collateral has been returned.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return updatedTransaction;
    } catch (error: any) {
      // Update transaction as failed
      const failedTransaction: Transaction = {
        ...transaction,
        status: 'failed'
      };
      
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? failedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? failedTransaction : t)
        ));
      }
      
      // Show error toast
      toast({
        title: 'Repayment Failed',
        description: error.message || 'Failed to repay loan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      throw error;
    }
  };

  // Claim returns from lending
  const claimLendReturns = async (lendId: string): Promise<Transaction> => {
    if (!address) throw new Error('Wallet not connected');
    
    // Find the lending position
    const lendPosition = lendPositions.find(p => p.id === lendId);
    if (!lendPosition) throw new Error('Lending position not found');
    if (lendPosition.status !== 'active') throw new Error('Lending position already completed');
    
    // Check if lending period is over
    if (Date.now() < lendPosition.endDate) {
      throw new Error(`Lending period not yet finished. Available on ${new Date(lendPosition.endDate).toLocaleDateString()}`);
    }
    
    // Calculate returns with interest
    const principal = lendPosition.amount;
    const interestAmount = principal * lendPosition.interest * ((lendPosition.endDate - lendPosition.startDate) / (365 * 24 * 60 * 60 * 1000));
    const totalReturns = principal + interestAmount;
    
    // Create transaction object
    const transaction: Transaction = {
      id: generateId(),
      type: 'claim',
      amount: totalReturns,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    // Update state with pending transaction
    setTransactions(prev => [transaction, ...prev]);
    
    try {
      // Get Petra wallet
      const aptosWallet = (window as AptosWindow).aptos;
      
      if (!aptosWallet) {
        throw new Error('Petra wallet not available');
      }
      
      // Example Aptos transaction for claiming lending returns
      const txPayload = {
        arguments: [address, totalReturns.toString()], 
        function: '0x1::coin::transfer',
        type: 'entry_function_payload',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
      };
      
      const pendingTransaction = await aptosWallet.signAndSubmitTransaction(txPayload);
      const txHash = pendingTransaction.hash;
      
      // Update transaction status
      const updatedTransaction: Transaction = { 
        ...transaction, 
        status: 'completed',
        txHash
      };
      
      // Update vGold balance
      setVGoldBalance(prevBalance => prevBalance + totalReturns);
      
      // Update the lending position
      const updatedPosition: LendPosition = {
        ...lendPosition,
        status: 'completed' as const,
      };
      
      // Update lending positions
      setLendPositions(prev => 
        prev.map(p => p.id === lendId ? updatedPosition : p)
      );
      
      // Update transaction list
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? updatedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_balance_${address}`, (vGoldBalance + totalReturns).toString());
        localStorage.setItem(`goldchain_lend_positions_${address}`, JSON.stringify(
          lendPositions.map(p => p.id === lendId ? updatedPosition : p)
        ));
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? updatedTransaction : t)
        ));
      }
      
      // Show success toast
      toast({
        title: 'Returns Claimed',
        description: `Successfully claimed ${totalReturns.toFixed(2)} vGold (including ${interestAmount.toFixed(2)} interest)`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return updatedTransaction;
    } catch (error: any) {
      // Update transaction as failed
      const failedTransaction: Transaction = {
        ...transaction,
        status: 'failed'
      };
      
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? failedTransaction : t)
      );
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`goldchain_transactions_${address}`, JSON.stringify(
          transactions.map(t => t.id === transaction.id ? failedTransaction : t)
        ));
      }
      
      // Show error toast
      toast({
        title: 'Claim Failed',
        description: error.message || 'Failed to claim returns',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      throw error;
    }
  };

  return (
    <GoldContext.Provider
      value={{
        vGoldBalance,
        vGoldPrice,
        transactions,
        lendPositions,
        borrowPositions,
        buyGold,
        sellGold,
        lendGold,
        borrowGold,
        repayLoan,
        claimLendReturns,
      }}
    >
      {children}
    </GoldContext.Provider>
  );
}; 
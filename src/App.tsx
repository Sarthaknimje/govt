import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ChakraProvider,
  extendTheme,
  Box,
  Flex,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Image,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Buy from './pages/Buy';
import Lend from './pages/Lend';
import Borrow from './pages/Borrow';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Register from './pages/Register';
import { WalletProvider } from './context/WalletContext';
import { GoldProvider } from './context/GoldContext';
import PriceProvider from './context/PriceContext';
import { FaExclamationTriangle } from 'react-icons/fa';
import './assets/animations.css';

// Extended theme with gold colors
const theme = extendTheme({
  colors: {
    gold: {
      50: '#FFF9E6',
      100: '#FFF0BF',
      200: '#FFE799',
      300: '#FFDE73',
      400: '#FFD54C',
      500: '#FFD700', // Main gold color
      600: '#CCAC00',
      700: '#998100',
      800: '#665600',
      900: '#332B00',
    },
    goldRoyal: {
      50: '#FFF8DC',
      100: '#FAEBD7',
      200: '#F5DEB3',
      300: '#DAA520', // Goldenrod
      400: '#B8860B', // DarkGoldenrod
      500: '#A67C00',
      600: '#8B6914',
      700: '#704214',
      800: '#543A0A',
      900: '#302105',
    },
  },
  fonts: {
    heading: '"Montserrat", sans-serif',
    body: '"Poppins", sans-serif',
  },
  styles: {
    global: {
      body: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      },
    },
  },
  components: {
    Button: {
      variants: {
        gold: {
          bg: 'gold.500',
          color: 'white',
          _hover: {
            bg: 'gold.400',
            _disabled: {
              bg: 'gold.300',
            },
          },
          _active: { bg: 'gold.600' },
        },
        royal: {
          bg: 'goldRoyal.300',
          color: 'white',
          _hover: {
            bg: 'goldRoyal.400',
          },
          _active: { bg: 'goldRoyal.500' },
        },
      },
    },
    // Add shimmer animation to certain components
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 2,
        py: 1,
      },
      variants: {
        shimmer: {
          position: 'relative',
          overflow: 'hidden',
          _after: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
            animation: 'shimmer 2s infinite',
          },
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState<any>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [metamaskInstalled, setMetamaskInstalled] = useState(true);
  const [walletChoice, setWalletChoice] = useState<'petra' | null>(null);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  // Check if user is logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('goldchain_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check if Petra wallet is installed
    checkWalletProviders();
  }, []);

  const checkWalletProviders = () => {
    // Check for Petra wallet
    if ((window as AptosWindow).aptos) {
      console.log("Petra wallet is installed");
    } else {
      console.log("No Petra wallet detected");
      setMetamaskInstalled(false);
      onOpen();
    }
  };

  const handleInstallPetra = () => {
    window.open('https://petra.app/', '_blank');
    onClose();
  };

  return (
    <ChakraProvider theme={theme}>
      <WalletProvider>
        <GoldProvider>
          <PriceProvider>
            <Router>
              <Flex direction="column" minH="100vh">
                <Header />
                <Box flex="1" className="fade-in">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/buy" element={<Buy />} />
                    <Route path="/lend" element={<Lend />} />
                    <Route path="/borrow" element={<Borrow />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/register" element={<Register setUser={setUser} />} />
                  </Routes>
                </Box>
                <Footer />
              </Flex>
            </Router>
            
            {/* Wallet Not Detected Alert */}
            <AlertDialog
              isOpen={isOpen && !metamaskInstalled}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent className="slide-in-up gold-wave">
                  <AlertDialogHeader fontSize="lg" fontWeight="bold" display="flex" alignItems="center">
                    <Icon as={FaExclamationTriangle} mr={2} color="orange.500" />
                    Wallet Not Detected
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    <Text mb={4}>
                      GoldChain requires a Polygon MATIC wallet to connect. Please install Petra wallet:
                    </Text>
                    
                    <Flex direction="column" gap={4}>
                      <Box 
                        p={3} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        className="card-hover" 
                        cursor="pointer"
                        onClick={handleInstallPetra}
                      >
                        <HStack>
                          <Image 
                            src="https://petra.app/assets/aptos.png" 
                            boxSize="40px" 
                            alt="Polygon Wallet" 
                          />
                          <Box>
                            <Text fontWeight="bold">Polygon MATIC Wallet</Text>
                            <Text fontSize="sm">Connect to Polygon Network</Text>
                          </Box>
                        </HStack>
                      </Box>
                    </Flex>
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose} variant="outline">
                      Not Now
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </PriceProvider>
        </GoldProvider>
      </WalletProvider>
    </ChakraProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  InputGroup,
  InputRightAddon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaCoins, FaExchangeAlt, FaMinus, FaPlus } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { useGold } from '../context/GoldContext';

const Buy = () => {
  const { balance, account, isConnected } = useWallet();
  const { vGoldBalance, vGoldPrice, buyGold, sellGold } = useGold();
  const [buyAmount, setBuyAmount] = useState<number | string>('');
  const [sellAmount, setSellAmount] = useState<number | string>('');
  const [buyMaticAmount, setBuyMaticAmount] = useState<number>(0);
  const [sellMaticAmount, setSellMaticAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    if (typeof buyAmount === 'string' && buyAmount !== '') {
      const amount = parseFloat(buyAmount);
      if (!isNaN(amount)) {
        setBuyMaticAmount(amount * vGoldPrice);
      } else {
        setBuyMaticAmount(0);
      }
    } else if (typeof buyAmount === 'number') {
      setBuyMaticAmount(buyAmount * vGoldPrice);
    } else {
      setBuyMaticAmount(0);
    }
  }, [buyAmount, vGoldPrice]);

  useEffect(() => {
    if (typeof sellAmount === 'string' && sellAmount !== '') {
      const amount = parseFloat(sellAmount);
      if (!isNaN(amount)) {
        setSellMaticAmount(amount * vGoldPrice);
      } else {
        setSellMaticAmount(0);
      }
    } else if (typeof sellAmount === 'number') {
      setSellMaticAmount(sellAmount * vGoldPrice);
    } else {
      setSellMaticAmount(0);
    }
  }, [sellAmount, vGoldPrice]);

  const formatBalance = (balance: string | number): string => {
    if (typeof balance === 'string') {
      return parseFloat(balance).toFixed(4);
    }
    return balance.toFixed(4);
  };

  const formatPrice = (price: number): string => {
    return price.toFixed(8);
  };

  const increaseAmount = (type: 'buy' | 'sell') => {
    if (type === 'buy') {
      const currentAmount = typeof buyAmount === 'string' ? parseFloat(buyAmount) || 0 : buyAmount;
      setBuyAmount((currentAmount + 1).toString());
    } else {
      const currentAmount = typeof sellAmount === 'string' ? parseFloat(sellAmount) || 0 : sellAmount;
      setSellAmount((currentAmount + 1).toString());
    }
  };

  const decreaseAmount = (type: 'buy' | 'sell') => {
    if (type === 'buy') {
      const currentAmount = typeof buyAmount === 'string' ? parseFloat(buyAmount) || 0 : buyAmount;
      if (currentAmount > 1) {
        setBuyAmount((currentAmount - 1).toString());
      } else {
        setBuyAmount('0');
      }
    } else {
      const currentAmount = typeof sellAmount === 'string' ? parseFloat(sellAmount) || 0 : sellAmount;
      if (currentAmount > 1) {
        setSellAmount((currentAmount - 1).toString());
      } else {
        setSellAmount('0');
      }
    }
  };

  const handleSliderChange = (val: number) => {
    setSliderValue(val);
    const percentAmount = (parseFloat(balance) * val) / 100;
    setBuyAmount(formatBalance(percentAmount / vGoldPrice));
  };

  const handleSellSliderChange = (val: number) => {
    setSliderValue(val);
    const percentAmount = (vGoldBalance * val) / 100;
    setSellAmount(formatBalance(percentAmount));
  };

  const handleBuy = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const amount = typeof buyAmount === 'string' ? parseFloat(buyAmount) : buyAmount;
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (buyMaticAmount > parseFloat(balance)) {
        throw new Error('Insufficient MATIC balance');
      }
      
      // Call the buy function from context
      const transaction = await buyGold(amount);
      
      toast({
        title: 'Purchase successful',
        description: `You've purchased ${formatBalance(amount)} vGold`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setBuyAmount('');
      setSliderValue(0);
    } catch (error: any) {
      setErrorMessage(error.message);
      toast({
        title: 'Purchase failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const amount = typeof sellAmount === 'string' ? parseFloat(sellAmount) : sellAmount;
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (amount > vGoldBalance) {
        throw new Error('Insufficient vGold balance');
      }
      
      // Call the sell function from context
      const transaction = await sellGold(amount);
      
      toast({
        title: 'Sale successful',
        description: `You've sold ${formatBalance(amount)} vGold for ${formatBalance(sellMaticAmount)} MATIC`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setSellAmount('');
      setSliderValue(0);
    } catch (error: any) {
      setErrorMessage(error.message);
      toast({
        title: 'Sale failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Buy & Sell vGold</Heading>
        
        {!isConnected && (
          <Alert status="warning">
            <AlertIcon />
            Please connect your wallet to buy or sell vGold
          </Alert>
        )}
        
        <HStack spacing={8} align="flex-start" wrap={{ base: 'wrap', md: 'nowrap' }}>
          {/* Stats Section */}
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={bgColor}
            flex="1"
            minW={{ base: '100%', md: '250px' }}
            maxW={{ base: '100%', md: '300px' }}
            className="card-hover"
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md" mb={2}>Current Balances</Heading>
              
              <Stat>
                <StatLabel>vGold Balance</StatLabel>
                <StatNumber className="balance-animation">{formatBalance(vGoldBalance)} vGold</StatNumber>
                <StatHelpText>≈ {formatBalance(vGoldBalance * vGoldPrice)} MATIC</StatHelpText>
              </Stat>
              
              <Divider />
              
              <Stat>
                <StatLabel>MATIC Balance</StatLabel>
                <StatNumber>{formatBalance(balance)}</StatNumber>
                <StatHelpText>≈ {formatBalance(parseFloat(balance) / vGoldPrice)} vGold</StatHelpText>
              </Stat>
              
              <Divider />
              
              <Stat>
                <StatLabel>Exchange Rate</StatLabel>
                <HStack>
                  <Text fontWeight="bold">1 vGold =</Text>
                  <Text>{formatBalance(vGoldPrice)} MATIC</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">1 MATIC =</Text>
                  <Text>{formatBalance(1 / vGoldPrice)} vGold</Text>
                </HStack>
              </Stat>
            </VStack>
          </Box>
          
          {/* Buy/Sell Tabs */}
          <Box
            flex="2"
            p={0}
            shadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={bgColor}
            minW={{ base: '100%', md: '0' }}
            className="card-hover"
          >
            <Tabs colorScheme="gold" isFitted>
              <TabList>
                <Tab 
                  fontSize="lg"
                  fontWeight="medium"
                  py={4}
                  _selected={{ color: "gold.800", borderColor: "gold.500" }}
                >
                  Buy vGold
                </Tab>
                <Tab 
                  fontSize="lg"
                  fontWeight="medium"
                  py={4}
                  _selected={{ color: "red.600", borderColor: "red.500" }}
                >
                  Sell vGold
                </Tab>
              </TabList>
              
              <TabPanels>
                {/* Buy Panel */}
                <TabPanel>
                  <VStack spacing={6} align="stretch" p={2}>
                    <FormControl>
                      <FormLabel>Amount of vGold to buy</FormLabel>
                      <InputGroup size="lg">
                        <InputGroup>
                          <IconButton
                            aria-label="Decrease amount"
                            icon={<FaMinus />}
                            onClick={() => decreaseAmount('buy')}
                            disabled={!isConnected}
                            size="md"
                            mr={1}
                          />
                          <Input
                            type="number"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            placeholder="0.0"
                            disabled={!isConnected}
                          />
                          <InputRightAddon children="vGold" />
                          <IconButton
                            aria-label="Increase amount"
                            icon={<FaPlus />}
                            onClick={() => increaseAmount('buy')}
                            disabled={!isConnected}
                            size="md"
                            ml={1}
                          />
                        </InputGroup>
                      </InputGroup>
                      
                      <Text mt={2} fontSize="sm" color="gray.500">
                        Select amount using the slider below:
                      </Text>
                      
                      <Box pt={6} pb={2}>
                        <Slider
                          id="slider"
                          defaultValue={0}
                          min={0}
                          max={100}
                          colorScheme="gold"
                          onChange={handleSliderChange}
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          isDisabled={!isConnected}
                          value={sliderValue}
                        >
                          <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>
                            25%
                          </SliderMark>
                          <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>
                            50%
                          </SliderMark>
                          <SliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>
                            75%
                          </SliderMark>
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <Tooltip
                            hasArrow
                            bg='gold.500'
                            color='white'
                            placement='top'
                            isOpen={showTooltip}
                            label={`${sliderValue}%`}
                          >
                            <SliderThumb boxSize={6}>
                              <Box color='gold.500' as={FaCoins} />
                            </SliderThumb>
                          </Tooltip>
                        </Slider>
                      </Box>
                    </FormControl>
                    
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text>You Pay:</Text>
                        <Text fontWeight="bold">{formatBalance(buyMaticAmount)} MATIC</Text>
                      </HStack>
                      <HStack justify="space-between" mt={2}>
                        <Text>You Receive:</Text>
                        <Text fontWeight="bold">{buyAmount ? formatBalance(buyAmount) : '0'} vGold</Text>
                      </HStack>
                      <HStack justify="space-between" mt={2}>
                        <Text>Exchange Rate:</Text>
                        <Text>1 vGold = {formatBalance(vGoldPrice)} MATIC</Text>
                      </HStack>
                    </Box>
                    
                    {errorMessage && (
                      <Alert status="error">
                        <AlertIcon />
                        {errorMessage}
                      </Alert>
                    )}
                    
                    <Button
                      colorScheme="gold"
                      size="lg"
                      leftIcon={<FaCoins />}
                      onClick={handleBuy}
                      isLoading={isLoading}
                      loadingText="Processing..."
                      isDisabled={!isConnected || buyAmount === '' || parseFloat(buyAmount.toString()) <= 0}
                    >
                      Buy vGold
                    </Button>
                  </VStack>
                </TabPanel>
                
                {/* Sell Panel */}
                <TabPanel>
                  <VStack spacing={6} align="stretch" p={2}>
                    <FormControl>
                      <FormLabel>Amount of vGold to sell</FormLabel>
                      <InputGroup size="lg">
                        <InputGroup>
                          <IconButton
                            aria-label="Decrease amount"
                            icon={<FaMinus />}
                            onClick={() => decreaseAmount('sell')}
                            disabled={!isConnected}
                            size="md"
                            mr={1}
                          />
                          <Input
                            type="number"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
                            placeholder="0.0"
                            disabled={!isConnected}
                          />
                          <InputRightAddon children="vGold" />
                          <IconButton
                            aria-label="Increase amount"
                            icon={<FaPlus />}
                            onClick={() => increaseAmount('sell')}
                            disabled={!isConnected}
                            size="md"
                            ml={1}
                          />
                        </InputGroup>
                      </InputGroup>
                      
                      <Text mt={2} fontSize="sm" color="gray.500">
                        Select amount using the slider below:
                      </Text>
                      
                      <Box pt={6} pb={2}>
                        <Slider
                          id="slider"
                          defaultValue={0}
                          min={0}
                          max={100}
                          colorScheme="red"
                          onChange={handleSellSliderChange}
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          isDisabled={!isConnected}
                          value={sliderValue}
                        >
                          <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>
                            25%
                          </SliderMark>
                          <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>
                            50%
                          </SliderMark>
                          <SliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>
                            75%
                          </SliderMark>
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <Tooltip
                            hasArrow
                            bg='red.500'
                            color='white'
                            placement='top'
                            isOpen={showTooltip}
                            label={`${sliderValue}%`}
                          >
                            <SliderThumb boxSize={6}>
                              <Box color='red.500' as={FaExchangeAlt} />
                            </SliderThumb>
                          </Tooltip>
                        </Slider>
                      </Box>
                    </FormControl>
                    
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text>You Sell:</Text>
                        <Text fontWeight="bold">{sellAmount ? formatBalance(sellAmount) : '0'} vGold</Text>
                      </HStack>
                      <HStack justify="space-between" mt={2}>
                        <Text>You Receive:</Text>
                        <Text fontWeight="bold">{formatBalance(sellMaticAmount)} MATIC</Text>
                      </HStack>
                      <HStack justify="space-between" mt={2}>
                        <Text>Exchange Rate:</Text>
                        <Text>1 vGold = {formatBalance(vGoldPrice)} MATIC</Text>
                      </HStack>
                    </Box>
                    
                    {errorMessage && (
                      <Alert status="error">
                        <AlertIcon />
                        {errorMessage}
                      </Alert>
                    )}
                    
                    <Button
                      colorScheme="red"
                      size="lg"
                      leftIcon={<FaExchangeAlt />}
                      onClick={handleSell}
                      isLoading={isLoading}
                      loadingText="Processing..."
                      isDisabled={!isConnected || sellAmount === '' || parseFloat(sellAmount.toString()) <= 0}
                    >
                      Sell vGold
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </HStack>
      </VStack>
    </Container>
  );
};

export default Buy; 
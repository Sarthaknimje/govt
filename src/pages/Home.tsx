import React, { useEffect, useState, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  Flex,
  SimpleGrid,
  Image,
  HStack,
  VStack,
  IconButton,
  IconProps,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useBreakpointValue,
  Badge,
  useDisclosure,
  Fade,
  ScaleFade,
  SlideFade,
} from '@chakra-ui/react';
import { 
  FaCoins, 
  FaWallet, 
  FaHandHoldingUsd, 
  FaShieldAlt, 
  FaUserShield, 
  FaChartLine, 
  FaLock, 
  FaSyncAlt, 
  FaArrowRight, 
  FaRegLightbulb, 
  FaGlobe,
  FaEthereum,
  FaUniversity
} from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { usePrice } from '../context/PriceContext';
import goldVaultImg from '../assets/gold-vault.svg';

const Feature = ({ title, text, icon, delay }: {
  title: string;
  text: string;
  icon: React.ReactElement;
  delay: number;
}) => {
  return (
    <Stack 
      className="slide-in-up" 
      style={{ animationDelay: `${delay}s` }}
      bg={useColorModeValue('white', 'gray.700')}
      boxShadow={'lg'}
      p={6}
      rounded={'xl'}
      border={'1px'}
      borderColor={useColorModeValue('gray.100', 'gray.600')}
      _hover={{
        borderColor: 'gold.500',
        transform: 'translateY(-5px)',
        transition: 'all 0.3s ease',
      }}
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'gold.500'}
        mb={4}
        className="shimmer"
      >
        {icon}
      </Flex>
      <Heading fontSize={'xl'}>{title}</Heading>
      <Text color={'gray.600'} align={'left'}>
        {text}
      </Text>
    </Stack>
  );
};

const Home = () => {
  const { connectWallet, isConnected } = useWallet();
  const { prices } = usePrice();
  const [scrollPosition, setScrollPosition] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [showVault, setShowVault] = useState(false);
  
  // Animation timers
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVault(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const goldPrice = (prices['gold'] || { usd: 2450 }).usd;
  const bitcoinPrice = (prices['bitcoin'] || { usd: 65000 }).usd;
  const maticPrice = (prices['matic-network'] || { usd: 0.85 }).usd;
  
  return (
    <Box overflow="hidden">
      {/* Hero Section */}
      <Container maxW={'7xl'} ref={heroRef}>
        <Stack
          align={'center'}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
          direction={{ base: 'column', md: 'row' }}
          position="relative"
        >
          {/* Gold dust particles - pure CSS animation */}
          <Box 
            position="absolute" 
            top="0" 
            left="0" 
            right="0" 
            bottom="0" 
            opacity="0.4"
            pointerEvents="none"
            zIndex="0"
            className="gold-wave"
            borderRadius="xl"
          />
          
          <Stack flex={1} spacing={{ base: 5, md: 10 }} zIndex="1">
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
            >
              <Text
                as={'span'}
                position={'relative'}
                _after={{
                  content: "''",
                  width: 'full',
                  height: '30%',
                  position: 'absolute',
                  bottom: 1,
                  left: 0,
                  bg: 'gold.400',
                  zIndex: -1,
                }}
              >
                Digital Gold,
              </Text>
              <br />
              <Text as={'span'} className="gold-text">
                Real Value
              </Text>
            </Heading>
            <Text color={'gray.500'} className="slide-in-up">
              GoldChain makes gold accessible to everyone. Buy, lend, and borrow digital gold (vGold) backed by real physical gold reserves.
              Experience all the benefits of gold ownership without the hassle of storage and security.
            </Text>
            
            <HStack wrap="wrap" spacing={4}>
              <Badge colorScheme="green" p={2} borderRadius="full" className="floating" fontSize="sm">
                <HStack>
                  <Icon as={FaLock} />
                  <Text>100% Backed by Physical Gold</Text>
                </HStack>
              </Badge>
              
              <Badge colorScheme="purple" p={2} borderRadius="full" className="floating" style={{ animationDelay: '0.5s' }} fontSize="sm">
                <HStack>
                  <Icon as={FaEthereum} />
                  <Text>Polygon Network</Text>
                </HStack>
              </Badge>
              
              <Badge colorScheme="blue" p={2} borderRadius="full" className="floating" style={{ animationDelay: '1s' }} fontSize="sm">
                <HStack>
                  <Icon as={FaUniversity} />
                  <Text>Audited & Secure</Text>
                </HStack>
              </Badge>
            </HStack>
            
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: 'column', sm: 'row' }}
            >
              {isConnected ? (
                <Button
                  as={RouterLink}
                  to="/dashboard"
                  rounded={'full'}
                  size={'lg'}
                  fontWeight={'normal'}
                  px={6}
                  colorScheme={'gold'}
                  bg={'gold.500'}
                  _hover={{ bg: 'gold.400' }}
                  className="gold-bar-shine"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  rounded={'full'}
                  size={'lg'}
                  fontWeight={'normal'}
                  px={6}
                  colorScheme={'gold'}
                  bg={'gold.500'}
                  _hover={{ bg: 'gold.400' }}
                  onClick={connectWallet}
                  className="gold-bar-shine"
                >
                  Connect Wallet
                </Button>
              )}
              <Button
                as={RouterLink}
                to="/buy"
                rounded={'full'}
                size={'lg'}
                fontWeight={'normal'}
                px={6}
                leftIcon={<FaCoins />}
                variant="outline"
                color={'goldRoyal.400'}
                borderColor={'goldRoyal.400'}
                _hover={{ bg: 'goldRoyal.50' }}
                className="shimmer"
              >
                Buy vGold
              </Button>
            </Stack>
          </Stack>
          <Flex
            flex={1}
            justify={'center'}
            align={'center'}
            position={'relative'}
            w={'full'}
            zIndex="1"
          >
            <Blob
              w={'150%'}
              h={'150%'}
              position={'absolute'}
              top={'-20%'}
              left={0}
              zIndex={-1}
              color={useColorModeValue('gold.100', 'gold.800')}
              style={{
                transform: `translateY(${scrollPosition * 0.1}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            />
            <ScaleFade initialScale={0.8} in={showVault}>
              <Box
                position={'relative'}
                height={'350px'}
                rounded={'2xl'}
                boxShadow={'2xl'}
                width={'full'}
                overflow={'hidden'}
                className="vault-door"
                bg={useColorModeValue('white', 'gray.700')}
                style={{
                  transform: `translateY(${scrollPosition * -0.05}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <Image
                  alt={'Gold bars stacked in a secure vault'}
                  fit={'contain'}
                  align={'center'}
                  w={'100%'}
                  h={'100%'}
                  src={goldVaultImg}
                  className="gold-stack"
                />
              </Box>
            </ScaleFade>
          </Flex>
        </Stack>
      </Container>

      {/* Live Price Ticker */}
      <Box 
        bg="gold.500" 
        py={2} 
        color="white"
        overflow="hidden"
        position="relative"
      >
        <Box className="price-ticker">
          <HStack spacing={10} px={10}>
            <HStack>
              <FaCoins />
              <Text fontWeight="bold">Gold: ${goldPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaEthereum} />
              <Text fontWeight="bold">Matic: ${maticPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaCoins} />
              <Text fontWeight="bold">Bitcoin: ${bitcoinPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <FaCoins />
              <Text fontWeight="bold">Gold: ${goldPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaEthereum} />
              <Text fontWeight="bold">Matic: ${maticPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaCoins} />
              <Text fontWeight="bold">Bitcoin: ${bitcoinPrice.toFixed(2)}</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box bg={useColorModeValue('gold.50', 'gray.900')} py={10}>
        <Container maxW={'7xl'}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
            <Stat className="slide-in-up gold-bar-shine">
              <StatLabel>Active Users</StatLabel>
              <StatNumber className="gold-text">10,200+</StatNumber>
              <StatHelpText>Global investors</StatHelpText>
            </Stat>
            <Stat className="slide-in-up gold-bar-shine" style={{ animationDelay: '0.1s' }}>
              <StatLabel>vGold in Circulation</StatLabel>
              <StatNumber className="gold-text">124,000</StatNumber>
              <StatHelpText>Worth of digital gold</StatHelpText>
            </Stat>
            <Stat className="slide-in-up gold-bar-shine" style={{ animationDelay: '0.2s' }}>
              <StatLabel>APY on Lending</StatLabel>
              <StatNumber className="gold-text">6.2%</StatNumber>
              <StatHelpText>Average return</StatHelpText>
            </Stat>
            <Stat className="slide-in-up gold-bar-shine" style={{ animationDelay: '0.3s' }}>
              <StatLabel>Physical Gold Backing</StatLabel>
              <StatNumber className="gold-text">100%</StatNumber>
              <StatHelpText>Security guaranteed</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxW={'7xl'} py={16}>
        <VStack spacing={12}>
          <Box textAlign="center" maxW="container.md" mx="auto">
            <Heading as="h2" size="xl" mb={4} className="gold-text">
              Why Choose GoldChain?
            </Heading>
            <Text color="gray.600">
              GoldChain is revolutionizing the way you invest in gold by combining the stability of precious metals with the flexibility of blockchain technology.
            </Text>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
            <Feature
              icon={<Icon as={FaCoins} w={10} h={10} />}
              title={'Tokenized Gold'}
              text={'Each vGold token is backed by real, physical gold stored in secure vaults and regularly audited.'}
              delay={0}
            />
            <Feature
              icon={<Icon as={FaHandHoldingUsd} w={10} h={10} />}
              title={'Earn Interest'}
              text={'Lend your vGold and earn attractive interest rates, turning your idle gold into a productive asset.'}
              delay={0.1}
            />
            <Feature
              icon={<Icon as={FaWallet} w={10} h={10} />}
              title={'Instant Liquidity'}
              text={'Convert your vGold to MATIC or other cryptocurrencies instantly, 24/7, without traditional market restrictions.'}
              delay={0.2}
            />
            <Feature
              icon={<Icon as={FaShieldAlt} w={10} h={10} />}
              title={'Secure & Insured'}
              text={'Your physical gold is stored in high-security vaults and fully insured against theft or loss.'}
              delay={0.3}
            />
            <Feature
              icon={<Icon as={FaChartLine} w={10} h={10} />}
              title={'Portfolio Diversification'}
              text={'Reduce overall risk in your investment portfolio with gold, a proven store of value for thousands of years.'}
              delay={0.4}
            />
            <Feature
              icon={<Icon as={FaSyncAlt} w={10} h={10} />}
              title={'Smart Contracts'}
              text={'All transactions are executed through transparent, audited smart contracts on the Polygon blockchain.'}
              delay={0.5}
            />
          </SimpleGrid>
          
          <Button
            as={RouterLink}
            to="/buy"
            rounded={'full'}
            px={6}
            py={3}
            colorScheme={'goldRoyal'}
            bg={'goldRoyal.300'}
            _hover={{ bg: 'goldRoyal.400' }}
            variant="solid"
            size="lg"
            rightIcon={<FaArrowRight />}
            className="gold-bar-shine"
          >
            Start Investing Now
          </Button>
        </VStack>
      </Container>

      {/* Call to action */}
      <Box bg="gold.500" color="white" py={16} className="gold-wave">
        <Container maxW={'3xl'} textAlign="center">
          <Heading as="h2" size="xl" mb={6}>
            Ready to secure your financial future with gold?
          </Heading>
          <Text fontSize="lg" mb={8}>
            Join thousands of investors who trust GoldChain for their gold investments. Get started in minutes.
          </Text>
          <HStack spacing={4} justify="center" wrap="wrap">
            <Button
              as={RouterLink}
              to={isConnected ? "/dashboard" : "#"}
              onClick={isConnected ? undefined : connectWallet}
              bg="white"
              color="gold.500"
              _hover={{ bg: 'gray.100' }}
              size="lg"
              className="glow"
            >
              {isConnected ? 'Go to Dashboard' : 'Connect Wallet'}
            </Button>
            <Button
              as={RouterLink}
              to="/buy"
              variant="outline"
              borderColor="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              size="lg"
              leftIcon={<FaCoins />}
              className="shimmer"
            >
              Buy vGold
            </Button>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

export const Blob = (props: IconProps) => {
  return (
    <Icon
      width={'100%'}
      viewBox="0 0 578 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M239.184 439.443c-55.13-5.419-110.241-21.365-151.074-58.767C42.307 338.722-7.478 282.729.938 221.217c8.433-61.644 78.896-91.048 126.871-130.712 34.337-28.388 70.198-51.348 112.004-66.78C282.34 8.024 325.382-3.369 370.518.904c54.019 5.115 112.774 10.886 150.881 49.482 39.916 40.427 49.421 100.753 53.385 157.402 4.13 59.015 11.255 128.44-30.444 170.44-41.383 41.683-111.6 19.106-169.213 30.663-46.68 9.364-88.56 35.21-135.943 30.551z"
        fill="currentColor"
      />
    </Icon>
  );
};

const PlayIcon = createIcon({
  displayName: 'PlayIcon',
  viewBox: '0 0 58 58',
  d: 'M28.9999 0.562988C13.3196 0.562988 0.562378 13.3202 0.562378 29.0005C0.562378 44.6808 13.3196 57.438 28.9999 57.438C44.6801 57.438 57.4374 44.6808 57.4374 29.0005C57.4374 13.3202 44.6801 0.562988 28.9999 0.562988ZM39.2223 30.272L23.5749 39.7247C23.3506 39.8591 23.0946 39.9314 22.8332 39.9342C22.5717 39.9369 22.3142 39.8701 22.0871 39.7406C21.86 39.611 21.6715 39.4234 21.5408 39.1969C21.4102 38.9705 21.3421 38.7133 21.3436 38.4519V19.5491C21.3421 19.2877 21.4102 19.0305 21.5408 18.8041C21.6715 18.5776 21.86 18.3899 22.0871 18.2604C22.3142 18.1308 22.5717 18.064 22.8332 18.0668C23.0946 18.0696 23.3506 18.1419 23.5749 18.2763L39.2223 27.729C39.4404 27.8619 39.6207 28.0486 39.7458 28.2713C39.8709 28.494 39.9366 28.7451 39.9366 29.0005C39.9366 29.2559 39.8709 29.507 39.7458 29.7297C39.6207 29.9523 39.4404 30.1391 39.2223 30.272Z',
}); 
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  Tag,
  useColorModeValue,
  Image,
  HStack,
  Icon,
  Divider
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram, FaGithub, FaDiscord, FaMedium } from 'react-icons/fa';
import logo from '../assets/logo.svg';

const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt="auto"
      borderTop="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 2fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <HStack spacing={2}>
                <Image src={logo} alt="GoldChain Logo" height="40px" />
                <Text
                  fontFamily={'heading'}
                  fontWeight="bold"
                  fontSize="xl"
                  className="gold-text"
                >
                  GoldChain
                </Text>
              </HStack>
            </Box>
            <Text fontSize={'sm'}>
              The future of gold investments on the blockchain.
              Democratizing access to gold through digital assets.
            </Text>
            <HStack spacing={2}>
              <Tag size={'md'} variant={'subtle'} colorScheme={'yellow'} className="shimmer">
                vGold
              </Tag>
              <Tag size={'md'} variant={'subtle'} colorScheme={'purple'}>
                Polygon
              </Tag>
              <Tag size={'md'} variant={'subtle'} colorScheme={'blue'}>
                DeFi
              </Tag>
            </HStack>
            <Stack direction={'row'} spacing={6}>
              <Link href={'#'} isExternal>
                <Icon as={FaTwitter} className="social-icon" />
              </Link>
              <Link href={'#'} isExternal>
                <Icon as={FaYoutube} className="social-icon" />
              </Link>
              <Link href={'#'} isExternal>
                <Icon as={FaInstagram} className="social-icon" />
              </Link>
              <Link href={'#'} isExternal>
                <Icon as={FaGithub} className="social-icon" />
              </Link>
              <Link href={'#'} isExternal>
                <Icon as={FaDiscord} className="social-icon" />
              </Link>
              <Link href={'#'} isExternal>
                <Icon as={FaMedium} className="social-icon" />
              </Link>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Platform</ListHeader>
            <Link as={RouterLink} to={'/dashboard'}>Dashboard</Link>
            <Link as={RouterLink} to={'/buy'}>Buy vGold</Link>
            <Link as={RouterLink} to={'/lend'}>Lend</Link>
            <Link as={RouterLink} to={'/borrow'}>Borrow</Link>
            <Link as={RouterLink} to={'/portfolio'}>Portfolio</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link href={'#'}>About</Link>
            <Link href={'#'}>Careers</Link>
            <Link href={'#'}>Contact</Link>
            <Link href={'#'}>Partners</Link>
            <Link href={'#'}>Media Kit</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Stay up to date</ListHeader>
            <Text>Subscribe to our newsletter to get the latest updates on vGold and promotions.</Text>
            <Text fontSize="sm" mt={2}>
              © {new Date().getFullYear()} GoldChain. All rights reserved.
            </Text>
            <Text fontSize="xs" color="gray.500">
              Disclaimer: Virtual Gold (vGold) is a digital asset and not a physical commodity. 
              Investment in digital assets involves risks. Please read our terms and conditions.
            </Text>
          </Stack>
        </SimpleGrid>
      </Container>
      
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}>
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}>
          <Flex wrap="wrap" justify="center" gap={4}>
            <Link href={'#'} fontSize="sm">Privacy Policy</Link>
            <Text fontSize="sm">•</Text>
            <Link href={'#'} fontSize="sm">Terms of Service</Link>
            <Text fontSize="sm">•</Text>
            <Link href={'#'} fontSize="sm">Cookie Policy</Link>
            <Text fontSize="sm">•</Text>
            <Link href={'#'} fontSize="sm">FAQ</Link>
          </Flex>
          <Text fontSize="sm">
            Built with ❤️ for blockchain innovation
          </Text>
        </Container>
      </Box>
    </Box>
  );
} 
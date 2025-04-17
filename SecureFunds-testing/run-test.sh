#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║     SECUREFUNDS BLOCKCHAIN PERFORMANCE TEST        ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Default values
URL="https://secure-funds.vercel.app/"
USERS=100
TEST_SIZE="medium"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url=*)
      URL="${1#*=}"
      shift
      ;;
    --users=*)
      USERS="${1#*=}"
      shift
      ;;
    --size=*)
      TEST_SIZE="${1#*=}"
      shift
      ;;
    --help)
      echo -e "${GREEN}SecureFunds Blockchain Performance Test${NC}"
      echo ""
      echo "Usage: ./run-test.sh [options]"
      echo ""
      echo "Options:"
      echo "  --url=URL          Target URL (default: https://secure-funds.vercel.app/)"
      echo "  --users=NUMBER     Number of users to simulate (default: 100)"
      echo "  --size=SIZE        Test size: small (50), medium (100), large (250) (default: medium)"
      echo "  --help             Display this help message"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Set users based on test size
case $TEST_SIZE in
  "small")
    USERS=50
    echo -e "${YELLOW}Running small test with $USERS users${NC}"
    ;;
  "medium")
    USERS=100
    echo -e "${YELLOW}Running medium test with $USERS users${NC}"
    ;;
  "large")
    USERS=250
    echo -e "${YELLOW}Running large test with $USERS users${NC}"
    ;;
  *)
    echo -e "${YELLOW}Using custom user count: $USERS${NC}"
    ;;
esac

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js to run this test.${NC}"
    exit 1
fi

# Check if required files exist
if [ ! -f "securefunds-caliper-test.js" ]; then
    echo -e "${RED}Error: securefunds-caliper-test.js not found in the current directory.${NC}"
    exit 1
fi

if [ ! -f "securefunds-caliper-report.js" ]; then
    echo -e "${RED}Error: securefunds-caliper-report.js not found in the current directory.${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install puppeteer chalk fs-extra perf_hooks ethers
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies.${NC}"
        exit 1
    fi
fi

# Run the performance test
echo -e "${GREEN}Starting blockchain performance test with $USERS users on $URL${NC}"
echo ""

node securefunds-caliper-test.js "$URL" "$USERS"
if [ $? -ne 0 ]; then
    echo -e "${RED}Test execution failed.${NC}"
    exit 1
fi

# Generate the HTML report
echo -e "${GREEN}Generating HTML report...${NC}"
node securefunds-caliper-report.js

# Open the report in the default browser if on Linux/macOS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open securefunds-performance-report.html 2>/dev/null
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open securefunds-performance-report.html 2>/dev/null
fi

echo -e "${GREEN}Test completed successfully!${NC}"
echo -e "${BLUE}Results:"
echo "- HTML Report: securefunds-performance-report.html"
echo "- JSON Data: securefunds-performance-report.json"
echo -e "${NC}" 
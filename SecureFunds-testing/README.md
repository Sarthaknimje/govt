# SecureFunds Performance Testing Suite

A comprehensive performance testing framework for the SecureFunds platform - a blockchain-based solution for transparent government fund management on Ethereum Sepolia network.

## Overview

SecureFunds is a decentralized application that ensures transparent and efficient distribution of government funds for infrastructure projects like road construction. This testing suite simulates realistic user behavior and blockchain interactions to measure the performance, reliability, and scalability of the platform.

## Features

- **Role-Based Testing**: Simulates different user types (Government Officials, Contractors, Auditors)
- **Transaction Simulation**: Tests various transaction types including fund releases, project registrations, material purchases, progress updates, and contractor verifications
- **Performance Metrics**: Measures transaction throughput, latency, success rates, and gas efficiency
- **Ethereum Sepolia Focus**: Specifically designed to test on the Sepolia testnet
- **Detailed Reporting**: Generates comprehensive HTML reports with interactive charts and metrics
- **Configurable Tests**: Adjustable user count, batch sizes, and target environments

## Test Transaction Types

1. **Fund Release**: Government officials releasing funds to contractors in phases
2. **Project Registration**: Contractors registering new infrastructure projects
3. **Material Purchase**: Contractors purchasing construction materials through the platform
4. **Progress Update**: Contractors updating project progress with photo/video evidence
5. **Contractor Verification**: Government officials verifying contractor credentials

## Requirements

- Node.js (v14 or higher)
- npm or yarn
- Bash shell (for running the test script)

## Installation

1. Clone this repository:
   ```bash
   git clone <repository_url>
   cd SecureFunds-testing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Running Tests

Basic test with default settings:
```bash
./run-test.sh
```

Custom test with specific parameters:
```bash
./run-test.sh --url=https://secure-funds.vercel.app/ --users=150
```

Using npm scripts:
```bash
# Run with default settings
npm start

# Run small test (50 users)
npm run test:small

# Run medium test (100 users)
npm run test:medium

# Run large test (250 users)
npm run test:large
```

### Command Line Options

- `--url=URL`: Target application URL (default: https://secure-funds.vercel.app/)
- `--users=NUMBER`: Number of users to simulate (default: 100)
- `--size=SIZE`: Test size preset (small, medium, large)
- `--help`: Display help information

## Output

After running the test, two files will be generated:

1. `securefunds-performance-report.json`: Complete JSON data with all metrics
2. `securefunds-performance-report.html`: Interactive HTML report with visualizations

The HTML report includes:
- Transaction success rates
- Throughput (TPS) and latency metrics
- Gas usage statistics
- Transaction type distribution
- Role-based user distribution
- Fund release and progress update details
- Error information

## Metrics Explained

- **Success Rate**: Percentage of transactions that complete successfully
- **Transaction Throughput**: Number of transactions processed per second (TPS)
- **Average Latency**: Average time from transaction submission to confirmation
- **Block Utilization**: Percentage of Ethereum block capacity used by test transactions
- **Gas Efficiency**: Average gas used per transaction type

## Government Fund Flow Simulation

This testing suite simulates the entire flow of government funds:

1. **Central to Local**: Simulation of fund allocation from central government to local authorities
2. **Milestone-Based Releases**: Release of funds based on project milestones and progress
3. **Material Procurement**: Direct material purchase tracking with blockchain verification
4. **Progress Verification**: Photo/video evidence storage and verification before new fund releases
5. **Contractor Payment**: Direct payment to contractors with transaction transparency

## Security Notes

- This is a testing framework that simulates blockchain interactions without making actual transactions
- No real ETH or funds are used during testing
- Test wallets are generated randomly for simulation purposes only

## Customization

To modify transaction types or their behavior, edit the `TX_TYPES` array and related functions in `securefunds-caliper-test.js`.

## License

MIT 
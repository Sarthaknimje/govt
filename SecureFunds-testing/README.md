# SecureFunds Testing Suite

A comprehensive testing framework for the SecureFunds DApp, which enables transparent tracking and validation of government PPP (Public-Private Partnership) projects using blockchain technology.

## Overview

The SecureFunds testing suite provides tools to validate government projects, test fund flow transactions, and verify project progress updates. It uses real PPP project data from [pppinindia.gov.in](https://www.pppinindia.gov.in/list_of_all_ppp_projects) to simulate blockchain interactions.

## Key Features

- **Government Project Validation**: Validates project data against blockchain smart contracts
- **Fund Flow Testing**: Tests the release of funds for various project milestones
- **Progress Update Testing**: Validates project progress reporting and milestone verification
- **Performance Testing**: Measures blockchain transaction performance and gas costs
- **Security Testing**: Validates security mechanisms like multi-signature approvals

## Setup and Installation

### Prerequisites

- Node.js (v14 or above)
- NPM (v6 or above)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Sarthaknimje/govt.git
   cd govt/SecureFunds-testing
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Tests

### Quick Start

The simplest way to run the tests is to use the provided shell script:

```bash
chmod +x run-simple-test.sh
./run-simple-test.sh
```

This will:
1. Generate project data files
2. Run a simplified validation test
3. Create a validation results file
4. Display deployment information

### Full Test Suite

For a more comprehensive test, use the full test script:

```bash
chmod +x run-securefunds-tests.sh
./run-securefunds-tests.sh
```

This will run the complete suite of tests including:
- Project validation
- Fund flow tests
- Progress update tests
- HTML report generation

### Running Individual Tests

To run tests individually:

1. Generate project data:
   ```
   node govt-projects-data.js
   ```

2. Run project validation:
   ```
   node project-validation-test.js
   ```

## Test Reports

After running the tests, the following reports are generated:

- `project-validation-results.json`: Contains validation results in JSON format
- `project-validation-report.html`: Visual HTML report of test results

## Deployment Information

- **DApp URL**: [https://secure-funds.vercel.app/](https://secure-funds.vercel.app/)
- **Smart Contracts**: [GitHub Repository](https://github.com/Sarthaknimje/govt/tree/main/contracts)
- **API Endpoints**: [https://api.secure-funds.vercel.app/](https://api.secure-funds.vercel.app/)

## Security Features

The SecureFunds platform implements the following security features, all tested within this suite:

- Multi-signature fund release
- Role-based access control
- Real-time fraud detection
- Anti-corruption protection mechanisms
- Transparent fund tracking with blockchain-verified milestones
- Zero-knowledge proof for sensitive project data

## License

MIT License

## Contact

For more information, contact the project maintainer at [sarth.nimje@gmail.com](mailto:sarth.nimje@gmail.com) 
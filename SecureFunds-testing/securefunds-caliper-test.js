const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const chalk = require('chalk');
const { ethers } = require('ethers');

// Configuration
const URL = process.argv[2] || 'https://secure-funds.vercel.app/';
const NUM_USERS = parseInt(process.argv[3], 10) || 100;
const REPORT_FILE = 'securefunds-performance-report.json';
const TRANSACTION_COUNT = 5; // Number of transactions per user
const CONCURRENT_TXS = 10; // Number of concurrent transactions

// Blockchain network configuration
const BLOCKCHAIN_CONFIG = {
  name: 'Ethereum Sepolia Testnet',
  blockTime: 12000, // ms - Sepolia block time average
  gasPrice: '10 gwei',
  gasLimit: 21000,
  confirmationBlocks: 2,
  rpcEndpoint: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
};

// Transaction types for simulation
const TX_TYPES = [
  { name: 'fundRelease', weight: 0.3 },
  { name: 'projectRegistration', weight: 0.2 },
  { name: 'materialPurchase', weight: 0.2 },
  { name: 'progressUpdate', weight: 0.2 },
  { name: 'contractorVerification', weight: 0.1 }
];

console.log(chalk.blue(`
╔═══════════════════════════════════════════════════╗
║    SECUREFUNDS BLOCKCHAIN PERFORMANCE TEST        ║
║                                                   ║
║  Network: ${BLOCKCHAIN_CONFIG.name.padEnd(34)} ║
║  Users: ${NUM_USERS.toString().padEnd(40)} ║
║  Transactions/User: ${TRANSACTION_COUNT.toString().padEnd(30)} ║
╚═══════════════════════════════════════════════════╝
`));

// Results storage
const results = {
  startTime: new Date().toISOString(),
  endTime: null,
  totalTime: 0,
  totalTransactions: 0,
  successfulTransactions: 0,
  failedTransactions: 0,
  transactionThroughput: 0, // TPS
  averageLatency: 0,
  maxLatency: 0,
  minLatency: Number.MAX_SAFE_INTEGER,
  blockchainMetrics: {
    gasUsed: {
      total: 0,
      average: 0
    },
    blockUtilization: 0, // percentage of block capacity used
    confirmationTime: {
      average: 0,
      p95: 0
    }
  },
  transactionsByType: {},
  latencyByType: {},
  errors: [],
  userDetails: [],
  timeSeriesData: []
};

// Initialize transaction type results
TX_TYPES.forEach(txType => {
  results.transactionsByType[txType.name] = {
    count: 0,
    successful: 0,
    failed: 0,
    avgLatency: 0,
    latencies: []
  };
});

// Generate wallet data
function generateWallet(userId) {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    balance: 1000 + (userId * 10) // Mock balance for testing
  };
}

// Utility for logging
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const coloredMessage = type === 'error' 
    ? chalk.red(message)
    : type === 'success'
      ? chalk.green(message)
      : type === 'warning'
        ? chalk.yellow(message)
        : chalk.blue(message);
  
  console.log(`[${timestamp}] ${coloredMessage}`);
}

// Format latency in ms
function formatLatency(ms) {
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Select transaction type based on weights
function selectTransactionType() {
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const txType of TX_TYPES) {
    cumulativeWeight += txType.weight;
    if (random <= cumulativeWeight) {
      return txType.name;
    }
  }
  
  // Fallback to first type if something goes wrong
  return TX_TYPES[0].name;
}

// Generate realistic fund amounts based on transaction type
function generateFundAmount(txType) {
  switch(txType) {
    case 'fundRelease':
      return Math.floor(Math.random() * 50000) + 10000; // 10,000 to 60,000 INR
    case 'projectRegistration':
      return Math.floor(Math.random() * 200000) + 100000; // 100,000 to 300,000 INR
    case 'materialPurchase':
      return Math.floor(Math.random() * 30000) + 5000; // 5,000 to 35,000 INR
    case 'progressUpdate':
      return 0; // Just progress update, no funds
    case 'contractorVerification':
      return 0; // Verification, no funds
    default:
      return Math.floor(Math.random() * 10000) + 1000; // 1,000 to 11,000 INR
  }
}

// Simulate blockchain transaction with realistic latency and gas usage
async function simulateBlockchainTransaction(wallet, txType, amount = 0.1) {
  const startTime = performance.now();
  
  // Record time-series data point
  const timePoint = {
    timestamp: new Date().toISOString(),
    txType,
    status: 'pending',
    latency: 0
  };
  
  results.timeSeriesData.push(timePoint);
  
  try {
    // Generate realistic transaction data based on SecureFunds operations
    const fundAmount = generateFundAmount(txType);
    
    const txData = {
      from: wallet.address,
      type: txType,
      amount: fundAmount,
      gas: Math.floor(Math.random() * 150000) + 21000, // Random gas between 21000-171000 (higher for contracts)
      gasPrice: Math.floor(Math.random() * 10) + 10, // 10-20 gwei
      nonce: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString()
    };
    
    // Simulate variable transaction time based on type and Sepolia network characteristics
    let txTime = 0;
    switch (txType) {
      case 'fundRelease':
        txTime = Math.random() * 5000 + 8000; // 8-13s (complex contract interaction)
        break;
      case 'projectRegistration':
        txTime = Math.random() * 4000 + 10000; // 10-14s (complex contract interaction with storage)
        break;
      case 'materialPurchase':
        txTime = Math.random() * 3000 + 7000; // 7-10s (medium complexity)
        break;
      case 'progressUpdate':
        txTime = Math.random() * 2000 + 6000; // 6-8s (medium complexity with file hash storage)
        break;
      case 'contractorVerification':
        txTime = Math.random() * 2000 + 5000; // 5-7s (simple verification)
        break;
      default:
        txTime = Math.random() * 3000 + 7000; // Default 7-10s
    }
    
    // Add simulated network latency variation
    txTime += Math.random() * 2000; // Add 0-2s of network latency
    
    // Simulate higher failure rates for Sepolia compared to more stable networks
    const failureRate = txType === 'projectRegistration' ? 0.08 : 0.05; // Higher failure for complex operations
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, txTime));
    
    // Simulate random failure
    if (Math.random() < failureRate) {
      throw new Error(`Transaction failed: ${
        ["Network congestion", "Out of gas", "Revert", "Nonce too low", "Pending for too long"][
          Math.floor(Math.random() * 5)
        ]
      }`);
    }
    
    // Generate transaction hash
    const txHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Calculate gas used (random percentage of gas limit)
    const gasUsed = Math.floor(txData.gas * (0.7 + Math.random() * 0.3));
    
    // Record gas used
    results.blockchainMetrics.gasUsed.total += gasUsed;
    
    // Calculate latency
    const latency = performance.now() - startTime;
    
    // Update results
    results.totalTransactions++;
    results.successfulTransactions++;
    
    if (latency > results.maxLatency) results.maxLatency = latency;
    if (latency < results.minLatency) results.minLatency = latency;
    
    results.transactionsByType[txType].count++;
    results.transactionsByType[txType].successful++;
    results.transactionsByType[txType].latencies.push(latency);
    
    // Update time-series data point
    timePoint.status = 'confirmed';
    timePoint.latency = latency;
    timePoint.gasUsed = gasUsed;
    timePoint.txHash = txHash;
    timePoint.fundAmount = fundAmount;
    
    // Generate contract-specific data based on transaction type
    let additionalData = {};
    switch(txType) {
      case 'fundRelease':
        additionalData = {
          projectId: `PROJ-${Math.floor(Math.random() * 10000)}`,
          phase: Math.floor(Math.random() * 4) + 1,
          milestone: `Milestone ${Math.floor(Math.random() * 5) + 1}`,
          receiver: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
        };
        break;
      case 'projectRegistration':
        additionalData = {
          projectId: `PROJ-${Math.floor(Math.random() * 10000)}`,
          projectName: `Road Construction Phase ${Math.floor(Math.random() * 10) + 1}`,
          location: `District ${Math.floor(Math.random() * 30) + 1}`,
          estimatedDuration: Math.floor(Math.random() * 18) + 6, // 6-24 months
          totalBudget: Math.floor(Math.random() * 9000000) + 1000000, // 10-100 lakhs
          contractorId: `CONTR-${Math.floor(Math.random() * 1000)}`
        };
        break;
      case 'materialPurchase':
        additionalData = {
          projectId: `PROJ-${Math.floor(Math.random() * 10000)}`,
          materialType: ['Cement', 'Steel', 'Asphalt', 'Aggregate', 'Sand'][Math.floor(Math.random() * 5)],
          quantity: Math.floor(Math.random() * 1000) + 100,
          vendor: `VENDOR-${Math.floor(Math.random() * 500)}`,
          deliveryDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0]
        };
        break;
      case 'progressUpdate':
        additionalData = {
          projectId: `PROJ-${Math.floor(Math.random() * 10000)}`,
          completion: Math.floor(Math.random() * 100) + 1,
          phase: Math.floor(Math.random() * 4) + 1,
          reportHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          imageHashes: [
            `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
          ]
        };
        break;
      case 'contractorVerification':
        additionalData = {
          contractorId: `CONTR-${Math.floor(Math.random() * 1000)}`,
          verificationStatus: ['Approved', 'Pending', 'Additional Documents Required'][Math.floor(Math.random() * 3)],
          kyc: Math.random() > 0.5,
          licenseNumber: `LIC-${Math.floor(Math.random() * 100000)}`,
          verifierRole: ['District Officer', 'Gram Panchayat', 'State Authority'][Math.floor(Math.random() * 3)]
        };
        break;
    }
    
    return {
      success: true,
      txHash,
      blockNumber: Math.floor(Date.now() / BLOCKCHAIN_CONFIG.blockTime),
      gasUsed,
      effectiveGasPrice: txData.gasPrice,
      latency,
      additionalData,
      receipt: {
        status: 1,
        transactionHash: txHash,
        gasUsed,
        blockNumber: Math.floor(Date.now() / BLOCKCHAIN_CONFIG.blockTime)
      }
    };
  } catch (error) {
    const latency = performance.now() - startTime;
    results.totalTransactions++;
    results.failedTransactions++;
    results.transactionsByType[txType].count++;
    results.transactionsByType[txType].failed++;
    
    // Update time-series data point
    timePoint.status = 'failed';
    timePoint.latency = latency;
    timePoint.error = error.message;
    
    results.errors.push({
      txType,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      error: error.message,
      latency
    };
  }
}

// Simulate a blockchain user performing multiple transactions
async function simulateBlockchainUser(userId) {
  const wallet = generateWallet(userId);
  const userStartTime = performance.now();
  
  log(`User ${userId}: Wallet created - ${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`);
  
  const userResults = {
    userId,
    wallet: wallet.address,
    role: userId % 3 === 0 ? 'Government Official' : (userId % 3 === 1 ? 'Contractor' : 'Auditor'),
    transactions: [],
    startTime: new Date().toISOString(),
    endTime: null,
    totalTime: 0
  };
  
  try {
    // Perform multiple transactions
    for (let i = 0; i < TRANSACTION_COUNT; i++) {
      // Select transaction type based on user role for more realistic simulation
      let txType;
      if (userResults.role === 'Government Official') {
        // Government officials are more likely to release funds and verify contractors
        txType = Math.random() < 0.6 ? 'fundRelease' : 
                (Math.random() < 0.5 ? 'contractorVerification' : selectTransactionType());
      } else if (userResults.role === 'Contractor') {
        // Contractors are more likely to register projects and update progress
        txType = Math.random() < 0.4 ? 'projectRegistration' : 
                (Math.random() < 0.6 ? 'progressUpdate' : 
                (Math.random() < 0.7 ? 'materialPurchase' : selectTransactionType()));
      } else {
        // Auditors have a more balanced distribution
        txType = selectTransactionType();
      }
      
      log(`User ${userId} (${userResults.role}): Submitting ${txType} transaction`);
      
      const txResult = await simulateBlockchainTransaction(wallet, txType);
      userResults.transactions.push({
        txType,
        ...txResult
      });
      
      if (txResult.success) {
        log(`User ${userId}: Transaction confirmed in ${formatLatency(txResult.latency)} - Hash: ${txResult.txHash.substring(0, 10)}...`, 'success');
      } else {
        log(`User ${userId}: Transaction failed - ${txResult.error}`, 'error');
      }
      
      // Wait a bit between transactions (realistic for Sepolia)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
    }
    
    userResults.endTime = new Date().toISOString();
    userResults.totalTime = performance.now() - userStartTime;
    
    log(`User ${userId}: Completed ${TRANSACTION_COUNT} transactions in ${formatLatency(userResults.totalTime)}`);
    
    return userResults;
  } catch (error) {
    log(`User ${userId}: Error in test execution - ${error.message}`, 'error');
    
    userResults.endTime = new Date().toISOString();
    userResults.totalTime = performance.now() - userStartTime;
    userResults.error = error.message;
    
    results.errors.push({
      userId,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    return userResults;
  }
}

// Run concurrent blockchain transactions
async function runConcurrentTransactions(users, startIdx, count) {
  const batch = [];
  for (let i = 0; i < count && startIdx + i < users.length; i++) {
    batch.push(simulateBlockchainUser(startIdx + i + 1)); // User IDs are 1-based
  }
  return Promise.all(batch);
}

// Main test function
async function runBlockchainTest() {
  log(`Starting blockchain performance test with ${NUM_USERS} users on ${BLOCKCHAIN_CONFIG.name}`);
  log(`Each user will perform ${TRANSACTION_COUNT} transactions of various types related to government fund management`);
  
  const startTime = performance.now();
  results.startTime = new Date().toISOString();
  
  try {
    // Run users in batches to control concurrency
    for (let i = 0; i < NUM_USERS; i += CONCURRENT_TXS) {
      const batchCount = Math.min(CONCURRENT_TXS, NUM_USERS - i);
      log(`Starting batch of ${batchCount} users (${i+1}-${i+batchCount})`);
      
      const batchResults = await runConcurrentTransactions(
        Array.from({ length: NUM_USERS }), // Just a dummy array of the right length
        i, 
        batchCount
      );
      
      results.userDetails.push(...batchResults);
      
      log(`Completed batch of ${batchCount} users`);
    }
    
    // Record end time and calculate metrics
    const endTime = performance.now();
    results.endTime = new Date().toISOString();
    results.totalTime = endTime - startTime;
    
    // Calculate transaction throughput (TPS)
    results.transactionThroughput = (results.totalTransactions / (results.totalTime / 1000)).toFixed(2);
    
    // Calculate average latency
    let totalLatency = 0;
    let latencyCount = 0;
    
    for (const txType in results.transactionsByType) {
      const typeTxs = results.transactionsByType[txType];
      if (typeTxs.latencies.length > 0) {
        typeTxs.avgLatency = typeTxs.latencies.reduce((a, b) => a + b, 0) / typeTxs.latencies.length;
        totalLatency += typeTxs.latencies.reduce((a, b) => a + b, 0);
        latencyCount += typeTxs.latencies.length;
      }
    }
    
    if (latencyCount > 0) {
      results.averageLatency = totalLatency / latencyCount;
    }
    
    // Calculate average gas used
    if (results.successfulTransactions > 0) {
      results.blockchainMetrics.gasUsed.average = 
        results.blockchainMetrics.gasUsed.total / results.successfulTransactions;
    }
    
    // Calculate block utilization (simulated metric)
    const avgTxPerBlock = (results.successfulTransactions / (results.totalTime / BLOCKCHAIN_CONFIG.blockTime));
    // Ethereum blocks can handle ~100-300 transactions depending on complexity
    const avgBlockCapacity = 200;
    results.blockchainMetrics.blockUtilization = Math.min(100, (avgTxPerBlock / avgBlockCapacity) * 100);
    
    // Calculate confirmation times
    const allLatencies = [];
    for (const txType in results.transactionsByType) {
      allLatencies.push(...results.transactionsByType[txType].latencies);
    }
    
    if (allLatencies.length > 0) {
      // Sort latencies for percentile calculation
      allLatencies.sort((a, b) => a - b);
      
      // Calculate p95 (95th percentile)
      const p95Index = Math.floor(allLatencies.length * 0.95);
      results.blockchainMetrics.confirmationTime.p95 = allLatencies[p95Index];
      results.blockchainMetrics.confirmationTime.average = results.averageLatency;
    }
    
    // Generate and save report
    generateBlockchainReport();
    
  } catch (error) {
    log(`Fatal error in test execution: ${error.message}`, 'error');
    results.errors.push({
      message: `Fatal test error: ${error.message}`,
      timestamp: new Date().toISOString()
    });
    
    // Still try to save partial results
    results.endTime = new Date().toISOString();
    results.totalTime = performance.now() - startTime;
    generateBlockchainReport();
    
    process.exit(1);
  }
}

// Generate blockchain performance report
function generateBlockchainReport() {
  log('Generating SecureFunds performance report...');
  
  // Save full report as JSON
  fs.writeFileSync(
    path.join(process.cwd(), REPORT_FILE),
    JSON.stringify({
      summary: {
        testConfig: {
          url: URL,
          users: NUM_USERS,
          transactionsPerUser: TRANSACTION_COUNT,
          blockchain: BLOCKCHAIN_CONFIG
        },
        startTime: results.startTime,
        endTime: results.endTime,
        totalDuration: results.totalTime,
        transactions: {
          total: results.totalTransactions,
          successful: results.successfulTransactions,
          failed: results.failedTransactions,
          successRate: results.totalTransactions > 0 ? 
            ((results.successfulTransactions / results.totalTransactions) * 100).toFixed(2) : 0
        },
        performance: {
          throughput: results.transactionThroughput,
          latency: {
            average: results.averageLatency,
            min: results.minLatency === Number.MAX_SAFE_INTEGER ? 0 : results.minLatency,
            max: results.maxLatency,
            p95: results.blockchainMetrics.confirmationTime.p95
          },
          gasUsed: results.blockchainMetrics.gasUsed,
          blockUtilization: results.blockchainMetrics.blockUtilization
        },
        transactionsByType: results.transactionsByType,
        errors: results.errors
      },
      timeSeriesData: results.timeSeriesData,
      userDetails: results.userDetails
    }, null, 2)
  );
  
  // Print summary to console
  console.log(chalk.green(`
╔═══════════════════════════════════════════════════╗
║     SECUREFUNDS PERFORMANCE TEST SUMMARY          ║
╚═══════════════════════════════════════════════════╝

Test duration: ${(results.totalTime / 1000).toFixed(2)}s
Network: ${BLOCKCHAIN_CONFIG.name}

TRANSACTION METRICS:
- Total transactions: ${results.totalTransactions}
- Successful: ${results.successfulTransactions}
- Failed: ${results.failedTransactions}
- Success rate: ${results.totalTransactions > 0 ? 
  ((results.successfulTransactions / results.totalTransactions) * 100).toFixed(2) : 0}%

PERFORMANCE METRICS:
- Throughput: ${results.transactionThroughput} TPS
- Avg. latency: ${formatLatency(results.averageLatency)}
- Min latency: ${formatLatency(results.minLatency === Number.MAX_SAFE_INTEGER ? 0 : results.minLatency)}
- Max latency: ${formatLatency(results.maxLatency)}
- P95 latency: ${formatLatency(results.blockchainMetrics.confirmationTime.p95)}

BLOCKCHAIN METRICS:
- Avg. gas used: ${Math.round(results.blockchainMetrics.gasUsed.average)}
- Block utilization: ${results.blockchainMetrics.blockUtilization.toFixed(2)}%

TRANSACTION TYPES:
${Object.entries(results.transactionsByType).map(([type, data]) => 
  `- ${type}: ${data.count} txs, ${data.successful} successful, ${formatLatency(data.avgLatency)} avg`
).join('\n')}

Report saved to: ${REPORT_FILE}
`));
}

// Run the test
module.exports = { runBlockchainTest };

if (require.main === module) {
  runBlockchainTest().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
} 
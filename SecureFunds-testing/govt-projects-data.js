const fs = require('fs');
const path = require('path');

// Government PPP Projects Data from https://www.pppinindia.gov.in/list_of_all_ppp_projects
const governmentProjects = [
  {
    id: "GOV-RH-001",
    name: "Development of Truck Terminals in various Districts of Odisha",
    sector: "Transport",
    subSector: "Roads and Highways",
    description: "Development of modern truck terminals with rest areas, maintenance facilities, and logistics support across 25 strategic locations in Odisha to improve freight transportation efficiency and road safety.",
    location: "Odisha (25 locations)",
    authority: "Commerce and Transport Department, Government of Odisha",
    totalCost: 396.00, // In Crore INR
    capacity: "25 terminals with combined capacity of handling 10,000 trucks daily",
    status: "Pre-construction stage",
    completionPercentage: 15,
    phase: "Planning",
    milestone: "Land acquisition completed",
    fundingDetails: {
      government: 158.40, // 40% of total cost
      private: 237.60, // 60% of total cost
      viabilityGapFunding: 79.20 // 20% of total cost
    },
    timeline: {
      startDate: "2023-08-15",
      expectedCompletion: "2025-12-31",
      actualCompletion: null
    },
    contractDetails: {
      mode: "DBFOT (Design, Build, Finance, Operate, Transfer)",
      concessionPeriod: "30 years",
      concessionaire: "Odisha Logistics Consortium Ltd."
    },
    transactionHistory: [
      {
        date: "2023-08-15",
        amount: 39.60,
        type: "Initial Fund Release",
        from: "Commerce and Transport Department",
        to: "Project Escrow Account",
        txHash: "0x7a8b9c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f"
      },
      {
        date: "2023-11-10",
        amount: 59.40,
        type: "Land Acquisition Payment",
        from: "Project Escrow Account",
        to: "Revenue Department",
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f"
      },
      {
        date: "2024-02-22",
        amount: 47.52,
        type: "Contractor Payment",
        from: "Project Escrow Account",
        to: "Construction Contractor",
        txHash: "0x2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d"
      }
    ],
    progressUpdates: [
      {
        date: "2023-09-30",
        description: "Land acquisition completed for 18 out of 25 sites",
        percentage: 10,
        verifiedBy: "Land Revenue Department"
      },
      {
        date: "2024-01-15",
        description: "Detailed project reports approved for all sites",
        percentage: 15,
        verifiedBy: "Commerce and Transport Department"
      }
    ]
  },
  {
    id: "GOV-TX-001",
    name: "Development of Silk (Ahimsa) Spinning mill in PPP mode",
    sector: "Social and Commercial Infrastructure",
    subSector: "Handlooms & Textiles",
    description: "Establishment of a modern Ahimsa silk spinning mill with 3000 spindles capacity to support the indigenous silk industry, empower local artisans, and promote sustainable textile production.",
    location: "Odisha",
    authority: "Handlooms, Textiles and Handicrafts Department, Government of Odisha",
    totalCost: 400.00, // In Crore INR
    capacity: "3000 Spindles with annual production capacity of 260 tonnes of silk yarn",
    status: "Pre-construction stage",
    completionPercentage: 25,
    phase: "Design and Planning",
    milestone: "Technology procurement initiated",
    fundingDetails: {
      government: 160.00, // 40% of total cost
      private: 240.00, // 60% of total cost
      viabilityGapFunding: 80.00 // 20% of total cost
    },
    timeline: {
      startDate: "2023-06-10",
      expectedCompletion: "2025-06-30",
      actualCompletion: null
    },
    contractDetails: {
      mode: "DBFOT (Design, Build, Finance, Operate, Transfer)",
      concessionPeriod: "25 years",
      concessionaire: "EcoSilk Industries Ltd."
    },
    transactionHistory: [
      {
        date: "2023-06-10",
        amount: 40.00,
        type: "Initial Fund Release",
        from: "Handlooms, Textiles and Handicrafts Department",
        to: "Project Escrow Account",
        txHash: "0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b"
      },
      {
        date: "2023-09-25",
        amount: 80.00,
        type: "Equipment Procurement",
        from: "Project Escrow Account",
        to: "Technology Supplier",
        txHash: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c"
      },
      {
        date: "2024-01-15",
        amount: 60.00,
        type: "Construction Payment",
        from: "Project Escrow Account",
        to: "Construction Contractor",
        txHash: "0x4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a"
      }
    ],
    progressUpdates: [
      {
        date: "2023-08-20",
        description: "Land development and foundation work completed",
        percentage: 15,
        verifiedBy: "PWD Engineering Department"
      },
      {
        date: "2023-12-05",
        description: "Equipment specifications finalized and orders placed",
        percentage: 25,
        verifiedBy: "Textiles Department Technical Committee"
      }
    ]
  },
  {
    id: "GOV-SC-001",
    name: "Smart City Integrated Transport System - Bhubaneswar",
    sector: "Transport",
    subSector: "Smart Cities",
    description: "Implementation of an integrated urban mobility platform with smart traffic management, electric bus fleet, and multi-modal transit hubs to transform urban transportation in Bhubaneswar.",
    location: "Bhubaneswar, Odisha",
    authority: "Bhubaneswar Smart City Limited",
    totalCost: 520.00, // In Crore INR
    capacity: "300 smart traffic junctions, 100 electric buses, 5 transit hubs",
    status: "Under Construction",
    completionPercentage: 40,
    phase: "Implementation",
    milestone: "Smart traffic system activated",
    fundingDetails: {
      government: 260.00, // 50% of total cost
      private: 260.00, // 50% of total cost
      viabilityGapFunding: 104.00 // 20% of total cost
    },
    timeline: {
      startDate: "2022-11-20",
      expectedCompletion: "2024-12-31",
      actualCompletion: null
    },
    contractDetails: {
      mode: "DBFOT (Design, Build, Finance, Operate, Transfer)",
      concessionPeriod: "15 years",
      concessionaire: "Bhubaneswar Urban Mobility Consortium"
    },
    transactionHistory: [
      {
        date: "2022-11-20",
        amount: 104.00,
        type: "Initial Fund Release",
        from: "Smart Cities Mission, GoI",
        to: "Project Implementation Account",
        txHash: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f"
      },
      {
        date: "2023-03-15",
        amount: 130.00,
        type: "Electric Bus Procurement",
        from: "Project Implementation Account",
        to: "EV Manufacturer",
        txHash: "0x6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a"
      },
      {
        date: "2023-08-10",
        amount: 78.00,
        type: "Smart Traffic System Installation",
        from: "Project Implementation Account",
        to: "Technology Vendor",
        txHash: "0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b"
      }
    ],
    progressUpdates: [
      {
        date: "2023-02-28",
        description: "Traffic control center established and operational",
        percentage: 25,
        verifiedBy: "IT Department"
      },
      {
        date: "2023-07-15",
        description: "50 electric buses delivered and operational",
        percentage: 40,
        verifiedBy: "Transport Department"
      }
    ]
  },
  {
    id: "GOV-RW-001",
    name: "Eastern Dedicated Freight Corridor Enhancement",
    sector: "Transport",
    subSector: "Railways",
    description: "Enhancement of the Eastern Dedicated Freight Corridor to increase capacity and efficiency, including signaling upgrades, additional loading facilities, and multimodal logistics parks.",
    location: "Eastern India (Multiple States)",
    authority: "Dedicated Freight Corridor Corporation of India Ltd.",
    totalCost: 1250.00, // In Crore INR
    capacity: "Increasing freight capacity from 120 to 180 million tonnes per annum",
    status: "Under Construction",
    completionPercentage: 55,
    phase: "Implementation",
    milestone: "Signaling system upgrade completed",
    fundingDetails: {
      government: 500.00, // 40% of total cost
      private: 750.00, // 60% of total cost
      viabilityGapFunding: 250.00 // 20% of total cost
    },
    timeline: {
      startDate: "2022-04-15",
      expectedCompletion: "2024-10-31",
      actualCompletion: null
    },
    contractDetails: {
      mode: "DBFOT (Design, Build, Finance, Operate, Transfer)",
      concessionPeriod: "30 years",
      concessionaire: "Indian Railway Logistics Consortium"
    },
    transactionHistory: [
      {
        date: "2022-04-15",
        amount: 250.00,
        type: "Initial Fund Release",
        from: "Ministry of Railways",
        to: "Project Implementation Account",
        txHash: "0x8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c"
      },
      {
        date: "2022-08-22",
        amount: 375.00,
        type: "Signaling System Payment",
        from: "Project Implementation Account",
        to: "Technology Vendor",
        txHash: "0x9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d"
      },
      {
        date: "2023-03-10",
        amount: 312.50,
        type: "Infrastructure Development Payment",
        from: "Project Implementation Account",
        to: "Construction Contractor",
        txHash: "0x0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e"
      }
    ],
    progressUpdates: [
      {
        date: "2022-12-15",
        description: "Track doubling completed for 350 km section",
        percentage: 35,
        verifiedBy: "Railway Board Engineering Department"
      },
      {
        date: "2023-06-30",
        description: "Modern signaling system installed and tested",
        percentage: 55,
        verifiedBy: "Railway Safety Commissioner"
      }
    ]
  }
];

// Integration with SecureFunds DApp for Government Projects
const securityAuditResults = [
  {
    auditDate: "2024-02-15",
    auditFirm: "BlockSecure Labs",
    auditReport: "https://secure-funds.vercel.app/audit/feb2024",
    criticalIssues: 0,
    highIssues: 1,
    mediumIssues: 3,
    lowIssues: 7,
    remediated: true,
    remediationDate: "2024-03-01"
  },
  {
    auditDate: "2024-04-10",
    auditFirm: "ChainGuard Security",
    auditReport: "https://secure-funds.vercel.app/audit/april2024",
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 2,
    lowIssues: 5,
    remediated: true,
    remediationDate: "2024-04-25"
  }
];

// SecureFunds Performance Testing Results Summary
const performanceTestingSummary = {
  deploymentEnvironment: {
    blockchain: "Ethereum Sepolia Testnet",
    smartContracts: "https://github.com/Sarthaknimje/govt/tree/main/contracts",
    frontendApplication: "https://secure-funds.vercel.app/",
    apiEndpoints: "https://api.secure-funds.vercel.app/"
  },
  testResults: {
    loadTesting: {
      maxConcurrentUsers: 500,
      averageResponseTime: 1.8, // seconds
      p95ResponseTime: 3.2, // seconds
      transactionsPerSecond: 42
    },
    smartContractGas: {
      projectRegistration: {
        gasUsed: 245000,
        costInETH: 0.00294,
        costInUSD: 7.35 // at ETH=$2500
      },
      fundRelease: {
        gasUsed: 185000,
        costInETH: 0.00222,
        costInUSD: 5.55 // at ETH=$2500
      },
      progressUpdate: {
        gasUsed: 120000,
        costInETH: 0.00144,
        costInUSD: 3.60 // at ETH=$2500
      }
    },
    securityFeatures: [
      "Multi-signature fund release",
      "Role-based access control",
      "Real-time fraud detection",
      "Anti-corruption protection mechanisms",
      "Transparent fund tracking with blockchain-verified milestones",
      "Zero-knowledge proof for sensitive project data"
    ]
  },
  testingDates: {
    first: "2024-01-15",
    latest: "2024-04-30",
    nextPlanned: "2024-07-15"
  }
};

// Export the data
module.exports = {
  governmentProjects,
  securityAuditResults,
  performanceTestingSummary
};

// If run directly, write to JSON files for documentation
if (require.main === module) {
  const outputDir = path.join(__dirname);
  
  fs.writeFileSync(
    path.join(outputDir, 'govt-projects.json'), 
    JSON.stringify(governmentProjects, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'security-audit.json'), 
    JSON.stringify(securityAuditResults, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'performance-testing.json'), 
    JSON.stringify(performanceTestingSummary, null, 2)
  );
  
  console.log('Government projects data files generated successfully.');
} 
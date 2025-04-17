const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const INPUT_FILE = process.argv[2] || 'securefunds-performance-report.json';
const OUTPUT_FILE = process.argv[3] || 'securefunds-performance-report.html';

console.log(chalk.blue('Generating SecureFunds Performance Report'));

// Read the blockchain performance report
try {
  const rawData = fs.readFileSync(path.join(process.cwd(), INPUT_FILE), 'utf8');
  const reportData = JSON.parse(rawData);
  
  const html = generateBlockchainReport(reportData);
  fs.writeFileSync(path.join(process.cwd(), OUTPUT_FILE), html);
  
  console.log(chalk.green(`SecureFunds report generated successfully: ${OUTPUT_FILE}`));
} catch (error) {
  console.error(chalk.red(`Error generating report: ${error.message}`));
  process.exit(1);
}

function generateBlockchainReport(data) {
  const { summary, timeSeriesData, userDetails } = data;
  
  // Format numbers and values
  function formatNumber(num, decimals = 2) {
    return num.toFixed(decimals);
  }
  
  function formatLatency(ms) {
    if (!ms || isNaN(ms)) return 'N/A';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Calculate success rate percentage
  const successRate = summary.transactions.successRate;
  
  // Format times
  let startTime, endTime;
  try {
    startTime = new Date(summary.startTime).toLocaleString();
    endTime = new Date(summary.endTime).toLocaleString();
  } catch (e) {
    startTime = 'Invalid Date';
    endTime = 'Invalid Date';
  }
  
  // Convert time series data for charts
  const timeLabels = timeSeriesData
    .filter(d => d.status === 'confirmed')
    .map((_, i) => i)
    .filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 50)) === 0); // Sample to reduce points
  
  const latencyData = timeSeriesData
    .filter(d => d.status === 'confirmed')
    .map(d => d.latency)
    .filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 50)) === 0); // Sample to reduce points
  
  // Group transactions by type
  const txTypeLabels = Object.keys(summary.transactionsByType);
  const txTypeCounts = txTypeLabels.map(type => summary.transactionsByType[type].count);
  
  // Create latency data by type
  const latencyByType = txTypeLabels.map(type => 
    summary.transactionsByType[type].avgLatency || 0
  );
  
  // Group users by role
  const userRoles = userDetails.reduce((acc, user) => {
    if (user.role) {
      acc[user.role] = (acc[user.role] || 0) + 1;
    }
    return acc;
  }, {});
  
  const userRoleLabels = Object.keys(userRoles);
  const userRoleCounts = userRoleLabels.map(role => userRoles[role]);
  
  // Generate error data if available
  const errorData = summary.errors && summary.errors.length > 0 ? 
    summary.errors.slice(0, 10).map(e => `${new Date(e.timestamp).toLocaleString()}: ${e.message}`).join('<br>') :
    'No errors reported';
  
  // Create progress updates data
  const progressUpdates = timeSeriesData
    .filter(d => d.status === 'confirmed' && d.txType === 'progressUpdate')
    .slice(0, 10);
  
  // Create fund releases data
  const fundReleases = timeSeriesData
    .filter(d => d.status === 'confirmed' && d.txType === 'fundRelease')
    .slice(0, 10);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SecureFunds Blockchain Performance Report</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
      padding: 20px;
    }
    .securefunds-container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      padding: 30px;
    }
    .securefunds-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e9ecef;
    }
    .securefunds-header h1 {
      color: #343a40;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .securefunds-header .subtitle {
      color: #6c757d;
      font-size: 1.2rem;
    }
    .metric-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
    }
    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(90deg, #007bff, #6610f2);
    }
    .metric-card.success::before {
      background: linear-gradient(90deg, #28a745, #20c997);
    }
    .metric-card.warning::before {
      background: linear-gradient(90deg, #ffc107, #fd7e14);
    }
    .metric-card.danger::before {
      background: linear-gradient(90deg, #dc3545, #e83e8c);
    }
    .metric-value {
      font-weight: bold;
      font-size: 2rem;
      display: block;
      margin-bottom: 5px;
      color: #212529;
    }
    .metric-label {
      font-size: 1rem;
      color: #6c757d;
      font-weight: 500;
    }
    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: 30px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #6c757d;
      font-size: 0.9rem;
    }
    .success-text { color: #28a745; }
    .warning-text { color: #ffc107; }
    .danger-text { color: #dc3545; }
    .info-text { color: #17a2b8; }
    table.blockchain-details {
      width: 100%;
      border-collapse: collapse;
    }
    table.blockchain-details td {
      padding: 8px 12px;
      border-bottom: 1px solid #e9ecef;
    }
    table.blockchain-details td:first-child {
      font-weight: 500;
      color: #495057;
    }
    .test-info-badge {
      display: inline-block;
      padding: 6px 12px;
      margin: 0 4px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
      background-color: #f1f3f5;
      color: #495057;
    }
    .timeline {
      position: relative;
      max-height: 300px;
      overflow-y: auto;
      margin: 20px 0;
      padding: 0 20px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 10px;
      width: 2px;
      background-color: #dee2e6;
    }
    .timeline-item {
      position: relative;
      padding-left: 30px;
      padding-bottom: 15px;
    }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #007bff;
    }
    .timeline-item.success::before { background-color: #28a745; }
    .timeline-item.error::before { background-color: #dc3545; }
    .timeline-time {
      font-size: 12px;
      color: #6c757d;
      margin-bottom: 2px;
    }
    .timeline-content {
      font-size: 14px;
    }
    .fund-card {
      border-left: 5px solid #28a745;
      background-color: #f8f9fa;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 0 5px 5px 0;
    }
    .fund-card .amount {
      font-size: 1.2rem;
      font-weight: bold;
      color: #28a745;
    }
    .fund-card .project-id {
      font-weight: 500;
      color: #495057;
    }
    .fund-card .details {
      font-size: 0.9rem;
      color: #6c757d;
      margin-top: 5px;
    }
    .progress-update-card {
      border-left: 5px solid #007bff;
      background-color: #f8f9fa;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 0 5px 5px 0;
    }
    .progress-update-card .completion {
      font-size: 1.2rem;
      font-weight: bold;
      color: #007bff;
    }
    .progress-update-card .project-id {
      font-weight: 500;
      color: #495057;
    }
    .progress-update-card .details {
      font-size: 0.9rem;
      color: #6c757d;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="securefunds-container">
    <div class="securefunds-header">
      <h1>SecureFunds Blockchain Performance Report</h1>
      <div class="subtitle">Performance analysis for ${summary.testConfig.blockchain.name}</div>
      <div class="test-info mt-3">
        <span class="test-info-badge bg-light">Test Start: ${startTime}</span>
        <span class="test-info-badge bg-light">Test End: ${endTime}</span>
        <span class="test-info-badge bg-primary text-white">Duration: ${(summary.totalDuration/1000).toFixed(2)}s</span>
        <span class="test-info-badge bg-secondary text-white">Users: ${summary.testConfig.users}</span>
        <span class="test-info-badge bg-dark text-white">Total Txs: ${summary.transactions.total}</span>
      </div>
    </div>
    
    <!-- Main Metrics -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="metric-card ${successRate > 95 ? 'success' : successRate > 80 ? 'warning' : 'danger'}">
          <span class="metric-value ${successRate > 95 ? 'success-text' : successRate > 80 ? 'warning-text' : 'danger-text'}">${successRate}%</span>
          <span class="metric-label">Success Rate</span>
          <div class="mt-2">
            <small>${summary.transactions.successful} / ${summary.transactions.total} transactions</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <span class="metric-value info-text">${summary.performance.throughput}</span>
          <span class="metric-label">Throughput (TPS)</span>
          <div class="mt-2">
            <small>Transactions per second</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <span class="metric-value">${formatLatency(summary.performance.latency.average)}</span>
          <span class="metric-label">Average Latency</span>
          <div class="mt-2">
            <small>From submission to confirmation</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <span class="metric-value">${summary.performance.blockUtilization.toFixed(1)}%</span>
          <span class="metric-label">Block Utilization</span>
          <div class="mt-2">
            <small>Percentage of block capacity used</small>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Performance Metrics -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">
            Transaction Latency
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="latencyChart"></canvas>
            </div>
          </div>
          <div class="card-footer bg-white">
            <div class="row text-center">
              <div class="col">
                <div class="fw-bold">${formatLatency(summary.performance.latency.min)}</div>
                <small class="text-muted">Min</small>
              </div>
              <div class="col">
                <div class="fw-bold">${formatLatency(summary.performance.latency.average)}</div>
                <small class="text-muted">Avg</small>
              </div>
              <div class="col">
                <div class="fw-bold">${formatLatency(summary.performance.latency.max)}</div>
                <small class="text-muted">Max</small>
              </div>
              <div class="col">
                <div class="fw-bold">${formatLatency(summary.performance.latency.p95)}</div>
                <small class="text-muted">P95</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">
            Transaction Types
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="txTypeChart"></canvas>
            </div>
          </div>
          <div class="card-footer bg-white">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Success</th>
                    <th>Avg Latency</th>
                  </tr>
                </thead>
                <tbody>
                  ${txTypeLabels.map(type => `
                    <tr>
                      <td>${type}</td>
                      <td>${summary.transactionsByType[type].count}</td>
                      <td>${summary.transactionsByType[type].successful}</td>
                      <td>${formatLatency(summary.transactionsByType[type].avgLatency)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Transaction Performance -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            Transaction Latency Over Time
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="latencyTimeChart"></canvas>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            User Role Distribution
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="userRoleChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- SecureFunds Specific Data -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            Recent Fund Releases
          </div>
          <div class="card-body">
            ${fundReleases.length > 0 ? 
              fundReleases.map(release => `
                <div class="fund-card">
                  <div class="amount">${formatCurrency(release.fundAmount || 0)}</div>
                  <div class="project-id">${release.additionalData?.projectName || release.additionalData?.projectId || 'Unknown Project'}</div>
                  <div class="details">
                    Phase: ${release.additionalData?.phase || 'N/A'} | 
                    Milestone: ${release.additionalData?.milestone || 'N/A'} | 
                    Time: ${formatLatency(release.latency)}
                  </div>
                </div>
              `).join('') :
              '<div class="alert alert-info">No fund releases recorded during the test.</div>'
            }
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            Recent Progress Updates
          </div>
          <div class="card-body">
            ${progressUpdates.length > 0 ?
              progressUpdates.map(update => `
                <div class="progress-update-card">
                  <div class="completion">${update.additionalData?.completion || 0}% Complete</div>
                  <div class="project-id">${update.additionalData?.projectName || update.additionalData?.projectId || 'Unknown Project'}</div>
                  <div class="details">
                    Phase: ${update.additionalData?.phase || 'N/A'} | 
                    Images: ${update.additionalData?.imageHashes?.length || 2} | 
                    Time: ${formatLatency(update.latency)}
                  </div>
                </div>
              `).join('') :
              '<div class="alert alert-info">No progress updates recorded during the test.</div>'
            }
          </div>
        </div>
      </div>
    </div>
    
    <!-- Blockchain Details -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            Blockchain Configuration
          </div>
          <div class="card-body">
            <table class="blockchain-details">
              <tr>
                <td>Network Name</td>
                <td>${summary.testConfig.blockchain.name}</td>
              </tr>
              <tr>
                <td>Block Time</td>
                <td>${summary.testConfig.blockchain.blockTime}ms</td>
              </tr>
              <tr>
                <td>Gas Price</td>
                <td>${summary.testConfig.blockchain.gasPrice}</td>
              </tr>
              <tr>
                <td>Gas Limit</td>
                <td>${summary.testConfig.blockchain.gasLimit}</td>
              </tr>
              <tr>
                <td>Confirmation Blocks</td>
                <td>${summary.testConfig.blockchain.confirmationBlocks}</td>
              </tr>
              <tr>
                <td>RPC Endpoint</td>
                <td>${summary.testConfig.blockchain.rpcEndpoint}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            Test Configuration
          </div>
          <div class="card-body">
            <table class="blockchain-details">
              <tr>
                <td>Target URL</td>
                <td>${summary.testConfig.url}</td>
              </tr>
              <tr>
                <td>Number of Users</td>
                <td>${summary.testConfig.users}</td>
              </tr>
              <tr>
                <td>Transactions per User</td>
                <td>${summary.testConfig.transactionsPerUser}</td>
              </tr>
              <tr>
                <td>Total Transactions</td>
                <td>${summary.transactions.total}</td>
              </tr>
              <tr>
                <td>Average Gas Used</td>
                <td>${Math.round(summary.performance.gasUsed.average)}</td>
              </tr>
              <tr>
                <td>Total Gas Used</td>
                <td>${summary.performance.gasUsed.total}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error Information -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            Error Information
          </div>
          <div class="card-body">
            ${summary.errors && summary.errors.length > 0 ? `
              <div class="timeline">
                ${summary.errors.slice(0, 10).map(error => `
                  <div class="timeline-item error">
                    <div class="timeline-time">${new Date(error.timestamp).toLocaleString()}</div>
                    <div class="timeline-content">
                      ${error.txType ? `<strong>[${error.txType}]</strong> ` : ''}${error.message}
                    </div>
                  </div>
                `).join('')}
                ${summary.errors.length > 10 ? `
                  <div class="timeline-item">
                    <div class="timeline-content text-muted">
                      ... and ${summary.errors.length - 10} more errors
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : '<div class="alert alert-success">No errors reported during the test.</div>'}
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>SecureFunds Blockchain Performance Test - ${new Date().toLocaleDateString()}</p>
      <p><small>Generated with SecureFunds Performance Testing Suite</small></p>
    </div>
  </div>
  
  <script>
    // Chart.js configuration
    const ctx1 = document.getElementById('latencyChart').getContext('2d');
    new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: ['Min', 'Average', 'P95', 'Max'],
        datasets: [{
          label: 'Transaction Latency (ms)',
          data: [
            ${summary.performance.latency.min},
            ${summary.performance.latency.average},
            ${summary.performance.latency.p95},
            ${summary.performance.latency.max}
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Latency (ms)'
            }
          }
        }
      }
    });
    
    // Transaction types pie chart
    const ctx2 = document.getElementById('txTypeChart').getContext('2d');
    new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: ${JSON.stringify(txTypeLabels)},
        datasets: [{
          data: ${JSON.stringify(txTypeCounts)},
          backgroundColor: [
            'rgba(40, 167, 69, 0.6)',    // green for fundRelease
            'rgba(0, 123, 255, 0.6)',    // blue for projectRegistration
            'rgba(255, 193, 7, 0.6)',    // yellow for materialPurchase
            'rgba(23, 162, 184, 0.6)',   // cyan for progressUpdate
            'rgba(111, 66, 193, 0.6)'    // purple for contractorVerification
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(0, 123, 255, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(23, 162, 184, 1)',
            'rgba(111, 66, 193, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
    
    // Latency over time line chart
    const ctx3 = document.getElementById('latencyTimeChart').getContext('2d');
    new Chart(ctx3, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(timeLabels)},
        datasets: [{
          label: 'Transaction Latency',
          data: ${JSON.stringify(latencyData)},
          borderColor: 'rgba(0, 123, 255, 1)',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Latency (ms)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Transaction Sequence'
            }
          }
        }
      }
    });
    
    // User role distribution chart
    const ctx4 = document.getElementById('userRoleChart').getContext('2d');
    new Chart(ctx4, {
      type: 'doughnut',
      data: {
        labels: ${JSON.stringify(userRoleLabels)},
        datasets: [{
          data: ${JSON.stringify(userRoleCounts)},
          backgroundColor: [
            'rgba(0, 123, 255, 0.6)',    // blue for Government Official
            'rgba(40, 167, 69, 0.6)',    // green for Contractor
            'rgba(255, 193, 7, 0.6)',    // yellow for Auditor
          ],
          borderColor: [
            'rgba(0, 123, 255, 1)',
            'rgba(40, 167, 69, 1)',
            'rgba(255, 193, 7, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: 'User Distribution by Role'
          }
        }
      }
    });
  </script>
</body>
</html>
  `;
} 
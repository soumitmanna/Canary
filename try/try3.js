    // API endpoints (using JSONPlaceholder for demonstration)
    const API_BASE = 'https://jsonplaceholder.typicode.com';
    const STATS_ENDPOINT = '/posts/1'; // Simulating stats endpoint
    const ALIASES_ENDPOINT = '/posts'; // Simulating aliases endpoint
    const LEAK_CHECK_ENDPOINT = '/posts'; // Simulating leak check endpoint

    // State management
    let appState = {
      stats: null,
      aliases: null,
      leakData: null,
      isLoading: true
    };

    // DOM elements
    const elements = {
      aliasStat: document.getElementById('aliasStat'),
      protectedStat: document.getElementById('protectedStat'),
      alertStat: document.getElementById('alertStat'),
      scoreStat: document.getElementById('scoreStat'),
      aliasesTable: document.getElementById('aliasesTable'),
      aliasesTableBody: document.getElementById('aliasesTableBody'),
      aliasesLoading: document.getElementById('aliasesLoading'),
      leakChart: document.getElementById('leakChart'),
      result: document.getElementById('result'),
      aliasInput: document.getElementById('aliasInput'),
      checkLeakBtn: document.getElementById('checkLeakBtn'),
      refreshData: document.getElementById('refreshData'),
      simulateDay: document.getElementById('simulateDay'),
      simulateWeek: document.getElementById('simulateWeek'),
      notification: document.getElementById('notification'),
      notificationText: document.getElementById('notificationText')
    };

    // Show notification
    function showNotification(message, type = 'info') {
      elements.notificationText.textContent = message;
      elements.notification.className = `notification ${type} show`;
      
      setTimeout(() => {
        elements.notification.classList.remove('show');
      }, 3000);
    }

    // Fetch data from API
    async function fetchData() {
      try {
        showLoadingState();
        
        // In a real app, these would be actual API endpoints
        // For demonstration, we're using JSONPlaceholder and simulating our data structure
        
        // Simulate fetching stats
        const statsResponse = await fetch(`${API_BASE}${STATS_ENDPOINT}`);
        const statsData = await statsResponse.json();
        
        // Simulate our stats structure from the server
        const serverStats = {
          aliases: 24 + Math.floor(Math.random() * 10),
          protectedAccounts: 182 + Math.floor(Math.random() * 20),
          alerts: 3 + Math.floor(Math.random() * 4),
          protectionScore: 92 + Math.floor(Math.random() * 8),
          trends: {
            aliases: Math.random() > 0.5 ? 'up' : 'down',
            protectedAccounts: Math.random() > 0.3 ? 'up' : 'down',
            alerts: Math.random() > 0.5 ? 'up' : 'down',
            protectionScore: Math.random() > 0.4 ? 'up' : 'down'
          }
        };
        
        // Simulate fetching aliases
        const aliasesResponse = await fetch(`${API_BASE}${ALIASES_ENDPOINT}?_limit=5`);
        const aliasesData = await aliasesResponse.json();
        
        // Transform to our structure
        const serverAliases = aliasesData.map((item, index) => ({
          id: item.id,
          email: `alias${item.id}@canary.com`,
          service: item.title.split(' ').slice(0, 3).join(' '),
          status: index % 4 === 0 ? 'leaked' : (index % 4 === 1 ? 'pending' : 'active'),
          lastUsed: `${index + 1} day${index > 0 ? 's' : ''} ago`
        }));
        
        // Simulate leak data for chart
        const serverLeakData = {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          values: [3, 5, 2, 4, 6, 8, 5]
        };
        
        // Update app state
        appState.stats = serverStats;
        appState.aliases = serverAliases;
        appState.leakData = serverLeakData;
        appState.isLoading = false;
        
        // Update UI
        updateAllStats();
        updateAliasesTable();
        updateChart();
        
        showNotification('Data loaded successfully', 'success');
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('Failed to load data. Using demo data.', 'error');
        
        // Fallback to demo data
        loadDemoData();
      }
    }

    // Load demo data if API fails
    function loadDemoData() {
      appState.stats = {
        aliases: 24,
        protectedAccounts: 182,
        alerts: 3,
        protectionScore: 97,
        trends: {
          aliases: 'up',
          protectedAccounts: 'up',
          alerts: 'down',
          protectionScore: 'up'
        }
      };
      
      appState.aliases = [
        { id: 1, email: 'john.shopping@canary.com', service: 'Online Store', status: 'active', lastUsed: 'Today' },
        { id: 2, email: 'john.news@canary.com', service: 'Newsletter', status: 'active', lastUsed: '2 days ago' },
        { id: 3, email: 'john.social@canary.com', service: 'Social Media', status: 'leaked', lastUsed: '1 week ago' },
        { id: 4, email: 'john.gaming@canary.com', service: 'Gaming Platform', status: 'active', lastUsed: '3 days ago' },
        { id: 5, email: 'john.finance@canary.com', service: 'Banking Service', status: 'pending', lastUsed: 'Just now' }
      ];
      
      appState.leakData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [3, 5, 2, 4, 6, 8, 5]
      };
      
      appState.isLoading = false;
      
      updateAllStats();
      updateAliasesTable();
      updateChart();
    }

    // Show loading state
    function showLoadingState() {
      elements.aliasStat.innerHTML = `
        <div class="loading-shimmer" style="width: 80%; height: 2.5rem;"></div>
        <div class="loading-shimmer" style="width: 60%;"></div>
      `;
      elements.aliasStat.classList.add('loading');
      
      elements.protectedStat.innerHTML = `
        <div class="loading-shimmer" style="width: 80%; height: 2.5rem;"></div>
        <div class="loading-shimmer" style="width: 60%;"></div>
      `;
      elements.protectedStat.classList.add('loading');
      
      elements.alertStat.innerHTML = `
        <div class="loading-shimmer" style="width: 80%; height: 2.5rem;"></div>
        <div class="loading-shimmer" style="width: 60%;"></div>
      `;
      elements.alertStat.classList.add('loading');
      
      elements.scoreStat.innerHTML = `
        <div class="loading-shimmer" style="width: 80%; height: 2.5rem;"></div>
        <div class="loading-shimmer" style="width: 60%;"></div>
      `;
      elements.scoreStat.classList.add('loading');
    }

    // Update all stats on the page
    function updateAllStats() {
      if (!appState.stats) return;
      
      updateStatCard(
        elements.aliasStat,
        'envelope',
        appState.stats.aliases,
        'Active Aliases',
        appState.stats.trends.aliases
      );
      
      updateStatCard(
        elements.protectedStat,
        'shield-alt',
        appState.stats.protectedAccounts,
        'Protected Accounts',
        appState.stats.trends.protectedAccounts
      );
      
      updateStatCard(
        elements.alertStat,
        'bell',
        appState.stats.alerts,
        'Leak Alerts',
        appState.stats.trends.alerts
      );
      
      updateStatCard(
        elements.scoreStat,
        'check-circle',
        appState.stats.protectionScore + '%',
        'Protection Score',
        appState.stats.trends.protectionScore
      );
    }

    // Update a single statistic card
    function updateStatCard(element, icon, value, label, trend) {
      element.classList.remove('loading');
      element.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <h3>${value}</h3>
        <p>${label}</p>
        <span class="stat-trend trend-${trend}">${trend === 'up' ? '+5%' : (trend === 'down' ? '-3%' : '0%')}</span>
      `;
    }

    // Update aliases table
    function updateAliasesTable() {
      if (!appState.aliases) return;
      
      elements.aliasesLoading.style.display = 'none';
      elements.aliasesTable.style.display = 'table';
      
      // Clear existing rows
      elements.aliasesTableBody.innerHTML = '';
      
      // Add new rows
      appState.aliases.forEach(alias => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${alias.email}</td>
          <td>${alias.service}</td>
          <td><span class="status status-${alias.status}">${alias.status.charAt(0).toUpperCase() + alias.status.slice(1)}</span></td>
          <td>${alias.lastUsed}</td>
        `;
        
        elements.aliasesTableBody.appendChild(row);
      });
    }

    // Update the leak chart
    function updateChart() {
      if (!appState.leakData) return;
      
      const chart = elements.leakChart;
      chart.innerHTML = '';
      
      const maxValue = Math.max(...appState.leakData.values);
      const chartHeight = 200;
      
      appState.leakData.values.forEach((value, index) => {
        const barHeight = (value / maxValue) * (chartHeight - 30);
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${barHeight}px`;
        bar.style.left = `${index * 40 + 20}px`;
        bar.style.background = `linear-gradient(to top, var(--color-${value > 5 ? 'danger' : value > 3 ? 'warning' : 'success'}), transparent)`;
        
        const label = document.createElement('div');
        label.textContent = value;
        label.style.position = 'absolute';
        label.style.top = '-25px';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.color = 'var(--color-light)';
        label.style.fontSize = '12px';
        
        const dayLabel = document.createElement('div');
        dayLabel.textContent = appState.leakData.labels[index];
        dayLabel.style.position = 'absolute';
        dayLabel.style.bottom = '-25px';
        dayLabel.style.left = '50%';
        dayLabel.style.transform = 'translateX(-50%)';
        dayLabel.style.color = 'var(--color-light)';
        dayLabel.style.fontSize = '12px';
        
        bar.appendChild(label);
        bar.appendChild(dayLabel);
        chart.appendChild(bar);
      });
    }

    // Check for leaks
    async function checkLeak() {
      const alias = elements.aliasInput.value.trim();
      
      if (!alias) {
        showNotification('Please enter an alias or email to check', 'error');
        return;
      }
      
      elements.result.textContent = "Checking...";
      elements.result.style.color = "var(--color-light)";
      elements.result.style.backgroundColor = "rgba(52, 152, 219, 0.1)";
      
      try {
        // Simulate API call to check for leaks
        const response = await fetch(`${API_BASE}${LEAK_CHECK_ENDPOINT}?q=${encodeURIComponent(alias)}`);
        const data = await response.json();
        
        // Simulate leak detection logic
        const isLeaked = alias.includes('leak') || alias.includes('test') || Math.random() > 0.7;
        
        if (isLeaked) {
          elements.result.innerHTML = `⚠️ <strong>Warning!</strong> ${alias} was found in recent data leaks. <a href="#" style="color: var(--color-primary);">Take action</a>`;
          elements.result.style.color = "var(--color-danger)";
          elements.result.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
          
          // Update stats
          appState.stats.alerts++;
          updateStatCard(
            elements.alertStat,
            'bell',
            appState.stats.alerts,
            'Leak Alerts',
            'up'
          );
        } else {
          elements.result.innerHTML = `✅ <strong>Good news!</strong> No leaks found for ${alias}.`;
          elements.result.style.color = "var(--color-success)";
          elements.result.style.backgroundColor = "rgba(46, 204, 113, 0.1)";
        }
      } catch (error) {
        console.error('Error checking leak:', error);
        elements.result.innerHTML = `❌ <strong>Error:</strong> Could not check alias at this time.`;
        elements.result.style.color = "var(--color-warning)";
        elements.result.style.backgroundColor = "rgba(243, 156, 18, 0.1)";
      }
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
      // Set up event listeners
      elements.checkLeakBtn.addEventListener('click', checkLeak);
      elements.refreshData.addEventListener('click', fetchData);
      elements.simulateDay.addEventListener('click', simulateTime.bind(null, 1));
      elements.simulateWeek.addEventListener('click', simulateTime.bind(null, 7));
      
      // Add event listener for Enter key in input field
      elements.aliasInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          checkLeak();
        }
      });
      
      // Load initial data
      fetchData();
    });

    // Simulate the passage of time
    function simulateTime(days) {
      if (!appState.stats) return;
      
      // Update stats based on time passed
      const aliasesChange = Math.floor(Math.random() * 5) - 1;
      const protectedChange = Math.floor(Math.random() * 10) + 2;
      const alertsChange = Math.floor(Math.random() * 4) - 1;
      const scoreChange = Math.floor(Math.random() * 3);
      
      appState.stats.aliases = Math.max(0, appState.stats.aliases + aliasesChange * days);
      appState.stats.protectedAccounts = Math.max(0, appState.stats.protectedAccounts + protectedChange * days);
      appState.stats.alerts = Math.max(0, appState.stats.alerts + alertsChange * days);
      appState.stats.protectionScore = Math.min(100, Math.max(0, appState.stats.protectionScore + scoreChange * days));
      
      // Update trends
      appState.stats.trends.aliases = aliasesChange > 0 ? 'up' : (aliasesChange < 0 ? 'down' : 'neutral');
      appState.stats.trends.protectedAccounts = protectedChange > 0 ? 'up' : (protectedChange < 0 ? 'down' : 'neutral');
      appState.stats.trends.alerts = alertsChange > 0 ? 'up' : (alertsChange < 0 ? 'down' : 'neutral');
      appState.stats.trends.protectionScore = scoreChange > 0 ? 'up' : (scoreChange < 0 ? 'down' : 'neutral');
      
      // Update the UI
      updateAllStats();
      
      showNotification(`Simulated ${days} day${days > 1 ? 's' : ''} of activity`);
    }
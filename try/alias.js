    // API endpoints (using JSONPlaceholder for demonstration)
    const API_BASE = 'https://jsonplaceholder.typicode.com';
    const ALIASES_ENDPOINT = '/posts'; // Simulating aliases endpoint
    const USERS_ENDPOINT = '/users/1'; // Simulating user endpoint
    
    // State management
    let appState = {
      aliases: [],
      filteredAliases: [],
      currentPage: 1,
      itemsPerPage: 8,
      totalItems: 0,
      sortField: 'created',
      sortDirection: 'desc',
      statusFilter: 'all',
      searchQuery: '',
      isLoading: true
    };
    
    // DOM elements
    const elements = {
      createAliasBtn: document.getElementById('createAliasBtn'),
      createAliasModal: document.getElementById('createAliasModal'),
      closeModal: document.getElementById('closeModal'),
      cancelCreate: document.getElementById('cancelCreate'),
      createAliasForm: document.getElementById('createAliasForm'),
      aliasesTable: document.getElementById('aliasesTable'),
      aliasesTableBody: document.getElementById('aliasesTableBody'),
      aliasesLoading: document.getElementById('aliasesLoading'),
      noAliasesMessage: document.getElementById('noAliasesMessage'),
      pagination: document.getElementById('pagination'),
      searchInput: document.getElementById('searchInput'),
      statusFilter: document.getElementById('statusFilter'),
      sortSelect: document.getElementById('sortSelect'),
      notification: document.getElementById('notification'),
      notificationText: document.getElementById('notificationText'),
      totalAliasesStat: document.getElementById('totalAliasesStat'),
      activeAliasesStat: document.getElementById('activeAliasesStat'),
      leakProtectedStat: document.getElementById('leakProtectedStat'),
      disabledAliasesStat: document.getElementById('disabledAliasesStat')
    };
    
    // Show notification
    function showNotification(message, type = 'info') {
      elements.notificationText.textContent = message;
      elements.notification.className = `notification ${type} show`;
      
      setTimeout(() => {
        elements.notification.classList.remove('show');
      }, 3000);
    }
    
    // Fetch aliases from API
    async function fetchAliases() {
      try {
        appState.isLoading = true;
        showLoadingState();
        
        // In a real app, this would be an actual API endpoint for aliases
        const response = await fetch(`${API_BASE}${ALIASES_ENDPOINT}?_limit=30`);
        const aliasesData = await response.json();
        
        // Simulate our aliases structure from the server
        const serverAliases = aliasesData.map((item, index) => {
          // Generate random status with weighted probability
          const statusRand = Math.random();
          let status;
          if (statusRand < 0.7) status = 'active';
          else if (statusRand < 0.9) status = 'paused';
          else status = 'leaked';
          
          // Generate random creation date (within last 90 days)
          const createdDate = new Date();
          createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
          
          return {
            id: item.id,
            email: `alias${item.id}@canary.com`,
            service: item.title.split(' ').slice(0, 3).join(' '),
            status: status,
            created: createdDate.toISOString().split('T')[0],
            note: item.body.split('\n')[0],
            forwarded: Math.random() > 0.3,
            leakProtected: Math.random() > 0.5
          };
        });
        
        // Update app state
        appState.aliases = serverAliases;
        appState.totalItems = serverAliases.length;
        appState.isLoading = false;
        
        // Update UI
        applyFilters();
        updateStats();
        
      } catch (error) {
        console.error('Error fetching aliases:', error);
        showNotification('Failed to load aliases. Using demo data.', 'error');
        
        // Fallback to demo data
        loadDemoAliases();
      }
    }
    
    // Load demo aliases if API fails
    function loadDemoAliases() {
      appState.aliases = [
        { id: 1, email: 'john.shopping@canary.com', service: 'Online Store', status: 'active', created: '2023-06-12', note: 'For shopping websites', forwarded: true, leakProtected: true },
        { id: 2, email: 'john.news@canary.com', service: 'Newsletter', status: 'active', created: '2023-05-28', note: 'News subscriptions', forwarded: true, leakProtected: false },
        { id: 3, email: 'john.social@canary.com', service: 'Social Media', status: 'leaked', created: '2023-03-15', note: 'Social networks', forwarded: false, leakProtected: true },
        { id: 4, email: 'john.gaming@canary.com', service: 'Gaming Platform', status: 'active', created: '2023-07-03', note: 'Gaming accounts', forwarded: true, leakProtected: true },
        { id: 5, email: 'john.finance@canary.com', service: 'Banking Service', status: 'paused', created: '2023-04-22', note: 'Financial institutions', forwarded: true, leakProtected: true },
        { id: 6, email: 'john.work@canary.com', service: 'Professional Network', status: 'active', created: '2023-05-10', note: 'Work-related accounts', forwarded: true, leakProtected: false },
        { id: 7, email: 'john.travel@canary.com', service: 'Travel Booking', status: 'active', created: '2023-06-30', note: 'Travel websites', forwarded: true, leakProtected: true },
        { id: 8, email: 'john.health@canary.com', service: 'Fitness App', status: 'paused', created: '2023-04-05', note: 'Health and fitness', forwarded: false, leakProtected: false }
      ];
      
      appState.totalItems = appState.aliases.length;
      appState.isLoading = false;
      
      applyFilters();
      updateStats();
    }
    
    // Show loading state
    function showLoadingState() {
      elements.aliasesTable.style.display = 'none';
      elements.aliasesLoading.style.display = 'block';
      elements.noAliasesMessage.style.display = 'none';
      
      elements.totalAliasesStat.innerHTML = `
        <div class="loading-shimmer" style="width: 80%; height: 2rem;"></div>
        <div class="loading-shimmer" style="width: 60%;"></div>
      `;
      elements.totalAliasesStat.classList.add('loading');
      
      elements.activeAliasesStat.innerHTML = `
        <div class="loading-shimmer" style="width: 80%; height: 2rem;"></div>
        <div class="loading-shimmer" style="width: 60%;"></div>
      `;
      elements.activeAliasesStat.classList.add('loading');
      
      elements.leakProtectedStat.innerHTML = `
        <div class="loading-shimmer" style="width: 80%; height: 2rem;"></div>
        <div class="loading-shimmer" style="width: 60%;"></div>
      `;
      elements.leakProtectedStat.classList.add('loading');
      
      elements.disabledAliasesStat.innerHTML = `
        <div class="loading-shimmer" style="width: 80%; height: 2rem;"></div>
        <div class="loading-shimmer" style="width: 60%;"></div>
      `;
      elements.disabledAliasesStat.classList.add('loading');
    }
    
    // Apply filters and search
    function applyFilters() {
      let filtered = [...appState.aliases];
      
      // Apply status filter
      if (appState.statusFilter !== 'all') {
        filtered = filtered.filter(alias => alias.status === appState.statusFilter);
      }
      
      // Apply search query
      if (appState.searchQuery) {
        const query = appState.searchQuery.toLowerCase();
        filtered = filtered.filter(alias => 
          alias.email.toLowerCase().includes(query) || 
          alias.service.toLowerCase().includes(query) ||
          (alias.note && alias.note.toLowerCase().includes(query))
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (appState.sortField) {
          case 'email':
            aValue = a.email;
            bValue = b.email;
            break;
          case 'service':
            aValue = a.service;
            bValue = b.service;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'created':
          default:
            aValue = a.created;
            bValue = b.created;
            break;
        }
        
        if (appState.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      appState.filteredAliases = filtered;
      appState.totalItems = filtered.length;
      appState.currentPage = 1;
      
      renderAliases();
      renderPagination();
    }
    
    // Render aliases to the table
    function renderAliases() {
      elements.aliasesLoading.style.display = 'none';
      
      if (appState.filteredAliases.length === 0) {
        elements.aliasesTable.style.display = 'none';
        elements.noAliasesMessage.style.display = 'block';
        return;
      }
      
      elements.aliasesTable.style.display = 'table';
      elements.noAliasesMessage.style.display = 'none';
      
      // Calculate pagination
      const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
      const endIndex = Math.min(startIndex + appState.itemsPerPage, appState.filteredAliases.length);
      const currentAliases = appState.filteredAliases.slice(startIndex, endIndex);
      
      // Clear existing rows
      elements.aliasesTableBody.innerHTML = '';
      
      // Add new rows
      currentAliases.forEach(alias => {
        const row = document.createElement('tr');
        
        // Format created date
        const createdDate = new Date(alias.created);
        const formattedDate = createdDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        row.innerHTML = `
          <td>
            <div>${alias.email}</div>
            ${alias.note ? `<small style="color: #d1e0ef; opacity: 0.7;">${alias.note}</small>` : ''}
          </td>
          <td>${alias.service}</td>
          <td><span class="status status-${alias.status}">${alias.status.charAt(0).toUpperCase() + alias.status.slice(1)}</span></td>
          <td>${formattedDate}</td>
          <td>
            <button class="action-btn" title="Edit alias" onclick="editAlias(${alias.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn" title="${alias.status === 'active' ? 'Disable' : 'Enable'} alias" onclick="toggleAlias(${alias.id})">
              <i class="fas ${alias.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
            </button>
            <button class="action-btn" title="Delete alias" onclick="deleteAlias(${alias.id})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        
        elements.aliasesTableBody.appendChild(row);
      });
    }
    
    // Render pagination controls
    function renderPagination() {
      const totalPages = Math.ceil(appState.totalItems / appState.itemsPerPage);
      
      if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
      }
      
      let paginationHTML = '';
      
      // Previous button
      paginationHTML += `
        <button class="pagination-btn" ${appState.currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${appState.currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button>
      `;
      
      // Page numbers
      const maxVisiblePages = 5;
      let startPage = Math.max(1, appState.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
          <button class="pagination-btn ${i === appState.currentPage ? 'active' : ''}" 
                  onclick="changePage(${i})">${i}</button>
        `;
      }
      
      // Next button
      paginationHTML += `
        <button class="pagination-btn" ${appState.currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${appState.currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button>
      `;
      
      elements.pagination.innerHTML = paginationHTML;
    }
    
    // Change page
    function changePage(page) {
      appState.currentPage = page;
      renderAliases();
      renderPagination();
    }
    
    // Update stats cards
    function updateStats() {
      if (!appState.aliases.length) return;
      
      const totalAliases = appState.aliases.length;
      const activeAliases = appState.aliases.filter(a => a.status === 'active').length;
      const leakProtected = appState.aliases.filter(a => a.leakProtected).length;
      const disabledAliases = appState.aliases.filter(a => a.status !== 'active').length;
      
      elements.totalAliasesStat.classList.remove('loading');
      elements.totalAliasesStat.innerHTML = `
        <i class="fas fa-envelope"></i>
        <h3>${totalAliases}</h3>
        <p>Total Aliases</p>
      `;
      
      elements.activeAliasesStat.classList.remove('loading');
      elements.activeAliasesStat.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>${activeAliases}</h3>
        <p>Active Aliases</p>
      `;
      
      elements.leakProtectedStat.classList.remove('loading');
      elements.leakProtectedStat.innerHTML = `
        <i class="fas fa-shield-alt"></i>
        <h3>${leakProtected}</h3>
        <p>Leak-Protected</p>
      `;
      
      elements.disabledAliasesStat.classList.remove('loading');
      elements.disabledAliasesStat.innerHTML = `
        <i class="fas fa-ban"></i>
        <h3>${disabledAliases}</h3>
        <p>Disabled Aliases</p>
      `;
    }
    
    // Create new alias
    async function createAlias(service, domain, note) {
      try {
        // In a real app, this would be an actual API call
        const response = await fetch(`${API_BASE}${ALIASES_ENDPOINT}`, {
          method: 'POST',
          body: JSON.stringify({
            title: service,
            body: note || 'No note provided',
            userId: 1,
          }),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        });
        
        const newAliasData = await response.json();
        
        // Create the new alias object
        const newAlias = {
          id: newAliasData.id,
          email: `alias${newAliasData.id}@${domain}`,
          service: service,
          status: 'active',
          created: new Date().toISOString().split('T')[0],
          note: note || '',
          forwarded: true,
          leakProtected: true
        };
        
        // Add to our local state
        appState.aliases.unshift(newAlias);
        appState.totalItems = appState.aliases.length;
        
        // Update UI
        applyFilters();
        updateStats();
        
        showNotification('Alias created successfully!', 'success');
        closeModal();
        
      } catch (error) {
        console.error('Error creating alias:', error);
        showNotification('Failed to create alias. Please try again.', 'error');
      }
    }
    
    // Edit alias
    function editAlias(id) {
      const alias = appState.aliases.find(a => a.id === id);
      if (alias) {
        showNotification(`Edit functionality would open for: ${alias.email}`, 'info');
      }
    }
    
    // Toggle alias status
    function toggleAlias(id) {
      const alias = appState.aliases.find(a => a.id === id);
      if (alias) {
        alias.status = alias.status === 'active' ? 'paused' : 'active';
        applyFilters();
        updateStats();
        
        showNotification(
          `Alias ${alias.status === 'active' ? 'enabled' : 'disabled'} successfully!`, 
          'success'
        );
      }
    }
    
    // Delete alias
    function deleteAlias(id) {
      if (confirm('Are you sure you want to delete this alias? This action cannot be undone.')) {
        const aliasIndex = appState.aliases.findIndex(a => a.id === id);
        if (aliasIndex !== -1) {
          appState.aliases.splice(aliasIndex, 1);
          appState.totalItems = appState.aliases.length;
          applyFilters();
          updateStats();
          
          showNotification('Alias deleted successfully!', 'success');
        }
      }
    }
    
    // Open modal
    function openModal() {
      elements.createAliasModal.classList.add('active');
    }
    
    // Close modal
    function closeModal() {
      elements.createAliasModal.classList.remove('active');
      elements.createAliasForm.reset();
    }
    
    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
      // Set up event listeners
      elements.createAliasBtn.addEventListener('click', openModal);
      elements.closeModal.addEventListener('click', closeModal);
      elements.cancelCreate.addEventListener('click', closeModal);
      
      elements.createAliasForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const service = document.getElementById('aliasService').value;
        const domain = document.getElementById('aliasDomain').value;
        const note = document.getElementById('aliasNote').value;
        
        createAlias(service, domain, note);
      });
      
      elements.searchInput.addEventListener('input', function() {
        appState.searchQuery = this.value;
        applyFilters();
      });
      
      elements.statusFilter.addEventListener('change', function() {
        appState.statusFilter = this.value;
        applyFilters();
      });
      
      elements.sortSelect.addEventListener('change', function() {
        const [field, direction] = this.value.split('_');
        appState.sortField = field;
        appState.sortDirection = direction;
        applyFilters();
      });
      
      // Set up table header sorting
      document.querySelectorAll('.aliases-table th[data-sort]').forEach(header => {
        header.addEventListener('click', function() {
          const field = this.getAttribute('data-sort');
          if (appState.sortField === field) {
            appState.sortDirection = appState.sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            appState.sortField = field;
            appState.sortDirection = 'desc';
          }
          applyFilters();
        });
      });
      
      // Load initial data
      fetchAliases();
    });
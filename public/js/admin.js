// Modal Manager Class
class ModalManager {
    constructor() {
        this.modal = document.getElementById('customModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalOk = document.getElementById('modalOk');
        this.modalCancel = document.getElementById('modalCancel');
        this.modalClose = document.getElementById('modalClose');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.modalClose.addEventListener('click', () => this.hide());
        this.modalOk.addEventListener('click', () => this.hide());
        this.modalCancel.addEventListener('click', () => this.hide());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.hide();
            }
        });
    }
    
    show(title, message, type = 'info') {
        try {
            this.modalTitle.textContent = title;
            this.modalMessage.textContent = message;
            
            // Configure buttons based on type
            if (type === 'confirm') {
                this.modalCancel.style.display = 'inline-block';
                this.modalOk.textContent = 'Yes';
                this.modalCancel.textContent = 'No';
            } 
            else {
                this.modalCancel.style.display = 'none';
                this.modalOk.textContent = 'OK';
            }
            
            this.modal.style.display = 'flex';
            
            return new Promise((resolve) => {
                this.modalOk.onclick = () => {
                    this.hide();
                    resolve(true);
                };
                this.modalCancel.onclick = () => {
                    this.hide();
                    resolve(false);
                };
            });
        } 
        catch (error) {
            console.error('Error showing modal:', error);
            // Fallback to alert if modal fails
            return Promise.resolve(window.alert(message));
        }
    }
    
    hide() {
        try {
            this.modal.style.display = 'none';
        } 
        catch (error) {
            console.error('Error hiding modal:', error);
        }
    }
    
    alert(message, title = 'Message') {
        return this.show(title, message, 'info');
    }
    
    confirm(message, title = 'Confirm') {
        return this.show(title, message, 'confirm');
    }
}

// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.isAuthenticated = false;
        this.currentSection = 'dashboard';
        this.charts = {};
        this.modal = new ModalManager();
        
        this.elements = {
            loginModal: document.getElementById('loginModal'),
            loginForm: document.getElementById('loginForm'),
            adminPanel: document.getElementById('adminPanel'),
            logoutBtn: document.getElementById('logoutBtn'),
            navBtns: document.querySelectorAll('.nav-btn'),
            sections: document.querySelectorAll('.admin-section'),
            pieChartDate: document.getElementById('pieChartDate'),
            mainFilter: document.getElementById('mainFilter'),
            attendanceDate: document.getElementById('attendanceDate'),
            loadAttendanceBtn: document.getElementById('loadAttendance'),
            attendanceTableBody: document.getElementById('attendanceTableBody'),
            createAttendanceBtn: document.getElementById('createAttendanceBtn'),
            attendanceFormPanel: document.getElementById('attendanceFormPanel'),
            attendanceForm: document.getElementById('attendanceForm'),
            attendanceFormTitle: document.getElementById('attendanceFormTitle'),
            attendanceName: document.getElementById('attendanceName'),
            attendanceMain: document.getElementById('attendanceMain'),
            attendanceDateTime: document.getElementById('attendanceDateTime'),
            attendanceTimeType: document.getElementById('attendanceTimeType'),
            submitAttendanceBtn: document.getElementById('submitAttendanceBtn'),
            cancelAttendanceBtn: document.getElementById('cancelAttendanceBtn'),
            editAttendanceId: document.getElementById('editAttendanceId'),
            createMainForm: document.getElementById('createMainForm'),
            mainsList: document.getElementById('mainsList'),
            ganttMain: document.getElementById('ganttMain'),
            ganttStartDate: document.getElementById('ganttStartDate'),
            ganttEndDate: document.getElementById('ganttEndDate'),
            loadGanttBtn: document.getElementById('loadGantt'),
            exportGanttBtn: document.getElementById('exportGantt'),
            ganttContainer: document.getElementById('ganttContainer'),
            exportMains: document.getElementById('exportMains'),
            exportStartDate: document.getElementById('exportStartDate'),
            exportEndDate: document.getElementById('exportEndDate'),
            exportPDFBtn: document.getElementById('exportPDF'),
            exportPreview: document.getElementById('exportPreview')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDates();
        this.checkAuthentication();
    }

    setupEventListeners() {
        // Debug: Check if button exists
        console.log('Setting up event listeners...');
        console.log('createAttendanceBtn element:', this.elements.createAttendanceBtn);
        console.log('Button exists:', !!this.elements.createAttendanceBtn);
        
        // Login form
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
        
        // Navigation
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchSection(btn.dataset.section));
        });
        
        // Dashboard controls
        this.elements.pieChartDate.addEventListener('change', () => this.updatePieChart());
        
        // Attendance records
        this.elements.loadAttendanceBtn.addEventListener('click', () => this.loadAttendanceRecords());
        
        // Attendance form
        if (this.elements.createAttendanceBtn) {
            this.elements.createAttendanceBtn.addEventListener('click', () => {
                console.log('Create attendance button clicked!');
                this.showAttendanceForm();
            });
        } else {
            console.error('createAttendanceBtn element not found!');
        }
        
        if (this.elements.attendanceForm) {
            this.elements.attendanceForm.addEventListener('submit', (e) => this.handleAttendanceSubmit(e));
        }
        
        if (this.elements.cancelAttendanceBtn) {
            this.elements.cancelAttendanceBtn.addEventListener('click', () => this.hideAttendanceForm());
        }
        
        // Mains management
        this.elements.createMainForm.addEventListener('submit', (e) => this.createMain(e));
        
        // Cancel edit button
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.cancelEdit());
        
        // Gantt chart
        this.elements.loadGanttBtn.addEventListener('click', () => this.loadGanttChart());
        this.elements.exportGanttBtn.addEventListener('click', () => this.exportGanttChart());
        
        // Export
        this.elements.exportPDFBtn.addEventListener('click', () => this.exportToPDF());
        
        // Chart export buttons
        document.querySelectorAll('.export-chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.exportChart(e.target.dataset.chart));
        });
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        this.elements.pieChartDate.value = today;
        this.elements.attendanceDate.value = today;
        this.elements.ganttStartDate.value = thirtyDaysAgo;
        this.elements.ganttEndDate.value = today;
        this.elements.exportStartDate.value = thirtyDaysAgo;
        this.elements.exportEndDate.value = today;
    }

    checkAuthentication() {
        // Check if already authenticated (you could use localStorage/sessionStorage)
        const isAuth = sessionStorage.getItem('admin_authenticated');
        if (isAuth === 'true') {
            this.showAdminPanel();
        } else {
            this.showLoginModal();
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(this.elements.loginForm);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            const result = await response.json();
            
            if (result.success) {
                sessionStorage.setItem('admin_authenticated', 'true');
                this.showAdminPanel();
            } else {
                this.showLoginError(result.message);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Login failed. Please try again.');
        }
    }

    showLoginError(message) {
        const errorElement = document.getElementById('loginError');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    showAdminPanel() {
        this.isAuthenticated = true;
        this.elements.loginModal.style.display = 'none';
        this.elements.adminPanel.style.display = 'block';
        
        // Load initial data
        this.loadMains();
        this.loadDashboard();
        
        // Load attendance records for the current date
        setTimeout(() => this.loadAttendanceRecords(), 500);
        
        // Force show the create button if it exists
        setTimeout(() => {
            this.ensureCreateButtonExists();
            const createBtn = document.getElementById('createAttendanceBtn');
            if (createBtn) {
                createBtn.style.display = 'inline-block';
                createBtn.style.visibility = 'visible';
                createBtn.style.opacity = '1';
                console.log('Forced create button to be visible');
            } else {
                console.error('Create button still not found after admin panel load');
            }
        }, 1000);
    }

    showLoginModal() {
        this.elements.loginModal.style.display = 'flex';
        this.elements.adminPanel.style.display = 'none';
    }

    logout() {
        sessionStorage.removeItem('admin_authenticated');
        this.isAuthenticated = false;
        this.showLoginModal();
        
        // Clear any sensitive data
        this.charts = {};
    }

    switchSection(sectionName) {
        // Update navigation
        this.elements.navBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Update sections
        this.elements.sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionName).classList.add('active');
        
        this.currentSection = sectionName;
        
        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'attendance':
                this.loadAttendanceRecords();
                this.ensureCreateButtonExists();
                break;
            case 'mains':
                this.loadMainsList();
                break;
        }
    }

    async loadMains() {
        try {
            const response = await fetch('/api/attendance/mains');
            const mains = await response.json();
            
            // Update all main selectors
            this.updateMainSelectors(mains);
            
        } catch (error) {
            console.error('Error loading mains:', error);
        }
    }

    updateMainSelectors(mains) {
        const selectors = [this.elements.mainFilter, this.elements.ganttMain, this.elements.exportMains];
        
        selectors.forEach(selector => {
            if (!selector) return;
            
            const currentValue = selector.value;
            const isMultiple = selector.hasAttribute('multiple');
            
            // Clear existing options except "All" options
            if (isMultiple) {
                selector.innerHTML = '<option value="all">All Mains</option>';
            } 
            else {
                selector.innerHTML = selector === this.elements.mainFilter 
                    ? '<option value="">All Mains</option>' 
                    : '<option value="all">All Mains</option>';
            }
            
            // Add mains
            mains.forEach(main => {
                const option = document.createElement('option');
                option.value = main.name;
                option.textContent = main.display_name;
                selector.appendChild(option);
            });
            
            // Restore previous value if it still exists
            if (currentValue && Array.from(selector.options).some(opt => opt.value === currentValue)) {
                selector.value = currentValue;
            }
        });
    }

    async loadDashboard() {
        await Promise.all([
            this.loadDailyChart(),
            this.updatePieChart()
        ]);
    }

    async loadDailyChart() {
        try {
            const response = await fetch('/api/admin/daily-stats?days=30');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }
            
            // Prepare chart data
            const labels = data.map(item => new Date(item.date).toLocaleDateString());
            const counts = data.map(item => parseInt(item.count) || 0);
            
            this.createBarChart(labels.reverse(), counts.reverse());
            
        } 
        catch (error) {
            console.error('Error in loadDailyChart:', error);
            const chartContainer = document.getElementById('dailyChart').parentElement;
            if (chartContainer) {
                chartContainer.innerHTML = '<div class="error">Error loading daily chart data</div>';
            }
        }
    }

    async updatePieChart() {
        try {
            const date = this.elements.pieChartDate.value;
            const response = await fetch(`/api/admin/main-stats?date=${date}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }
            
            // Prepare chart data
            const labels = data.map(item => item.main);
            const counts = data.map(item => parseInt(item.count) || 0);
            
            this.createPieChart(labels, counts);
            
        } catch (error) {
            console.error('Error in updatePieChart:', error);
            const chartContainer = document.getElementById('pieChart').parentElement;
            if (chartContainer) {
                chartContainer.innerHTML = '<div class="error">Error loading pie chart data</div>';
            }
        }
    }

    createBarChart(labels, data) {
        const ctx = document.getElementById('dailyChart').getContext('2d');
        
        if (this.charts.dailyChart) {
            this.charts.dailyChart.destroy();
        }
        
        // Responsive sizing based on screen width
        const isSmallScreen = window.innerWidth < 768;
        const isMediumScreen = window.innerWidth >= 768 && window.innerWidth < 1200;
        
        this.charts.dailyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Attendance Count',
                    data: data,
                    backgroundColor: 'rgba(212, 175, 55, 0.8)',
                    borderColor: 'rgba(139, 69, 19, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: isSmallScreen ? 1.5 : isMediumScreen ? 1.8 : 2,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: isSmallScreen ? 10 : isMediumScreen ? 11 : 12
                            }
                        }
                    },
                    y: {
                        ticks: {
                            maxTicksLimit: isSmallScreen ? 6 : isMediumScreen ? 7 : 8,
                            font: {
                                size: isSmallScreen ? 10 : isMediumScreen ? 11 : 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                layout: {
                    padding: isSmallScreen ? 5 : isMediumScreen ? 8 : 10
                }
            }
        });
    }

    createPieChart(labels, data) {
        const ctx = document.getElementById('pieChart').getContext('2d');
        
        if (this.charts.pieChart) {
            this.charts.pieChart.destroy();
        }
        
        const colors = [
            'rgba(212, 175, 55, 0.8)',
            'rgba(139, 69, 19, 0.8)',
            'rgba(205, 127, 50, 0.8)',
            'rgba(160, 82, 45, 0.8)',
            'rgba(139, 0, 0, 0.8)'
        ];
        
        // Responsive sizing based on screen width
        const isSmallScreen = window.innerWidth < 768;
        const isMediumScreen = window.innerWidth >= 768 && window.innerWidth < 1200;
        
        this.charts.pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: 'rgba(139, 69, 19, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: isSmallScreen ? 10 : isMediumScreen ? 11 : 12
                            },
                            padding: isSmallScreen ? 10 : isMediumScreen ? 15 : 20,
                            usePointStyle: true,
                            boxWidth: isSmallScreen ? 12 : isMediumScreen ? 14 : 16
                        }
                    }
                },
                layout: {
                    padding: isSmallScreen ? 5 : isMediumScreen ? 8 : 10
                }
            }
        });
    }

    async loadAttendanceRecords() {
        try {
            const main = this.elements.mainFilter.value;
            const date = this.elements.attendanceDate.value;
            
            let url = `/api/admin/main-attendance/${main || 'all'}`;
            if (date) {
                url += `?date=${date}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const records = await response.json();
            
            console.log(`Loaded ${records.length} attendance records for ${date || 'today'}`);
            
            this.displayAttendanceRecords(records);
            
        } catch (error) {
            console.error('Error loading attendance records:', error);
            this.elements.attendanceTableBody.innerHTML = 
                `<tr><td colspan="5" class="no-data">Error loading attendance records: ${error.message}</td></tr>`;
        }
    }

    displayAttendanceRecords(records) {
        if (records.length === 0) {
            this.elements.attendanceTableBody.innerHTML = 
                '<tr><td colspan="5" class="no-data">No attendance records found for the selected criteria</td></tr>';
            return;
        }
        
        this.elements.attendanceTableBody.innerHTML = records.map(record => `
            <tr>
                <td>${record.name}</td>
                <td>${record.main || 'N/A'}</td>
                <td>${new Date(record.login_time).toLocaleString()}</td>
                <td>${record.is_custom_time ? 'Custom' : 'System'}</td>
                <td class="actions-cell">
                    <button class="action-btn edit-btn" onclick="adminPanel.editAttendanceRecord(${record.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="adminPanel.deleteAttendanceRecord(${record.id}, '${record.name}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    async createMain(event) {
        try {
            event.preventDefault();
            
            const formData = new FormData(this.elements.createMainForm);
            const mainData = {
                name: formData.get('name').trim(),
                displayName: formData.get('displayName').trim()
            };
            
            if (!mainData.name || !mainData.displayName) {
                await this.modal.alert('Please fill in all fields', 'Validation Error');
                return;
            }
            
            const editId = document.getElementById('editMainId').value;
            const isEditing = editId !== '';
            
            const url = isEditing ? `/api/admin/mains/${editId}` : '/api/admin/mains';
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mainData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                await this.modal.alert(
                    isEditing ? 'Main updated successfully!' : 'Main created successfully!',
                    'Success'
                );
                this.cancelEdit();
                await this.loadMains(); // Refresh all selectors
                await this.loadMainsList(); // Refresh the mains list
            } else {
                await this.modal.alert(
                    result.error || `Failed to ${isEditing ? 'update' : 'create'} main`,
                    'Error'
                );
            }
            
        } catch (error) {
            console.error('Error in createMain:', error);
            await this.modal.alert(
                'An unexpected error occurred. Please try again.',
                'Error'
            );
        }
    }

    editMain(button) {
        const id = button.dataset.id;
        const name = button.dataset.name;
        const displayName = button.dataset.display;
        
        // Populate form
        document.getElementById('editMainId').value = id;
        document.getElementById('mainName').value = name;
        document.getElementById('mainDisplayName').value = displayName;
        
        // Update UI
        document.getElementById('formTitle').textContent = 'Edit Main';
        document.getElementById('submitMainBtn').textContent = 'Update Main';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        
        // Scroll to form
        document.querySelector('.create-main-panel').scrollIntoView({ behavior: 'smooth' });
    }

    cancelEdit() {
        // Reset form
        this.elements.createMainForm.reset();
        document.getElementById('editMainId').value = '';
        
        // Update UI
        document.getElementById('formTitle').textContent = 'Create New Main';
        document.getElementById('submitMainBtn').textContent = 'Create Main';
        document.getElementById('cancelEditBtn').style.display = 'none';
    }

    async deleteMain(id, name) {
        try {
            const confirmed = await this.modal.confirm(
                `Are you sure you want to delete "${name}"? This action cannot be undone.`,
                'Confirm Deletion'
            );
            
            if (!confirmed) {
                return;
            }
            
            const response = await fetch(`/api/admin/mains/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                await this.modal.alert('Main deleted successfully!', 'Success');
                await this.loadMains(); // Refresh all selectors
                await this.loadMainsList(); // Refresh the mains list
            } else {
                await this.modal.alert(
                    result.error || 'Failed to delete main',
                    'Error'
                );
            }
            
        } catch (error) {
            console.error('Error in deleteMain:', error);
            await this.modal.alert(
                'An unexpected error occurred while deleting. Please try again.',
                'Error'
            );
        }
    }

    async toggleMain(id) {
        try {
            const response = await fetch(`/api/admin/mains/${id}/toggle`, {
                method: 'PATCH'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                await this.loadMains(); // Refresh all selectors
                await this.loadMainsList(); // Refresh the mains list
            } else {
                await this.modal.alert(
                    result.error || 'Failed to toggle main status',
                    'Error'
                );
            }
            
        } catch (error) {
            console.error('Error in toggleMain:', error);
            await this.modal.alert(
                'An unexpected error occurred while toggling status. Please try again.',
                'Error'
            );
        }
    }

    async loadMainsList() {
        try {
            const response = await fetch('/api/admin/mains');
            const mains = await response.json();
            
            if (mains.length === 0) {
                this.elements.mainsList.innerHTML = '<div class="no-data">No mains created yet</div>';
                return;
            }
            
            this.elements.mainsList.innerHTML = mains.map(main => `
                <div class="main-card ${!main.is_active ? 'inactive' : ''}">
                    <h4>${main.display_name}</h4>
                    <p>Name: ${main.name}</p>
                    <p>Status: ${main.is_active ? 'Active' : 'Inactive'}</p>
                    <div class="main-actions">
                        <button class="edit-main-btn" data-id="${main.id}" 
                                data-name="${main.name}" data-display="${main.display_name}">
                            Edit
                        </button>
                        <button class="toggle-main-btn ${main.is_active ? 'deactivate' : 'activate'}" 
                                data-id="${main.id}">
                            ${main.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="delete-main-btn" data-id="${main.id}" data-name="${main.display_name}">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners
            document.querySelectorAll('.edit-main-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.editMain(e.target));
            });
            
            document.querySelectorAll('.toggle-main-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.toggleMain(e.target.dataset.id));
            });
            
            document.querySelectorAll('.delete-main-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteMain(e.target.dataset.id, e.target.dataset.name));
            });
            
        } catch (error) {
            console.error('Error loading mains list:', error);
            this.elements.mainsList.innerHTML = '<div class="error">Error loading mains list</div>';
        }
    }

    async loadGanttChart() {
        try {
            const main = this.elements.ganttMain.value;
            const startDate = this.elements.ganttStartDate.value;
            const endDate = this.elements.ganttEndDate.value;
            
            const response = await fetch(`/api/admin/gantt-data?main=${main}&startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();
            
            this.displayGanttChart(data, startDate, endDate);
            
        } catch (error) {
            console.error('Error loading Gantt chart:', error);
            this.elements.ganttContainer.innerHTML = '<div class="no-data">Error loading Gantt chart data</div>';
        }
    }

    displayGanttChart(data, startDate, endDate) {
        if (data.length === 0) {
            this.elements.ganttContainer.innerHTML = '<div class="no-data">No attendance data found for the selected period</div>';
            return;
        }
        
        // Group data by person
        const peopleData = {};
        data.forEach(record => {
            const key = `${record.name} (${record.main})`;
            if (!peopleData[key]) {
                peopleData[key] = {};
            }
            peopleData[key][record.date] = true;
        });
        
        // Generate date range
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }
        
        // Create Gantt chart HTML
        let html = `
            <div class="gantt-chart">
                <div class="gantt-header">
                    <div class="gantt-name">Name (Main)</div>
                    <div class="gantt-timeline">
                        ${dates.map(date => `<div class="gantt-day" title="${new Date(date).toDateString()}"></div>`).join('')}
                    </div>
                </div>
        `;
        
        Object.keys(peopleData).forEach(person => {
            html += `
                <div class="gantt-row">
                    <div class="gantt-person">${person}</div>
                    <div class="gantt-days">
                        ${dates.map(date => `
                            <div class="gantt-day">
                                ${peopleData[person][date] ? '<div class="gantt-attendance" title="Present"></div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.elements.ganttContainer.innerHTML = html;
    }

    exportChart(chartName) {
        if (!this.charts[chartName]) {
            alert('Chart not available for export');
            return;
        }
        
        const chart = this.charts[chartName];
        const url = chart.toBase64Image();
        
        // Create download link
        const link = document.createElement('a');
        link.download = `${chartName}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = url;
        link.click();
    }

    async exportToPDF() {
        try {
            const selectedMains = Array.from(this.elements.exportMains.selectedOptions).map(opt => opt.value);
            const startDate = this.elements.exportStartDate.value;
            const endDate = this.elements.exportEndDate.value;
            
            const mainsParam = selectedMains.includes('all') ? 'all' : selectedMains.join(',');
            
            const response = await fetch(`/api/admin/export-data?mains=${mainsParam}&startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();
            
            // Use the PDF export utility
            if (window.PDFExporter) {
                window.PDFExporter.exportAttendanceData(data, {
                    startDate,
                    endDate,
                    mains: selectedMains
                });
            } else {
                alert('PDF export functionality not available');
            }
            
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Failed to export data to PDF');
        }
    }

    exportGanttChart() {
        const ganttElement = this.elements.ganttContainer.querySelector('.gantt-chart');
        if (!ganttElement) {
            alert('No Gantt chart to export');
            return;
        }
        
        // You would implement screenshot or HTML-to-PDF conversion here
        // For now, we'll show an alert
        alert('Gantt chart export functionality would be implemented here');
    }

    // Setup edit attendance modal functionality
    setupEditAttendanceModal() {
        const modal = document.getElementById('editAttendanceModal');
        const closeBtn = document.getElementById('editModalClose');
        const cancelBtn = document.getElementById('editCancelBtn');
        const saveBtn = document.getElementById('editSaveBtn');

        // Close modal events
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => this.closeEditModal());
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditModal();
            }
        });

        // Save changes
        saveBtn.addEventListener('click', () => this.saveAttendanceChanges());

        // Load mains for edit form
        this.loadMainsForEdit();
    }

    async loadMainsForEdit() {
        try {
            const response = await fetch('/api/attendance/mains');
            if (!response.ok) throw new Error('Failed to load mains');
            
            const mains = await response.json();
            const editMainSelect = document.getElementById('editMain');
            
            editMainSelect.innerHTML = '<option value="">Select main...</option>';
            mains.forEach(main => {
                const option = document.createElement('option');
                option.value = main.name;
                option.textContent = main.display_name;
                editMainSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading mains for edit:', error);
        }
    }

    async editAttendanceRecord(recordId) {
        try {
            // Get current record data
            const currentRecords = await this.getCurrentAttendanceRecords();
            const record = currentRecords.find(r => r.id === recordId);
            
            if (!record) {
                await this.modal.alert('Record not found', 'Error');
                return;
            }

            // Populate edit form
            document.getElementById('editRecordId').value = record.id;
            document.getElementById('editName').value = record.name;
            document.getElementById('editMain').value = record.main;
            document.getElementById('editIsCustomTime').checked = record.is_custom_time;
            
            // Format datetime for input
            const loginTime = new Date(record.login_time);
            const formattedTime = new Date(loginTime.getTime() - loginTime.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            document.getElementById('editLoginTime').value = formattedTime;

            // Show modal
            document.getElementById('editAttendanceModal').style.display = 'flex';
            
        } catch (error) {
            console.error('Error editing attendance record:', error);
            await this.modal.alert('Failed to load record for editing', 'Error');
        }
    }

    async getCurrentAttendanceRecords() {
        const main = this.elements.mainFilter.value;
        const date = this.elements.attendanceDate.value;
        
        let url = `/api/admin/main-attendance/${main || 'all'}`;
        if (date) {
            url += `?date=${date}`;
        }
        
        const response = await fetch(url);
        return await response.json();
    }

    closeEditModal() {
        document.getElementById('editAttendanceModal').style.display = 'none';
        document.getElementById('editAttendanceForm').reset();
    }

    async saveAttendanceChanges() {
        try {
            const form = document.getElementById('editAttendanceForm');
            const formData = new FormData(form);
            
            const recordId = formData.get('recordId');
            const data = {
                name: formData.get('name').trim(),
                main: formData.get('main'),
                login_time: new Date(formData.get('loginTime')).toISOString(),
                is_custom_time: formData.has('isCustomTime')
            };

            if (!data.name || !data.main || !data.login_time) {
                await this.modal.alert('Please fill in all required fields', 'Validation Error');
                return;
            }

            const response = await fetch(`/api/admin/attendance/${recordId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update record');
            }

            await this.modal.alert('Attendance record updated successfully', 'Success');
            this.closeEditModal();
            this.loadAttendanceRecords(); // Refresh the table
            
        } catch (error) {
            console.error('Error saving attendance changes:', error);
            await this.modal.alert(error.message || 'Failed to update attendance record', 'Error');
        }
    }

    async deleteAttendanceRecord(recordId, recordName) {
        try {
            const confirmed = await this.modal.confirm(
                `Are you sure you want to delete the attendance record for "${recordName}"?`,
                'Confirm Deletion'
            );

            if (!confirmed) {
                return;
            }

            const response = await fetch(`/api/admin/attendance/${recordId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete record');
            }

            await this.modal.alert('Attendance record deleted successfully', 'Success');
            this.loadAttendanceRecords(); // Refresh the table
            
        } catch (error) {
            console.error('Error deleting attendance record:', error);
            await this.modal.alert(error.message || 'Failed to delete attendance record', 'Error');
        }
    }

    // Attendance Form Management
    async showAttendanceForm(recordId = null) {
        try {
            console.log('showAttendanceForm called with recordId:', recordId); // Debug
            
            // Load mains for the dropdown
            await this.loadMainsForForm();
            
            if (recordId) {
                // Edit mode
                this.elements.attendanceFormTitle.textContent = 'Edit Attendance Record';
                this.elements.submitAttendanceBtn.textContent = 'Update Record';
                await this.loadAttendanceForEdit(recordId);
            } else {
                // Create mode
                this.elements.attendanceFormTitle.textContent = 'Create New Attendance Record';
                this.elements.submitAttendanceBtn.textContent = 'Create Record';
                this.elements.attendanceForm.reset();
                this.elements.editAttendanceId.value = '';
                
                // Set current date/time as default
                const now = new Date();
                // For datetime-local input, we need YYYY-MM-DDTHH:MM format
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                
                const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                console.log('Setting default datetime:', localDateTime);
                this.elements.attendanceDateTime.value = localDateTime;
            }
            
            this.elements.attendanceFormPanel.style.display = 'block';
            this.elements.attendanceFormPanel.classList.add('show');
            this.elements.attendanceName.focus();
            
        } catch (error) {
            console.error('Error showing attendance form:', error);
            await this.modal.alert('Error loading form. Please try again.', 'Error');
        }
    }

    hideAttendanceForm() {
        this.elements.attendanceFormPanel.style.display = 'none';
        this.elements.attendanceFormPanel.classList.remove('show');
        this.elements.attendanceForm.reset();
        this.elements.editAttendanceId.value = '';
    }

    async loadMainsForForm() {
        try {
            const response = await fetch('/api/attendance/mains');
            if (!response.ok) throw new Error('Failed to load mains');
            
            const mains = await response.json();
            
            // Clear existing options
            this.elements.attendanceMain.innerHTML = '<option value="">Select Main</option>';
            
            // Add mains to select
            mains.forEach(main => {
                const option = document.createElement('option');
                option.value = main.name;
                option.textContent = main.display_name;
                this.elements.attendanceMain.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading mains for form:', error);
            throw error;
        }
    }

    async loadAttendanceForEdit(recordId) {
        try {
            // For now, we'll get the record from the displayed table
            // In a real implementation, you might want to fetch from API
            const tableRows = this.elements.attendanceTableBody.querySelectorAll('tr');
            let recordData = null;
            
            tableRows.forEach(row => {
                const editBtn = row.querySelector('.edit-btn');
                if (editBtn && editBtn.onclick.toString().includes(recordId)) {
                    const cells = row.querySelectorAll('td');
                    recordData = {
                        id: recordId,
                        name: cells[0].textContent,
                        main: cells[1].textContent,
                        login_time: cells[2].textContent,
                        is_custom_time: cells[3].textContent === 'Custom'
                    };
                }
            });
            
            if (recordData) {
                this.elements.editAttendanceId.value = recordData.id;
                this.elements.attendanceName.value = recordData.name;
                this.elements.attendanceMain.value = recordData.main;
                this.elements.attendanceTimeType.value = recordData.is_custom_time ? 'custom' : 'system';
                
                // Parse and set the date/time
                const dateTime = new Date(recordData.login_time);
                console.log('Original datetime from record:', recordData.login_time);
                console.log('Parsed datetime object:', dateTime);
                
                // Format for datetime-local input (YYYY-MM-DDTHH:MM)
                const year = dateTime.getFullYear();
                const month = String(dateTime.getMonth() + 1).padStart(2, '0');
                const day = String(dateTime.getDate()).padStart(2, '0');
                const hours = String(dateTime.getHours()).padStart(2, '0');
                const minutes = String(dateTime.getMinutes()).padStart(2, '0');
                
                const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                console.log('Formatted datetime for input:', formattedDateTime);
                this.elements.attendanceDateTime.value = formattedDateTime;
            }
            
        } catch (error) {
            console.error('Error loading attendance for edit:', error);
            throw error;
        }
    }

    async handleAttendanceSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(this.elements.attendanceForm);
            const rawLoginTime = formData.get('loginTime');
            const rawTimeType = formData.get('timeType');
            
            console.log('Form submission debug:');
            console.log('Raw login time:', rawLoginTime);
            console.log('Raw time type:', rawTimeType);
            
            // Better date handling - datetime-local gives us a string in YYYY-MM-DDTHH:mm format
            let loginTimeISO;
            if (rawLoginTime) {
                // If the datetime-local doesn't include seconds, add them
                const dateTimeString = rawLoginTime.includes(':') && rawLoginTime.split(':').length === 2 
                    ? rawLoginTime + ':00' 
                    : rawLoginTime;
                
                // Create date object and ensure it's valid
                const dateObj = new Date(dateTimeString);
                
                console.log('Date object created:', dateObj);
                console.log('Is valid date:', !isNaN(dateObj.getTime()));
                
                if (isNaN(dateObj.getTime())) {
                    await this.modal.alert('Invalid date/time format. Please select a valid date and time.', 'Validation Error');
                    return;
                }
                
                loginTimeISO = dateObj.toISOString();
            } else {
                await this.modal.alert('Please select a date and time.', 'Validation Error');
                return;
            }
            
            const attendanceData = {
                name: formData.get('name').trim(),
                main: formData.get('main'),
                loginTime: loginTimeISO,
                isCustomTime: rawTimeType === 'custom'
            };
            
            console.log('Final attendance data:', attendanceData);
            
            // Validation
            if (!attendanceData.name || !attendanceData.main || !attendanceData.loginTime) {
                await this.modal.alert('Please fill in all required fields with valid data', 'Validation Error');
                return;
            }
            
            const editId = this.elements.editAttendanceId.value;
            const isEditing = editId !== '';
            
            const url = isEditing 
                ? `/api/admin/attendance/${editId}`
                : '/api/admin/attendance';
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attendanceData)
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const result = await response.json();
            console.log('Response body:', result);
            
            if (response.ok) {
                await this.modal.alert(
                    isEditing ? 'Attendance record updated successfully!' : 'Attendance record created successfully!',
                    'Success'
                );
                this.hideAttendanceForm();
                await this.loadAttendanceRecords(); // Refresh the table
            } else {
                console.error('Server error response:', result);
                if (result.error && (result.error.includes('duplicate') || result.error.includes('unique constraint'))) {
                    await this.modal.alert(
                        'This person has already logged in today for this main. Duplicate entries are not allowed.',
                        'Duplicate Entry'
                    );
                } else {
                    await this.modal.alert(
                        result.error || `Failed to ${isEditing ? 'update' : 'create'} attendance record`,
                        'Error'
                    );
                }
            }
            
        } catch (error) {
            console.error('Error in handleAttendanceSubmit:', error);
            await this.modal.alert('An error occurred. Please try again.', 'Error');
        }
    }

    ensureCreateButtonExists() {
        const controlsPanel = document.querySelector('#attendance .controls-panel');
        let createBtn = document.getElementById('createAttendanceBtn');
        
        if (!createBtn && controlsPanel) {
            console.log('Create button not found, adding it dynamically...');
            createBtn = document.createElement('button');
            createBtn.id = 'createAttendanceBtn';
            createBtn.className = 'action-btn create-btn';
            createBtn.textContent = 'Create New Record';
            
            // Apply proper styling
            createBtn.style.cssText = `
                background: linear-gradient(135deg, #27ae60, #2ecc71) !important;
                color: white !important;
                border: 2px solid #229954 !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                font-family: var(--font-heading) !important;
                font-weight: 600 !important;
                font-size: 14px !important;
                margin-left: 12px !important;
                min-width: 160px !important;
                height: 44px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                line-height: 1 !important;
                box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3) !important;
            `;
            
            // Add click event
            createBtn.addEventListener('click', () => {
                console.log('Dynamically created button clicked!');
                this.showAttendanceForm();
            });
            
            controlsPanel.appendChild(createBtn);
            console.log('Create button added dynamically');
            
            // Update elements reference
            this.elements.createAttendanceBtn = createBtn;
        }
        
        return createBtn;
    }

    // ...existing code...
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
    window.adminPanel.setupEditAttendanceModal();
    
    // Add window resize handler for responsive charts
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.adminPanel.charts.dailyChart) {
                window.adminPanel.charts.dailyChart.resize();
            }
            if (window.adminPanel.charts.pieChart) {
                window.adminPanel.charts.pieChart.resize();
            }
        }, 250);
    });
});

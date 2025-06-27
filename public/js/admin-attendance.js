// this modal management section is shared with the administrator.
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
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
        
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
        } catch (error) {
            console.error('Error showing modal:', error);
            return Promise.resolve(window.alert(message));
        }
    }
    
    hide() {
        try {
            this.modal.style.display = 'none';
        } catch (error) {
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

// Admin Attendance Form JavaScript (NO TIME RESTRICTIONS)
class AdminAttendanceForm {
    constructor() {
        this.form = document.getElementById('attendanceForm');
        this.nameInput = document.getElementById('studentName');
        this.mainSelect = document.getElementById('mainSelect');
        this.adminPasswordInput = document.getElementById('adminPassword');
        this.systemTimeRadio = document.getElementById('systemTime');
        this.customTimeRadio = document.getElementById('customTime');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.customTimeInput = document.getElementById('customTimeInput');
        this.customDateTime = document.getElementById('customDateTime');
        this.submitBtn = document.getElementById('submitBtn');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
        this.modal = new ModalManager();
        
        this.init();
    }

    init() {
        this.loadMains();
        this.setupEventListeners();
        this.updateCurrentTime();
        this.setDefaultCustomTime();
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
        
        // NO TIME RESTRICTIONS FOR ADMIN - Form is always available
        console.log('Admin Attendance Form - No time restrictions applied');
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Time option changes
        this.systemTimeRadio.addEventListener('change', () => this.toggleTimeInput());
        this.customTimeRadio.addEventListener('change', () => this.toggleTimeInput());
        
        // Input validation
        this.nameInput.addEventListener('blur', () => this.validateName());
        this.mainSelect.addEventListener('change', () => this.validateMain());
        this.adminPasswordInput.addEventListener('blur', () => this.validatePassword());
        this.customDateTime.addEventListener('change', () => this.validateCustomTime());
        
        // Clear messages when user starts typing
        this.nameInput.addEventListener('input', () => this.clearMessages());
        this.mainSelect.addEventListener('change', () => this.clearMessages());
        this.adminPasswordInput.addEventListener('input', () => this.clearMessages());
        
        // Clear password field when page loads for security
        this.adminPasswordInput.value = '';
    }

    async loadMains() {
        try {
            console.log('Loading mains for admin attendance form...');
            const response = await fetch('/api/attendance/mains');
            console.log('Mains response:', response);
            
            if (!response.ok) {
                throw new Error('Failed to load mains');
            }
            
            const mains = await response.json();
            console.log('Mains data received:', mains);
            
            // Clear existing options (keep the placeholder)
            this.mainSelect.innerHTML = '<option value="">Select main</option>';
            
            // Add all mains (already filtered for active in the API)
            mains.forEach(main => {
                console.log('Adding main:', main);
                const option = document.createElement('option');
                option.value = main.name;
                option.textContent = main.display_name;
                this.mainSelect.appendChild(option);
            });
            
            console.log('Mains loaded successfully. Total options:', this.mainSelect.options.length);
            
        } 
        catch (error) {
            console.error('Error loading mains:', error);
            await this.modal.alert('Failed to load available mains. Please refresh the page.', 'Error');
        }
    }

    updateCurrentTime() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Manila',
            timeZoneName: 'short'
        };
        
        this.currentTimeDisplay.textContent = `Current time: ${now.toLocaleString('en-US', options)}`;
    }

    setDefaultCustomTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        this.customDateTime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    toggleTimeInput() {
        try {
            if (this.customTimeRadio.checked) {
                this.customTimeInput.style.display = 'block';
                this.customDateTime.required = true;
            } 
            else {
                this.customTimeInput.style.display = 'none';
                this.customDateTime.required = false;
            }
            this.clearMessages();
        } 
        catch (error) {
            console.error('Error toggling time input:', error);
        }
    }

    validateName() {
        try {
            const name = this.nameInput.value.trim();
            const nameError = document.getElementById('nameError');
            
            if (!name) {
                nameError.textContent = 'Please enter a name';
                nameError.style.display = 'block';
                return false;
            }
            
            if (name.length < 2) {
                nameError.textContent = 'Name must be at least 2 characters';
                nameError.style.display = 'block';
                return false;
            }
            
            nameError.style.display = 'none';
            return true;
        } 
        catch (error) {
            console.error('Error validating name:', error);
            return false;
        }
    }

    validateMain() {
        try {
            const main = this.mainSelect.value;
            const mainError = document.getElementById('mainError');
            
            if (!main) {
                mainError.textContent = 'Please select a main';
                mainError.style.display = 'block';
                return false;
            }
            
            mainError.style.display = 'none';
            return true;
        } 
        catch (error) {
            console.error('Error validating main selection:', error);
            return false;
        }
    }

    validatePassword() {
        try {
            const password = this.adminPasswordInput.value;
            const passwordError = document.getElementById('passwordError');
            
            if (!password) {
                passwordError.textContent = 'Admin password is required';
                passwordError.style.display = 'block';
                return false;
            }
            
            // We'll verify the password with the server during submission
            // For now, just check that it's not empty
            passwordError.style.display = 'none';
            return true;
        } 
        catch (error) {
            console.error('Error validating admin password:', error);
            return false;
        }
    }

    validateCustomTime() {
        if (!this.customTimeRadio.checked) {
            return true;
        }
        
        const customTime = this.customDateTime.value;
        const timeError = document.getElementById('timeError');
        
        if (!customTime) {
            timeError.textContent = 'Please select a custom time';
            timeError.style.display = 'block';
            return false;
        }
        
        const selectedTime = new Date(customTime);
        const now = new Date();
        
        // Allow future times for admin (unlike regular form)
        if (selectedTime > now) {
            timeError.textContent = 'Note: You are setting a future time for attendance';
            timeError.style.display = 'block';
            timeError.style.color = '#ff9500'; // Orange warning instead of red error
            return true; // Still valid for admin
        }
        
        // Check if time is too far in the past (more than 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        if (selectedTime < thirtyDaysAgo) {
            timeError.textContent = 'Please select a time within the last 30 days';
            timeError.style.display = 'block';
            timeError.style.color = '#cc0000';
            return false;
        }
        
        timeError.style.display = 'none';
        return true;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        // Clear previous messages
        this.clearMessages();
        
        // Validate all fields
        const isNameValid = this.validateName();
        const isMainValid = this.validateMain();
        const isPasswordValid = this.validatePassword();
        const isTimeValid = this.validateCustomTime();
        
        if (!isNameValid || !isMainValid || !isPasswordValid || !isTimeValid) {
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Prepare form data
            const formData = new FormData(this.form);
            const name = formData.get('name').trim();
            const main = formData.get('main');
            const adminPassword = formData.get('adminPassword');
            const timeOption = formData.get('timeOption');
            
            let loginTime;
            let isCustomTime = false;
            
            if (timeOption === 'custom') {
                loginTime = new Date(formData.get('customTime')).toISOString();
                isCustomTime = true;
            } 
            else {
                loginTime = new Date().toISOString();
                isCustomTime = false;
            }
            
            // Normalize name for consistency
            const normalizedName = this.normalizeName(name);
            
            // Submit to admin endpoint (with password verification)
            const response = await fetch('/api/admin/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: normalizedName,
                    main: main,
                    loginTime: loginTime,
                    isCustomTime: isCustomTime,
                    adminPassword: adminPassword
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showSuccessMessage();
                this.form.reset();
                this.setDefaultCustomTime();
                this.toggleTimeInput(); // Reset time input display
                // Clear password field for security
                this.adminPasswordInput.value = '';
            } 
            else {
                if (response.status === 401) {
                    // Password error
                    const passwordError = document.getElementById('passwordError');
                    passwordError.textContent = result.error || 'Invalid admin password';
                    passwordError.style.display = 'block';
                    this.adminPasswordInput.focus();
                    this.adminPasswordInput.select();
                } 
                else if (result.error && (result.error.includes('duplicate') || result.error.includes('unique constraint'))) {
                    await this.modal.alert(
                        'This person has already logged attendance today for this main. Duplicate entries are not allowed.',
                        'Duplicate Entry'
                    );
                } 
                else {
                    await this.modal.alert(
                        result.error || 'Failed to record attendance. Please try again.',
                        'Error'
                    );
                }
            }
            
        } 
        catch (error) {
            console.error('Submission error:', error);
            await this.modal.alert(
                'Network error. Please check your connection and try again.',
                'Connection Error'
            );
        } 
        finally {
            this.setLoadingState(false);
        }
    }

    normalizeName(name) {
        try {
            return name
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
                .trim();
        } 
        catch (error) {
            console.error('Error normalizing name:', error);
            return name;
        }
    }

    setLoadingState(isLoading) {
        try {
            const btnText = this.submitBtn.querySelector('.btn-text');
            const btnLoader = this.submitBtn.querySelector('.btn-loader');

            if (isLoading) {
                btnText.style.display = 'none';
                btnLoader.style.display = 'block';
                this.submitBtn.disabled = true;
            } 
            else {
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
                this.submitBtn.disabled = false;
            }
        } 
        catch (error) {
            console.error('Error setting loading state:', error);
        }
    }

    showSuccessMessage() {
        try {
            this.successMessage.style.display = 'flex';
            setTimeout(() => {
                this.successMessage.style.display = 'none';
            }, 5000);
        } 
        catch (error) {
            console.error('Error showing success message:', error);
        }
    }

    showErrorMessage(message) {
        try {
            const errorText = this.errorMessage.querySelector('.error-text');
            errorText.textContent = message;
            this.errorMessage.style.display = 'flex';

            setTimeout(() => {
                this.errorMessage.style.display = 'none';
            }, 8000);
        } 
        catch (error) {
            console.error('Error showing error message:', error);
        }
    }

    clearMessages() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
        
        // Clear field-specific errors
        document.querySelectorAll('.form-error').forEach(error => {
            error.style.display = 'none';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminAttendanceForm();
});

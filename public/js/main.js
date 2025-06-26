// Modal Manager Class (shared with admin)
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
            } else {
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

// Main Attendance Form JavaScript
class AttendanceForm {
    constructor() {
        this.form = document.getElementById('attendanceForm');
        this.nameInput = document.getElementById('studentName');
        this.mainSelect = document.getElementById('mainSelect');
        this.systemTimeRadio = document.getElementById('systemTime');
        this.customTimeRadio = document.getElementById('customTime');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.customTimeInput = document.getElementById('customTimeInput');
        this.customDateTime = document.getElementById('customDateTime');
        this.submitBtn = document.getElementById('submitBtn');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
        this.modal = new ModalManager();
        this.formClosedMessage = null;
        
        this.init();
    }

    init() {
        this.loadMains();
        this.updateCurrentTime();
        this.setupEventListeners();
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
        // Check form open/close every minute
        this.checkFormOpenClose();
        setInterval(() => this.checkFormOpenClose(), 60000);
    }

    checkFormOpenClose() {
        // Get current time in GMT+8
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const gmt8 = new Date(utc + (8 * 60 * 60 * 1000));
        const hour = gmt8.getHours();
        // Form is open from 6:00 to 20:59 (6am to before 9pm)
        const isOpen = hour >= 6 && hour < 21;
        if (!isOpen) {
            this.form.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
            if (!this.formClosedMessage) {
                this.formClosedMessage = document.createElement('div');
                this.formClosedMessage.className = 'error-message';
                this.formClosedMessage.style.marginTop = '2rem';
                this.formClosedMessage.innerHTML = '<div class="error-icon">⏰</div><div class="error-text">Attendance is only open from 6:00am to 9:00pm (GMT+8). Please come back during open hours.</div>';
                this.form.parentNode.insertBefore(this.formClosedMessage, this.form.nextSibling);
            }
            this.formClosedMessage.style.display = 'flex';
        } else {
            this.form.querySelectorAll('input, select, button').forEach(el => el.disabled = false);
            if (this.formClosedMessage) this.formClosedMessage.style.display = 'none';
        }
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
        this.customDateTime.addEventListener('change', () => this.validateCustomTime());
        
        // Clear messages on input
        this.nameInput.addEventListener('input', () => this.clearMessages());
        this.mainSelect.addEventListener('change', () => this.clearMessages());
    }

    async loadMains() {
        try {
            const response = await fetch('/api/attendance/mains');
            if (!response.ok) throw new Error('Failed to load mains');
            
            const mains = await response.json();
            
            // Clear existing options except the first one
            this.mainSelect.innerHTML = '<option value="">Select your main</option>';
            
            // Add mains to select
            mains.forEach(main => {
                const option = document.createElement('option');
                option.value = main.name;
                option.textContent = main.display_name;
                this.mainSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading mains:', error);
            this.showError('Failed to load available mains. Please refresh the page.');
        }
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        this.currentTimeDisplay.textContent = `Current Time: ${timeString}`;
    }

    toggleTimeInput() {
        if (this.customTimeRadio.checked) {
            this.customTimeInput.style.display = 'block';
            this.customDateTime.required = true;
            
            // Set default to current time
            const now = new Date();
            const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            this.customDateTime.value = localISOTime;
        } else {
            this.customTimeInput.style.display = 'none';
            this.customDateTime.required = false;
            this.customDateTime.value = '';
        }
        this.clearFieldError('timeError');
    }

    validateName() {
        const name = this.nameInput.value.trim();
        if (!name) {
            this.showFieldError('nameError', 'Name is required');
            this.nameInput.classList.add('error');
            return false;
        }
        if (name.length < 2) {
            this.showFieldError('nameError', 'Name must be at least 2 characters long');
            this.nameInput.classList.add('error');
            return false;
        }
        if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
            this.showFieldError('nameError', 'Name can only contain letters, spaces, hyphens, apostrophes, and periods');
            this.nameInput.classList.add('error');
            return false;
        }
        
        this.clearFieldError('nameError');
        this.nameInput.classList.remove('error');
        return true;
    }

    validateMain() {
        if (!this.mainSelect.value) {
            this.showFieldError('mainError', 'Please select your main');
            this.mainSelect.classList.add('error');
            return false;
        }
        
        this.clearFieldError('mainError');
        this.mainSelect.classList.remove('error');
        return true;
    }

    validateCustomTime() {
        if (this.customTimeRadio.checked && !this.customDateTime.value) {
            this.showFieldError('timeError', 'Please select a custom time');
            return false;
        }
        
        if (this.customTimeRadio.checked) {
            const selectedTime = new Date(this.customDateTime.value);
            const now = new Date();
            
            // Allow times up to 1 hour in the future
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
            
            if (selectedTime > oneHourFromNow) {
                this.showFieldError('timeError', 'Custom time cannot be more than 1 hour in the future');
                return false;
            }
        }
        
        this.clearFieldError('timeError');
        return true;
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearFieldError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        errorElement.style.display = 'none';
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        // Validate all fields
        const isNameValid = this.validateName();
        const isMainValid = this.validateMain();
        const isTimeValid = this.validateCustomTime();
        
        if (!isNameValid || !isMainValid || !isTimeValid) {
            return;
        }
        
        // Prepare submission data
        const formData = {
            name: this.nameInput.value.trim(),
            main: this.mainSelect.value,
            loginTime: this.systemTimeRadio.checked 
                ? new Date().toISOString() 
                : new Date(this.customDateTime.value).toISOString(),
            isCustomTime: this.customTimeRadio.checked
        };
        
        await this.submitAttendance(formData);
    }

    async submitAttendance(data) {
        this.setLoading(true);
        this.clearMessages();
        
        try {
            const response = await fetch('/api/attendance/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit attendance');
            }
            
            await this.modal.alert('Attendance recorded successfully!', 'Success');
            this.resetForm();
            
        } catch (error) {
            console.error('Submission error:', error);
            
            if (error.message.includes('Duplicate attendance')) {
                await this.modal.alert(
                    'You have already logged in today for this main. Duplicate entries are not allowed.',
                    'Duplicate Entry'
                );
            } else if (error.name === 'TypeError') {
                await this.modal.alert(
                    'Network error. Please check your connection and try again.',
                    'Connection Error'
                );
            } else {
                await this.modal.alert(
                    error.message || 'Failed to record attendance. Please try again.',
                    'Error'
                );
            }
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        const btnText = this.submitBtn.querySelector('.btn-text');
        const btnLoader = this.submitBtn.querySelector('.btn-loader');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            this.submitBtn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            this.submitBtn.disabled = false;
        }
    }

    showSuccess(message) {
        this.successMessage.querySelector('.success-text').textContent = message;
        this.successMessage.style.display = 'flex';
        this.errorMessage.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.successMessage.style.display = 'none';
        }, 5000);
    }

    showError(message) {
        this.errorMessage.querySelector('.error-text').textContent = message;
        this.errorMessage.style.display = 'flex';
        this.successMessage.style.display = 'none';
    }

    clearMessages() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }

    resetForm() {
        this.form.reset();
        this.systemTimeRadio.checked = true;
        this.toggleTimeInput();
        
        // Clear all error states
        this.nameInput.classList.remove('error');
        this.mainSelect.classList.remove('error');
        this.clearFieldError('nameError');
        this.clearFieldError('mainError');
        this.clearFieldError('timeError');
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AttendanceForm();
});

// Utility functions for date/time formatting
window.formatDateTime = function(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

window.formatDate = function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Form handling JavaScript for Excellence Educational Institute

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    initFormSubmission();
    initFormStorage();
    
    console.log('Form handlers initialized');
});

// Initialize form validation
function initFormValidation() {
    const forms = document.querySelectorAll('form[id]');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
            
            // Add required field indicators
            if (input.hasAttribute('required')) {
                addRequiredIndicator(input);
            }
        });
        
        // Form submission validation
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                submitForm(form);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required`;
    }
    
    // Type-specific validation
    if (value && isValid) {
        switch (fieldType) {
            case 'email':
                if (!utils.validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'tel':
                if (!utils.validatePhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 10-digit phone number';
                }
                break;
                
            case 'date':
                if (!validateDate(value, fieldName)) {
                    isValid = false;
                    errorMessage = getDateErrorMessage(fieldName);
                }
                break;
                
            case 'number':
                const min = field.getAttribute('min');
                const max = field.getAttribute('max');
                const numValue = parseFloat(value);
                
                if (min && numValue < parseFloat(min)) {
                    isValid = false;
                    errorMessage = `Value must be at least ${min}`;
                }
                if (max && numValue > parseFloat(max)) {
                    isValid = false;
                    errorMessage = `Value must be at most ${max}`;
                }
                break;
        }
        
        // Special field validations
        if (fieldName === 'pincode' && !/^\d{6}$/.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid 6-digit pincode';
        }
        
        if (fieldName === 'percentage' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
            isValid = false;
            errorMessage = 'Percentage must be between 0 and 100';
        }
    }
    
    // Show/hide error
    if (isValid) {
        showFieldSuccess(field);
    } else {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Validate entire form
function validateForm(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    let isFormValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    // Check checkbox agreements
    const requiredCheckboxes = form.querySelectorAll('input[type="checkbox"][required]');
    requiredCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            showFieldError(checkbox, 'Please accept the terms and conditions');
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

// Submit form
function submitForm(form) {
    const formId = form.id;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    showFormLoading(form);
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        handleFormSubmission(formId, data, form);
    }, 2000);
}

// Handle form submission based on form type
function handleFormSubmission(formId, data, form) {
    let successMessage = '';
    let redirectUrl = '';
    
    switch (formId) {
        case 'quickEnquiryForm':
            successMessage = 'Thank you for your enquiry! We will contact you within 24 hours.';
            console.log('Quick Enquiry submitted:', data);
            break;
            
        case 'admissionForm':
            successMessage = 'Your admission application has been submitted successfully! You will receive a confirmation email shortly.';
            redirectUrl = 'contact.html';
            console.log('Admission form submitted:', data);
            break;
            
        case 'contactForm':
            successMessage = 'Thank you for contacting us! We will respond to your message within 4 hours.';
            console.log('Contact form submitted:', data);
            break;
            
        case 'newsletterForm':
            successMessage = 'Successfully subscribed to our newsletter!';
            console.log('Newsletter subscription:', data);
            break;
            
        default:
            successMessage = 'Form submitted successfully!';
            console.log('Form submitted:', data);
    }
    
    // Hide loading state
    hideFormLoading(form);
    
    // Show success message
    showFormSuccess(form, successMessage);
    
    // Clear form data from storage
    clearFormStorage(formId);
    
    // Reset form
    form.reset();
    
    // Redirect if specified
    if (redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 3000);
    }
}

// Form storage for auto-save
function initFormStorage() {
    const forms = document.querySelectorAll('form[id]');
    
    forms.forEach(form => {
        const formId = form.id;
        
        // Load saved data
        loadFormData(form);
        
        // Save data on input
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                saveFormData(formId, form);
            });
        });
    });
}

// Save form data to localStorage
function saveFormData(formId, form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Don't save sensitive data
    delete data.password;
    delete data.confirmPassword;
    
    localStorage.setItem(`form_${formId}`, JSON.stringify(data));
}

// Load form data from localStorage
function loadFormData(form) {
    const formId = form.id;
    const savedData = localStorage.getItem(`form_${formId}`);
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && data[key]) {
                    field.value = data[key];
                }
            });
        } catch (e) {
            console.warn('Error loading form data:', e);
        }
    }
}

// Clear form data from localStorage
function clearFormStorage(formId) {
    localStorage.removeItem(`form_${formId}`);
}

// UI Helper Functions

function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.name;
}

function addRequiredIndicator(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label && !label.textContent.includes('*')) {
        label.innerHTML += ' <span class="required">*</span>';
    }
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.classList.add('field-error');
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function showFieldSuccess(field) {
    clearFieldError(field);
    field.classList.remove('error');
    field.classList.add('success');
}

function clearFieldError(field) {
    field.classList.remove('error', 'success');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }
}

function hideFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        // Restore original button text
        const originalText = getOriginalButtonText(form.id);
        submitButton.innerHTML = originalText;
    }
}

function getOriginalButtonText(formId) {
    const buttonTexts = {
        'quickEnquiryForm': '<i class="fas fa-paper-plane"></i> Submit Enquiry',
        'admissionForm': '<i class="fas fa-paper-plane"></i> Submit Application',
        'contactForm': '<i class="fas fa-paper-plane"></i> Send Message',
        'newsletterForm': 'Subscribe'
    };
    
    return buttonTexts[formId] || 'Submit';
}

function showFormSuccess(form, message) {
    // Remove existing success message
    const existingMessage = form.parentNode.querySelector('.form-success');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const successElement = document.createElement('div');
    successElement.classList.add('form-success');
    successElement.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    form.parentNode.insertBefore(successElement, form);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.remove();
        }
    }, 10000);
}

// Validation helper functions
function validateDate(dateString, fieldName) {
    const date = new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
        return false;
    }
    
    // Date of birth should be in the past
    if (fieldName === 'dateOfBirth') {
        return date < now;
    }
    
    // Start date should be in the future
    if (fieldName === 'startDate') {
        return date >= now;
    }
    
    return true;
}

function getDateErrorMessage(fieldName) {
    switch (fieldName) {
        case 'dateOfBirth':
            return 'Please enter a valid date of birth';
        case 'startDate':
            return 'Start date should be in the future';
        default:
            return 'Please enter a valid date';
    }
}

// Phone number formatting
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 10) {
        value = value.substring(0, 10);
        value = value.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    
    input.value = value;
}

// Add phone formatting to phone inputs
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => formatPhoneNumber(input));
    });
});

// Add CSS for form validation styles
const formStyle = document.createElement('style');
formStyle.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: var(--danger-color);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .form-group input.success,
    .form-group select.success,
    .form-group textarea.success {
        border-color: var(--success-color);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .field-error {
        color: var(--danger-color);
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .field-error:before {
        content: "⚠";
        font-weight: bold;
    }
    
    .required {
        color: var(--danger-color);
        font-weight: bold;
    }
    
    .form-success {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        animation: successSlideIn 0.5s ease;
    }
    
    .success-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        text-align: center;
        justify-content: center;
    }
    
    .success-content i {
        font-size: 2rem;
    }
    
    .success-content p {
        margin: 0;
        font-size: 1.1rem;
        color: white;
    }
    
    @keyframes successSlideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

document.head.appendChild(formStyle);

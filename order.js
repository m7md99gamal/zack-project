// Order Form Validation
const orderForm = document.getElementById('orderForm');
const today = new Date().toISOString().split('T')[0];
document.getElementById('deliveryDate').min = today;

// Phone number validation
function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Real-time validation
function setupRealTimeValidation() {
    const inputs = [
        { id: 'fullName', validate: (value) => value.trim().length >= 2 },
        { id: 'phoneNumber', validate: validatePhone },
        { id: 'deliveryAddress', validate: (value) => value.trim().length >= 10 },
        { id: 'city', validate: (value) => value.trim().length >= 2 },
        { id: 'zipCode', validate: (value) => /^\d{5,6}$/.test(value) },
        { id: 'orderDescription', validate: (value) => value.trim().length >= 10 }
    ];

    inputs.forEach(input => {
        const element = document.getElementById(input.id);
        const errorElement = document.getElementById(input.id + 'Error');
        
        if (element && errorElement) {
            element.addEventListener('input', () => {
                const value = element.value.trim();
                
                if (value === '') {
                    errorElement.textContent = '';
                    errorElement.style.color = '#e53e3e';
                } else if (input.validate(value)) {
                    errorElement.textContent = '✓';
                    errorElement.style.color = '#38a169';
                } else {
                    errorElement.textContent = 'Please enter a valid value';
                    errorElement.style.color = '#e53e3e';
                }
            });
        }
    });
}

// Form Submission
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const formData = {
        fullName: document.getElementById('fullName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        deliveryAddress: document.getElementById('deliveryAddress').value,
        city: document.getElementById('city').value,
        zipCode: document.getElementById('zipCode').value,
        category: document.querySelector('input[name="category"]:checked').value,
        orderDescription: document.getElementById('orderDescription').value,
        quantity: document.getElementById('quantity').value,
        weight: document.getElementById('weight').value || 'Not specified',
        specialInstructions: document.getElementById('specialInstructions').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        deliveryTime: document.getElementById('deliveryTime').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        timestamp: new Date().toISOString(),
        orderId: 'ORD' + Date.now()
    };
    
    // Basic validation
    let isValid = true;
    
    if (formData.fullName.trim().length < 2) {
        showError('fullNameError', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!validatePhone(formData.phoneNumber)) {
        showError('phoneNumberError', 'Please enter a valid phone number');
        isValid = false;
    }
    
    if (formData.deliveryAddress.trim().length < 10) {
        showError('deliveryAddressError', 'Please enter a complete address');
        isValid = false;
    }
    
    if (formData.city.trim().length < 2) {
        showError('cityError', 'Please enter a valid city');
        isValid = false;
    }
    
    if (!/^\d{5,6}$/.test(formData.zipCode)) {
        showError('zipCodeError', 'Please enter a valid zip code');
        isValid = false;
    }
    
    if (formData.orderDescription.trim().length < 10) {
        showError('orderDescriptionError', 'Please describe your order in detail');
        isValid = false;
    }
    
    if (!formData.deliveryDate) {
        showError('deliveryDateError', 'Please select a delivery date');
        isValid = false;
    }
    
    if (!formData.deliveryTime) {
        showError('deliveryTimeError', 'Please select a delivery time');
        isValid = false;
    }
    
    if (isValid) {
        // Save to localStorage (in a real app, you would send this to a server)
        saveOrder(formData);
        
        // Show success message and redirect
        alert(`🎉 Order placed successfully!\nYour Order ID: ${formData.orderId}\nYou will be contacted shortly for confirmation.`);
        
        // Reset form
        orderForm.reset();
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});

function saveOrder(orderData) {
    // Get existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('deliveryOrders') || '[]');
    
    // Add new order
    existingOrders.push(orderData);
    
    // Save back to localStorage
    localStorage.setItem('deliveryOrders', JSON.stringify(existingOrders));
    
    console.log('Order saved:', orderData);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#e53e3e';
    }
}

// Initialize real-time validation on page load
document.addEventListener('DOMContentLoaded', () => {
    setupRealTimeValidation();
    
    // Set today's date as min date for delivery
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deliveryDate').min = today;
    document.getElementById('deliveryDate').value = today;
    
    // Set default time to afternoon
    document.getElementById('deliveryTime').value = 'afternoon';
    
    // Update order summary based on category selection
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', updateOrderSummary);
    });
    
    // Update delivery charge based on weight
    const weightInput = document.getElementById('weight');
    weightInput.addEventListener('input', updateOrderSummary);
});

function updateOrderSummary() {
    // Get selected category
    const selectedCategory = document.querySelector('input[name="category"]:checked').value;
    const weight = parseFloat(document.getElementById('weight').value) || 1;
    
    // Base prices
    let serviceFee = 5.00;
    let deliveryCharge = 3.50;
    
    // Adjust based on category
    switch(selectedCategory) {
        case 'parcel':
            deliveryCharge = 5.00 + (weight * 0.5); // $0.50 per kg
            break;
        case 'grocery':
            deliveryCharge = 4.00;
            break;
        case 'food':
            serviceFee = 4.00; // Lower service fee for food
            break;
    }
    
    // Calculate tax (10%)
    const tax = (serviceFee + deliveryCharge) * 0.10;
    const total = serviceFee + deliveryCharge + tax;
    
    // Update display
    document.querySelector('.summary-item:nth-child(1) .price').textContent = `$${serviceFee.toFixed(2)}`;
    document.querySelector('.summary-item:nth-child(2) .price').textContent = `$${deliveryCharge.toFixed(2)}`;
    document.querySelector('.summary-item:nth-child(3) .price').textContent = `$${tax.toFixed(2)}`;
    document.querySelector('.summary-item.total .price').textContent = `$${total.toFixed(2)}`;
}
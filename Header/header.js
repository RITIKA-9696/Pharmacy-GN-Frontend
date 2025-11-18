// Translation dictionary
const translations = {
  english: {
    enterPinCode: "Select Pincode:",
    
    contact: "Contact",
    wishlist: "Wishlist",
    cart: "Cart",
    profile: "Profile",
    signupLogin: "Sign Up / Login",
    orders: "Orders",
    logout: "Logout",
    motherCare: "Mother Care",
    babyCare: "Baby Care",
    medicineHealthcare: "Medicine & HealthCare",
    prescriptionMedicines: "Prescription Medicines (Upload Prescription)",
    otc: "Over-the-Counter (OTC) Medicines",
    chronic: "Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)",
    firstAid: "First Aid & Emergency" ,
    pain: "Pain Relief & Fever",
    allergy: "Allergy & Cold Care",
    digestive: "Digestive Health",
    men: "Men's Health",
    wellness: "Wellness",
    vitamins: "Vitamins & Supplements",
    skin: "Skin & Hair Care",
    oral: "Oral Care",
    menstrual: "Menstrual & Intimate Care",
    fitness: "Fitness & Weight Management",
    senior: "Senior Care",
    immunity: "Immunity Boosters",
    ayurveda: "Ayurveda & Herbal Products",
    devices: "Devices",
    bp: "Monitoring Devices (BP Monitors, Glucometers)",
    mobility: "Mobility Aids (Walkers, Wheelchairs)",
    respiratory: "Respiratory Care (Nebulizers, Oxygen)",
    surgical: "Surgical Items",
    pincodeSuccess: "Pin Code selected:",
    invalidPincode: "Please enter a valid 6-digit pin code."
  },
  hindi: {
    enterPinCode: "पिनकोड चुनें",
    go: "जाएं",
    contact: "संपर्क",
    wishlist: "इच्छा सूची",
    cart: "कार्ट",
    profile: "प्रोफ़ाइल",
    signupLogin: "साइन अप / लॉगिन",
    orders: "ऑर्डर",
    logout: "लॉगआउट",
    motherCare: "मदर केयर",
    babyCare: "बेबी केअर",
    medicineHealthcare: "दवाइयाँ और स्वास्थ्य देखभाल",
    prescriptionMedicines: "प्रिस्क्रिप्शन दवाइयाँ (प्रिस्क्रिप्शन अपलोड करें)",
    otc: "ओवर-द-काउंटर (OTC) दवाइयाँ",
    chronic: "क्रॉनिक केयर (मधुमेह, उच्च रक्तचाप, हृदय, अस्थमा, थायराइड)",
    firstAid: "प्राथमिक चिकित्सा और आपातकाल",
    pain: "दर्द निवारक और बुखार",
    allergy: "एलर्जी और सर्दी की देखभाल",
    digestive: "पाचन स्वास्थ्य",
    men: "पुरुष स्वास्थ्य",
    wellness: "वेलनेस",
    vitamins: "विटामिन और सप्लीमेंट्स",
    skin: "त्वचा और बाल देखभाल",
    oral: "मौखिक देखभाल",
    menstrual: "मासिक धर्म और अंतरंग देखभाल",
    fitness: "फिटनेस और वजन प्रबंधन",
    senior: "वरिष्ठ नागरिक देखभाल",
    immunity: "प्रतिरक्षा बूस्टर",
    ayurveda: "आयुर्वेद और हर्बल उत्पाद",
    devices: "डिवाइस",
    bp: "मॉनिटरिंग डिवाइस (BP मॉनिटर, ग्लूकोमीटर)",
    mobility: "गतिशीलता सहायता (वॉकर, व्हीलचेयर)",
    respiratory: "श्वसन देखभाल (नेबुलाइज़र, ऑक्सीजन)",
    surgical: "सर्जिकल आइटम",
    pincodeSuccess: "पिन कोड चुना गया:",
    invalidPincode: "कृपया 6 अंकों का वैध भारतीय पिनकोड डालें।"
  },
  marathi: {
    enterPinCode: "पिनकोड निवडा",
    go: "जा",
    contact: "संपर्क",
    wishlist: "इच्छा यादी",
    cart: "कार्ट",
    profile: "प्रोफाइल",
    signupLogin: "साइन अप / लॉगिन",
    orders: "ऑर्डर",
    logout: "लॉगआउट",
    motherCare:  "मदर केअर",
    babyCare: "बाळ काळजी",
    medicineHealthcare: "औषधे आणि आरोग्यसेवा",
    prescriptionMedicines: "प्रिस्क्रिप्शन औषधे (प्रिस्क्रिप्शन अपलोड करा)",
    otc: "ओव्हर-द-काउंटर (OTC) औषधे",
    chronic: "दीर्घकालीन काळजी (मधुमेह, उच्च रक्तदाब, हृदय, अस्थमा, थायरॉईड)",
    firstAid: "प्रथमोपचार आणि आपत्कालीन",
    pain: "वेदना आराम आणि ताप",
    allergy: "एलर्जी आणि सर्दी काळजी",
    digestive: "पचन आरोग्य",
    men: "पुरुष आरोग्य",
    wellness: "वेलनेस",
    vitamins: "व्हिटॅमिन आणि सप्लिमेंट्स",
    skin: "त्वचा आणि केस काळजी",
    oral: "तोंडाची काळजी",
    menstrual: "मासिक पाळी आणि अंतरंग काळजी",
    fitness: "फिटनेस आणि वजन व्यवस्थापन",
    senior: "ज्येष्ठ नागरिक काळजी",
    immunity: "रोगप्रतिकार शक्ती वाढवणारे",
    ayurveda: "आयुर्वेद",
    devices: "उपकरणे",
    bp: "मॉनिटरिंग उपकरणे (BP मॉनिटर, ग्लूकोमीटर)",
    mobility: "गतिशीलता सहाय्य (वॉकर, व्हीलचेअर)",
    respiratory: "श्वसन काळजी (नेब्युलायझर, ऑक्सिजन)",
    surgical: "सर्जिकल वस्तू",
    pincodeSuccess: "पिन कोड निवडला:",
    invalidPincode: "कृपया वैध 6 अंकी पिन कोड प्रविष्ट करा।"
  }
};



// Function to handle pin code selection with persistence
function selectPin() {
  console.log('selectPin function called');
  
  const pincodeInput = document.getElementById('pincode');
  
  if (!pincodeInput) {
    console.error('Pincode input element not found!');
    return;
  }
  
  const pin = pincodeInput.value.trim();
  console.log('Pin value:', pin);
  
  
}

// Function to load saved pincode
function loadSavedPincode() {
  console.log('loadSavedPincode function called');
  
  const savedPincode = localStorage.getItem('savedPincode');
  console.log('Retrieved pincode from localStorage:', savedPincode);
  
  const pincodeInput = document.getElementById('pincode');
  
  if (pincodeInput && savedPincode) {
    pincodeInput.value = savedPincode;
    console.log('Pincode loaded into input:', savedPincode);
  }
}

// Function to translate the page
function translatePage(language) {
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[language] && translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });

  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[language] && translations[language][key]) {
      element.placeholder = translations[language][key];
    }
  });

  localStorage.setItem('selectedLanguage', language);
  console.log(`Language changed to: ${language}`);
}

// Function to handle language change
function changeLanguage(lang) {
  translatePage(lang);
  showNotification(`Language changed to ${lang}`);
}

// Show notification
function showNotification(message) {
  const existingNotification = document.querySelector('.custom-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'custom-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Profile dropdown toggle function
function toggleProfileDropdown() {
  const profileMenu = document.getElementById('profile-menu');
  if (profileMenu) {
    profileMenu.classList.toggle('show');
    console.log('Profile menu toggled');
  }
}

// Close dropdown when clicking outside
function closeDropdownOnClickOutside(event) {
  const profileDropdown = document.querySelector('.profile-dropdown');
  const profileMenu = document.getElementById('profile-menu');
  
  if (profileDropdown && profileMenu && !profileDropdown.contains(event.target)) {
    profileMenu.classList.remove('show');
  }
}

// Main initialization function
function initializeHeader() {
  console.log('Initializing header...');
  
  // Load saved language preference
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'english';
  console.log('Saved language:', savedLanguage);
  
  // Set the dropdown to the saved language
  const languageSelector = document.getElementById('language-selector');
  if (languageSelector) {
    languageSelector.value = savedLanguage;
    translatePage(savedLanguage);
    
    // Add event listener for language change
    languageSelector.addEventListener('change', function() {
      changeLanguage(this.value);
    });
  }
  
  // Load saved pincode
  loadSavedPincode();
  
  // Add Enter key support for pincode
  const pincodeInput = document.getElementById('pincode');
  if (pincodeInput) {
    pincodeInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        selectPin();
      }
    });
  }
  
  // Profile dropdown functionality
  const profileBtn = document.getElementById('profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', function(event) {
      event.stopPropagation();
      toggleProfileDropdown();
      console.log('Profile button clicked');
    });
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', closeDropdownOnClickOutside);
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(event) {
      event.preventDefault();
      // Add your logout logic here
      showNotification('Logged out successfully');
      console.log('Logout clicked');
      // You can redirect to login page or clear session data here
      // window.location.href = '/login.html';
    });
  }
  
  console.log('Header initialization complete');
}

// Wait for DOM to be fully loaded - SINGLE event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing header...');
    initializeHeader();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('DOM already ready, initializing header...');
    setTimeout(initializeHeader, 0);
}

// Mobile menu toggle
document.getElementById('mobile-menu-btn')?.addEventListener('click', function () {
  document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Close mobile menu when clicking any link
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.add('hidden');
  });
});
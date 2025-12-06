// ========================================
// HASH DE CONTRASEÑA (SHA-256)
// ========================================
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// ========================================
// INICIALIZACIÓN DE DATOS
// ========================================
function initializeData() {
    // Contraseña por defecto: "admin123" (hasheada)
    if (!localStorage.getItem('adminPasswordHash')) {
        hashPassword('admin123').then(hash => {
            localStorage.setItem('adminPasswordHash', hash);
        });
    }
    
    // Servicios iniciales
    if (!localStorage.getItem('services')) {
        const defaultServices = [
            {
                id: Date.now() + 1,
                name: 'CELULARES Y TABLETS',
                icon: '📱',
                items: ['Cambio de pantalla táctil', 'Reemplazo de batería', 'Reparación de puerto de carga', 'Cambio de cámara', 'Liberación de equipos', 'Actualización de software'],
                price: 8000
            },
            {
                id: Date.now() + 2,
                name: 'NOTEBOOKS Y PCS',
                icon: '💻',
                items: ['Reparación de placa madre', 'Cambio de disco duro/SSD', 'Upgrade de RAM', 'Limpieza profunda', 'Instalación de Windows', 'Recuperación de datos'],
                price: 12000
            },
            {
                id: Date.now() + 3,
                name: 'AIRES ACONDICIONADOS',
                icon: '❄️',
                items: ['Carga de gas', 'Limpieza completa', 'Reparación de filtros', 'Service preventivo', 'Cambio de compresor', 'Instalación y mudanza'],
                price: 15000
            },
            {
                id: Date.now() + 4,
                name: 'ELECTRODOMÉSTICOS',
                icon: '🔌',
                items: ['Heladeras y freezers', 'Lavarropas y secarropas', 'Microondas', 'Cocinas y hornos', 'Aspiradoras', 'Service preventivo'],
                price: 10000
            }
        ];
        localStorage.setItem('services', JSON.stringify(defaultServices));
    }
    
    // Precios iniciales
    if (!localStorage.getItem('prices')) {
        const defaultPrices = [
            { id: Date.now() + 1, service: 'Cambio de pantalla celular', price: 8000, time: '24hs' },
            { id: Date.now() + 2, service: 'Reemplazo de batería', price: 5000, time: '1-2hs' },
            { id: Date.now() + 3, service: 'Reparación placa madre notebook', price: 15000, time: '48hs' },
            { id: Date.now() + 4, service: 'Instalación Windows + drivers', price: 4000, time: '3-4hs' },
            { id: Date.now() + 5, service: 'Carga de gas aire acondicionado', price: 18000, time: '24hs' },
            { id: Date.now() + 6, service: 'Limpieza completa aire split', price: 12000, time: '2-3hs' },
            { id: Date.now() + 7, service: 'Reparación heladera (diagnóstico)', price: 10000, time: '48-72hs' },
            { id: Date.now() + 8, service: 'Reparación lavarropas', price: 12000, time: '48hs' }
        ];
        localStorage.setItem('prices', JSON.stringify(defaultPrices));
    }
}

// ========================================
// RENDERIZADO DE SERVICIOS
// ========================================
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card">
            <div class="service-icon">${service.icon}</div>
            <h3>${service.name}</h3>
            <ul>
                ${service.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <div class="service-price">Desde $${service.price.toLocaleString('es-AR')}</div>
            <span class="badge-free">Presupuesto GRATIS</span>
        </div>
    `).join('');
}

// ========================================
// RENDERIZADO DE PRECIOS
// ========================================
function renderPrices() {
    const pricingTableBody = document.getElementById('pricingTableBody');
    const prices = JSON.parse(localStorage.getItem('prices') || '[]');
    
    pricingTableBody.innerHTML = prices.map(price => `
        <tr>
            <td>${price.service}</td>
            <td>$${price.price.toLocaleString('es-AR')}</td>
            <td>${price.time}</td>
        </tr>
    `).join('');
}

// ========================================
// ADMIN - ABRIR/CERRAR LOGIN
// ========================================
function openAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'none';
}

// ========================================
// ADMIN - LOGIN
// ========================================
async function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    
    if (!password) {
        showToast('⚠ Por favor ingresá la contraseña');
        return;
    }
    
    const hashedInput = await hashPassword(password);
    const storedHash = localStorage.getItem('adminPasswordHash');
    
    if (hashedInput === storedHash) {
        closeAdminLogin();
        openAdminPanel();
        showToast('✓ Acceso concedido');
    } else {
        showToast('⚠ Contraseña incorrecta');
        document.getElementById('adminPassword').value = '';
    }
}

// ========================================
// ADMIN - ABRIR/CERRAR PANEL
// ========================================
function openAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    renderAdminServices();
    renderAdminPrices();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    cancelEditService();
    cancelEditPrice();
}

// ========================================
// ADMIN - GESTIÓN DE SERVICIOS
// ========================================
function renderAdminServices() {
    const servicesList = document.getElementById('servicesList');
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    
    servicesList.innerHTML = services.map(service => `
        <div class="service-item">
            <div class="service-item-info">
                <h4>${service.icon} ${service.name}</h4>
                <p>${service.items.length} items - Desde $${service.price.toLocaleString('es-AR')}</p>
            </div>
            <div class="service-item-actions">
                <button onclick="editService(${service.id})" class="btn btn-small btn-edit">Editar</button>
                <button onclick="deleteService(${service.id})" class="btn btn-small btn-delete">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function saveService() {
    const id = document.getElementById('editServiceId').value;
    const name = document.getElementById('serviceName').value.trim();
    const icon = document.getElementById('serviceIcon').value.trim();
    const itemsText = document.getElementById('serviceItems').value.trim();
    const price = document.getElementById('servicePrice').value;
    
    if (!name || !icon || !itemsText || !price) {
        showToast('⚠ Por favor completá todos los campos');
        return;
    }
    
    const items = itemsText.split('\n').filter(item => item.trim() !== '');
    
    if (items.length === 0) {
        showToast('⚠ Agregá al menos un item');
        return;
    }
    
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    
    if (id) {
        // Editar existente
        const index = services.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            services[index] = {
                id: parseInt(id),
                name: name.toUpperCase(),
                icon,
                items,
                price: parseInt(price)
            };
        }
    } else {
        // Crear nuevo
        services.push({
            id: Date.now(),
            name: name.toUpperCase(),
            icon,
            items,
            price: parseInt(price)
        });
    }
    
    localStorage.setItem('services', JSON.stringify(services));
    renderAdminServices();
    renderServices();
    cancelEditService();
    showToast('✓ Servicio guardado exitosamente');
}

function editService(id) {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const service = services.find(s => s.id === id);
    
    if (service) {
        document.getElementById('editServiceId').value = service.id;
        document.getElementById('serviceName').value = service.name;
        document.getElementById('serviceIcon').value = service.icon;
        document.getElementById('serviceItems').value = service.items.join('\n');
        document.getElementById('servicePrice').value = service.price;
        document.getElementById('serviceName').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function deleteService(id) {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
        let services = JSON.parse(localStorage.getItem('services') || '[]');
        services = services.filter(s => s.id !== id);
        localStorage.setItem('services', JSON.stringify(services));
        renderAdminServices();
        renderServices();
        showToast('✓ Servicio eliminado');
    }
}

function cancelEditService() {
    document.getElementById('editServiceId').value = '';
    document.getElementById('serviceName').value = '';
    document.getElementById('serviceIcon').value = '';
    document.getElementById('serviceItems').value = '';
    document.getElementById('servicePrice').value = '';
}

// ========================================
// ADMIN - GESTIÓN DE PRECIOS
// ========================================
function renderAdminPrices() {
    const pricesList = document.getElementById('pricesList');
    const prices = JSON.parse(localStorage.getItem('prices') || '[]');
    
    pricesList.innerHTML = prices.map(price => `
        <div class="price-item">
            <div class="price-item-info">
                <h4>${price.service}</h4>
                <p>$${price.price.toLocaleString('es-AR')} - ${price.time}</p>
            </div>
            <div class="price-item-actions">
                <button onclick="editPrice(${price.id})" class="btn btn-small btn-edit">Editar</button>
                <button onclick="deletePrice(${price.id})" class="btn btn-small btn-delete">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function savePrice() {
    const id = document.getElementById('editPriceId').value;
    const service = document.getElementById('priceService').value.trim();
    const amount = document.getElementById('priceAmount').value;
    let time = document.getElementById('priceTime').value.trim();
    
    if (!service || !amount || !time) {
        showToast('⚠ Por favor completá todos los campos');
        return;
    }
    
    // Agregar "hs" automáticamente si no lo tiene
    if (!time.toLowerCase().includes('hs') && !time.toLowerCase().includes('hora') && !time.toLowerCase().includes('día')) {
        time = time + 'hs';
    }
    
    const prices = JSON.parse(localStorage.getItem('prices') || '[]');
    
    if (id) {
        // Editar existente
        const index = prices.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            prices[index] = {
                id: parseInt(id),
                service,
                price: parseInt(amount),
                time
            };
        }
    } else {
        // Crear nuevo
        prices.push({
            id: Date.now(),
            service,
            price: parseInt(amount),
            time
        });
    }
    
    localStorage.setItem('prices', JSON.stringify(prices));
    renderAdminPrices();
    renderPrices();
    cancelEditPrice();
    showToast('✓ Precio guardado exitosamente');
}

function editPrice(id) {
    const prices = JSON.parse(localStorage.getItem('prices') || '[]');
    const price = prices.find(p => p.id === id);
    
    if (price) {
        document.getElementById('editPriceId').value = price.id;
        document.getElementById('priceService').value = price.service;
        document.getElementById('priceAmount').value = price.price;
        document.getElementById('priceTime').value = price.time;
        document.getElementById('priceService').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function deletePrice(id) {
    if (confirm('¿Estás seguro de eliminar este precio?')) {
        let prices = JSON.parse(localStorage.getItem('prices') || '[]');
        prices = prices.filter(p => p.id !== id);
        localStorage.setItem('prices', JSON.stringify(prices));
        renderAdminPrices();
        renderPrices();
        showToast('✓ Precio eliminado');
    }
}

function cancelEditPrice() {
    document.getElementById('editPriceId').value = '';
    document.getElementById('priceService').value = '';
    document.getElementById('priceAmount').value = '';
    document.getElementById('priceTime').value = '';
}

// ========================================
// ADMIN - CAMBIAR CONTRASEÑA
// ========================================
async function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showToast('⚠ Por favor completá ambos campos');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('⚠ La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('⚠ Las contraseñas no coinciden');
        return;
    }
    
    const hashedPassword = await hashPassword(newPassword);
    localStorage.setItem('adminPasswordHash', hashedPassword);
    
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    showToast('✓ Contraseña cambiada exitosamente');
}

// ========================================
// SISTEMA DE TEMAS
// ========================================
const themes = ['blue', 'green', 'orange', 'purple'];
let currentThemeIndex = 0;

const themeSwitcher = document.getElementById('themeSwitcher');
const body = document.body;

// Cargar tema guardado
const savedTheme = localStorage.getItem('theme') || 'blue';
currentThemeIndex = themes.indexOf(savedTheme);
body.setAttribute('data-theme', savedTheme);

// Cambiar tema con animación
themeSwitcher.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    
    body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    body.setAttribute('data-theme', newTheme);
    
    localStorage.setItem('theme', newTheme);
    
    const themeNames = {
        'blue': 'Azul Técnico',
        'green': 'Verde Tech',
        'orange': 'Naranja Energético',
        'purple': 'Púrpura Profesional'
    };
    showToast(`Tema cambiado a: ${themeNames[newTheme]}`);
});

// ========================================
// MENÚ MÓVIL
// ========================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const nav = document.getElementById('nav');

mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    nav.classList.toggle('active');
});

nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        nav.classList.remove('active');
    });
});

// ========================================
// HEADER STICKY
// ========================================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.padding = '10px 0';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.padding = '15px 0';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }
    
    lastScroll = currentScroll;
});

// ========================================
// FAQ ACCORDION
// ========================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        item.classList.toggle('active');
    });
});

// ========================================
// TESTIMONIOS SLIDER
// ========================================
const sliderDots = document.getElementById('sliderDots');
const testimonialCards = document.querySelectorAll('.testimonial-card');

if (window.innerWidth <= 768) {
    testimonialCards.forEach((card, index) => {
        const dot = document.createElement('span');
        dot.className = 'slider-dot';
        if (index === 0) dot.classList.add('active');
        sliderDots.appendChild(dot);
    });
}

// ========================================
// MOSTRAR/OCULTAR INPUTS "OTRO"
// ========================================

// Formulario Rápido - Dispositivo "Otro"
const dispositivoSelect = document.getElementById('dispositivoSelect');
const dispositivoOtro = document.getElementById('dispositivoOtro');

if (dispositivoSelect && dispositivoOtro) {
    dispositivoSelect.addEventListener('change', function() {
        if (this.value === 'Otro') {
            dispositivoOtro.style.display = 'block';
            dispositivoOtro.required = true;
            dispositivoOtro.style.animation = 'slideIn 0.3s ease';
        } else {
            dispositivoOtro.style.display = 'none';
            dispositivoOtro.required = false;
            dispositivoOtro.value = '';
        }
    });
}

// Formulario Rápido - Marca "Otra"
const marcaSelect = document.getElementById('marcaSelect');
const marcaOtra = document.getElementById('marcaOtra');

if (marcaSelect && marcaOtra) {
    marcaSelect.addEventListener('change', function() {
        if (this.value === 'Otra') {
            marcaOtra.style.display = 'block';
            marcaOtra.required = true;
            marcaOtra.style.animation = 'slideIn 0.3s ease';
        } else {
            marcaOtra.style.display = 'none';
            marcaOtra.required = false;
            marcaOtra.value = '';
        }
    });
}

// Formulario de Contacto - Dispositivo "Otro"
const dispositivoContactSelect = document.getElementById('dispositivoContactSelect');
const dispositivoContactOtro = document.getElementById('dispositivoContactOtro');

if (dispositivoContactSelect && dispositivoContactOtro) {
    dispositivoContactSelect.addEventListener('change', function() {
        if (this.value === 'Otro') {
            dispositivoContactOtro.style.display = 'block';
            dispositivoContactOtro.required = true;
            dispositivoContactOtro.style.animation = 'slideIn 0.3s ease';
        } else {
            dispositivoContactOtro.style.display = 'none';
            dispositivoContactOtro.required = false;
            dispositivoContactOtro.value = '';
        }
    });
}

// Formulario de Contacto - Marca "Otra"
const marcaContactSelect = document.getElementById('marcaContactSelect');
const marcaContactOtra = document.getElementById('marcaContactOtra');

if (marcaContactSelect && marcaContactOtra) {
    marcaContactSelect.addEventListener('change', function() {
        if (this.value === 'Otra') {
            marcaContactOtra.style.display = 'block';
            marcaContactOtra.required = true;
            marcaContactOtra.style.animation = 'slideIn 0.3s ease';
        } else {
            marcaContactOtra.style.display = 'none';
            marcaContactOtra.required = false;
            marcaContactOtra.value = '';
        }
    });
}

// ========================================
// ENVÍO DE FORMULARIOS CON EMAILJS
// ========================================

const EMAILJS_CONFIG = {
    publicKey: 'YzQVxS-7kuYTarZ40',
    serviceId: 'service_wd0cm2m',
    templateIdQuick: 'template_fmk3hji',
    templateIdContact: 'template_x2jhkxg'
};

// Cargar EmailJS library
(function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = function() {
        emailjs.init(EMAILJS_CONFIG.publicKey);
    };
    document.head.appendChild(script);
})();

// FORMULARIO RÁPIDO
const quickForm = document.getElementById('quickForm');
if (quickForm) {
    quickForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = quickForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'ENVIANDO...';
        submitBtn.disabled = true;
        
        const formData = new FormData(quickForm);
        
        let dispositivo = formData.get('dispositivo');
        if (dispositivo === 'Otro' && formData.get('dispositivoOtro')) {
            dispositivo = formData.get('dispositivoOtro');
        }
        
        let marca = formData.get('marca');
        if (marca === 'Otra' && formData.get('marcaOtra')) {
            marca = formData.get('marcaOtra');
        }
        
        const templateParams = {
            dispositivo: dispositivo,
            marca: marca,
            problema: formData.get('problema'),
            email: formData.get('email')
        };
        
        try {
            await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateIdQuick,
                templateParams
            );
            
            showToast('✓ Presupuesto solicitado! Te contactaremos pronto.');
            quickForm.reset();
            if (dispositivoOtro) dispositivoOtro.style.display = 'none';
            if (marcaOtra) marcaOtra.style.display = 'none';
            
        } catch (error) {
            console.error('Error al enviar:', error);
            showToast('⚠ Error al enviar. Por favor llamanos o escribinos por WhatsApp.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// FORMULARIO DE CONTACTO COMPLETO
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'ENVIANDO...';
        submitBtn.disabled = true;
        
        const formData = new FormData(contactForm);
        
        let dispositivo = formData.get('dispositivo');
        if (dispositivo === 'Otro' && formData.get('dispositivoContactOtro')) {
            dispositivo = formData.get('dispositivoContactOtro');
        }
        
        let marca = formData.get('marca');
        if (marca === 'Otra' && formData.get('marcaContactOtra')) {
            marca = formData.get('marcaContactOtra');
        }
        
        const templateParams = {
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            dispositivo: dispositivo,
            marca: marca,
            problema: formData.get('problema'),
            llamar: formData.get('llamar') ? 'Sí, prefiere que lo llamen' : 'No'
        };
        
        try {
            await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateIdContact,
                templateParams
            );
            
            showToast('✓ Mensaje enviado! Te responderemos en menos de 2 horas.');
            contactForm.reset();
            if (dispositivoContactOtro) dispositivoContactOtro.style.display = 'none';
            if (marcaContactOtra) marcaContactOtra.style.display = 'none';
            
        } catch (error) {
            console.error('Error al enviar:', error);
            showToast('⚠ Error al enviar. Por favor llamanos o escribinos por WhatsApp.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// SISTEMA DE NOTIFICACIONES TOAST
// ========================================
function showToast(message, duration = 4000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ========================================
// SMOOTH SCROLL
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ========================================
// ANIMACIONES AL SCROLL
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll('.service-card, .why-item, .testimonial-card, .timeline-item');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ========================================
// CONTADOR DE VISITAS
// ========================================
let visitCount = localStorage.getItem('visitCount') || 0;
visitCount++;
localStorage.setItem('visitCount', visitCount);

// ========================================
// PREVENIR MÚLTIPLES ENVÍOS
// ========================================
let formSubmitting = false;

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        if (formSubmitting) {
            e.preventDefault();
            return false;
        }
    });
});

// ========================================
// LOG DE DEBUG
// ========================================
console.log('%c🔧 TechRepair.Pro - Sistema Cargado', 'color: #2563EB; font-size: 16px; font-weight: bold;');
console.log('Tema actual:', body.getAttribute('data-theme'));
console.log('Visitas:', visitCount);

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    renderServices();
    renderPrices();
});


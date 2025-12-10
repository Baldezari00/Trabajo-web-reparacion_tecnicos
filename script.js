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
// CARGAR DATOS DESDE JSON O EMBEBIDOS
// ========================================
let servicesData = [];
let pricesData = [];

// Datos embebidos como respaldo
const EMBEDDED_SERVICES = [
    {
        id: 1,
        name: "TELEVISORES",
        icon: "📺",
        items: [
            "Reparación de pantalla",
            "Cambio de placa madre",
            "Reparación de fuente de alimentación",
            "Configuración y sintonización",
            "Actualización de software",
            "Reparación de audio",
            "Cambio de backlight LED",
            "Reparación de entrada HDMI",
            "Instalación y soporte en pared"
        ],
        price: 15000
    },
    {
        id: 2,
        name: "MICROONDAS",
        icon: "🔥",
        items: [
            "Reparación de magnetrón",
            "Cambio de plato giratorio",
            "Reparación de panel de control",
            "Cambio de puerta y bisagras",
            "Reparación de sistema de calentamiento",
            "Limpieza profunda interna",
            "Cambio de fusible térmico",
            "Reparación de timer"
        ],
        price: 12000
    }
];

const EMBEDDED_PRICES = [
    { id: 1, service: "Reparación de pantalla TV", price: 20000, time: "24-48hs" },
    { id: 2, service: "Cambio de placa madre TV", price: 25000, time: "48hs" },
    { id: 3, service: "Reparación de magnetrón microondas", price: 15000, time: "24hs" },
    { id: 4, service: "Limpieza profunda microondas", price: 8000, time: "2-3hs" }
];

async function loadData() {
    try {
        // Intentar cargar desde archivos JSON
        const [servicesResponse, pricesResponse] = await Promise.all([
            fetch('./data/services.json?t=' + Date.now()),
            fetch('./data/prices.json?t=' + Date.now())
        ]);
        
        if (servicesResponse.ok && pricesResponse.ok) {
            servicesData = await servicesResponse.json();
            pricesData = await pricesResponse.json();
            console.log('✅ Datos cargados desde JSON');
        } else {
            throw new Error('Archivos JSON no disponibles');
        }
    } catch (error) {
        console.warn('⚠ Usando datos embebidos:', error.message);
        servicesData = EMBEDDED_SERVICES;
        pricesData = EMBEDDED_PRICES;
    } finally {
        renderServices();
        renderPrices();
    }
}

// Datos por defecto si no se pueden cargar los JSON
function getDefaultServices() {
    return [
        {
            id: 1,
            name: "TELEVISORES",
            icon: "📺",
            items: [
                "Reparación de pantalla",
                "Cambio de placa madre",
                "Reparación de fuente de alimentación",
                "Configuración y sintonización",
                "Actualización de software",
                "Reparación de audio",
                "Cambio de backlight LED",
                "Reparación de entrada HDMI",
                "Instalación y soporte en pared"
            ],
            price: 15000
        },
        {
            id: 2,
            name: "MICROONDAS",
            icon: "🔥",
            items: [
                "Reparación de magnetrón",
                "Cambio de plato giratorio",
                "Reparación de panel de control",
                "Cambio de puerta y bisagras",
                "Reparación de sistema de calentamiento",
                "Limpieza profunda interna",
                "Cambio de fusible térmico",
                "Reparación de timer"
            ],
            price: 12000
        }
    ];
}

function getDefaultPrices() {
    return [
        { id: 1, service: "Reparación de pantalla TV", price: 20000, time: "24-48hs" },
        { id: 2, service: "Cambio de placa madre TV", price: 25000, time: "48hs" },
        { id: 3, service: "Reparación de magnetrón microondas", price: 15000, time: "24hs" },
        { id: 4, service: "Limpieza profunda microondas", price: 8000, time: "2-3hs" }
    ];
}

// ========================================
// INICIALIZACIÓN DE CONTRASEÑA
// ========================================
function initializePassword() {
    // Contraseña por defecto: "admin123" (hasheada)
    if (!localStorage.getItem('adminPasswordHash')) {
        hashPassword('admin123').then(hash => {
            localStorage.setItem('adminPasswordHash', hash);
        });
    }
}

// ========================================
// RENDERIZADO DE SERVICIOS
// ========================================
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    
    if (!servicesData || servicesData.length === 0) {
        servicesGrid.innerHTML = '<p style="text-align:center;grid-column:1/-1;">Cargando servicios...</p>';
        return;
    }
    
    servicesGrid.innerHTML = servicesData.map(service => `
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
    
    if (!pricesData || pricesData.length === 0) {
        pricingTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Cargando precios...</td></tr>';
        return;
    }
    
    pricingTableBody.innerHTML = pricesData.map(price => `
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
    
    servicesList.innerHTML = servicesData.map(service => `
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
    
    if (id) {
        // Editar existente
        const index = servicesData.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            servicesData[index] = {
                id: parseInt(id),
                name: name.toUpperCase(),
                icon,
                items,
                price: parseInt(price)
            };
        }
    } else {
        // Crear nuevo
        const newId = servicesData.length > 0 ? Math.max(...servicesData.map(s => s.id)) + 1 : 1;
        servicesData.push({
            id: newId,
            name: name.toUpperCase(),
            icon,
            items,
            price: parseInt(price)
        });
    }
    
    showDataToSave('services', servicesData);
    renderAdminServices();
    renderServices();
    cancelEditService();
}

function editService(id) {
    const service = servicesData.find(s => s.id === id);
    
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
        servicesData = servicesData.filter(s => s.id !== id);
        showDataToSave('services', servicesData);
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
    
    pricesList.innerHTML = pricesData.map(price => `
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
    
    if (id) {
        // Editar existente
        const index = pricesData.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            pricesData[index] = {
                id: parseInt(id),
                service,
                price: parseInt(amount),
                time
            };
        }
    } else {
        // Crear nuevo
        const newId = pricesData.length > 0 ? Math.max(...pricesData.map(p => p.id)) + 1 : 1;
        pricesData.push({
            id: newId,
            service,
            price: parseInt(amount),
            time
        });
    }
    
    showDataToSave('prices', pricesData);
    renderAdminPrices();
    renderPrices();
    cancelEditPrice();
}

function editPrice(id) {
    const price = pricesData.find(p => p.id === id);
    
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
        pricesData = pricesData.filter(p => p.id !== id);
        showDataToSave('prices', pricesData);
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
// MOSTRAR DATOS PARA GUARDAR
// ========================================
// ========================================
// MOSTRAR DATOS PARA GUARDAR Y ENVIAR POR WHATSAPP
// ========================================
function showDataToSave(type, data) {
    const fileName = type === 'services' ? 'services.json' : 'prices.json';
    const jsonContent = JSON.stringify(data, null, 2);
    
    const message = `
✓ Cambios guardados temporalmente!

¿Qué querés hacer?

1️⃣ COPIAR JSON (para actualizarlo vos mismo en GitHub)
2️⃣ ENVIAR POR WHATSAPP (te lo mandamos para que lo actualices)
    `;
    
    if (confirm(message.trim())) {
        // Mostrar opciones
        showWhatsAppOptions(fileName, jsonContent);
    }
}

function showWhatsAppOptions(fileName, jsonContent) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        text-align: center;
    `;
    
    modal.innerHTML = `
        <h3 style="margin-bottom: 20px; color: #1f2937;">¿Cómo querés proceder?</h3>
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <button id="copyBtn" style="
                padding: 15px;
                background: #2563EB;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
            ">
                📋 Copiar JSON al portapapeles
            </button>
            <button id="whatsappBtn" style="
                padding: 15px;
                background: #25D366;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
            ">
                📱 Enviar por WhatsApp
            </button>
            <button id="cancelBtn" style="
                padding: 15px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
            ">
                ❌ Cancelar
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Botón copiar
    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(jsonContent).then(() => {
            showToast('✓ JSON copiado al portapapeles!');
            document.body.removeChild(overlay);
        }).catch(() => {
            // Fallback: mostrar en textarea
            const textarea = document.createElement('textarea');
            textarea.value = jsonContent;
            textarea.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:80%;z-index:999999;padding:20px;';
            document.body.appendChild(textarea);
            textarea.select();
            showToast('Seleccioná todo y copiá (Ctrl+C)');
            setTimeout(() => {
                document.body.removeChild(textarea);
                document.body.removeChild(overlay);
            }, 5000);
        });
    });
    
    // Botón WhatsApp
    document.getElementById('whatsappBtn').addEventListener('click', () => {
        const phoneNumber = '542235254889';
        const message = `🔧 *ACTUALIZACIÓN DE DATOS - TechRepair.Pro*

📄 Archivo: ${fileName}

Por favor, actualizá este archivo en GitHub con el siguiente contenido:

\`\`\`json
${jsonContent}
\`\`\`

Después de actualizar, esperá 1-2 minutos para que se actualice el hosting.`;
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        document.body.removeChild(overlay);
        showToast('✓ Abriendo WhatsApp...');
    });
    
    // Botón cancelar
    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    // Cerrar al hacer click fuera del modal
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
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
initializePassword();
loadData(); // Cargar datos desde JSON
});
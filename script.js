/* ==========================================================================
   FloodGuard - JavaScript Avançado
   Sistema Inteligente de Prevenção e Resposta a Enchentes
   ========================================================================== */

// ==========================================================================
// CONFIGURAÇÕES GLOBAIS E CONSTANTES
// ==========================================================================

const CONFIG = {
    SIMULATION: {
        FLOOD_DURATION: 2000,
        RAIN_DURATION: 5000,
        RAIN_INTENSITY: 50,
        WATER_LEVELS: [0, 50, 100, 150, 200]
    },
    ALERTS: {
        CHECK_INTERVAL: 30000,
        SOUND_ENABLED: true,
        NOTIFICATION_DURATION: 5000
    },
    MONITORING: {
        UPDATE_INTERVAL: 2000,
        SENSOR_COUNT: 15,
        CHART_POINTS: 50
    }
};

// Estado global da aplicação
const APP_STATE = {
    isEmergencyMode: false,
    currentAlertLevel: 'Baixo',
    affectedAreas: 0,
    evacuationRoutes: 12,
    sensorsData: [],
    lastUpdate: new Date(),
    floodSimulationActive: false,
    rainActive: false
};

// ==========================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌊 FloodGuard inicializado');
    
    // Inicializar componentes base
    initializeApp();
    initializeAnimations();
    setupEventListeners();
    startDataSimulation();
    
    // Verificar se há alertas ativos
    checkActiveAlerts();
    
    // Configurar atualizações em tempo real
    setInterval(updateRealTimeData, CONFIG.MONITORING.UPDATE_INTERVAL);
    setInterval(checkActiveAlerts, CONFIG.ALERTS.CHECK_INTERVAL);
});

// ==========================================================================
// INICIALIZAÇÃO DOS COMPONENTES
// ==========================================================================

function initializeApp() {
    // Configurar navegação ativa
    updateActiveNavigation();
    
    // Inicializar dados simulados
    generateInitialSensorData();
    
    // Configurar tooltips e popovers
    initializeBootstrapComponents();
    
    // Configurar animações de entrada
    observeElementsForAnimation();
    
    console.log('✅ Aplicação inicializada com sucesso');
}

function initializeBootstrapComponents() {
    // Inicializar tooltips do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Inicializar popovers do Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

function updateActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// ==========================================================================
// SIMULAÇÃO DE ENCHENTE INTERATIVA
// ==========================================================================

function simulateFlood() {
    if (APP_STATE.floodSimulationActive) {
        console.log('⚠️ Simulação já em andamento');
        return;
    }
    
    APP_STATE.floodSimulationActive = true;
    const button = document.querySelector('button[onclick="simulateFlood()"]');
    const floodWater = document.getElementById('floodWater');
    const rainContainer = document.getElementById('rainContainer');
    
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Simulando...';
    }
    
    console.log('🌊 Iniciando simulação de enchente');
    
    // Iniciar chuva
    startRainAnimation(rainContainer);
    
    // Simular aumento gradual do nível da água
    setTimeout(() => {
        animateFloodWater(floodWater, 0);
    }, 1000);
    
    // Finalizar simulação
    setTimeout(() => {
        endFloodSimulation(button, floodWater, rainContainer);
    }, CONFIG.SIMULATION.FLOOD_DURATION + CONFIG.SIMULATION.RAIN_DURATION);
}

function startRainAnimation(container) {
    if (!container) return;
    
    APP_STATE.rainActive = true;
    console.log('🌧️ Iniciando animação de chuva');
    
    const rainInterval = setInterval(() => {
        if (!APP_STATE.rainActive) {
            clearInterval(rainInterval);
            return;
        }
        
        createRaindrop(container);
    }, 100);
    
    // Parar chuva após duração configurada
    setTimeout(() => {
        APP_STATE.rainActive = false;
        setTimeout(() => {
            container.innerHTML = '';
        }, 2000);
    }, CONFIG.SIMULATION.RAIN_DURATION);
}

function createRaindrop(container) {
    const raindrop = document.createElement('div');
    raindrop.className = 'raindrop';
    raindrop.style.left = Math.random() * 100 + '%';
    raindrop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
    
    container.appendChild(raindrop);
    
    // Remover gota após animação
    setTimeout(() => {
        if (raindrop.parentNode) {
            raindrop.parentNode.removeChild(raindrop);
        }
    }, 1000);
}

function animateFloodWater(floodWater, currentLevel) {
    if (!floodWater || currentLevel >= CONFIG.SIMULATION.WATER_LEVELS.length) {
        return;
    }
    
    const targetHeight = CONFIG.SIMULATION.WATER_LEVELS[currentLevel];
    floodWater.style.height = targetHeight + 'px';
    
    console.log(`💧 Nível da água: ${targetHeight}px`);
    
    // Próximo nível após delay
    setTimeout(() => {
        animateFloodWater(floodWater, currentLevel + 1);
    }, 400);
}

function endFloodSimulation(button, floodWater, rainContainer) {
    APP_STATE.floodSimulationActive = false;
    
    // Resetar elementos
    if (floodWater) {
        setTimeout(() => {
            floodWater.style.height = '0px';
        }, 1000);
    }
    
    if (rainContainer) {
        rainContainer.innerHTML = '';
    }
    
    if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-play me-2"></i>Simular Enchente';
    }
    
    console.log('✅ Simulação de enchente finalizada');
}

// ==========================================================================
// MODO DE EMERGÊNCIA
// ==========================================================================

function activateEmergencyMode() {
    APP_STATE.isEmergencyMode = !APP_STATE.isEmergencyMode;
    
    const statusElement = document.getElementById('systemStatus');
    const alertLevel = document.getElementById('alertLevel');
    const affectedAreas = document.getElementById('affectedAreas');
    const demoStatus = document.getElementById('demoStatus');
    
    if (APP_STATE.isEmergencyMode) {
        // Ativar modo de emergência
        APP_STATE.currentAlertLevel = 'CRÍTICO';
        APP_STATE.affectedAreas = Math.floor(Math.random() * 8) + 3;
        
        updateElementSafely(statusElement, '<i class="fas fa-circle text-danger me-1"></i>EMERGÊNCIA ATIVA');
        updateElementSafely(alertLevel, 'CRÍTICO');
        updateElementSafely(affectedAreas, APP_STATE.affectedAreas);
        updateElementSafely(demoStatus, `
            <div class="alert alert-danger">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>EMERGÊNCIA ATIVADA</h6>
                <p class="mb-0">Sistema em modo de resposta a emergência. Todas as equipes foram notificadas.</p>
                <ul class="mb-0 mt-2">
                    <li>🚨 Alertas enviados para ${(APP_STATE.affectedAreas * 1500).toLocaleString()} pessoas</li>
                    <li>🚁 3 helicópteros de resgate mobilizados</li>
                    <li>🚍 12 ônibus de evacuação em rota</li>
                    <li>🏥 Hospitais em estado de alerta</li>
                </ul>
            </div>
        `);
        
        // Adicionar efeitos visuais de emergência
        document.body.classList.add('emergency-mode');
        
        console.log('🚨 Modo de emergência ATIVADO');
        showNotification('EMERGÊNCIA ATIVADA', 'Sistema em modo de resposta a emergência', 'danger');
        
    } else {
        // Desativar modo de emergência
        APP_STATE.currentAlertLevel = 'Baixo';
        APP_STATE.affectedAreas = 0;
        
        updateElementSafely(statusElement, '<i class="fas fa-circle text-success me-1"></i>Sistema Ativo');
        updateElementSafely(alertLevel, 'Baixo');
        updateElementSafely(affectedAreas, '0');
        updateElementSafely(demoStatus, `
            <div class="alert alert-success">
                <h6><i class="fas fa-check-circle me-2"></i>Sistema Normal</h6>
                <p class="mb-0">Todas as funções operando normalmente. Monitoramento ativo.</p>
            </div>
        `);
        
        // Remover efeitos visuais de emergência
        document.body.classList.remove('emergency-mode');
        
        console.log('✅ Modo de emergência DESATIVADO');
        showNotification('Sistema Normal', 'Voltando ao modo de operação normal', 'success');
    }
}

// ==========================================================================
// DADOS EM TEMPO REAL
// ==========================================================================

function showRealTimeData() {
    const demoStatus = document.getElementById('demoStatus');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    const sensorData = generateRandomSensorData();
    
    updateElementSafely(demoStatus, `
        <div class="alert alert-info">
            <h6><i class="fas fa-chart-bar me-2"></i>Dados em Tempo Real - ${currentTime}</h6>
            <div class="row">
                <div class="col-md-6">
                    <strong>Sensores Ativos:</strong>
                    <ul class="small mb-0">
                        <li>Nível Rio Tietê: ${sensorData.waterLevel}m</li>
                        <li>Precipitação: ${sensorData.rainfall}mm/h</li>
                        <li>Temperatura: ${sensorData.temperature}°C</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <strong>Status da Rede:</strong>
                    <ul class="small mb-0">
                        <li>Sensores Online: ${sensorData.sensorsOnline}/15</li>
                        <li>Última Atualização: ${currentTime}</li>
                        <li>Latência: ${sensorData.latency}ms</li>
                    </ul>
                </div>
            </div>
        </div>
    `);
    
    console.log('📊 Dados em tempo real atualizados', sensorData);
}

function generateRandomSensorData() {
    return {
        waterLevel: (Math.random() * 5 + 2).toFixed(1),
        rainfall: (Math.random() * 20).toFixed(1),
        temperature: (Math.random() * 10 + 20).toFixed(1),
        sensorsOnline: Math.floor(Math.random() * 3) + 13,
        latency: Math.floor(Math.random() * 50) + 10
    };
}

function updateRealTimeData() {
    // Atualizar métricas do dashboard se estiver visível
    const alertLevel = document.getElementById('alertLevel');
    const affectedAreas = document.getElementById('affectedAreas');
    const evacuationRoutes = document.getElementById('evacuationRoutes');
    
    if (!APP_STATE.isEmergencyMode && alertLevel) {
        // Pequenas variações aleatórias no modo normal
        const variation = Math.floor(Math.random() * 3) - 1;
        APP_STATE.evacuationRoutes = Math.max(10, Math.min(15, APP_STATE.evacuationRoutes + variation));
        updateElementSafely(evacuationRoutes, APP_STATE.evacuationRoutes);
    }
    
    // Atualizar timestamp
    APP_STATE.lastUpdate = new Date();
}

// ==========================================================================
// SISTEMA DE ALERTAS
// ==========================================================================

function checkActiveAlerts() {
    const alertsToShow = generateRandomAlerts();
    
    if (alertsToShow.length > 0) {
        console.log(`🔔 ${alertsToShow.length} alertas ativos encontrados`);
        alertsToShow.forEach(alert => {
            if (Math.random() > 0.7) { // 30% chance de mostrar cada alerta
                showNotification(alert.title, alert.message, alert.type);
            }
        });
    }
}

function generateRandomAlerts() {
    const alerts = [
        {
            title: 'Chuva Forte Detectada',
            message: 'Precipitação acima de 15mm/h na região central',
            type: 'warning'
        },
        {
            title: 'Nível do Rio Estável',
            message: 'Monitoramento normal - sem riscos detectados',
            type: 'success'
        },
        {
            title: 'Manutenção de Sensor',
            message: 'Sensor SP-003 em manutenção preventiva',
            type: 'info'
        }
    ];
    
    // Retornar alertas aleatórios baseado na chance
    return alerts.filter(() => Math.random() > 0.8);
}

function showNotification(title, message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getIconForType(type)} me-2"></i>
            <div>
                <strong>${title}</strong><br>
                <small>${message}</small>
            </div>
            <button type="button" class="btn-close ms-auto" aria-label="Close"></button>
        </div>
    `;
    
    // Adicionar estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: var(--shadow-heavy);
        animation: slideInRight 0.3s ease;
    `;
    
    // Adicionar ao documento
    document.body.appendChild(notification);
    
    // Configurar botão de fechar
    const closeBtn = notification.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Remover automaticamente após duração configurada
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, CONFIG.ALERTS.NOTIFICATION_DURATION);
    
    console.log(`🔔 Notificação exibida: ${title}`);
}

function getIconForType(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        danger: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ==========================================================================
// ANIMAÇÕES E EFEITOS VISUAIS
// ==========================================================================

function initializeAnimations() {
    // Adicionar CSS para animações de notificação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .emergency-mode {
            animation: emergency-pulse 2s infinite;
        }
        
        @keyframes emergency-pulse {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.1) hue-rotate(10deg); }
        }
        
        .notification-toast {
            border-left: 4px solid currentColor;
        }
    `;
    document.head.appendChild(style);
}

function observeElementsForAnimation() {
    // Intersection Observer para animações de entrada
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observar elementos com data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// ==========================================================================
// GERAÇÃO DE DADOS SIMULADOS
// ==========================================================================

function generateInitialSensorData() {
    APP_STATE.sensorsData = [];
    
    for (let i = 0; i < CONFIG.MONITORING.SENSOR_COUNT; i++) {
        APP_STATE.sensorsData.push({
            id: `SP-${String(i + 1).padStart(3, '0')}`,
            location: generateRandomLocation(),
            waterLevel: Math.random() * 5 + 1,
            rainfall: Math.random() * 10,
            temperature: Math.random() * 15 + 15,
            humidity: Math.random() * 40 + 40,
            status: Math.random() > 0.1 ? 'online' : 'offline',
            lastUpdate: new Date()
        });
    }
    
    console.log(`📊 ${APP_STATE.sensorsData.length} sensores simulados criados`);
}

function generateRandomLocation() {
    const locations = [
        'Centro', 'Vila Madalena', 'Itaim Bibi', 'Moema', 'Pinheiros',
        'Liberdade', 'Bela Vista', 'Jardins', 'Brooklin', 'Vila Olímpia',
        'Santana', 'Ipiranga', 'Tatuapé', 'Lapa', 'Butantã'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
}

function startDataSimulation() {
    // Simular atualizações periódicas dos sensores
    setInterval(() => {
        APP_STATE.sensorsData.forEach(sensor => {
            if (sensor.status === 'online') {
                // Pequenas variações nos dados
                sensor.waterLevel += (Math.random() - 0.5) * 0.1;
                sensor.rainfall += (Math.random() - 0.5) * 0.5;
                sensor.temperature += (Math.random() - 0.5) * 0.2;
                sensor.humidity += (Math.random() - 0.5) * 1;
                
                // Manter valores dentro de limites realistas
                sensor.waterLevel = Math.max(0.5, Math.min(8, sensor.waterLevel));
                sensor.rainfall = Math.max(0, Math.min(50, sensor.rainfall));
                sensor.temperature = Math.max(10, Math.min(40, sensor.temperature));
                sensor.humidity = Math.max(30, Math.min(90, sensor.humidity));
                
                sensor.lastUpdate = new Date();
            }
        });
    }, CONFIG.MONITORING.UPDATE_INTERVAL);
}

// ==========================================================================
// UTILITÁRIOS E HELPERS
// ==========================================================================

function updateElementSafely(element, content) {
    if (element) {
        element.innerHTML = content;
    }
}

function setupEventListeners() {
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Scroll indicator no hero
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }
    
    // Atualizar navbar no scroll
    window.addEventListener('scroll', updateNavbarOnScroll);
    
    console.log('🎯 Event listeners configurados');
}

function updateNavbarOnScroll() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

// ==========================================================================
// API PARA OUTRAS PÁGINAS
// ==========================================================================

// Disponibilizar funções globalmente para uso em outras páginas
window.FloodGuard = {
    activateEmergencyMode,
    showRealTimeData,
    simulateFlood,
    showNotification,
    getSensorData: () => APP_STATE.sensorsData,
    getAppState: () => ({ ...APP_STATE }),
    updateRealTimeData,
    checkActiveAlerts
};

// ==========================================================================
// CONSOLE WELCOME MESSAGE
// ==========================================================================

console.log(`
🌊 FloodGuard - Sistema Inteligente de Prevenção e Resposta a Enchentes
═══════════════════════════════════════════════════════════════════════

✨ Funcionalidades Ativas:
   • Simulação de enchente interativa
   • Sistema de alertas em tempo real
   • Modo de emergência
   • Monitoramento de sensores
   • Notificações inteligentes

🚀 Estado do Sistema: ATIVO
📊 Sensores: ${CONFIG.MONITORING.SENSOR_COUNT} simulados
⚡ Atualizações: A cada ${CONFIG.MONITORING.UPDATE_INTERVAL/1000}s

Desenvolvido com 💙 para salvar vidas
`);

console.log('🎯 Sistema FloodGuard totalmente carregado e operacional!'); 
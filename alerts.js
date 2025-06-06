// ==========================================================================
// FloodGuard - Sistema de Alertas JavaScript
// Funcionalidades avançadas de notificação e monitoramento em tempo real
// ==========================================================================

class FloodAlertSystem {
    constructor() {
        this.alerts = [];
        this.activeFilter = 'all';
        this.map = null;
        this.markers = [];
        this.notificationQueue = [];
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        console.log('🚨 Inicializando Sistema de Alertas FloodGuard...');
        this.initializeMap();
        this.generateInitialAlerts();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.displayAlerts();
        this.updateAlertHistory();
        console.log('✅ Sistema de Alertas inicializado com sucesso!');
    }

    initializeMap() {
        // Inicializar mapa centrado em São Paulo
        this.map = L.map('alertsMap').setView([-23.5505, -46.6333], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Adicionar marcadores de alertas
        this.updateMapMarkers();
    }

    generateInitialAlerts() {
        const alertTypes = [
            {
                level: 1,
                type: 'info',
                title: 'Monitoramento Normal',
                color: 'success',
                icon: 'check-circle'
            },
            {
                level: 2,
                type: 'warning',
                title: 'Atenção',
                color: 'warning',
                icon: 'exclamation-triangle'
            },
            {
                level: 3,
                type: 'alert',
                title: 'Alerta',
                color: 'orange',
                icon: 'exclamation-circle'
            },
            {
                level: 4,
                type: 'critical',
                title: 'Crítico',
                color: 'danger',
                icon: 'times-circle'
            },
            {
                level: 5,
                type: 'emergency',
                title: 'Emergência',
                color: 'purple',
                icon: 'skull-crossbones'
            }
        ];

        const locations = [
            { name: 'Centro', lat: -23.5505, lng: -46.6333 },
            { name: 'Vila Madalena', lat: -23.5268, lng: -46.6917 },
            { name: 'Brooklin', lat: -23.6140, lng: -46.6970 },
            { name: 'Ipiranga', lat: -23.5933, lng: -46.6100 },
            { name: 'Jabaquara', lat: -23.6200, lng: -46.6450 },
            { name: 'Tatuapé', lat: -23.5400, lng: -46.5700 },
            { name: 'Santana', lat: -23.5050, lng: -46.6250 },
            { name: 'Mooca', lat: -23.5650, lng: -46.6000 },
            { name: 'Lapa', lat: -23.5280, lng: -46.7050 },
            { name: 'Penha', lat: -23.5350, lng: -46.5400 }
        ];

        const messages = [
            'Níveis normais de precipitação detectados',
            'Aumento gradual no nível das águas observado',
            'Chuva intensa prevista para as próximas 2 horas',
            'Risco elevado de alagamento em vias principais',
            'Enchente confirmada - evacuação imediata recomendada',
            'Sensores indicam saturação do solo',
            'Drenagem urbana operando em capacidade máxima',
            'Previsão meteorológica indica tempestade severa',
            'Bloqueio de vias devido ao acúmulo de água',
            'Acionamento das sirenes de emergência'
        ];

        // Gerar alertas iniciais
        for (let i = 0; i < 15; i++) {
            const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];
            
            const alert = {
                id: `alert_${Date.now()}_${i}`,
                timestamp: new Date(Date.now() - Math.random() * 3600000 * 24),
                level: alertType.level,
                type: alertType.type,
                title: alertType.title,
                message: message,
                location: location.name,
                coordinates: { lat: location.lat, lng: location.lng },
                icon: alertType.icon,
                color: alertType.color,
                status: Math.random() > 0.3 ? 'active' : 'resolved',
                affectedPeople: Math.floor(Math.random() * 5000) + 100,
                severity: this.calculateSeverity(alertType.level)
            };

            this.alerts.push(alert);
        }

        // Ordenar por timestamp (mais recentes primeiro)
        this.alerts.sort((a, b) => b.timestamp - a.timestamp);
    }

    calculateSeverity(level) {
        const severities = {
            1: 'Baixa',
            2: 'Moderada',
            3: 'Alta',
            4: 'Crítica',
            5: 'Extrema'
        };
        return severities[level] || 'Desconhecida';
    }

    displayAlerts() {
        const alertsFeed = document.getElementById('alertsFeed');
        const filteredAlerts = this.filterAlerts();

        if (filteredAlerts.length === 0) {
            alertsFeed.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <h5>Nenhum alerta para este filtro</h5>
                    <p class="text-muted">Todas as áreas estão seguras no momento</p>
                </div>
            `;
            return;
        }

        alertsFeed.innerHTML = filteredAlerts.map(alert => {
            const severityClass = this.getSeverityClass(alert.type);
            const timeAgo = this.getTimeAgo(alert.timestamp);
            const iconName = this.getAlertIcon(alert.type);
            
            return `
                <div class="alert-card ${alert.type}">
                    <div class="alert-header">
                        <div class="d-flex align-items-center">
                            <div class="alert-icon ${alert.type}">
                                <i class="fas fa-${iconName}"></i>
                            </div>
                            <div class="alert-content">
                                <h6>${alert.title}</h6>
                                <p>${alert.message}</p>
                            </div>
                        </div>
                        <span class="severity-badge ${severityClass}">${alert.severity}</span>
                    </div>
                    <div class="alert-meta">
                        <div class="alert-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${alert.location}</span>
                        </div>
                        <div class="alert-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getSeverityClass(type) {
        const classMap = {
            'info': 'info',
            'warning': 'warning', 
            'alert': 'warning',
            'critical': 'danger',
            'emergency': 'critical'
        };
        return classMap[type] || 'info';
    }

    getAlertIcon(type) {
        const iconMap = {
            'info': 'check-circle',
            'warning': 'exclamation-triangle',
            'alert': 'exclamation-circle',
            'critical': 'times-circle',
            'emergency': 'skull-crossbones'
        };
        return iconMap[type] || 'info-circle';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes} min atrás`;
        if (hours < 24) return `${hours}h atrás`;
        return `${days}d atrás`;
    }

    filterAlerts() {
        if (this.activeFilter === 'all') {
            return this.alerts;
        }

        const filterMap = {
            'info': [1],
            'warning': [2, 3],
            'critical': [4, 5]
        };

        return this.alerts.filter(alert => 
            filterMap[this.activeFilter]?.includes(alert.level)
        );
    }

    updateMapMarkers() {
        // Limpar marcadores existentes
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Adicionar novos marcadores
        this.alerts.forEach(alert => {
            if (alert.status === 'active') {
                const iconColor = {
                    1: '#28a745',
                    2: '#ffc107', 
                    3: '#fd7e14',
                    4: '#dc3545',
                    5: '#6f42c1'
                };

                const iconName = this.getAlertIcon(alert.type);
                const bgColor = iconColor[alert.level] || '#17a2b8';

                const marker = L.marker([alert.coordinates.lat, alert.coordinates.lng], {
                    icon: L.divIcon({
                        html: `<div class="map-marker-custom" style="background: ${bgColor}; border: 3px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                                <i class="fas fa-${iconName}" style="color: white; font-size: 14px;"></i>
                               </div>`,
                        className: 'custom-div-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                });

                marker.bindPopup(`
                    <div class="popup-content">
                        <h6 class="fw-bold text-${alert.color}">
                            <i class="fas fa-${alert.icon} me-2"></i>${alert.title}
                        </h6>
                        <p class="mb-2">${alert.message}</p>
                        <div class="small text-muted">
                            <div><strong>Local:</strong> ${alert.location}</div>
                            <div><strong>Horário:</strong> ${this.formatTime(alert.timestamp)}</div>
                            <div><strong>Afetados:</strong> ${alert.affectedPeople.toLocaleString()} pessoas</div>
                        </div>
                        <div class="mt-2">
                            <button class="btn btn-${alert.color} btn-sm" onclick="alertSystem.viewDetails('${alert.id}')">
                                Ver Detalhes
                            </button>
                        </div>
                    </div>
                `);

                this.map.addLayer(marker);
                this.markers.push(marker);
            }
        });
    }

    updateAlertHistory() {
        const historyContainer = document.getElementById('alertHistory');
        const recentAlerts = this.alerts.slice(0, 8);

        historyContainer.innerHTML = recentAlerts.map((alert, index) => {
            const typeClass = alert.type === 'critical' || alert.type === 'emergency' ? 'recent' : 
                            alert.type === 'warning' || alert.type === 'alert' ? 'warning' :
                            alert.type === 'info' ? 'info' : '';
            
            return `
                <div class="history-item ${typeClass}">
                    <div class="history-content">
                        <h6>${alert.title}</h6>
                        <p>${alert.message.length > 60 ? alert.message.substring(0, 60) + '...' : alert.message}</p>
                        <div class="history-time">${this.getTimeAgo(alert.timestamp)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Formulário de inscrição
        const subscriptionForm = document.getElementById('subscriptionForm');
        subscriptionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubscription();
        });

        // Scroll suave para indicador
        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                document.querySelector('section.py-4').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }
    }

    startRealTimeUpdates() {
        // Atualizar dados a cada 10 segundos
        this.updateInterval = setInterval(() => {
            this.simulateNewAlert();
            this.updateCounters();
            this.displayAlerts();
            this.updateMapMarkers();
            this.updateAlertHistory();
        }, 10000);

        // Simular notificação de emergência ocasionalmente
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% de chance
                this.showEmergencyNotification();
            }
        }, 30000);
    }

    simulateNewAlert() {
        if (Math.random() < 0.3) { // 30% de chance de novo alerta
            const newAlert = this.generateRandomAlert();
            this.alerts.unshift(newAlert);
            
            // Manter apenas os 50 alertas mais recentes
            if (this.alerts.length > 50) {
                this.alerts = this.alerts.slice(0, 50);
            }

            // Mostrar notificação se for crítico
            if (newAlert.level >= 4) {
                this.showAlertNotification(newAlert);
            }
        }
    }

    generateRandomAlert() {
        const alertTypes = [
            { level: 1, type: 'info', title: 'Informativo', color: 'success', icon: 'check-circle' },
            { level: 2, type: 'warning', title: 'Atenção', color: 'warning', icon: 'exclamation-triangle' },
            { level: 3, type: 'alert', title: 'Alerta', color: 'warning', icon: 'exclamation-circle' },
            { level: 4, type: 'critical', title: 'Crítico', color: 'danger', icon: 'times-circle' },
            { level: 5, type: 'emergency', title: 'Emergência', color: 'purple', icon: 'skull-crossbones' }
        ];

        const locations = [
            { name: 'Centro', lat: -23.5505, lng: -46.6333 },
            { name: 'Vila Madalena', lat: -23.5268, lng: -46.6917 },
            { name: 'Brooklin', lat: -23.6140, lng: -46.6970 }
        ];

        const messages = [
            'Novos dados meteorológicos recebidos',
            'Alteração nos níveis de água detectada',
            'Atualização do sistema de monitoramento',
            'Alerta crítico: evacuação recomendada'
        ];

        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];

        return {
            id: `alert_${Date.now()}_${Math.random()}`,
            timestamp: new Date(),
            level: alertType.level,
            type: alertType.type,
            title: alertType.title,
            message: message,
            location: location.name,
            coordinates: location,
            icon: alertType.icon,
            color: alertType.color,
            status: 'active',
            affectedPeople: Math.floor(Math.random() * 2000) + 100,
            severity: this.calculateSeverity(alertType.level)
        };
    }

    updateCounters() {
        const safeAreas = document.getElementById('safeAreas');
        const activeAlerts = document.getElementById('activeAlerts');
        const criticalAreas = document.getElementById('criticalAreas');
        const notifiedPeople = document.getElementById('notifiedPeople');

        const criticalCount = this.alerts.filter(a => a.level >= 4 && a.status === 'active').length;
        const activeCount = this.alerts.filter(a => a.status === 'active').length;
        const totalPeople = this.alerts
            .filter(a => a.status === 'active')
            .reduce((sum, alert) => sum + alert.affectedPeople, 0);

        this.animateCounter(safeAreas, 127 - criticalCount);
        this.animateCounter(activeAlerts, activeCount);
        this.animateCounter(criticalAreas, criticalCount);
        this.animateCounter(notifiedPeople, totalPeople);
    }

    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent.replace(/[,.]/g, '')) || 0;
        const increment = (targetValue - currentValue) / 10;
        
        let counter = 0;
        const timer = setInterval(() => {
            counter++;
            const newValue = Math.round(currentValue + (increment * counter));
            element.textContent = newValue.toLocaleString();
            
            if (counter >= 10) {
                clearInterval(timer);
                element.textContent = targetValue.toLocaleString();
            }
        }, 50);
    }

    showEmergencyNotification() {
        const emergencyAlert = document.getElementById('emergencyAlert');
        const alertText = document.getElementById('emergencyAlertText');
        
        const emergencyMessages = [
            'Enchente detectada na região central - evacuação imediata!',
            'Tempestade severa se aproximando - busque abrigo!',
            'Níveis críticos de água registrados - evite áreas de risco!',
            'Alerta máximo: situação de emergência declarada!'
        ];

        alertText.textContent = emergencyMessages[Math.floor(Math.random() * emergencyMessages.length)];
        emergencyAlert.classList.remove('d-none');

        // Tocar som de alerta (simulado)
        console.log('🚨 ALERTA DE EMERGÊNCIA ATIVADO!');

        // Ocultar após 10 segundos
        setTimeout(() => {
            emergencyAlert.classList.add('d-none');
        }, 10000);
    }

    showAlertNotification(alert) {
        // Criar notificação toast
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${alert.color} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <strong><i class="fas fa-${alert.icon} me-2"></i>${alert.title}</strong><br>
                        ${alert.message} - ${alert.location}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        // Adicionar à página
        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        toastContainer.innerHTML = toastHtml;
        document.body.appendChild(toastContainer);

        // Ativar toast
        const toastElement = toastContainer.querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remover após 5 segundos
        setTimeout(() => {
            document.body.removeChild(toastContainer);
        }, 5000);
    }

    handleSubscription() {
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const location = document.getElementById('location').value;

        if (!phone && !email) {
            alert('Por favor, forneça pelo menos um meio de contato.');
            return;
        }

        // Simular inscrição
        const successToast = `
            <div class="toast align-items-center text-white bg-success border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <strong><i class="fas fa-check-circle me-2"></i>Inscrição realizada!</strong><br>
                        Você receberá alertas para ${location}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        toastContainer.innerHTML = successToast;
        document.body.appendChild(toastContainer);

        const toastElement = toastContainer.querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Limpar formulário
        document.getElementById('subscriptionForm').reset();

        setTimeout(() => {
            document.body.removeChild(toastContainer);
        }, 5000);
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d atrás`;
        } else if (hours > 0) {
            return `${hours}h atrás`;
        } else if (minutes > 0) {
            return `${minutes}min atrás`;
        } else {
            return 'Agora';
        }
    }

    viewDetails(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;

        const modal = new bootstrap.Modal(document.createElement('div'));
        const modalHtml = `
            <div class="modal fade" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-${alert.color} text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-${alert.icon} me-2"></i>Detalhes do Alerta
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Informações Gerais</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Tipo:</strong> ${alert.title}</li>
                                        <li><strong>Severidade:</strong> ${alert.severity}</li>
                                        <li><strong>Status:</strong> ${alert.status}</li>
                                        <li><strong>Local:</strong> ${alert.location}</li>
                                        <li><strong>Horário:</strong> ${alert.timestamp.toLocaleString()}</li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h6>Impacto</h6>
                                    <ul class="list-unstyled">
                                        <li><strong>Pessoas Afetadas:</strong> ${alert.affectedPeople.toLocaleString()}</li>
                                        <li><strong>Coordenadas:</strong> ${alert.coordinates.lat.toFixed(4)}, ${alert.coordinates.lng.toFixed(4)}</li>
                                    </ul>
                                </div>
                            </div>
                            <hr>
                            <h6>Descrição</h6>
                            <p>${alert.message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-${alert.color}">Compartilhar Alerta</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.body.lastElementChild;
        const bootstrapModal = new bootstrap.Modal(modalElement);
        bootstrapModal.show();

        modalElement.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalElement);
        });
    }

    shareAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;

        const shareText = `🚨 ${alert.title} - ${alert.location}\n${alert.message}\nVia FloodGuard - Sistema de Alertas`;
        
        if (navigator.share) {
            navigator.share({
                title: `FloodGuard - ${alert.title}`,
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Link copiado para a área de transferência!');
            });
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.map) {
            this.map.remove();
        }
    }
}

// Funções globais para filtros
function filterAlerts(filter) {
    // Atualizar botões ativos
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Aplicar filtro
    alertSystem.activeFilter = filter;
    alertSystem.displayAlerts();
}

// Inicialização
let alertSystem;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM carregado - Inicializando sistema...');
    alertSystem = new FloodAlertSystem();
});

// Limpeza ao sair da página
window.addEventListener('beforeunload', () => {
    if (alertSystem) {
        alertSystem.destroy();
    }
});

// Adicionar estilos customizados para marcadores
const style = document.createElement('style');
style.textContent = `
    .custom-marker {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(255,255,255,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid currentColor;
    }
    
    .custom-div-icon {
        background: transparent !important;
        border: none !important;
    }
    
    .popup-content {
        min-width: 200px;
    }
`;
document.head.appendChild(style); 
// ==========================================================================
// FloodGuard - Sistema de Evacuação JavaScript
// Navegação inteligente, rotas otimizadas e coordenação de emergência
// ==========================================================================

class EvacuationSystem {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.routingControl = null;
        this.shelters = [];
        this.dangerZones = [];
        this.activeRoute = null;
        this.emergencyMode = false;
        this.layers = {
            shelters: null,
            dangers: null,
            traffic: null
        };
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        console.log('🚨 Inicializando Sistema de Evacuação FloodGuard...');
        this.initializeMap();
        this.generateSheltersData();
        this.generateDangerZones();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.displayNearestShelters();
        this.generateLiveUpdates();
        console.log('✅ Sistema de Evacuação inicializado com sucesso!');
    }

    initializeMap() {
        // Inicializar mapa centrado em São Paulo
        this.map = L.map('evacuationMap').setView([-23.5505, -46.6333], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Adicionar camadas
        this.initializeLayers();
        
        // Tentar obter localização do usuário
        this.getCurrentLocation();
    }

    initializeLayers() {
        // Camada de abrigos
        this.layers.shelters = L.layerGroup().addTo(this.map);
        
        // Camada de zonas de perigo
        this.layers.dangers = L.layerGroup().addTo(this.map);
        
        // Camada de trânsito
        this.layers.traffic = L.layerGroup().addTo(this.map);
    }

    generateSheltersData() {
        this.shelters = [
            {
                id: 'centro_esportivo',
                name: 'Centro Esportivo Municipal',
                coordinates: [-23.5505, -46.6333],
                capacity: 500,
                occupied: 127,
                facilities: ['Banheiros', 'Chuveiros', 'Cozinha', 'Enfermaria'],
                address: 'Rua das Flores, 123 - Centro',
                contact: '(11) 3456-7890',
                status: 'available'
            },
            {
                id: 'escola_estadual',
                name: 'Escola Estadual João Silva',
                coordinates: [-23.5268, -46.6917],
                capacity: 300,
                occupied: 89,
                facilities: ['Banheiros', 'Biblioteca', 'Quadra'],
                address: 'Av. Paulista, 456 - Vila Madalena',
                contact: '(11) 3654-0987',
                status: 'available'
            },
            {
                id: 'ginasio_olimpico',
                name: 'Ginásio Olímpico',
                coordinates: [-23.6140, -46.6970],
                capacity: 800,
                occupied: 234,
                facilities: ['Banheiros', 'Chuveiros', 'Arquibancada', 'Estacionamento'],
                address: 'Rua do Esporte, 789 - Brooklin',
                contact: '(11) 3321-6543',
                status: 'available'
            },
            {
                id: 'centro_cultural',
                name: 'Centro Cultural da Cidade',
                coordinates: [-23.5933, -46.6100],
                capacity: 400,
                occupied: 156,
                facilities: ['Auditório', 'Banheiros', 'Café'],
                address: 'Praça da Cultura, 321 - Ipiranga',
                contact: '(11) 3789-0123',
                status: 'available'
            },
            {
                id: 'clube_municipal',
                name: 'Clube Municipal',
                coordinates: [-23.6200, -46.6450],
                capacity: 600,
                occupied: 278,
                facilities: ['Piscina', 'Vestiários', 'Restaurante', 'Salão'],
                address: 'Av. dos Esportes, 654 - Jabaquara',
                contact: '(11) 3567-8901',
                status: 'nearly_full'
            },
            {
                id: 'igreja_matriz',
                name: 'Igreja Matriz São José',
                coordinates: [-23.5400, -46.5700],
                capacity: 200,
                occupied: 45,
                facilities: ['Salão paroquial', 'Cozinha', 'Banheiros'],
                address: 'Rua da Igreja, 147 - Tatuapé',
                contact: '(11) 3234-5678',
                status: 'available'
            }
        ];

        this.updateShelterMarkers();
    }

    generateDangerZones() {
        this.dangerZones = [
            {
                id: 'zona_centro',
                name: 'Centro - Área Alagada',
                coordinates: [
                    [-23.5450, -46.6380],
                    [-23.5550, -46.6380],
                    [-23.5550, -46.6280],
                    [-23.5450, -46.6280]
                ],
                level: 'high',
                description: 'Alagamento confirmado nas ruas principais'
            },
            {
                id: 'zona_marginais',
                name: 'Marginais - Trânsito Interditado',
                coordinates: [
                    [-23.5200, -46.6900],
                    [-23.5300, -46.6900],
                    [-23.5300, -46.6800],
                    [-23.5200, -46.6800]
                ],
                level: 'medium',
                description: 'Vias bloqueadas devido ao acúmulo de água'
            },
            {
                id: 'zona_sul',
                name: 'Zona Sul - Risco Elevado',
                coordinates: [
                    [-23.6100, -46.7000],
                    [-23.6200, -46.7000],
                    [-23.6200, -46.6900],
                    [-23.6100, -46.6900]
                ],
                level: 'critical',
                description: 'Área crítica - evacuação obrigatória'
            }
        ];

        this.updateDangerZones();
    }

    updateShelterMarkers() {
        this.layers.shelters.clearLayers();

        this.shelters.forEach(shelter => {
            const occupancyRate = (shelter.occupied / shelter.capacity) * 100;
            let markerColor = '#28a745'; // Verde
            
            if (occupancyRate > 80) markerColor = '#dc3545'; // Vermelho
            else if (occupancyRate > 60) markerColor = '#ffc107'; // Amarelo

            const marker = L.marker(shelter.coordinates, {
                icon: L.divIcon({
                    html: `<div class="shelter-marker" style="background: ${markerColor}">
                            <i class="fas fa-home"></i>
                           </div>`,
                    className: 'custom-div-icon',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            });

            const popupContent = `
                <div class="shelter-popup">
                    <h6 class="fw-bold mb-2">${shelter.name}</h6>
                    <div class="mb-2">
                        <div class="d-flex justify-content-between">
                            <span>Capacidade:</span>
                            <span>${shelter.occupied}/${shelter.capacity}</span>
                        </div>
                        <div class="capacity-bar mt-1">
                            <div class="capacity-fill" style="width: ${occupancyRate}%; background: ${markerColor}"></div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <strong>Instalações:</strong><br>
                        ${shelter.facilities.join(', ')}
                    </div>
                    <div class="mb-2">
                        <strong>Endereço:</strong><br>
                        ${shelter.address}
                    </div>
                    <div class="mb-3">
                        <strong>Contato:</strong> ${shelter.contact}
                    </div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary btn-sm" onclick="evacuationSystem.calculateRoute('${shelter.id}')">
                            <i class="fas fa-route me-1"></i>Ir para este abrigo
                        </button>
                        <button class="btn btn-outline-primary btn-sm" onclick="evacuationSystem.callShelter('${shelter.contact}')">
                            <i class="fas fa-phone me-1"></i>Ligar
                        </button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            this.layers.shelters.addLayer(marker);
        });
    }

    updateDangerZones() {
        this.layers.dangers.clearLayers();

        this.dangerZones.forEach(zone => {
            let color = '#ffc107'; // Amarelo para médio
            let fillOpacity = 0.3;
            
            if (zone.level === 'high') {
                color = '#fd7e14'; // Laranja
                fillOpacity = 0.4;
            } else if (zone.level === 'critical') {
                color = '#dc3545'; // Vermelho
                fillOpacity = 0.5;
            }

            const polygon = L.polygon(zone.coordinates, {
                color: color,
                fillColor: color,
                fillOpacity: fillOpacity,
                weight: 2
            });

            polygon.bindPopup(`
                <div class="danger-popup">
                    <h6 class="fw-bold text-danger">${zone.name}</h6>
                    <p class="mb-2">${zone.description}</p>
                    <div class="alert alert-warning mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Evite esta área!</strong>
                    </div>
                </div>
            `);

            this.layers.dangers.addLayer(polygon);
        });
    }

    displayNearestShelters() {
        const container = document.getElementById('nearestShelters');
        
        // Ordenar por distância (simulada) e disponibilidade
        const sortedShelters = this.shelters
            .sort((a, b) => {
                const occupancyA = a.occupied / a.capacity;
                const occupancyB = b.occupied / b.capacity;
                return occupancyA - occupancyB;
            })
            .slice(0, 4);

        container.innerHTML = sortedShelters.map(shelter => {
            const occupancyRate = (shelter.occupied / shelter.capacity) * 100;
            let statusClass = 'success';
            let statusText = 'Disponível';
            
            if (occupancyRate > 80) {
                statusClass = 'danger';
                statusText = 'Quase Lotado';
            } else if (occupancyRate > 60) {
                statusClass = 'warning';
                statusText = 'Ocupação Alta';
            }

            return `
                <div class="border-bottom p-3">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0 fw-bold">${shelter.name}</h6>
                        <span class="badge bg-${statusClass}">${statusText}</span>
                    </div>
                    <div class="mb-2">
                        <div class="d-flex justify-content-between text-muted small">
                            <span>Ocupação:</span>
                            <span>${shelter.occupied}/${shelter.capacity}</span>
                        </div>
                        <div class="capacity-bar mt-1">
                            <div class="capacity-fill bg-${statusClass}" style="width: ${occupancyRate}%"></div>
                        </div>
                    </div>
                    <div class="small text-muted mb-2">${shelter.address}</div>
                    <div class="d-grid gap-1">
                        <button class="btn btn-sm btn-outline-primary" onclick="evacuationSystem.calculateRoute('${shelter.id}')">
                            <i class="fas fa-route me-1"></i>Navegar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Formulário de rota
        const routeForm = document.getElementById('routeForm');
        routeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRouteCalculation();
        });

        // Detectar mudanças na localização
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => this.updateUserLocation(position),
                (error) => console.warn('Erro ao obter localização:', error),
                { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
            );
        }
    }

    getCurrentLocation() {
        const button = document.querySelector('button[onclick*="getCurrentLocation"]');
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Localizando...';

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Adicionar marcador do usuário
                    if (this.userMarker) {
                        this.map.removeLayer(this.userMarker);
                    }
                    
                    this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lng], {
                        icon: L.divIcon({
                            html: '<div style="background: #007bff; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="fas fa-user"></i></div>',
                            className: 'user-location-marker',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(this.map);

                    // Centralizar mapa na localização do usuário
                    this.map.setView([this.userLocation.lat, this.userLocation.lng], 14);
                    
                    // Atualizar campo de localização
                    document.getElementById('startLocation').value = 'Sua localização atual';
                    
                    button.innerHTML = '<i class="fas fa-location-arrow me-2"></i>Localização Obtida';
                    button.classList.add('btn-success');
                    button.classList.remove('btn-light');
                    
                    // Recalcular abrigos mais próximos
                    this.displayNearestShelters();
                },
                (error) => {
                    console.error('Erro ao obter localização:', error);
                    button.innerHTML = '<i class="fas fa-location-arrow me-2"></i>Erro na Localização';
                    button.classList.add('btn-warning');
                    button.classList.remove('btn-light');
                    
                    // Usar localização padrão (Centro de SP)
                    this.userLocation = { lat: -23.5505, lng: -46.6333 };
                }
            );
        } else {
            button.innerHTML = '<i class="fas fa-times me-2"></i>GPS Indisponível';
            button.classList.add('btn-danger');
            button.classList.remove('btn-light');
        }
    }

    useCurrentLocation() {
        if (this.userLocation) {
            document.getElementById('startLocation').value = 'Sua localização atual';
        } else {
            this.getCurrentLocation();
        }
    }

    calculateRoute(shelterId) {
        const shelter = this.shelters.find(s => s.id === shelterId);
        if (!shelter) return;

        if (!this.userLocation) {
            alert('Localização não disponível. Clique em "Minha Localização" primeiro.');
            return;
        }

        // Remover rota anterior
        if (this.routingControl) {
            this.map.removeControl(this.routingControl);
        }

        // Criar nova rota
        this.routingControl = L.Routing.control({
            waypoints: [
                L.latLng(this.userLocation.lat, this.userLocation.lng),
                L.latLng(shelter.coordinates[0], shelter.coordinates[1])
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: () => null, // Não criar marcadores automáticos
            lineOptions: {
                styles: [{ color: '#28a745', weight: 6, opacity: 0.8 }]
            }
        }).addTo(this.map);

        // Mostrar tracker de navegação
        this.showNavigationTracker(shelter);
        
        // Atualizar formulário
        document.getElementById('shelterSelect').value = shelterId;
        
        // Centralizar mapa na rota
        this.map.fitBounds([
            [this.userLocation.lat, this.userLocation.lng],
            [shelter.coordinates[0], shelter.coordinates[1]]
        ], { padding: [20, 20] });
    }

    showNavigationTracker(shelter) {
        const tracker = document.getElementById('gpsTracker');
        const stepsContainer = document.getElementById('navigationSteps');
        
        // Simular instruções de navegação
        const instructions = [
            'Siga em frente por 500m',
            'Vire à direita na Rua das Flores',
            'Continue por 1,2km',
            `Chegue ao destino: ${shelter.name}`
        ];

        stepsContainer.innerHTML = instructions.map((instruction, index) => `
            <div class="step-indicator">
                <div class="step-number">${index + 1}</div>
                <div class="small">${instruction}</div>
            </div>
        `).join('');

        tracker.classList.remove('d-none');
        
        // Simular progresso da navegação
        this.simulateNavigation(instructions);
    }

    simulateNavigation(instructions) {
        let currentStep = 0;
        const stepInterval = setInterval(() => {
            if (currentStep < instructions.length - 1) {
                currentStep++;
                const steps = document.querySelectorAll('.step-number');
                steps.forEach((step, index) => {
                    if (index < currentStep) {
                        step.style.background = '#28a745';
                    } else if (index === currentStep) {
                        step.style.background = '#ffc107';
                    }
                });
            } else {
                clearInterval(stepInterval);
                this.completeNavigation();
            }
        }, 5000); // Avançar a cada 5 segundos para demonstração
    }

    completeNavigation() {
        const tracker = document.getElementById('gpsTracker');
        const stepsContainer = document.getElementById('navigationSteps');
        
        stepsContainer.innerHTML = `
            <div class="text-center text-success">
                <i class="fas fa-check-circle fa-2x mb-2"></i>
                <div class="fw-bold">Você chegou ao destino!</div>
                <div class="small">Procure a recepção do abrigo</div>
            </div>
        `;

        setTimeout(() => {
            tracker.classList.add('d-none');
        }, 5000);
    }

    handleRouteCalculation() {
        const startLocation = document.getElementById('startLocation').value;
        const shelterSelect = document.getElementById('shelterSelect').value;

        if (!startLocation) {
            alert('Por favor, informe sua localização atual.');
            return;
        }

        if (!shelterSelect) {
            alert('Por favor, selecione um abrigo de destino.');
            return;
        }

        this.calculateRoute(shelterSelect);
    }

    toggleLayer(layerName) {
        const layer = this.layers[layerName];
        if (!layer) return;

        const button = event.target.closest('button');
        
        if (this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
            button.classList.remove('active');
        } else {
            this.map.addLayer(layer);
            button.classList.add('active');
        }
    }

    startEmergencyMode() {
        this.emergencyMode = true;
        
        // Ativar modo de emergência visual
        document.body.classList.add('emergency-mode');
        
        // Mostrar notificação de emergência
        const emergencyAlert = `
            <div class="alert alert-danger alert-dismissible fade show position-fixed" style="top: 100px; left: 50%; transform: translateX(-50%); z-index: 1055; min-width: 400px;">
                <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle fa-2x me-3 text-danger"></i>
                    <div>
                        <h6 class="alert-heading mb-1">MODO EMERGÊNCIA ATIVADO</h6>
                        <p class="mb-0">Calculando rota mais segura automaticamente...</p>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', emergencyAlert);
        
        // Encontrar abrigo mais próximo disponível
        setTimeout(() => {
            this.findNearestAvailableShelter();
        }, 2000);
    }

    findNearestAvailableShelter() {
        const availableShelters = this.shelters.filter(s => s.occupied / s.capacity < 0.8);
        if (availableShelters.length > 0) {
            const nearestShelter = availableShelters[0]; // Simplificado
            this.calculateRoute(nearestShelter.id);
        }
    }

    requestRescue() {
        const rescueModal = `
            <div class="modal fade" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-helicopter me-2"></i>Solicitação de Resgate
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Use apenas em situações de extrema emergência
                            </div>
                            <form>
                                <div class="mb-3">
                                    <label class="form-label">Situação Atual</label>
                                    <select class="form-select">
                                        <option>Preso em área alagada</option>
                                        <option>Ferido/Necessita assistência médica</option>
                                        <option>Veículo preso na água</option>
                                        <option>Pessoa desaparecida</option>
                                        <option>Outra emergência</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Número de Pessoas</label>
                                    <input type="number" class="form-control" value="1" min="1">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Observações</label>
                                    <textarea class="form-control" rows="3" placeholder="Descreva a situação..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" onclick="evacuationSystem.confirmRescueRequest()">
                                <i class="fas fa-exclamation-triangle me-2"></i>Solicitar Resgate Urgente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', rescueModal);
        const modalElement = document.body.lastElementChild;
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        modalElement.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalElement);
        });
    }

    confirmRescueRequest() {
        // Simular envio da solicitação
        const successAlert = `
            <div class="alert alert-success alert-dismissible fade show position-fixed" style="top: 100px; right: 20px; z-index: 1055; min-width: 350px;">
                <div class="d-flex align-items-center">
                    <i class="fas fa-check-circle fa-2x me-3 text-success"></i>
                    <div>
                        <h6 class="alert-heading mb-1">RESGATE SOLICITADO</h6>
                        <p class="mb-0">Equipe de emergência a caminho<br>
                        <strong>Protocolo:</strong> RES-${Date.now().toString().slice(-6)}</p>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', successAlert);
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
        modal.hide();
        
        // Adicionar update em tempo real
        this.addLiveUpdate('🚁 Equipe de resgate despachada para sua localização', 'danger');
    }

    stopNavigation() {
        if (this.routingControl) {
            this.map.removeControl(this.routingControl);
            this.routingControl = null;
        }
        
        document.getElementById('gpsTracker').classList.add('d-none');
    }

    shareLocation() {
        if (this.userLocation) {
            const locationText = `Minha localização atual: ${this.userLocation.lat.toFixed(6)}, ${this.userLocation.lng.toFixed(6)} - FloodGuard Emergency`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Minha Localização - FloodGuard',
                    text: locationText,
                    url: `https://maps.google.com/?q=${this.userLocation.lat},${this.userLocation.lng}`
                });
            } else {
                navigator.clipboard.writeText(locationText).then(() => {
                    alert('Localização copiada para a área de transferência!');
                });
            }
        }
    }

    callShelter(phone) {
        window.open(`tel:${phone}`, '_self');
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateEvacuationStats();
            this.updateShelterOccupancy();
            this.generateRandomUpdate();
        }, 15000); // Atualizar a cada 15 segundos
    }

    updateEvacuationStats() {
        // Simular mudanças nos números
        const availableShelters = document.getElementById('availableShelters');
        const activeRoutes = document.getElementById('activeRoutes');
        const evacuatingPeople = document.getElementById('evacuatingPeople');
        const avgTime = document.getElementById('avgTime');

        const newShelters = Math.max(8, parseInt(availableShelters.textContent) + (Math.random() > 0.5 ? 1 : -1));
        const newRoutes = Math.max(3, parseInt(activeRoutes.textContent) + (Math.random() > 0.5 ? 1 : -1));
        const newPeople = Math.max(800, parseInt(evacuatingPeople.textContent.replace(/[,.]/g, '')) + Math.floor((Math.random() - 0.5) * 100));

        availableShelters.textContent = newShelters;
        activeRoutes.textContent = newRoutes;
        evacuatingPeople.textContent = newPeople.toLocaleString();
        
        // Tempo médio varia entre 6-12 minutos
        const minutes = Math.floor(Math.random() * 6) + 6;
        avgTime.textContent = `${minutes} min`;
    }

    updateShelterOccupancy() {
        // Simular mudanças na ocupação dos abrigos
        this.shelters.forEach(shelter => {
            const change = Math.floor((Math.random() - 0.5) * 10);
            shelter.occupied = Math.max(0, Math.min(shelter.capacity, shelter.occupied + change));
        });

        this.updateShelterMarkers();
        this.displayNearestShelters();
    }

    generateLiveUpdates() {
        const updates = [
            { text: '🚌 Ônibus de evacuação chegou ao Centro Esportivo', type: 'info' },
            { text: '⚠️ Nova área de risco identificada na Zona Leste', type: 'warning' },
            { text: '🏥 Equipe médica posicionada no Ginásio Olímpico', type: 'success' },
            { text: '🚧 Rua das Flores temporariamente bloqueada', type: 'warning' },
            { text: '✅ 50 pessoas evacuadas com sucesso', type: 'success' },
            { text: '📡 Sistema de comunicação restabelecido', type: 'info' }
        ];

        const container = document.getElementById('liveUpdates');
        
        // Adicionar updates iniciais
        updates.forEach((update, index) => {
            setTimeout(() => {
                this.addLiveUpdate(update.text, update.type);
            }, index * 2000);
        });
    }

    addLiveUpdate(text, type = 'info') {
        const container = document.getElementById('liveUpdates');
        const timestamp = new Date().toLocaleTimeString();
        
        const updateElement = document.createElement('div');
        updateElement.className = `mb-3 p-2 border-start border-${type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'primary'} border-3`;
        updateElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="small">${text}</div>
                <small class="text-muted ms-2">${timestamp}</small>
            </div>
        `;

        container.insertBefore(updateElement, container.firstChild);

        // Manter apenas os 10 updates mais recentes
        const updates = container.children;
        if (updates.length > 10) {
            container.removeChild(updates[updates.length - 1]);
        }

        // Scroll para o topo
        container.scrollTop = 0;
    }

    generateRandomUpdate() {
        const randomUpdates = [
            { text: '🚨 Novo alerta emitido para região central', type: 'warning' },
            { text: '🚑 Ambulância despachada para atendimento', type: 'info' },
            { text: '⛑️ Equipe de resgate em ação', type: 'info' },
            { text: '📍 Rota alternativa calculada automaticamente', type: 'success' },
            { text: '🔧 Manutenção concluída no sistema de drenagem', type: 'success' },
            { text: '📊 Atualização dos dados meteorológicos', type: 'info' }
        ];

        const randomUpdate = randomUpdates[Math.floor(Math.random() * randomUpdates.length)];
        this.addLiveUpdate(randomUpdate.text, randomUpdate.type);
    }

    updateUserLocation(position) {
        this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // Atualizar marcador do usuário se existir
        if (this.userMarker) {
            this.userMarker.setLatLng([this.userLocation.lat, this.userLocation.lng]);
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.routingControl) {
            this.map.removeControl(this.routingControl);
        }
        if (this.map) {
            this.map.remove();
        }
    }
}

// Inicialização
let evacuationSystem;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM carregado - Inicializando sistema de evacuação...');
    evacuationSystem = new EvacuationSystem();
});

// Limpeza ao sair da página
window.addEventListener('beforeunload', () => {
    if (evacuationSystem) {
        evacuationSystem.destroy();
    }
});

// Estilos adicionais
const style = document.createElement('style');
style.textContent = `
    .user-location-marker {
        background: transparent !important;
        border: none !important;
    }
    
    .emergency-mode {
        filter: hue-rotate(15deg) contrast(1.1);
    }
    
    .shelter-popup {
        min-width: 250px;
    }
    
    .danger-popup {
        min-width: 200px;
    }
    
    .custom-div-icon {
        background: transparent !important;
        border: none !important;
    }
`;
document.head.appendChild(style); 
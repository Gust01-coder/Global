/* ==========================================================================
   FloodGuard - Monitoramento JavaScript
   Funcionalidades específicas da página de monitoramento
   ========================================================================== */

// ==========================================================================
// VARIÁVEIS GLOBAIS DO MONITORAMENTO
// ==========================================================================

let currentView = 'realtime';
let currentChartPeriod = '24h';
let waterLevelChart = null;
let sensorsVisible = true;
let floodLayerVisible = true;
let monitoringInterval = null;

// Dados simulados para gráficos
const chartData = {
    '24h': {
        labels: [],
        waterLevels: [],
        rainfall: []
    },
    '7d': {
        labels: [],
        waterLevels: [],
        rainfall: []
    },
    '30d': {
        labels: [],
        waterLevels: [],
        rainfall: []
    }
};

// ==========================================================================
// INICIALIZAÇÃO DA PÁGINA DE MONITORAMENTO
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('monitoring.html')) {
        console.log('📊 Inicializando página de monitoramento');
        
        initializeMonitoringPage();
        setupMonitoringIntervals();
        generateInitialChartData();
        createWaterLevelChart();
        generateInteractiveMap();
        loadSensorsList();
        generateRainfallForecast();
        updateWeatherData();
        
        console.log('✅ Página de monitoramento carregada');
    }
});

// ==========================================================================
// INICIALIZAÇÃO DOS COMPONENTES
// ==========================================================================

function initializeMonitoringPage() {
    // Atualizar timestamp inicial
    updateLastUpdateTime();
    
    // Configurar estilos específicos do monitoramento
    addMonitoringStyles();
    
    // Atualizar métricas iniciais
    updateKeyMetrics();
}

function addMonitoringStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .metric-card-large {
            border-radius: 1rem;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .metric-card-large:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .metric-card-large::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            transform: translate(30px, -30px);
        }
        
        .metric-icon {
            font-size: 2.5rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
        }
        
        .metric-trend {
            font-size: 0.8rem;
            opacity: 0.8;
        }
        
        .weather-main {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .weather-icon {
            font-size: 3rem;
        }
        
        .weather-detail {
            text-align: center;
            padding: 0.5rem;
            background: rgba(0,123,255,0.1);
            border-radius: 0.5rem;
        }
        
        .weather-detail i {
            display: block;
            margin-bottom: 0.25rem;
        }
        
        .weather-detail small {
            display: block;
            margin-bottom: 0.25rem;
        }
        
        .map-legend {
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(255,255,255,0.9);
            padding: 0.5rem;
            border-radius: 0.5rem;
            font-size: 0.8rem;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }
        
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }
        
        .legend-color.safe { background: rgba(40, 167, 69, 0.8); }
        .legend-color.warning { background: rgba(255, 193, 7, 0.8); }
        .legend-color.danger { background: rgba(220, 53, 69, 0.8); }
        .legend-color.sensor { background: rgba(23, 162, 184, 0.8); border: 2px solid white; }
        
        .sensor-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            background: rgba(0,123,255,0.05);
            border-radius: 0.5rem;
            border-left: 4px solid transparent;
            transition: all 0.3s ease;
        }
        
        .sensor-item:hover {
            background: rgba(0,123,255,0.1);
            transform: translateX(5px);
        }
        
        .sensor-item.online {
            border-left-color: #28a745;
        }
        
        .sensor-item.offline {
            border-left-color: #dc3545;
            opacity: 0.7;
        }
        
        .sensor-item.warning {
            border-left-color: #ffc107;
        }
        
        .sensor-info h6 {
            margin-bottom: 0.25rem;
            font-size: 0.9rem;
        }
        
        .sensor-info small {
            color: #6c757d;
        }
        
        .sensor-status {
            text-align: right;
        }
        
        .sensor-value {
            font-weight: bold;
            margin-bottom: 0.25rem;
        }
        
        .status-badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
        }
        
        .rainfall-hour {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            background: rgba(23,162,184,0.1);
            border-radius: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .rainfall-hour:hover {
            background: rgba(23,162,184,0.2);
            transform: translateX(5px);
        }
        
        .rainfall-bar {
            width: 100px;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin: 0 1rem;
        }
        
        .rainfall-fill {
            height: 100%;
            background: linear-gradient(90deg, #17a2b8, #0056b3);
            border-radius: 4px;
            transition: width 0.5s ease;
        }
        
        .risk-scale {
            width: 100%;
            height: 20px;
            background: linear-gradient(90deg, #28a745 0%, #ffc107 50%, #dc3545 100%);
            border-radius: 10px;
            position: relative;
            margin-bottom: 0.5rem;
        }
        
        .risk-indicator {
            position: absolute;
            top: -5px;
            width: 30px;
            height: 30px;
            background: white;
            border: 3px solid #333;
            border-radius: 50%;
            transform: translateX(-50%);
            transition: left 0.5s ease;
        }
        
        .risk-labels {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .factor-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            background: rgba(0,0,0,0.05);
            border-radius: 0.5rem;
        }
        
        .factor-item i {
            margin-right: 0.5rem;
        }
        
        .chart-container {
            position: relative;
            height: 300px;
        }
        
        .btn-group .btn.active {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================================================
// ATUALIZAÇÃO DE DADOS EM TEMPO REAL
// ==========================================================================

function setupMonitoringIntervals() {
    // Atualizar dados a cada 5 segundos
    monitoringInterval = setInterval(() => {
        if (currentView === 'realtime') {
            updateKeyMetrics();
            updateWeatherData();
            updateLastUpdateTime();
            updateChart();
            loadSensorsList();
        }
    }, 5000);
    
    // Atualizar gráfico com novos dados
    setInterval(() => {
        addNewChartData();
    }, 30000);
}

function updateKeyMetrics() {
    const sensors = window.FloodGuard ? window.FloodGuard.getSensorData() : [];
    
    // Calcular métricas
    const avgWaterLevel = calculateAverageWaterLevel(sensors);
    const totalRainfall = calculateTotalRainfall(sensors);
    const onlineSensors = sensors.filter(s => s.status === 'online').length;
    const activeAlerts = Math.floor(Math.random() * 3);
    
    // Atualizar elementos
    updateElementSafely(document.getElementById('waterLevel'), avgWaterLevel.toFixed(1) + 'm');
    updateElementSafely(document.getElementById('rainfall'), totalRainfall.toFixed(1) + 'mm');
    updateElementSafely(document.getElementById('sensorsOnline'), `${onlineSensors}/${sensors.length}`);
    updateElementSafely(document.getElementById('alertsCount'), activeAlerts);
}

function calculateAverageWaterLevel(sensors) {
    const onlineSensors = sensors.filter(s => s.status === 'online');
    if (onlineSensors.length === 0) return 2.3;
    
    const sum = onlineSensors.reduce((acc, sensor) => acc + sensor.waterLevel, 0);
    return sum / onlineSensors.length;
}

function calculateTotalRainfall(sensors) {
    const onlineSensors = sensors.filter(s => s.status === 'online');
    if (onlineSensors.length === 0) return 12.5;
    
    const sum = onlineSensors.reduce((acc, sensor) => acc + sensor.rainfall, 0);
    return sum / onlineSensors.length * 24; // Simular 24h
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    updateElementSafely(document.getElementById('lastUpdate'), timeString);
}

function updateWeatherData() {
    const weatherData = generateRandomWeatherData();
    
    updateElementSafely(document.getElementById('temperature'), weatherData.temperature + '°C');
    updateElementSafely(document.getElementById('visibility'), weatherData.visibility + 'km');
    updateElementSafely(document.getElementById('windSpeed'), weatherData.windSpeed + 'km/h');
    updateElementSafely(document.getElementById('humidity'), weatherData.humidity + '%');
    updateElementSafely(document.getElementById('pressure'), weatherData.pressure + 'mb');
}

function generateRandomWeatherData() {
    return {
        temperature: Math.floor(Math.random() * 10) + 18,
        visibility: Math.floor(Math.random() * 5) + 5,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        humidity: Math.floor(Math.random() * 30) + 60,
        pressure: Math.floor(Math.random() * 40) + 1000
    };
}

// ==========================================================================
// GRÁFICOS E VISUALIZAÇÕES
// ==========================================================================

function generateInitialChartData() {
    const periods = {
        '24h': { points: 24, interval: 1 },
        '7d': { points: 7, interval: 24 },
        '30d': { points: 30, interval: 24 }
    };
    
    Object.keys(periods).forEach(period => {
        const config = periods[period];
        chartData[period].labels = [];
        chartData[period].waterLevels = [];
        chartData[period].rainfall = [];
        
        for (let i = config.points - 1; i >= 0; i--) {
            const date = new Date();
            if (period === '24h') {
                date.setHours(date.getHours() - i);
                chartData[period].labels.push(date.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }));
            } else {
                date.setDate(date.getDate() - i);
                chartData[period].labels.push(date.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                }));
            }
            
            // Gerar dados simulados
            const baseWaterLevel = 2.3;
            const waterVariation = (Math.random() - 0.5) * 1.5;
            chartData[period].waterLevels.push(baseWaterLevel + waterVariation);
            
            chartData[period].rainfall.push(Math.random() * 15);
        }
    });
}

function createWaterLevelChart() {
    const ctx = document.getElementById('waterLevelChart');
    if (!ctx) return;
    
    const data = chartData[currentChartPeriod];
    
    waterLevelChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Nível da Água (m)',
                data: data.waterLevels,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8
            }, {
                label: 'Chuva (mm)',
                data: data.rainfall,
                borderColor: '#17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.2,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#007bff',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Nível da Água (m)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Precipitação (mm)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateChart() {
    if (!waterLevelChart) return;
    
    const data = chartData[currentChartPeriod];
    waterLevelChart.data.labels = data.labels;
    waterLevelChart.data.datasets[0].data = data.waterLevels;
    waterLevelChart.data.datasets[1].data = data.rainfall;
    waterLevelChart.update('none');
}

function addNewChartData() {
    const data = chartData[currentChartPeriod];
    
    // Adicionar novo ponto
    const now = new Date();
    let newLabel;
    
    if (currentChartPeriod === '24h') {
        newLabel = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else {
        newLabel = now.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    }
    
    // Remover primeiro ponto e adicionar novo
    data.labels.shift();
    data.labels.push(newLabel);
    
    data.waterLevels.shift();
    data.waterLevels.push(calculateAverageWaterLevel(window.FloodGuard?.getSensorData() || []));
    
    data.rainfall.shift();
    data.rainfall.push(Math.random() * 15);
    
    updateChart();
}

// ==========================================================================
// MAPA INTERATIVO
// ==========================================================================

function generateInteractiveMap() {
    const mapGrid = document.getElementById('mapGrid');
    if (!mapGrid) return;
    
    mapGrid.innerHTML = '';
    
    // Criar tooltip container
    let tooltip = document.querySelector('.map-cell-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'map-cell-tooltip';
        document.body.appendChild(tooltip);
    }
    
    // Dados para diferentes tipos de células
    const cellData = {
        safe: {
            icon: 'fas fa-check-circle',
            title: 'Área Segura',
            description: 'Sem riscos detectados',
            color: '#28a745'
        },
        warning: {
            icon: 'fas fa-exclamation-triangle',
            title: 'Área de Atenção',
            description: 'Monitoramento intensificado',
            color: '#ffc107'
        },
        danger: {
            icon: 'fas fa-times-circle',
            title: 'Área de Risco',
            description: 'Possível alagamento',
            color: '#dc3545'
        },
        sensor: {
            icon: 'fas fa-satellite',
            title: 'Sensor Ativo',
            description: 'Monitoramento em tempo real',
            color: '#007bff'
        }
    };
    
    // Criar grid 8x6 (48 células)
    for (let i = 0; i < 48; i++) {
        const cell = document.createElement('div');
        cell.className = 'map-cell';
        cell.setAttribute('data-cell', i);
        
        // Definir tipo de célula com distribuição mais realista
        const random = Math.random();
        let cellType = 'safe';
        
        if (random < 0.08) {
            cellType = 'danger';
        } else if (random < 0.18) {
            cellType = 'warning';
        } else if (random < 0.32) {
            cellType = 'sensor';
        }
        
        const data = cellData[cellType];
        cell.classList.add(cellType);
        cell.innerHTML = `<i class="${data.icon}"></i>`;
        
        // Calcular coordenadas
        const coordinates = {
            x: i % 8,
            y: Math.floor(i / 8)
        };
        
        // Adicionar eventos de mouse
        cell.addEventListener('mouseenter', (e) => {
            showMapTooltip(e, coordinates, data);
        });
        
        cell.addEventListener('mouseleave', () => {
            hideMapTooltip();
        });
        
        cell.addEventListener('mousemove', (e) => {
            updateTooltipPosition(e);
        });
        
        // Adicionar event listener de clique
        cell.addEventListener('click', () => handleMapCellClick(i, cellType, coordinates, data));
        
        mapGrid.appendChild(cell);
    }
    
    console.log('🗺️ Mapa interativo gerado com 48 células');
}

function handleMapCellClick(cellIndex, cellType, coordinates, data) {
    // Gerar informações detalhadas da célula
    const detailedInfo = generateCellDetails(cellType, coordinates);
    
    // Criar modal com informações detalhadas
    const modal = createMapCellModal(cellIndex, cellType, coordinates, data, detailedInfo);
    
    // Mostrar modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Limpar modal após fechar
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
    
    console.log(`🗺️ Célula clicada: (${coordinates.x}, ${coordinates.y}) - ${cellType}`);
}

function generateCellDetails(cellType, coordinates) {
    const baseDetails = {
        safe: {
            waterLevel: (Math.random() * 2 + 1).toFixed(1) + 'm',
            risk: 'Baixo',
            lastUpdate: 'Agora',
            sensors: Math.floor(Math.random() * 3) + 1,
            status: 'Normal'
        },
        warning: {
            waterLevel: (Math.random() * 1.5 + 3).toFixed(1) + 'm',
            risk: 'Médio',
            lastUpdate: Math.floor(Math.random() * 5) + 1 + 'min atrás',
            sensors: Math.floor(Math.random() * 2) + 2,
            status: 'Atenção'
        },
        danger: {
            waterLevel: (Math.random() * 2 + 5).toFixed(1) + 'm',
            risk: 'Alto',
            lastUpdate: 'Agora',
            sensors: Math.floor(Math.random() * 3) + 2,
            status: 'Crítico'
        },
        sensor: {
            waterLevel: (Math.random() * 3 + 2).toFixed(1) + 'm',
            risk: 'Variável',
            lastUpdate: 'Tempo real',
            sensors: 1,
            status: 'Online'
        }
    };
    
    return baseDetails[cellType];
}

function createMapCellModal(cellIndex, cellType, coordinates, data, details) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    
    const statusColor = cellType === 'danger' ? 'danger' : 
                       cellType === 'warning' ? 'warning' : 
                       cellType === 'sensor' ? 'primary' : 'success';
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-${statusColor} text-white">
                    <h5 class="modal-title fw-bold">
                        <i class="${data.icon} me-2"></i>${data.title}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <div class="info-section">
                                <h6 class="section-title">
                                    <i class="fas fa-map-marker-alt text-primary me-2"></i>Localização
                                </h6>
                                <div class="info-list">
                                    <div class="info-item">
                                        <span class="info-label">Coordenadas:</span>
                                        <span class="info-value">(${coordinates.x}, ${coordinates.y})</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Quadrante:</span>
                                        <span class="info-value">${getQuadrantName(coordinates)}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Região:</span>
                                        <span class="info-value">${getRegionName(coordinates)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-section">
                                <h6 class="section-title">
                                    <i class="fas fa-info-circle text-info me-2"></i>Status Atual
                                </h6>
                                <div class="info-list">
                                    <div class="info-item">
                                        <span class="info-label">Nível da Água:</span>
                                        <span class="info-value fw-bold">${details.waterLevel}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Risco:</span>
                                        <span class="badge bg-${statusColor} ms-2">${details.risk}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Status:</span>
                                        <span class="info-value">${details.status}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Sensores:</span>
                                        <span class="info-value">${details.sensors}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4">
                    <div class="row">
                        <div class="col-12">
                            <div class="info-section">
                                <h6 class="section-title">
                                    <i class="fas fa-chart-line text-success me-2"></i>Informações Adicionais
                                </h6>
                                <div class="alert alert-${statusColor === 'danger' ? 'danger' : statusColor === 'warning' ? 'warning' : 'info'}" role="alert">
                                    <div class="alert-content">
                                        <div class="mb-2">
                                            <strong>Descrição:</strong> ${data.description}
                                        </div>
                                        <div class="mb-2">
                                            <strong>Última Atualização:</strong> ${details.lastUpdate}
                                        </div>
                                        ${cellType === 'sensor' ? '<div class="mb-2"><strong>Frequência:</strong> Dados a cada 30 segundos</div>' : ''}
                                        ${cellType === 'danger' ? '<div><strong>⚠️ Ação Recomendada:</strong> Evacuar área imediatamente</div>' : ''}
                                        ${cellType === 'warning' ? '<div><strong>👁️ Ação Recomendada:</strong> Monitorar de perto</div>' : ''}
                                        ${cellType === 'safe' ? '<div><strong>✅ Status:</strong> Área segura para permanência</div>' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Fechar
                    </button>
                    <button type="button" class="btn btn-${statusColor}" onclick="focusOnCell(${cellIndex})">
                        <i class="fas fa-search me-1"></i>Focar na Área
                    </button>
                    ${cellType === 'sensor' ? `
                        <button type="button" class="btn btn-info" onclick="showSensorData(${cellIndex})">
                            <i class="fas fa-chart-bar me-1"></i>Ver Dados
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

function getQuadrantName(coordinates) {
    const quadrants = [
        'Norte-Oeste', 'Norte', 'Norte', 'Norte', 'Norte', 'Norte', 'Norte', 'Norte-Leste',
        'Oeste', 'Centro-Norte', 'Centro-Norte', 'Centro-Norte', 'Centro-Norte', 'Centro-Norte', 'Centro-Norte', 'Leste',
        'Oeste', 'Centro', 'Centro', 'Centro', 'Centro', 'Centro', 'Centro', 'Leste',
        'Oeste', 'Centro', 'Centro', 'Centro', 'Centro', 'Centro', 'Centro', 'Leste',
        'Oeste', 'Centro-Sul', 'Centro-Sul', 'Centro-Sul', 'Centro-Sul', 'Centro-Sul', 'Centro-Sul', 'Leste',
        'Sul-Oeste', 'Sul', 'Sul', 'Sul', 'Sul', 'Sul', 'Sul', 'Sul-Leste'
    ];
    
    const index = coordinates.y * 8 + coordinates.x;
    return quadrants[index] || 'Desconhecido';
}

function getRegionName(coordinates) {
    const regions = ['Centro', 'Vila Madalena', 'Brooklin', 'Itaim', 'Moema', 'Pinheiros'];
    return regions[Math.floor(Math.random() * regions.length)];
}

// Funções auxiliares para tooltip
function showMapTooltip(event, coordinates, data) {
    const tooltip = document.querySelector('.map-cell-tooltip');
    if (!tooltip) return;
    
    tooltip.innerHTML = `
        <div><strong>${data.title}</strong></div>
        <div>Posição: (${coordinates.x}, ${coordinates.y})</div>
        <div>${data.description}</div>
    `;
    
    updateTooltipPosition(event);
    tooltip.classList.add('show');
}

function hideMapTooltip() {
    const tooltip = document.querySelector('.map-cell-tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
    }
}

function updateTooltipPosition(event) {
    const tooltip = document.querySelector('.map-cell-tooltip');
    if (!tooltip) return;
    
    const rect = tooltip.getBoundingClientRect();
    let left = event.clientX + 10;
    let top = event.clientY - rect.height - 10;
    
    // Ajustar se sair da tela
    if (left + rect.width > window.innerWidth) {
        left = event.clientX - rect.width - 10;
    }
    
    if (top < 0) {
        top = event.clientY + 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

// Funções auxiliares para ações do modal
function focusOnCell(cellIndex) {
    const cell = document.querySelector(`[data-cell="${cellIndex}"]`);
    if (cell) {
        cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cell.style.transform = 'scale(1.2)';
        cell.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.8)';
        
        setTimeout(() => {
            cell.style.transform = '';
            cell.style.boxShadow = '';
        }, 2000);
    }
}

function showSensorData(cellIndex) {
    window.FloodGuard?.showNotification(
        'Dados do Sensor',
        `Visualizando dados detalhados do sensor na posição ${cellIndex}. Implementação completa em breve.`,
        'info'
    );
}

// ==========================================================================
// LISTA DE SENSORES
// ==========================================================================

function loadSensorsList() {
    const sensorsList = document.getElementById('sensorsList');
    if (!sensorsList) return;
    
    const sensors = window.FloodGuard ? window.FloodGuard.getSensorData() : generateMockSensors();
    
    sensorsList.innerHTML = '';
    
    sensors.slice(0, 8).forEach(sensor => {
        const sensorElement = document.createElement('div');
        sensorElement.className = `sensor-item ${sensor.status}`;
        
        let statusClass = 'success';
        let statusText = 'Online';
        
        if (sensor.status === 'offline') {
            statusClass = 'danger';
            statusText = 'Offline';
        } else if (sensor.waterLevel > 5) {
            statusClass = 'warning';
            statusText = 'Alerta';
        }
        
        sensorElement.innerHTML = `
            <div class="sensor-info">
                <h6>${sensor.id}</h6>
                <small>${sensor.location}</small>
            </div>
            <div class="sensor-status">
                <div class="sensor-value">${sensor.waterLevel.toFixed(1)}m</div>
                <span class="badge bg-${statusClass} status-badge">${statusText}</span>
            </div>
        `;
        
        sensorElement.addEventListener('click', () => showSensorDetails(sensor));
        
        sensorsList.appendChild(sensorElement);
    });
}

function generateMockSensors() {
    const mockSensors = [];
    for (let i = 0; i < 10; i++) {
        mockSensors.push({
            id: `SP-${String(i + 1).padStart(3, '0')}`,
            location: ['Centro', 'Vila Madalena', 'Itaim', 'Moema'][i % 4],
            waterLevel: Math.random() * 5 + 1,
            status: Math.random() > 0.1 ? 'online' : 'offline'
        });
    }
    return mockSensors;
}

function showSensorDetails(sensor) {
    const details = `
        <strong>Sensor:</strong> ${sensor.id}<br>
        <strong>Localização:</strong> ${sensor.location}<br>
        <strong>Nível da Água:</strong> ${sensor.waterLevel.toFixed(1)}m<br>
        <strong>Status:</strong> ${sensor.status}<br>
        <strong>Última Atualização:</strong> ${new Date().toLocaleTimeString('pt-BR')}
    `;
    
    window.FloodGuard?.showNotification(
        'Detalhes do Sensor',
        details,
        'info'
    );
}

// ==========================================================================
// PREVISÃO DE CHUVA
// ==========================================================================

function generateRainfallForecast() {
    const forecastContainer = document.getElementById('rainfallForecast');
    if (!forecastContainer) return;
    
    forecastContainer.innerHTML = '';
    
    for (let i = 1; i <= 6; i++) {
        const hour = new Date();
        hour.setHours(hour.getHours() + i);
        
        const rainfall = Math.random() * 25;
        const intensity = rainfall > 15 ? 'Alta' : rainfall > 8 ? 'Moderada' : 'Baixa';
        const color = rainfall > 15 ? '#dc3545' : rainfall > 8 ? '#ffc107' : '#28a745';
        
        const forecastElement = document.createElement('div');
        forecastElement.className = 'rainfall-hour';
        forecastElement.innerHTML = `
            <div>
                <strong>${hour.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                <br>
                <small>${intensity}</small>
            </div>
            <div class="rainfall-bar">
                <div class="rainfall-fill" style="width: ${(rainfall / 25) * 100}%; background-color: ${color};"></div>
            </div>
            <div class="text-end">
                <strong>${rainfall.toFixed(1)}mm</strong>
            </div>
        `;
        
        forecastContainer.appendChild(forecastElement);
    }
}

// ==========================================================================
// CONTROLES DE INTERFACE
// ==========================================================================

function changeView(view) {
    currentView = view;
    
    // Atualizar botões ativos
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Simular mudança de conteúdo
    window.FloodGuard?.showNotification(
        'Visualização Alterada',
        `Mudando para visualização: ${view}`,
        'info'
    );
    
    console.log(`📊 Visualização alterada para: ${view}`);
}

function changeChartPeriod(period) {
    currentChartPeriod = period;
    
    // Atualizar botões ativos
    document.querySelectorAll('.btn-group-sm .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Atualizar gráfico
    if (waterLevelChart) {
        waterLevelChart.destroy();
        createWaterLevelChart();
    }
    
    console.log(`📈 Período do gráfico alterado para: ${period}`);
}

function toggleLayer(layer) {
    const button = event.target;
    
    if (layer === 'sensors') {
        sensorsVisible = !sensorsVisible;
        const sensorCells = document.querySelectorAll('.map-cell.sensor');
        
        sensorCells.forEach(cell => {
            if (sensorsVisible) {
                cell.style.display = 'flex';
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            } else {
                cell.style.opacity = '0.3';
                cell.style.transform = 'scale(0.8)';
            }
        });
        
        // Atualizar aparência do botão
        if (sensorsVisible) {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-satellite me-1"></i>Sensores';
        } else {
            button.classList.remove('active');
            button.innerHTML = '<i class="far fa-satellite me-1"></i>Sensores';
        }
        
    } else if (layer === 'flood') {
        floodLayerVisible = !floodLayerVisible;
        const floodCells = document.querySelectorAll('.map-cell.danger, .map-cell.warning');
        
        floodCells.forEach(cell => {
            if (floodLayerVisible) {
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
                cell.style.filter = 'none';
            } else {
                cell.style.opacity = '0.4';
                cell.style.transform = 'scale(0.9)';
                cell.style.filter = 'grayscale(50%)';
            }
        });
    
    // Atualizar aparência do botão
        if (floodLayerVisible) {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-water me-1"></i>Áreas de Risco';
        } else {
            button.classList.remove('active');
            button.innerHTML = '<i class="far fa-eye-slash me-1"></i>Áreas de Risco';
        }
    }
    
    // Mostrar feedback visual
    window.FloodGuard?.showNotification(
        'Layer Atualizada',
        `${layer === 'sensors' ? 'Sensores' : 'Áreas de Risco'} ${
            (layer === 'sensors' ? sensorsVisible : floodLayerVisible) ? 'ativados' : 'desativados'
        }`,
        'info'
    );
    
    console.log(`🗺️ Layer ${layer} ${layer === 'sensors' ? (sensorsVisible ? 'ativada' : 'desativada') : (floodLayerVisible ? 'ativada' : 'desativada')}`);
}

function refreshData() {
    // Mostrar indicador de carregamento
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Atualizando...';
    btn.disabled = true;
    
    // Simular carregamento
    setTimeout(() => {
        updateKeyMetrics();
        updateWeatherData();
        loadSensorsList();
        generateRainfallForecast();
        addNewChartData();
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        window.FloodGuard?.showNotification(
            'Dados Atualizados',
            'Todas as informações foram atualizadas com sucesso',
            'success'
        );
    }, 2000);
    
    console.log('🔄 Atualizando dados do monitoramento');
}

function exportData() {
    // Simular exportação de dados
    const data = {
        timestamp: new Date().toISOString(),
        sensors: window.FloodGuard ? window.FloodGuard.getSensorData() : [],
        metrics: {
            waterLevel: document.getElementById('waterLevel')?.textContent,
            rainfall: document.getElementById('rainfall')?.textContent,
            sensorsOnline: document.getElementById('sensorsOnline')?.textContent
        },
        weather: {
            temperature: document.getElementById('temperature')?.textContent,
            humidity: document.getElementById('humidity')?.textContent,
            pressure: document.getElementById('pressure')?.textContent
        }
    };
    
    // Criar e baixar arquivo
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `floodguard-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    window.FloodGuard?.showNotification(
        'Dados Exportados',
        'Arquivo de dados baixado com sucesso',
        'success'
    );
    
    console.log('📥 Dados exportados com sucesso');
}

// ==========================================================================
// UTILITÁRIOS
// ==========================================================================

function updateElementSafely(element, content) {
    if (element) {
        element.innerHTML = content;
    }
}

// ==========================================================================
// LIMPEZA AO SAIR DA PÁGINA
// ==========================================================================

window.addEventListener('beforeunload', function() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
    
    if (waterLevelChart) {
        waterLevelChart.destroy();
    }
});

console.log('📊 Módulo de monitoramento carregado'); 
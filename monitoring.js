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
    
    // Criar grid 8x6
    for (let i = 0; i < 48; i++) {
        const cell = document.createElement('div');
        cell.className = 'map-cell';
        cell.setAttribute('data-cell', i);
        
        // Definir tipo de célula aleatoriamente
        const random = Math.random();
        let cellType = 'safe';
        let content = '';
        
        if (random < 0.1) {
            cellType = 'danger';
            content = '<i class="fas fa-exclamation-triangle"></i>';
        } else if (random < 0.2) {
            cellType = 'warning';
            content = '<i class="fas fa-eye"></i>';
        } else if (random < 0.35) {
            cellType = 'sensor';
            content = '<i class="fas fa-satellite"></i>';
        }
        
        cell.classList.add(cellType);
        cell.innerHTML = content;
        
        // Adicionar event listener
        cell.addEventListener('click', () => handleMapCellClick(i, cellType));
        
        mapGrid.appendChild(cell);
    }
}

function handleMapCellClick(cellIndex, cellType) {
    const cellInfo = {
        safe: 'Área segura - Sem riscos detectados',
        warning: 'Área de atenção - Monitoramento intensificado',
        danger: 'Área de risco - Possível alagamento',
        sensor: 'Sensor de monitoramento - Online'
    };
    
    const coordinates = {
        x: cellIndex % 8,
        y: Math.floor(cellIndex / 8)
    };
    
    window.FloodGuard?.showNotification(
        `Quadrante (${coordinates.x}, ${coordinates.y})`,
        cellInfo[cellType],
        cellType === 'danger' ? 'danger' : cellType === 'warning' ? 'warning' : 'info'
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
    if (layer === 'sensors') {
        sensorsVisible = !sensorsVisible;
        document.querySelectorAll('.map-cell.sensor').forEach(cell => {
            cell.style.display = sensorsVisible ? 'flex' : 'none';
        });
    } else if (layer === 'flood') {
        floodLayerVisible = !floodLayerVisible;
        document.querySelectorAll('.map-cell.danger, .map-cell.warning').forEach(cell => {
            cell.style.opacity = floodLayerVisible ? '1' : '0.3';
        });
    }
    
    // Atualizar aparência do botão
    event.target.classList.toggle('active');
    
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
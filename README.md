# 🌊 FloodGuard - Sistema Inteligente de Prevenção e Resposta a Enchentes

## 📋 Visão Geral

O **FloodGuard** é um sistema web completo e inteligente para monitoramento, prevenção e resposta rápida a eventos extremos de enchentes. Desenvolvido com tecnologias modernas para salvar vidas e proteger comunidades.

## 🚀 Funcionalidades Principais

### 🏠 **Página Inicial (index.html)**
- Interface moderna e responsiva
- Hero section com call-to-actions
- Apresentação das funcionalidades principais
- Estatísticas em tempo real
- Design otimizado para conversão

### 📊 **Centro de Monitoramento (monitoring.html)**
- **Dashboard em tempo real** com métricas principais
- **Gráficos interativos** (Chart.js) para níveis de água
- **Condições meteorológicas** atualizadas
- **Mapa de Sensores interativo** com funcionalidades avançadas:
  - Grid 8x6 com células coloridas por tipo de risco
  - Sensores com animação de pulso
  - Tooltips informativos ao hover
  - Modais detalhados ao clicar
  - Controles de layer (sensores/áreas de risco)
  - Sistema de coordenadas e quadrantes
- **Lista de sensores** com status em tempo real

### 🚨 **Sistema de Alertas (alerts.html)**
- **Mapa georeferenciado** com marcadores coloridos
- **Alertas em tempo real** com feed dinâmico
- **Histórico de alertas** com timeline
- **Notificações** automáticas para eventos críticos
- **Sistema de filtros** por nível de severidade
- **Dados simulados** realistas para demonstração

### 🚪 **Planos de Evacuação (evacuation.html)**
- Rotas de fuga otimizadas
- Pontos de encontro seguros
- Instruções detalhadas
- Mapas interativos

### ℹ️ **Sobre o Projeto (about.html)**
- Informações da equipe
- Missão, visão e valores
- Tecnologias utilizadas
- Impacto esperado
- Timeline do projeto

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com gradientes e animações
- **JavaScript (ES6+)** - Interatividade avançada
- **Bootstrap 5.3** - Framework responsivo
- **Font Awesome 6.4** - Ícones profissionais
- **Chart.js** - Gráficos interativos
- **Leaflet** - Mapas interativos

### **Funcionalidades JavaScript**
- **Classes ES6** para organização do código
- **Fetch API** para requisições
- **LocalStorage** para persistência
- **Event Listeners** para interatividade
- **Timers e Intervals** para atualizações em tempo real
- **Geolocalização** para mapas precisos

## ✨ Melhorias Recentes Implementadas

### 🗺️ **Mapa de Sensores (monitoring.html) - OTIMIZADO ⚡**

#### **🎯 OTIMIZAÇÃO FINAL - Espaço 100% Utilizado:**
- ✅ **Layout Flexbox**: Card-body com altura fixa + flex: 1 no mapa
- ✅ **Zero espaço desperdiçado** - aproveitamento máximo do container
- ✅ **Legenda horizontal** sem sobreposição de elementos
- ✅ **Altura otimizada**: 435px desktop / 350px mobile
- ✅ **Layout responsivo** perfeito para todos os dispositivos
- ✅ **Production-ready** com qualidade enterprise

#### **Correções de Visibilidade:**
- ✅ **Estilos CSS completos** para todas as células do mapa
- ✅ **Cores específicas** para cada tipo de área:
  - 🟢 **Verde** - Áreas Seguras (gradiente)
  - 🟡 **Laranja** - Áreas de Atenção (gradiente)
  - 🔴 **Vermelho** - Áreas de Risco (gradiente)
  - 🔵 **Azul** - Sensores Ativos (com animação de pulso)
- ✅ **Ícones FontAwesome** claramente visíveis em todas as células
- ✅ **Grid responsivo** 8x6 perfeitamente estruturado

#### **Interatividade Melhorada:**
- ✅ **Tooltips informativos** com design glassmorphism
- ✅ **Modais detalhados** com informações completas:
  - Localização e coordenadas
  - Status atual e nível de água
  - Recomendações por tipo de área
  - Design responsivo e legível
- ✅ **Controles de layer** funcionais
- ✅ **Hover effects** e animações suaves

#### **Design System:**
- ✅ **Tipografia melhorada** para legibilidade
- ✅ **Contraste otimizado** em todos os textos
- ✅ **Espaçamento consistente** entre elementos
- ✅ **Responsividade** para dispositivos móveis
- ✅ **Badges e cores** com alta visibilidade

### 🚨 **Sistema de Alertas (alerts.html)**

#### **Melhorias Visuais:**
- ✅ **Mapa georeferenciado** reposicionado no topo
- ✅ **Marcadores coloridos** por nível de severidade
- ✅ **Feed de alertas** redesenhado com cards modernos
- ✅ **Timeline de histórico** com indicadores visuais
- ✅ **Ícones específicos** para cada tipo de alerta

#### **Funcionalidades:**
- ✅ **Notificações em tempo real** com toast messages
- ✅ **Sistema de filtros** por categoria
- ✅ **Dados simulados** realistas
- ✅ **Geolocalização** de alertas
- ✅ **Integração** com sistema de monitoramento

### 📱 **Responsividade Global:**
- ✅ **Design mobile-first** em todas as páginas
- ✅ **Breakpoints otimizados** para tablets e desktop
- ✅ **Navegação** adaptativa
- ✅ **Grids flexíveis** que se adaptam ao dispositivo

## 🎨 Design System

### **Cores Principais:**
- **Primário:** `#007bff` (Azul FloodGuard)
- **Sucesso:** `#28a745` (Verde segurança)
- **Atenção:** `#ffc107` (Amarelo alerta)
- **Perigo:** `#dc3545` (Vermelho emergência)
- **Info:** `#17a2b8` (Azul informativo)

### **Gradientes:**
- **Seguro:** Linear-gradient(135deg, #28a745, #20c997)
- **Atenção:** Linear-gradient(135deg, #ffc107, #fd7e14)
- **Perigo:** Linear-gradient(135deg, #dc3545, #e83e8c)
- **Sensor:** Linear-gradient(135deg, #007bff, #6f42c1)

### **Tipografia:**
- **Font Family:** -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Títulos:** Font-weight 700, cores escuras para contraste
- **Texto:** Font-weight 400-600, hierarchy bem definida

## 🚀 Como Executar

### **Pré-requisitos:**
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (recomendado para desenvolvimento)

### **Instalação:**
1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd floodguard
```

2. Execute um servidor local:
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# Live Server (VS Code Extension)
```

3. Acesse no navegador:
```
http://localhost:8000
```

## 📁 Estrutura do Projeto

```
floodguard/
├── index.html              # Página inicial
├── monitoring.html         # Centro de monitoramento
├── alerts.html            # Sistema de alertas
├── evacuation.html        # Planos de evacuação
├── about.html             # Sobre o projeto
├── styles.css             # Estilos globais
├── script.js              # Scripts principais
├── monitoring.js          # Scripts do monitoramento
├── alerts.js              # Scripts dos alertas
├── evacuation.js          # Scripts da evacuação
├── README.md              # Documentação
└── AVALIACAO.md          # Critérios de avaliação
```

## 🔧 Funcionalidades Técnicas

### **Monitoramento em Tempo Real:**
- Atualização automática a cada 5 segundos
- Dados simulados realistas
- Persistência local de configurações
- Sistema de cache inteligente

### **Mapas Interativos:**
- Integração com Leaflet para mapas reais
- Grid customizado para sensores
- Marcadores dinâmicos por tipo
- Zoom e navegação fluida

### **Sistema de Notificações:**
- Toast messages elegantes
- Categorização por severidade
- Persistência de estado
- Queue de notificações

### **Responsividade:**
- Breakpoints: 576px, 768px, 992px, 1200px
- Grid system do Bootstrap 5
- Componentes adaptáveis
- Touch-friendly em dispositivos móveis

## 🎯 Status do Projeto

### ✅ **Concluído:**
- [x] Interface completa e responsiva
- [x] Sistema de monitoramento funcional
- [x] Mapa de sensores interativo
- [x] Sistema de alertas em tempo real
- [x] Correções de visibilidade e legibilidade
- [x] Modais informativos detalhados
- [x] Design system consistente

### 🔄 **Em Desenvolvimento:**
- [ ] Integração com APIs reais de sensores
- [ ] Sistema de autenticação
- [ ] Dashboard administrativo
- [ ] Notificações push
- [ ] Histórico de dados persistente
- [ ] Relatórios automatizados

### 🚀 **Futuras Melhorias:**
- [ ] Aplicativo móvel nativo
- [ ] Integração com sistemas governamentais
- [ ] Machine Learning para predições
- [ ] API pública para desenvolvedores
- [ ] Multi-idiomas (i18n)

## 👥 Equipe de Desenvolvimento

- **Frontend Developer:** Implementação completa da interface
- **UX/UI Designer:** Design system e experiência do usuário
- **JavaScript Developer:** Funcionalidades interativas e dinâmicas

## 📝 Licença

Este projeto foi desenvolvido como sistema de demonstração para prevenção de enchentes.

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Contato

Para mais informações sobre o projeto FloodGuard, entre em contato através dos canais oficiais.

---

**🌊 FloodGuard - Protegendo Vidas Contra Enchentes** 
*Desenvolvido com 💙 para salvar vidas e proteger comunidades* 
# Fintia - Personal Finance Management App

## 📋 Descripción del Proyecto

Fintia es una aplicación web de gestión de finanzas personales diseñada para ayudar a usuarios a controlar sus gastos e ingresos de manera simple y visual. La aplicación está construida con Next.js 15 y Supabase, ofreciendo una experiencia moderna y rápida.

## 🎯 Visión del Producto

Hacer que la gestión de finanzas personales sea **simple, visual y accesible** para personas que no son expertas en finanzas, eliminando la complejidad de otras herramientas del mercado.

## 💎 Modelo de Negocio (Freemium)

### Versión Gratuita
- ✅ Registro manual de gastos e ingresos
- ✅ Categorización de transacciones
- ✅ Visualización en dashboard básico
- ✅ Gráficos básicos
- ✅ Categorías personalizadas
- ✅ Recordatorios de registro

### Versión Premium ($9.99/mes)
- 🌟 **Sincronización automática** de transacciones bancarias
- 🌟 **Presupuestos por categoría** con límites configurables
- 🌟 **Alertas inteligentes** de sobre-gasto
- 🌟 **Insights financieros automáticos** basados en patrones
- 🌟 **Exportación de reportes** (PDF, Excel)
- 🌟 **Comparación entre períodos**
- 🌟 **Objetivos de ahorro** con seguimiento
- 🌟 **Análisis financieros avanzados**

## 👥 Roles del Sistema

### Usuario Free
- Registrar, editar y eliminar transacciones manuales
- Visualizar reportes básicos
- Crear categorías personalizadas
- Acceder al dashboard básico
- Recibir recordatorios de registro

### Usuario Premium
- Todas las funcionalidades de Free +
- Sincronizar transacciones automáticamente
- Definir límites de presupuesto por categoría
- Recibir alertas inteligentes de sobre-gasto
- Exportar reportes en PDF/Excel
- Acceder a análisis financieros detallados
- Comparar gastos entre períodos
- Crear objetivos de ahorro

### Administrador
- Gestionar usuarios y planes de suscripción
- Supervisar el funcionamiento de la plataforma
- Administrar configuraciones del sistema
- Ver métricas y estadísticas de uso

## 📚 Historias de Usuario (Product Backlog)

### 🎯 Alcance del MVP

El MVP se enfoca en:
- ✅ Registro y visualización de gastos e ingresos
- ✅ Diferenciación clara entre versión gratuita y premium
- ✅ Experiencia de usuario simple y clara
- ✅ Base sólida para futuras funcionalidades avanzadas

### 👤 Historias de Usuario por Integrante

**Compromiso de desarrollo:** Cada integrante desarrolla 3 historias de usuario complejas.

#### 👩‍💻 Sara - Funcionalidades Core Free

**HU-1: CRUD de Transacciones (Ingresos/Gastos)** ⭐ PRIORITARIA
> Como usuario Free, quiero registrar, eliminar y editar mis transacciones (gastos e ingresos), para llevar control de mi dinero de forma organizada.

**Criterios de aceptación:**
- [ ] El usuario puede crear una transacción con monto, fecha, categoría y descripción
- [ ] El usuario puede editar transacciones existentes
- [ ] El usuario puede eliminar transacciones
- [ ] El sistema muestra un listado de transacciones con filtros básicos (fecha/categoría)
- [ ] Los cambios se reflejan inmediatamente en el dashboard
- [ ] Validación de campos obligatorios (monto, fecha, tipo)
- [ ] Confirmación antes de eliminar

**HU-2: Dashboard Visual de Finanzas** ⭐ PRIORITARIA
> Como usuario Free, quiero ver un dashboard con gráficos de mis gastos e ingresos, para entender rápidamente mi situación financiera.

**Criterios de aceptación:**
- [ ] El dashboard muestra ingresos, gastos y balance del mes actual
- [ ] Se visualizan las categorías más usadas
- [ ] Se puede cambiar el rango de fechas (mes/semana/año)
- [ ] La información se actualiza automáticamente con cada transacción
- [ ] Diseño responsive para móvil y desktop
- [ ] Gráficos claros y fáciles de entender

**HU-3: Categorización de Transacciones** ⭐ PRIORITARIA
> Como usuario Free, quiero poder asignar categorías a mis transacciones, para analizar mejor en qué gasto mi dinero.

**Criterios de aceptación:**
- [ ] El usuario puede elegir una categoría al crear/editar una transacción
- [ ] Hay categorías predeterminadas (Alimentación, Transporte, Vivienda, Servicios, etc.)
- [ ] El usuario puede filtrar transacciones por categoría
- [ ] El dashboard agrupa gastos por categorías
- [ ] Cada categoría tiene color e icono distintivo

---

#### 👩‍💻 Sofía - Funcionalidades Premium Automáticas

**HU-4: Sincronización Automática de Transacciones** 🌟 PREMIUM
> Como usuario Premium, quiero que mis transacciones financieras se sincronicen automáticamente desde mis cuentas bancarias, para evitar el registro manual de gastos y mantener mi información financiera siempre actualizada.

**Criterios de aceptación:**
- [ ] El usuario puede conectar una o más cuentas bancarias a la aplicación
- [ ] El sistema importa solo las transacciones asociadas a las cuentas conectadas
- [ ] Las transacciones sincronizadas incluyen monto, fecha, descripción y categoría sugerida
- [ ] El usuario puede editar y reclasificar las transacciones sincronizadas
- [ ] Las transacciones se reflejan en menos de 5 minutos en el dashboard
- [ ] Manejo de errores de conexión bancaria
- [ ] Seguridad: encriptación de credenciales bancarias

**HU-5: Configuración de Presupuestos por Categoría** 🌟 PREMIUM
> Como usuario Premium, quiero definir límites de gasto por categoría, para controlar mejor mi presupuesto mensual y evitar gastos excesivos.

**Criterios de aceptación:**
- [ ] El usuario puede crear, editar y eliminar presupuestos por categoría
- [ ] Cada presupuesto tiene un monto máximo y un periodo de tiempo (mensual/semanal)
- [ ] El sistema calcula automáticamente el gasto acumulado por categoría
- [ ] El progreso del presupuesto se muestra visualmente en el dashboard (barra de progreso)
- [ ] Indicador visual cuando se acerca al límite (80%)
- [ ] Solo disponible para usuarios Premium

**HU-6: Alertas Inteligentes por Sobre-gasto** 🌟 PREMIUM
> Como usuario Premium, quiero recibir alertas inteligentes cuando me acerque o supere los límites de mis presupuestos, para tomar decisiones financieras a tiempo y ajustar mis hábitos de consumo.

**Criterios de aceptación:**
- [ ] El sistema detecta cuando el gasto alcanza un porcentaje configurable del presupuesto (default: 80%)
- [ ] Se generan alertas visuales dentro de la aplicación (notificaciones in-app)
- [ ] Las alertas indican la categoría y el monto excedido o cercano al límite
- [ ] El usuario puede consultar un historial de alertas generadas
- [ ] Las alertas se generan en tiempo real al registrar transacciones
- [ ] Solo disponible para usuarios Premium

---

#### 👩‍💻 Manuela - Funcionalidades Premium Avanzadas

**HU-7: Exportación de Reportes Financieros** 🌟 PREMIUM
> Como usuario Premium, quiero poder exportar mis reportes financieros en formatos comunes (PDF, Excel), para compartirlos fácilmente o analizarlos fuera de la aplicación.

**Criterios de aceptación:**
- [ ] El usuario puede seleccionar el rango de fechas para el reporte
- [ ] El usuario puede elegir tipo de reporte (ingresos, gastos, presupuestos, completo)
- [ ] El sistema genera un archivo descargable en PDF o Excel
- [ ] Los reportes incluyen gráficos y tablas con la información seleccionada
- [ ] Branding de Fintia en los reportes exportados
- [ ] La exportación está disponible solo para usuarios Premium

**HU-8: Personalización de Categorías** ⭐ FREE
> Como usuario Free, quiero crear y editar mis propias categorías de gastos e ingresos, para adaptar la aplicación a mis hábitos financieros personales.

**Criterios de aceptación:**
- [ ] El usuario puede añadir nuevas categorías con nombre, color y icono distintivo
- [ ] El usuario puede editar categorías personalizadas (no las predeterminadas)
- [ ] El usuario puede eliminar categorías personalizadas
- [ ] Las categorías personalizadas aparecen en el dashboard y filtros
- [ ] El sistema valida que no haya duplicados de nombre
- [ ] Límite razonable de categorías personalizadas (ej: 20 máximo)

**HU-9: Insights Financieros Automáticos** 🌟 PREMIUM
> Como usuario Premium, quiero recibir resúmenes automáticos basados en mis patrones de gasto, para mejorar mis hábitos financieros y ahorrar más.

**Criterios de aceptación:**
- [ ] El sistema analiza transacciones y presupuestos para generar insights
- [ ] Se generan sugerencias visuales en el dashboard (ej. "Reducir gasto en transporte podría aumentar tu ahorro en 10%")
- [ ] Los insights se basan en patrones reales del usuario
- [ ] Los insights se actualizan mensualmente
- [ ] Mínimo 3-5 insights relevantes por mes
- [ ] Solo disponible para usuarios Premium

---

#### 👩‍💻 Alejandra - Funcionalidades Premium de Análisis

**HU-10: Comparación de Gastos entre Períodos** 🌟 PREMIUM
> Como usuario Premium, quiero comparar mis gastos e ingresos entre distintos meses, para identificar patrones y mejorar mis decisiones financieras.

**Criterios de aceptación:**
- [ ] El usuario puede seleccionar dos períodos de tiempo distintos
- [ ] El sistema muestra variaciones porcentuales entre períodos
- [ ] Los resultados se muestran de forma visual (gráficas comparativas)
- [ ] Comparación por categorías individuales
- [ ] Indicadores de mejora/empeoramiento
- [ ] Funcionalidad disponible solo para usuarios Premium

**HU-11: Recordatorios Inteligentes de Registro** ⭐ FREE
> Como usuario Free, quiero recibir recordatorios para registrar mis gastos, para no olvidar llevar mi control financiero al día.

**Criterios de aceptación:**
- [ ] El usuario puede activar o desactivar recordatorios en configuración
- [ ] Se muestran como notificaciones dentro de la app (no emails)
- [ ] El sistema detecta inactividad prolongada (>3 días) y sugiere registrar gastos
- [ ] Los recordatorios no interfieren con la experiencia de uso
- [ ] Recordatorios configurables (frecuencia, horario)

**HU-12: Creación y Seguimiento de Objetivos de Ahorro** 🌟 PREMIUM
> Como usuario Premium, quiero definir objetivos de ahorro, para mantenerme motivado y mejorar mis hábitos financieros.

**Criterios de aceptación:**
- [ ] El usuario puede crear objetivos con nombre, monto objetivo y fecha límite
- [ ] El sistema calcula el progreso del ahorro automáticamente (ingresos - gastos)
- [ ] El progreso se muestra visualmente (barra de progreso con porcentaje)
- [ ] El usuario puede editar o eliminar objetivos
- [ ] Se muestran múltiples objetivos simultáneos
- [ ] Celebración visual al alcanzar un objetivo

---

## 🚀 Funcionalidades Implementadas

### ✅ Fase 0: Landing y Autenticación (COMPLETADO)

**Landing Page:**
- ✅ Página de marketing completa (Hero, Problem, Solution, Features, Pricing, MVP, CTA, Footer)
- ✅ Sistema de autenticación con Supabase (Login/Signup)
- ✅ Header responsive con menú móvil
- ✅ Design system con CSS Modules
- ✅ Gradientes y animaciones profesionales
- ✅ Migrado a Next.js 15

**Autenticación:**
- ✅ Registro de usuarios con email/password
- ✅ Login con email/password
- ✅ Confirmación de email
- ✅ Logout
- ✅ Gestión de sesiones con Supabase Auth
- ✅ Row Level Security (RLS)

### 🎯 Fase 1: MVP Core (PRÓXIMA - Sara)

**HU-1: CRUD de Transacciones** (Sara)
- [ ] Formulario de nueva transacción
- [ ] Vista de lista de transacciones
- [ ] Edición de transacciones
- [ ] Eliminación con confirmación
- [ ] Filtros por fecha y categoría

**HU-2: Dashboard Visual** (Sara)
- [ ] Tarjetas de resumen (ingresos, gastos, balance)
- [ ] Gráfica de pastel por categorías
- [ ] Gráfica de barras ingresos vs egresos
- [ ] Selector de rango de fechas
- [ ] Actualización automática

**HU-3: Categorización** (Sara)
- [ ] Categorías predefinidas con iconos y colores
- [ ] Selector de categoría en transacciones
- [ ] Filtro por categoría en lista
- [ ] Agrupación por categoría en dashboard

### 🎯 Fase 2: Funcionalidades Premium Core (Sofía)

**HU-4: Sincronización Bancaria** (Sofía)
- [ ] Integración con API bancaria (Plaid/Belvo)
- [ ] Conexión de cuentas
- [ ] Importación automática de transacciones
- [ ] Categorización automática con AI
- [ ] Reclasificación manual

**HU-5: Presupuestos** (Sofía)
- [ ] CRUD de presupuestos por categoría
- [ ] Cálculo automático de gasto vs presupuesto
- [ ] Visualización de progreso (barras)
- [ ] Configuración de periodos

**HU-6: Alertas de Sobre-gasto** (Sofía)
- [ ] Sistema de notificaciones in-app
- [ ] Detección de umbrales (80%, 100%)
- [ ] Historial de alertas
- [ ] Configuración de porcentajes

### 🎯 Fase 3: Funcionalidades Premium Avanzadas (Manuela)

**HU-7: Exportación de Reportes** (Manuela)
- [ ] Generación de PDF con gráficos
- [ ] Generación de Excel con datos
- [ ] Selector de rango de fechas
- [ ] Selector de tipo de reporte
- [ ] Branding en reportes

**HU-8: Categorías Personalizadas** (Manuela)
- [ ] CRUD de categorías custom
- [ ] Selector de color
- [ ] Selector de icono
- [ ] Validación de duplicados

**HU-9: Insights con AI** (Manuela)
- [ ] Análisis de patrones con GPT-4
- [ ] Generación de sugerencias
- [ ] Visualización en dashboard
- [ ] Actualización mensual

### 🎯 Fase 4: Funcionalidades Premium de Análisis (Alejandra)

**HU-10: Comparación entre Períodos** (Alejandra)
- [ ] Selector de dos períodos
- [ ] Cálculo de variaciones porcentuales
- [ ] Gráficas comparativas
- [ ] Análisis por categorías

**HU-11: Recordatorios** (Alejandra)
- [ ] Sistema de notificaciones in-app
- [ ] Detección de inactividad
- [ ] Configuración de frecuencia
- [ ] Activar/desactivar en settings

**HU-12: Objetivos de Ahorro** (Alejandra)
- [ ] CRUD de objetivos
- [ ] Cálculo automático de progreso
- [ ] Visualización con barras de progreso
- [ ] Celebración al alcanzar objetivo

### 🔮 Funcionalidades Futuras (Post-MVP)

#### Versión 3.0 (AI Premium Features)

**🤖 AI Email Parser (Auto-registro de transacciones):**
- [ ] Conectar cuenta de email (Gmail, Outlook)
- [ ] Leer automáticamente correos de bancos
- [ ] Extraer información de transacciones (monto, fecha, descripción, tipo)
- [ ] Categorización automática con AI
- [ ] Confirmación manual antes de registrar
- [ ] Aprendizaje basado en confirmaciones del usuario
- [ ] Soporte para múltiples bancos mexicanos
- [ ] Dashboard de correos procesados

**🎤 Chat con Entrada de Audio (Registro por Voz):**
- [ ] Interfaz de chat flotante
- [ ] Grabación de audio en tiempo real
- [ ] Transcripción de audio a texto con Whisper API
- [ ] Procesamiento con AI (GPT-4) para extraer:
  - Monto
  - Tipo (ingreso/egreso)
  - Categoría (inferida)
  - Descripción
- [ ] Confirmación visual antes de registrar
- [ ] Ejemplos de comandos de voz:
  - "Gasté 5 mil en el súper"
  - "Ingreso de 20 mil por freelance"
  - "Pagué 2 mil quinientos de luz"
  - "Cena con amigos, 800 pesos"
- [ ] Historial de conversaciones
- [ ] Soporte para español mexicano

#### Versión 4.0 (Mobile & Advanced)

**📱 Aplicación Móvil:**
- [ ] App nativa para iOS
- [ ] App nativa para Android
- [ ] Sincronización cross-platform
- [ ] Notificaciones push
- [ ] Widget de balance

**📊 Analytics Avanzado:**
- [ ] Predicciones de gastos futuros con ML
- [ ] Análisis de tendencias con IA
- [ ] Recomendaciones personalizadas de ahorro
- [ ] Benchmarking con usuarios similares (anónimo)

## 🛠 Stack Tecnológico

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** JavaScript (ES Modules)
- **UI:** React 19
- **Estilos:** CSS Modules + Global CSS
- **Iconos:** Lucide React
- **Visualizaciones:** Recharts o Chart.js (a implementar)

### Backend
- **BaaS:** Supabase
  - **Auth:** Autenticación con email/password
  - **Database:** PostgreSQL
  - **Storage:** Para archivos (futuro)
  - **Realtime:** Para actualizaciones en tiempo real (futuro)

### AI/ML (Funcionalidades Premium Futuras)
- **Transcripción de audio:** OpenAI Whisper API
- **Procesamiento de lenguaje natural:** GPT-4 API
- **Email parsing:** GPT-4 + Custom prompts
- **Categorización inteligente:** Fine-tuned model (futuro)

### Integraciones (Futuras)
- **Email:** Gmail API, Microsoft Graph API
- **Bancarias:** Plaid, Belvo (para México)
- **Pagos:** Stripe para suscripciones Premium

## 📊 Estructura de Base de Datos (Propuesta)

### Tablas Principales

```sql
-- Usuarios (manejado por Supabase Auth)
-- auth.users

-- Perfiles de usuario
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'premium'
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income' | 'expense'
  color TEXT,
  icon TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transacciones
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'income' | 'expense'
  category_id UUID REFERENCES categories(id),
  description TEXT,
  date DATE NOT NULL,
  source TEXT DEFAULT 'manual', -- 'manual' | 'email' | 'voice' | 'bank'
  metadata JSONB, -- Para guardar data extra (ej: email_id, audio_url)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Presupuestos (Premium)
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(10, 2) NOT NULL,
  period TEXT NOT NULL, -- 'monthly' | 'weekly' | 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conexiones bancarias (Premium - Futuro)
CREATE TABLE bank_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  bank_name TEXT NOT NULL,
  account_last_four TEXT,
  access_token_encrypted TEXT,
  last_sync_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Historial de chat de voz (Premium)
CREATE TABLE voice_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  audio_url TEXT,
  transcription TEXT,
  processed_data JSONB, -- Monto, categoría, etc. extraídos
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices Recomendados
```sql
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_budgets_user_category ON budgets(user_id, category_id);
```

### Row Level Security (RLS)
```sql
-- Los usuarios solo pueden ver y modificar sus propios datos
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 📁 Estructura del Proyecto

```
fintia-landing/
├── app/
│   ├── layout.jsx                 # Root layout
│   ├── page.jsx                   # Landing page
│   ├── globals.css                # Estilos globales
│   ├── (auth)/                    # Auth pages
│   │   ├── login/
│   │   └── signup/
│   └── (dashboard)/               # Dashboard protegido (a crear)
│       ├── layout.jsx             # Dashboard layout
│       ├── page.jsx               # Dashboard home
│       ├── transactions/
│       │   ├── page.jsx           # Lista de transacciones
│       │   ├── new/page.jsx       # Nueva transacción
│       │   └── [id]/page.jsx      # Editar transacción
│       ├── analytics/
│       │   └── page.jsx           # Página de gráficas
│       ├── categories/
│       │   └── page.jsx           # Gestión de categorías
│       └── settings/
│           └── page.jsx           # Configuración
├── components/
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── ... (componentes de landing)
│   └── dashboard/                 # Componentes del dashboard (a crear)
│       ├── TransactionCard.jsx
│       ├── BalanceCard.jsx
│       ├── ExpenseChart.jsx
│       ├── IncomeChart.jsx
│       └── CategoryChart.jsx
├── lib/
│   ├── supabase/
│   │   ├── client.js
│   │   ├── server.js
│   │   └── middleware.js
│   ├── auth/
│   │   └── AuthContext.jsx
│   └── utils/                     # Utilidades (a crear)
│       ├── currency.js            # Formateo de moneda
│       ├── dates.js               # Manejo de fechas
│       └── charts.js              # Helpers para gráficas
├── middleware.js
├── next.config.js
└── package.json
```

## 🎨 Guía de Diseño

### Paleta de Colores
```css
/* Primarios */
--primary: #B9D8C2 → #7ab98d (Celadon Green)
--accent: #FFCB47 (Golden Pollen)

/* Secundarios */
--secondary-blue: #9AC2C9
--secondary-dark-blue: #8AA1B1

/* Neutrales */
--gray-50: #f7f8f7
--gray-900: #2a2e26

/* Semánticos */
--success: #7ab98d (Verde)
--warning: #FFCB47 (Amarillo)
--error: #ef4444 (Rojo)
--income: #22c55e (Verde brillante)
--expense: #ef4444 (Rojo)
```

### Tipografía
- **Font:** Inter (con fallbacks a system fonts)
- **Headings:** Responsive con clamp()
- **Body:** 1rem, line-height 1.7

## 🔐 Seguridad y Privacidad

- **Autenticación:** Supabase Auth con JWT
- **RLS:** Row Level Security habilitado en todas las tablas
- **HTTPS:** Obligatorio en producción
- **Encriptación:** Tokens bancarios encriptados
- **GDPR Compliance:** Derecho a exportar y eliminar datos
- **2FA:** Implementar autenticación de dos factores (futuro)

## 📱 Responsive Design

- **Mobile First:** Diseño optimizado para móviles
- **Breakpoints:**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🚀 Deployment

### Desarrollo
```bash
npm run dev
```

### Producción (Recomendado: Vercel)
```bash
npm run build
npm run start
```

**Variables de entorno requeridas:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**Variables de entorno futuras (Premium):**
```
OPENAI_API_KEY=              # Para Whisper y GPT-4
GMAIL_CLIENT_ID=             # Para Gmail API
GMAIL_CLIENT_SECRET=
STRIPE_SECRET_KEY=           # Para pagos
STRIPE_WEBHOOK_SECRET=
```

## 🧪 Testing (Futuro)

- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Coverage:** Mínimo 80%

## 📈 Métricas y Analytics (Futuro)

- **Web Analytics:** Vercel Analytics o Plausible
- **Error Tracking:** Sentry
- **Performance:** Web Vitals

## 👥 Contribución

### Workflow de Desarrollo
1. Crear feature branch desde `main`
2. Implementar funcionalidad
3. Escribir tests (cuando se implemente testing)
4. Crear Pull Request
5. Code review
6. Merge a `main`

### Convenciones de Código
- **Naming:** camelCase para variables/funciones, PascalCase para componentes
- **Imports:** Usar path aliases (@/components, @/lib)
- **CSS:** CSS Modules para componentes, variables CSS para temas
- **Commits:** Mensajes descriptivos en español

## 📝 Notas Importantes

### Consideraciones Técnicas
- El proyecto usa **ES Modules** (`"type": "module"` en package.json)
- Next.js config debe usar `export default` en lugar de `module.exports`
- Todos los componentes interactivos deben tener `'use client'` directive

### Prioridades de Desarrollo

**Roadmap del Equipo:**

1. **Fase 0 - Landing + Auth (COMPLETADO):**
   - ✅ Landing page completa
   - ✅ Sistema de autenticación
   - ✅ Migración a Next.js 15

2. **Fase 1 - MVP Core (Sara) - 2-3 semanas:**
   - HU-1: CRUD de Transacciones
   - HU-2: Dashboard Visual
   - HU-3: Categorización
   - **Objetivo:** Aplicación funcional para usuarios Free

3. **Fase 2 - Premium Core (Sofía) - 3-4 semanas:**
   - HU-4: Sincronización Bancaria
   - HU-5: Presupuestos por Categoría
   - HU-6: Alertas Inteligentes
   - **Objetivo:** Diferenciación Premium con valor real

4. **Fase 3 - Premium Avanzado (Manuela) - 2-3 semanas:**
   - HU-7: Exportación de Reportes
   - HU-8: Categorías Personalizadas
   - HU-9: Insights con AI
   - **Objetivo:** Funcionalidades avanzadas de análisis

5. **Fase 4 - Premium Analytics (Alejandra) - 2-3 semanas:**
   - HU-10: Comparación entre Períodos
   - HU-11: Recordatorios Inteligentes
   - HU-12: Objetivos de Ahorro
   - **Objetivo:** Completar suite Premium de análisis

6. **Fase 5 - AI Features (Futuro):**
   - Email Parser con AI
   - Chat con entrada de audio
   - Predicciones con ML

**Timeline Total Estimado:** 9-13 semanas para MVP completo + Premium features

### Monetización
- **Plan Gratuito:** Funcionalidades básicas, ilimitado para siempre
- **Plan Premium ($9.99/mes):**
  - Sincronización bancaria
  - AI email parser
  - Chat de voz
  - Presupuestos inteligentes
  - Reportes avanzados
  - Soporte prioritario

## 📝 Próximos Pasos Inmediatos

### ✅ Fase Actual: Preparación para MVP (Sara)

**Prioridad 1: Setup de Base de Datos**
1. Crear esquema completo en Supabase
   - Tabla `profiles` con subscription_tier
   - Tabla `categories` con seed data
   - Tabla `transactions` con RLS
   - Tabla `budgets` (para Premium)
   - Tabla `savings_goals` (para Premium)
2. Configurar Row Level Security (RLS) policies
3. Crear categorías predefinidas (seed data):
   - **Ingresos:** Salario, Freelance, Inversiones, Otros
   - **Egresos:** Alimentación, Transporte, Vivienda, Servicios, Entretenimiento, Salud, Educación, Otros

**Prioridad 2: Protección de Rutas**
1. Middleware para rutas de dashboard
2. Verificación de suscripción (free vs premium)
3. Redirección a login si no autenticado
4. Layout base del dashboard

**Prioridad 3: HU-1 - CRUD de Transacciones (Sara)**
1. Layout del dashboard con sidebar/navegación
2. Página de lista de transacciones con tabla
3. Formulario de nueva transacción (modal o página)
4. Edición de transacciones existentes
5. Eliminación con modal de confirmación
6. Filtros por fecha y categoría
7. Paginación de transacciones

**Prioridad 4: HU-2 - Dashboard Visual (Sara)**
1. Instalar Recharts o Chart.js
2. Tarjetas de resumen (ingresos, gastos, balance del mes)
3. Gráfica de pastel por categorías (gastos)
4. Gráfica de barras ingresos vs egresos
5. Selector de rango de fechas (mes/semana/año)
6. Actualización automática al crear/editar transacciones

**Prioridad 5: HU-3 - Categorización (Sara)**
1. Componente selector de categorías con iconos
2. Integrar selector en formulario de transacciones
3. Filtro por categoría en lista de transacciones
4. Visualización agrupada por categoría en dashboard
5. Colores distintivos por categoría

---

## 👥 Equipo de Desarrollo

| Integrante | Historias de Usuario | Enfoque | Estado |
|------------|---------------------|---------|--------|
| **Sara** | HU-1, HU-2, HU-3 | MVP Core - Funcionalidades Free básicas | 🔄 Siguiente |
| **Sofía** | HU-4, HU-5, HU-6 | Premium - Automatización y presupuestos | ⏳ Pendiente |
| **Manuela** | HU-7, HU-8, HU-9 | Premium - Reportes e insights AI | ⏳ Pendiente |
| **Alejandra** | HU-10, HU-11, HU-12 | Premium - Analytics y objetivos | ⏳ Pendiente |

**Compromiso:** Cada integrante desarrolla 3 HUs complejas enfocadas en su área.

---

## 📋 Rúbrica de Evaluación (Criterios de Código)

### Implementación UI — 25 pts
El código React debe reflejar fielmente el diseño para las **3 × N funcionalidades** asignadas a cada integrante.

**Requisitos:**
- Componentes React por cada pantalla/funcionalidad de las HUs asignadas
- Uso de CSS Modules para estilos (sin Tailwind, sin estilos inline masivos)
- Internacionalización (i18n) con `next-intl`: todas las cadenas de texto deben estar en `messages/es.json` y `messages/en.json`
- Accesibilidad básica (a11y): atributos `aria-*` donde corresponda, etiquetas `<label>` vinculadas a inputs, contraste de color adecuado
- Diseño responsive (mobile-first)

### Lógica y Hooks — 20 pts
Uso de **hooks personalizados** (`lib/hooks/`) para manejar la navegación y estados complejos de las historias de usuario.

**Requisitos:**
- Cada integrante debe tener al menos **1 hook personalizado** por HU compleja (mínimo 3 hooks por persona)
- Los hooks deben encapsular: llamadas a Supabase, estado de carga/error, lógica de negocio (filtros, cálculos, etc.)
- Los componentes/páginas solo deben contener JSX y llamar al hook — **no lógica de fetch directamente en los componentes**
- Patrón: `useNombreFeature()` → retorna `{ data, loading, error, acciones... }`

**Hooks ya implementados (referencia):**
- `lib/hooks/useTransactions.js` → HU-1 (CRUD, filtros, búsqueda)
- `lib/hooks/useDashboardStats.js` → HU-2 (estadísticas, gráficas, período)
- `lib/hooks/useRecurring.js` → Transacciones recurrentes (estado modal + CRUD)

**Convención para nuevos hooks:**
```js
// lib/hooks/useNombreFeature.js
export function useNombreFeature() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // lógica de fetch, useEffect, useCallback...

  return { data, loading, error, /* acciones */ }
}
```

---

**Última actualización:** 2026-03-16
**Versión:** 0.2.0 (Dashboard + Charts + AI Widget + Recurring + Custom Hooks)
**Equipo:** Sara, Sofía, Manuela, Alejandra

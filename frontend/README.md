# Personal Finance Manager

Applicazione web per la gestione completa delle finanze personali. Tieni traccia delle tue transazioni, gestisci i tuoi investimenti e monitora la tua situazione finanziaria attraverso una dashboard intuitiva e report dettagliati.

## App Online

L'applicazione è ora disponibile online! Puoi accedervi al seguente indirizzo:
[https://finance-management-7c778.web.app/](https://finance-management-7c778.web.app/)

## Architettura del Sistema

Il nostro progetto si basa su un'architettura Three-Tier che separa nettamente presentazione, logica di business e persistenza dei dati:

1. **Presentation Layer** (Frontend): Interfaccia utente reattiva sviluppata con React
2. **Business Logic Layer** (Backend): API RESTful sviluppata con ASP.NET Core
3. **Data Access Layer** (Database): PostgreSQL per la persistenza ottimizzata dei dati

### Schema dell'Architettura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │     │    Backend   │     │   Database   │
│   (React)    │◄────┤  (ASP.NET)   │◄────┤ (PostgreSQL) │
└──────────────┘     └──────────────┘     └──────────────┘
        ▲                   ▲
        │                   │
        │                   │
┌──────────────┐     ┌──────────────┐
│    Auth      │     │  Financial   │
│   Services   │     │    APIs      │
└──────────────┘     └──────────────┘
```

## Tecnologie Utilizzate

### Frontend
- **Framework**: React 19 (Single Page Application)
- **UI Library**: Material-UI v5
- **Grafici**: Chart.js con wrapper React-Chartjs-2
- **Routing**: React Router v6
- **Form Management**: React Hook Form
- **API Client**: Axios
- **Date Handling**: date-fns
- **AI Assistant**: Integrazione con Gemini API per suggerimenti finanziari

### Backend
- **Framework**: ASP.NET Core 9
- **API**: RESTful Web API
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **Autenticazione**: 
  - JWT Bearer Token
  - Google OAuth 2.0
  - Email/Password nativa
- **API Finanziarie**:
  - Finnhub API per dati di mercato in tempo reale e notizie finanziarie
  - Yahoo Finance API per dati storici e analisi di lungo periodo

### Hosting e Deployment
- **Frontend**: Firebase Hosting
  - Distribuzione globale tramite CDN
  - Deploy automatici via GitHub Actions
  - Analytics integrata per monitoraggio utilizzo
- **Backend**: Azure App Service
  - Scaling automatico in base al carico
  - Monitoraggio con Azure Application Insights
  - Integrazione continua tramite Azure DevOps
- **Database**: Azure Database per PostgreSQL
  - Alta disponibilità con replicazione geografica
  - Backup automatici programmati
  - Scaling dinamico delle risorse

### Integrazione e Sicurezza
- Autenticazione multi-provider (Google + Email/Password)
- Comunicazione backend-frontend criptata via HTTPS
- Validazione input lato client e server
- Rate limiting per prevenire abusi delle API
- Monitoraggio attivo per potenziali vulnerabilità

## Caratteristiche Principali

### Dashboard
- Panoramica finanziaria con statistiche chiave
- Visualizzazione del bilancio corrente
- Grafico delle entrate/uscite
- Ultime transazioni e investimenti

### Gestione Transazioni
- Registrazione di entrate e uscite
- Categorizzazione personalizzabile delle transazioni
- Ricerca e filtro avanzati
- Modifica e eliminazione delle transazioni

### Gestione Investimenti
- Registrazione e tracciamento degli investimenti
- Monitoraggio dei prezzi attuali tramite API finanziarie
- Analisi delle performance degli investimenti
- Funzionalità di acquisto e vendita di asset

### Analytics
- Esplorazione del mercato azionario con dati in tempo reale da Finnhub
- Grafici dettagliati sull'andamento dei prezzi con dati storici da Yahoo Finance
- Analisi dell'allocazione del portafoglio
- Statistiche sulla performance finanziaria

### Assistente AI
- Suggerimenti personalizzati basati sui tuoi pattern di spesa
- Risposte a domande sulla gestione finanziaria
- Analisi predittive sulle tue finanze
- Powered by Gemini API

## Installazione per sviluppatori

### Prerequisiti
- Node.js (v18 o superiore)
- npm (v9 o superiore)
- .NET 9 SDK
- PostgreSQL 15+

### Configurazione Frontend
1. Clona il repository
2. Naviga nella cartella frontend
```bash
cd frontend
```
3. Installa le dipendenze
```bash
npm install
```
4. Configura le variabili d'ambiente
```bash
cp .env.example .env.local
# Modifica le variabili nel file .env.local
```
5. Avvia il server di sviluppo
```bash
npm start
```
L'applicazione sarà disponibile all'indirizzo [http://localhost:3000](http://localhost:3000)

### Configurazione Backend
1. Naviga nella cartella backend
```bash
cd backend
```
2. Ripristina i pacchetti NuGet
```bash
dotnet restore
```
3. Configura il database e le API keys
```bash
# Modifica appsettings.Development.json con le tue configurazioni
```
4. Esegui l'API
```bash
dotnet run
```
L'API sarà disponibile all'indirizzo [http://localhost:5000](http://localhost:5000)

## Contribuire al Progetto

Le pull request sono benvenute. Per modifiche importanti, apri prima una issue per discutere cosa vorresti cambiare.

## Licenza

Questo progetto è concesso in licenza con licenza MIT.

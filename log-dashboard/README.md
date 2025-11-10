# AWS Log Service Dashboard

A modern, real-time dashboard for the AWS Log Service built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## ✨ Features

- **Real-Time Updates** - Auto-refreshes every 5 seconds to show latest logs
- **Data Visualization** - Interactive charts showing log distribution and timeline
- **Smart Filtering** - Filter logs by severity (info, warning, error)
- **Submit Logs** - Built-in form to create new log entries
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Modern UI** - Beautiful gradient design with smooth animations
- **Fast Performance** - Optimized with Next.js 14 App Router
- **Type Safe** - Full TypeScript support

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Data visualization
- **date-fns** - Date formatting

### Backend
- **AWS Lambda** - Serverless compute
- **DynamoDB** - NoSQL database
- **Terraform** - Infrastructure as Code

## Quick Start

### Prerequisites

- Node.js 18+ installed
- AWS Lambda URLs configured (from backend deployment)

### Installation

1. **Clone and navigate to dashboard:**
   ```bash
   cd log-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Edit `.env.local` with your Lambda URLs:**
   ```env
   NEXT_PUBLIC_INGEST_URL=https://YOUR-INGEST-URL.lambda-url.REGION.on.aws/
   NEXT_PUBLIC_READ_URL=https://YOUR-READ-URL.lambda-url.REGION.on.aws/
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
log-dashboard/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard page
├── components/
│   ├── LogChart.tsx      # Charts component
│   ├── LogEntry.tsx      # Individual log display
│   ├── LogForm.tsx       # Log submission form
│   ├── LogList.tsx       # Log list with filters
│   └── StatsCard.tsx     # Statistics card
├── lib/
│   ├── api.ts           # API client functions
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript type definitions
├── public/              # Static assets
└── package.json         # Dependencies
```

## Features Explained

### Real-Time Updates
The dashboard automatically polls the AWS Lambda endpoint every 5 seconds to fetch new logs. You can toggle auto-refresh on/off or manually refresh.

### Statistics Cards
Four cards display:
- **Total Logs** - Count of all logs
- **Info** - Count of info-level logs
- **Warnings** - Count of warning-level logs
- **Errors** - Count of error-level logs

### Charts
- **Pie Chart** - Shows distribution of logs by severity
- **Bar Chart** - Shows timeline of logs over the last 12 hours

### Log Filtering
Click filter buttons to show:
- **All** - All logs
- **Info** - Only info logs
- **Warning** - Only warning logs
- **Error** - Only error logs

### Submit Logs
Use the form to create new logs with:
- Severity selection (info/warning/error)
- Message text area
- Real-time submission feedback

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Next.js dashboard"
   git push
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_INGEST_URL`
     - `NEXT_PUBLIC_READ_URL`
   - Click Deploy

3. **Access your dashboard:**
   ```
   https://your-project.vercel.app
   ```

### Deploy to Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `.next` folder
   - Add environment variables in site settings

### Deploy to AWS Amplify

1. **Connect repository:**
   - Go to AWS Amplify Console
   - Connect your GitHub repository

2. **Configure build:**
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands:
           - npm install
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

3. **Add environment variables** in Amplify Console

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_INGEST_URL` | Lambda URL for ingesting logs | `https://xxx.lambda-url.eu-north-1.on.aws/` |
| `NEXT_PUBLIC_READ_URL` | Lambda URL for reading logs | `https://yyy.lambda-url.eu-north-1.on.aws/` |

### Auto-Refresh Interval

To change the auto-refresh interval, edit `app/page.tsx`:

```typescript
// Change 5000 (5 seconds) to your desired interval in milliseconds
const interval = setInterval(() => {
  loadLogs();
}, 5000); // 5 seconds
```

## Screenshots

### Dashboard Overview
- Statistics cards showing log counts
- Real-time data visualization
- Log filtering and search

### Submit Logs
- Simple form for creating new logs
- Immediate feedback on submission
- Auto-refresh to show new logs

### Charts
- Pie chart showing severity distribution
- Bar chart showing timeline

## 🛠️ Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

## Customization

### Change Color Scheme

Edit `tailwind.config.ts` to customize colors:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Add New Charts

Install additional chart libraries:
```bash
npm install @tremor/react
npm install victory
```

## Performance

- **First Load JS**: ~100 KB
- **Page Load Time**: < 1 second
- **Auto-refresh**: Every 5 seconds (configurable)
- **Build Time**: ~30 seconds

## Troubleshooting

### CORS Errors
- Ensure Lambda Function URLs have CORS enabled
- Check that `allow_origins` includes your domain

### Logs Not Loading
- Verify Lambda URLs in `.env.local`
- Check browser console for errors
- Test Lambda URLs directly with curl

### Build Errors
- Delete `.next` folder: `rm -rf .next`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

## License

MIT License - feel free to use this project for learning and portfolios!

## Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [DynamoDB](https://aws.amazon.com/dynamodb/)

---

**Made with using serverless architecture**

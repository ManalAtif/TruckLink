import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'TruckLink Driver Hiring & Onboarding API',
      timestamp: new Date().toISOString(),
    });
  });

  // Simple driver match scoring helper endpoint if requested via REST
  app.post('/api/match-score', (req, res) => {
    const { driver, job } = req.body;
    if (!driver || !job) {
      return res.status(400).json({ error: 'Driver and Job details required' });
    }

    let score = 0;
    const reasons: string[] = [];

    // CDL Class match (30 pts)
    if (driver.cdlClass === job.cdlClassRequired) {
      score += 30;
      reasons.push(`Exact CDL Class ${driver.cdlClass} match (+30)`);
    } else if (driver.cdlClass === 'Class A' && (job.cdlClassRequired === 'Class B' || job.cdlClassRequired === 'Class C')) {
      score += 25;
      reasons.push(`Superior CDL Class (Class A covers ${job.cdlClassRequired}) (+25)`);
    }

    // Endorsements (25 pts)
    const requiredEndorsements: string[] = job.endorsementsRequired || [];
    if (requiredEndorsements.length === 0) {
      score += 25;
      reasons.push('No special endorsements required (+25)');
    } else {
      const driverEndorsements: string[] = driver.endorsements || [];
      const matched = requiredEndorsements.filter((e) => driverEndorsements.includes(e));
      const endorsementFraction = matched.length / requiredEndorsements.length;
      const pts = Math.round(endorsementFraction * 25);
      score += pts;
      reasons.push(`Matched ${matched.length}/${requiredEndorsements.length} required endorsements (+${pts})`);
    }

    // Experience (20 pts)
    const minExp = job.minExperienceYears || 0;
    const driverExp = driver.experienceYears || 0;
    if (driverExp >= minExp) {
      score += 20;
      reasons.push(`Meets or exceeds experience requirement (${driverExp} yrs vs ${minExp} yrs min) (+20)`);
    } else {
      const pts = Math.max(0, Math.round((driverExp / Math.max(minExp, 1)) * 20));
      score += pts;
      reasons.push(`Below experience requirement (${driverExp} yrs / ${minExp} yrs min) (+${pts})`);
    }

    // Equipment Type (15 pts)
    if (driver.equipmentTypes?.includes(job.equipmentType) || !job.equipmentType) {
      score += 15;
      reasons.push(`Equipment match: ${job.equipmentType} (+15)`);
    }

    // Route Type (10 pts)
    if (driver.preferredRoutes?.includes(job.routeType) || !job.routeType) {
      score += 10;
      reasons.push(`Route preference match: ${job.routeType} (+10)`);
    }

    return res.json({
      score: Math.min(100, score),
      reasons,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruckLink Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

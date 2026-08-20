import { DriverProfile, JobPosting, MatchResult } from '../types';

export function calculateDriverJobMatch(driver: DriverProfile, job: JobPosting): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. CDL Class Match (Weight: 30%)
  let cdlClassMatch = false;
  if (driver.cdlClass === job.cdlClassRequired) {
    cdlClassMatch = true;
    score += 30;
    reasons.push(`Exact CDL Class Match: ${driver.cdlClass}`);
  } else if (driver.cdlClass === 'Class A' && (job.cdlClassRequired === 'Class B' || job.cdlClassRequired === 'Class C')) {
    cdlClassMatch = true;
    score += 28;
    reasons.push(`Higher-tier CDL (${driver.cdlClass}) qualifies for ${job.cdlClassRequired}`);
  } else if (driver.cdlClass === 'Class B' && job.cdlClassRequired === 'Class C') {
    cdlClassMatch = true;
    score += 26;
    reasons.push(`CDL Class B qualifies for ${job.cdlClassRequired}`);
  } else {
    reasons.push(`Does not meet required CDL ${job.cdlClassRequired} (Driver holds ${driver.cdlClass})`);
  }

  // 2. Endorsements Match (Weight: 25%)
  const requiredEndorsements = job.endorsementsRequired || [];
  const driverEndorsements = driver.endorsements || [];
  const matchedEndorsements = requiredEndorsements.filter((req) =>
    driverEndorsements.some((d) => d.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(d.toLowerCase()))
  );
  const missingEndorsements = requiredEndorsements.filter(
    (req) => !driverEndorsements.some((d) => d.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(d.toLowerCase()))
  );

  if (requiredEndorsements.length === 0) {
    score += 25;
    reasons.push('All endorsement criteria satisfied (Standard CDL)');
  } else {
    const fraction = matchedEndorsements.length / requiredEndorsements.length;
    const endorsementPoints = Math.round(fraction * 25);
    score += endorsementPoints;
    if (fraction === 1) {
      reasons.push(`Holds all required endorsements (${matchedEndorsements.join(', ')})`);
    } else {
      reasons.push(`Has ${matchedEndorsements.length}/${requiredEndorsements.length} endorsements (Missing: ${missingEndorsements.join(', ')})`);
    }
  }

  // 3. Experience Match (Weight: 20%)
  let experienceMatch = false;
  const minExp = job.minExperienceYears || 0;
  const driverExp = driver.experienceYears || 0;

  if (driverExp >= minExp) {
    experienceMatch = true;
    score += 20;
    reasons.push(`Experience verified: ${driverExp} yrs exceeds required ${minExp} yrs`);
  } else {
    const expFraction = driverExp / Math.max(minExp, 1);
    const expPoints = Math.round(expFraction * 20);
    score += expPoints;
    reasons.push(`Below experience threshold (${driverExp} yrs / ${minExp} yrs min)`);
  }

  // 4. Equipment Match (Weight: 15%)
  let equipmentMatch = false;
  if (!job.equipmentType || driver.equipmentTypes?.some((eq) => eq.toLowerCase() === job.equipmentType.toLowerCase())) {
    equipmentMatch = true;
    score += 15;
    reasons.push(`Equipment preference verified: ${job.equipmentType}`);
  } else {
    reasons.push(`Equipment differs: Driver specializes in ${driver.equipmentTypes?.join(', ')}`);
  }

  // 5. Route Match (Weight: 10%)
  let routeMatch = false;
  if (!job.routeType || driver.preferredRoutes?.some((r) => r.toLowerCase().includes(job.routeType.toLowerCase()))) {
    routeMatch = true;
    score += 10;
    reasons.push(`Route alignment: ${job.routeType}`);
  } else {
    reasons.push(`Route preference is ${driver.preferredRoutes?.join(', ')} (Job is ${job.routeType})`);
  }

  // Small bonus for clean MVR
  if (driver.cleanMvr && driver.mvrViolationsCount === 0) {
    score = Math.min(100, score + 2);
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    driver,
    job,
    overallScore: finalScore,
    cdlClassMatch,
    endorsementsMatched: matchedEndorsements,
    endorsementsMissing: missingEndorsements,
    experienceMatch,
    equipmentMatch,
    routeMatch,
    reasons,
  };
}

export function rankDriversForJob(drivers: DriverProfile[], job: JobPosting): MatchResult[] {
  // STRICT REQUIREMENT: Only approved drivers are visible / ranked
  const approvedDrivers = drivers.filter((d) => d.status === 'approved');
  return approvedDrivers
    .map((driver) => calculateDriverJobMatch(driver, job))
    .sort((a, b) => b.overallScore - a.overallScore);
}

export function rankJobsForDriver(jobs: JobPosting[], driver: DriverProfile): MatchResult[] {
  const activeJobs = jobs.filter((j) => j.status === 'active');
  return activeJobs
    .map((job) => calculateDriverJobMatch(driver, job))
    .sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * routes/ai.ts
 * -------------
 * All Gemini AI-powered API routes for Phase 2.
 *
 * POST /api/ai/dispatch-suggest    — ranked dispatch recommendations
 * POST /api/ai/categorize-hazard   — NLP hazard categorization
 * POST /api/ai/generate-scenario   — natural language → Scenario object
 * POST /api/ai/refine-eta          — predictive corridor clearance timing
 *
 * Security: All routes require authentication. GEMINI_API_KEY is never
 * exposed to the client. All AI calls are logged to the audit log.
 */

import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { appendAuditLog } from '../db/store.js';
import { query } from '../db/pg.js';
import { authenticateToken } from '../middleware/auth.js';

export const aiRouter = Router();

// All AI routes require authentication
aiRouter.use(authenticateToken);

// ─── Gemini client (server-side only) ─────────────────────────────────────────
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Parse JSON from a Gemini response that may be wrapped in ```json ... ``` fences.
 */
function parseGeminiJson<T>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

// ─── 2.1 POST /api/ai/dispatch-suggest ───────────────────────────────────────
aiRouter.post('/dispatch-suggest', async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    
    const activeCallsRes = await query(
      `SELECT id, caller, incident_type as "incidentType", summary, status 
       FROM distress_calls WHERE status = 'Active' AND (organization_id = $1 OR $1 IS NULL)`,
      [orgId]
    );
    const activeCalls = activeCallsRes.rows;

    const scenariosRes = await query(
      `SELECT alert_radius as "alertRadius", ambulance_speed as "ambulanceSpeed", traffic_density as "trafficDensity" 
       FROM scenarios WHERE (organization_id = $1 OR $1 IS NULL) LIMIT 1`,
      [orgId]
    );
    const scenarios = scenariosRes.rows;

    const latestRunRes = await query(
      `SELECT name, travel_time_min as "travelTimeMin" 
       FROM simulation_runs WHERE (organization_id = $1 OR $1 IS NULL) ORDER BY created_at DESC LIMIT 1`,
      [orgId]
    );
    const latestRun = latestRunRes.rows[0];

    const trafficDensity = scenarios[0]?.trafficDensity || 'medium';
    const ambulanceSpeed = scenarios[0]?.ambulanceSpeed || 60;
    const alertRadius = scenarios[0]?.alertRadius || 500;

    const contextPrompt = `
You are an AI dispatch coordinator for an emergency traffic management system.
Analyze the following active distress calls and operational context, then return ranked dispatch recommendations.

## Active Distress Calls (${activeCalls.length} calls)
${activeCalls.map((c, i) => `
${i + 1}. Call ID: ${c.id}
   Caller: ${c.caller}
   Incident Type: ${c.incidentType}
   Summary: ${c.summary}
   Status: ${c.status}
`).join('')}

## Operational Context
- Current traffic density: ${trafficDensity}
- Ambulance average speed: ${ambulanceSpeed} km/h
- Active alert radius: ${alertRadius}m
- Last corridor run: ${latestRun ? `${latestRun.name}, ETA was ${latestRun.travelTimeMin} min` : 'No recent runs'}

## Instructions
Respond ONLY with a JSON object (no markdown, no explanation) in this exact format:
{
  "recommendations": [
    {
      "callId": "string — the call ID from above",
      "priority": number — 1 (highest) to ${activeCalls.length} (lowest),
      "unit": "string — recommended unit e.g. ALS-104 or BLS-22",
      "route": "string — recommended route name",
      "etaMinutes": number — estimated ETA in minutes,
      "confidence": number — 0.0 to 1.0,
      "reasoning": "string — 1-2 sentence explanation"
    }
  ],
  "summary": "string — overall dispatch strategy in 1-2 sentences",
  "alertRadiusSuggestion": number — recommended alert radius in meters,
  "trafficNote": "string — brief note on traffic conditions"
}`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contextPrompt,
    });

    const text = response.text || '';
    const result = parseGeminiJson<{
      recommendations: Array<{
        callId: string;
        priority: number;
        unit: string;
        route: string;
        etaMinutes: number;
        confidence: number;
        reasoning: string;
      }>;
      summary: string;
      alertRadiusSuggestion: number;
      trafficNote: string;
    }>(text);

    appendAuditLog({
      organizationId: orgId,
      actor: `${req.user!.name} (${req.user!.role})`,
      action: 'AI_DISPATCH_SUGGESTION',
      resource: `${activeCalls.length} active calls`,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Gemini returned ${result.recommendations.length} recommendations. Top: ${result.recommendations[0]?.unit || 'N/A'}`,
    });

    res.json({ ...result, generatedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI dispatch suggestion failed';
    console.error('[AI] dispatch-suggest error:', message);
    res.status(500).json({ error: message });
  }
});

// ─── 2.2 POST /api/ai/categorize-hazard ──────────────────────────────────────
aiRouter.post('/categorize-hazard', async (req: Request, res: Response) => {
  const { notes, coordinates } = req.body as { notes?: string; coordinates?: string };

  if (!notes || notes.trim().length < 5) {
    res.status(400).json({ error: 'notes must be at least 5 characters.' });
    return;
  }

  try {
    const prompt = `
You are an emergency traffic hazard classification AI.
Analyze this citizen hazard report and classify it.

## Hazard Report
Notes: "${notes}"
${coordinates ? `Coordinates: ${coordinates}` : ''}

## Valid Categories
- "Accident" — vehicle collision, crash
- "Road Obstruction" — debris, fallen tree, construction, barrier, pothole
- "Flooding" — standing water, flash flood, drain overflow
- "Stalled EMS" — ambulance, fire truck, or emergency vehicle stuck

## Valid Severities
- "Minor Delay" — small slowdown, traffic moving
- "Lane Restricted" — one or more lanes blocked but road passable
- "Critical Blocking" — road fully blocked, emergency detour needed

Respond ONLY with a JSON object (no markdown) in this exact format:
{
  "category": "one of the four categories above",
  "severity": "one of the three severities above",
  "confidence": number between 0.0 and 1.0,
  "reasoning": "one sentence explaining classification",
  "urgency": "low" | "medium" | "high" | "critical"
}`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const result = parseGeminiJson<{
      category: string;
      severity: string;
      confidence: number;
      reasoning: string;
      urgency: string;
    }>(response.text || '{}');

    appendAuditLog({
      organizationId: req.user?.organizationId,
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'Mobile User',
      action: 'AI_HAZARD_CATEGORIZED',
      resource: notes.slice(0, 60),
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Category: ${result.category}, Severity: ${result.severity}, Confidence: ${result.confidence}`,
    });

    res.json({ ...result, generatedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI hazard categorization failed';
    console.error('[AI] categorize-hazard error:', message);
    res.status(500).json({ error: message });
  }
});

// ─── 2.3 POST /api/ai/generate-scenario ──────────────────────────────────────
aiRouter.post('/generate-scenario', async (req: Request, res: Response) => {
  const { description } = req.body as { description?: string };

  if (!description || description.trim().length < 10) {
    res.status(400).json({ error: 'description must be at least 10 characters.' });
    return;
  }

  try {
    const prompt = `
You are an emergency simulation scenario generator for a municipal traffic management system.
Generate a realistic and detailed simulation scenario from the following description.

## User Description
"${description}"

## Field Constraints
- alertRadius: integer between 100 and 2000 (meters)
- driverCompliance: integer between 10 and 100 (percent)
- ambulanceSpeed: integer between 20 and 120 (km/h)
- trafficDensity: one of "low" | "medium" | "high" | "critical"
- status must always be "Draft"

Respond ONLY with a JSON object (no markdown) in this exact format:
{
  "name": "string — concise scenario title (max 60 chars)",
  "routeProfile": "string — descriptive route name",
  "startNode": "string — starting location e.g. Node A (City Center)",
  "destinationNode": "string — destination e.g. Node H (General Hospital)",
  "alertRadius": number,
  "driverCompliance": number,
  "ambulanceSpeed": number,
  "trafficDensity": "low" | "medium" | "high" | "critical",
  "status": "Draft",
  "reasoning": "string — 2-3 sentences explaining the generated parameters"
}`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const generated = parseGeminiJson<{
      name: string;
      routeProfile: string;
      startNode: string;
      destinationNode: string;
      alertRadius: number;
      driverCompliance: number;
      ambulanceSpeed: number;
      trafficDensity: 'low' | 'medium' | 'high' | 'critical';
      status: 'Draft';
      reasoning: string;
    }>(response.text || '{}');

    // Build a full Scenario object
    const newScenario = {
      id: `sc-ai-${Date.now()}`,
      name: generated.name,
      routeProfile: generated.routeProfile,
      startNode: generated.startNode,
      destinationNode: generated.destinationNode,
      alertRadius: Math.min(2000, Math.max(100, generated.alertRadius)),
      driverCompliance: Math.min(100, Math.max(10, generated.driverCompliance)),
      ambulanceSpeed: Math.min(120, Math.max(20, generated.ambulanceSpeed)),
      trafficDensity: generated.trafficDensity,
      status: 'Draft' as const,
      createdAt: new Date().toLocaleString(),
      seed: Math.floor(Math.random() * 90000) + 10000,
    };

    appendAuditLog({
      organizationId: req.user?.organizationId,
      actor: `${req.user!.name} (${req.user!.role})`,
      action: 'AI_SCENARIO_GENERATED',
      resource: newScenario.name,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Density: ${newScenario.trafficDensity}, Alert: ${newScenario.alertRadius}m, Compliance: ${newScenario.driverCompliance}%`,
    });

    res.json({
      scenario: newScenario,
      reasoning: generated.reasoning,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI scenario generation failed';
    console.error('[AI] generate-scenario error:', message);
    res.status(500).json({ error: message });
  }
});

// ─── 2.4 POST /api/ai/refine-eta ─────────────────────────────────────────────
aiRouter.post('/refine-eta', async (req: Request, res: Response) => {
  const {
    trafficDensity,
    ambulanceSpeed,
    complianceRate,
    alertRadius,
    distanceRemainingKm,
    preemptionNodes,
  } = req.body as {
    trafficDensity?: string;
    ambulanceSpeed?: number;
    complianceRate?: number;
    alertRadius?: number;
    distanceRemainingKm?: number;
    preemptionNodes?: Array<{ name: string; status: string; distanceMeters: number; etaSeconds: number }>;
  };

  if (!trafficDensity || !ambulanceSpeed) {
    res.status(400).json({ error: 'trafficDensity and ambulanceSpeed are required.' });
    return;
  }

  try {
    const nodesText = preemptionNodes?.length
      ? preemptionNodes.map(n =>
          `  - ${n.name}: ${n.status}, ${n.distanceMeters}m away, ETA ${n.etaSeconds}s`
        ).join('\n')
      : '  (no node data provided)';

    const prompt = `
You are a predictive corridor clearance AI for emergency ambulance routing.
Analyze the current corridor conditions and provide refined ETA predictions with optimization recommendations.

## Current Corridor State
- Traffic density: ${trafficDensity}
- Ambulance speed: ${ambulanceSpeed} km/h
- Driver compliance rate: ${complianceRate ?? 70}%
- Active alert radius: ${alertRadius ?? 500}m
- Distance remaining: ${distanceRemainingKm ?? 2.5} km
- Signal preemption nodes:
${nodesText}

## Instructions
Provide refined ETA predictions per node and overall corridor optimization advice.
Respond ONLY with a JSON object (no markdown) in this exact format:
{
  "refinedEtaMinutes": number — overall refined ETA in minutes,
  "confidencePercent": number — 0 to 100,
  "recommendedSpeedKph": number — optimal speed recommendation,
  "timeSavingOpportunityMin": number — potential additional time saved,
  "nodeRefinements": [
    {
      "name": "string — node name",
      "refinedEtaSec": number — refined ETA in seconds,
      "action": "string — brief recommended action e.g. 'Hold Green Wave +15s'"
    }
  ],
  "corridorHealthScore": number — 0 to 100 (100 = fully optimal),
  "insight": "string — 2-3 sentence actionable insight for the dispatch operator",
  "speedAdjustmentReason": "string — why this speed is recommended"
}`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const result = parseGeminiJson<{
      refinedEtaMinutes: number;
      confidencePercent: number;
      recommendedSpeedKph: number;
      timeSavingOpportunityMin: number;
      nodeRefinements: Array<{ name: string; refinedEtaSec: number; action: string }>;
      corridorHealthScore: number;
      insight: string;
      speedAdjustmentReason: string;
    }>(response.text || '{}');

    appendAuditLog({
      organizationId: req.user?.organizationId,
      actor: `${req.user!.name} (${req.user!.role})`,
      action: 'AI_ETA_REFINED',
      resource: 'Corridor ETA',
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Refined ETA: ${result.refinedEtaMinutes}min. Health score: ${result.corridorHealthScore}/100`,
    });

    res.json({ ...result, generatedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI ETA refinement failed';
    console.error('[AI] refine-eta error:', message);
    res.status(500).json({ error: message });
  }
});

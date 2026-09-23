// Helper para tracking de ejecuciones de cron jobs.
// Cada ejecución crea un CronRun (status='running'), y al terminar se marca
// como success/failed con duración y metadata.
//
// - trackCronRun: envuelve una función async y la trackea automáticamente.
// - startCronRun/finishCronRun: para control manual (no usado por ahora,
//   pero queda como utilidad pública para cron jobs futuros).

import 'server-only';
import { prisma } from '@/lib/db';

export type CronJobName = 'monthly_debts' | 'overdue_check';
export type CronTrigger = 'cron_vercel' | 'manual_admin' | 'manual_superadmin' | 'system';
export type CronStatus = 'running' | 'success' | 'failed';

export interface StartCronRunInput {
  jobName: CronJobName;
  trigger: CronTrigger;
  triggeredBy?: string | null;
  metadata?: Record<string, unknown>;
}

export interface FinishCronRunInput {
  status: 'success' | 'failed';
  metadata?: Record<string, unknown>;
  errorMessage?: string;
}

/** Inicia un CronRun (status='running') y devuelve su id. */
export async function startCronRun(input: StartCronRunInput): Promise<string> {
  const run = await prisma.cronRun.create({
    data: {
      jobName: input.jobName,
      trigger: input.trigger,
      triggeredBy: input.triggeredBy ?? null,
      status: 'running',
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
  return run.id;
}

/** Marca el run como success o failed, calcula durationMs y mergea metadata. */
export async function finishCronRun(
  runId: string,
  input: FinishCronRunInput,
): Promise<void> {
  const run = await prisma.cronRun.findUnique({ where: { id: runId } });
  if (!run) return;
  const durationMs = Date.now() - run.startedAt.getTime();

  // Merge metadata si viene nueva
  let mergedMetadata: Record<string, unknown> = {};
  if (run.metadata) {
    try {
      mergedMetadata = JSON.parse(run.metadata);
    } catch {
      // ignore — metadata corrupto
    }
  }
  if (input.metadata) {
    mergedMetadata = { ...mergedMetadata, ...input.metadata };
  }

  await prisma.cronRun.update({
    where: { id: runId },
    data: {
      status: input.status,
      finishedAt: new Date(),
      durationMs,
      metadata: Object.keys(mergedMetadata).length > 0 ? JSON.stringify(mergedMetadata) : null,
      errorMessage: input.errorMessage ?? null,
    },
  });
}

/**
 * Helper: ejecuta una función envolviéndola con tracking automático.
 * Si la función tira excepción, el CronRun queda como 'failed' con el errorMessage
 * y luego se re-lanza la excepción (no se traga el error).
 */
export async function trackCronRun<T>(
  input: StartCronRunInput,
  fn: () => Promise<T>,
): Promise<T> {
  const runId = await startCronRun(input);
  try {
    const result = await fn();
    // Si el resultado tiene metadata serializable, lo guardamos.
    const meta = isPlainRecord(result) ? (result as Record<string, unknown>) : undefined;
    await finishCronRun(runId, { status: 'success', metadata: meta });
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    await finishCronRun(runId, { status: 'failed', errorMessage: msg });
    throw err;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

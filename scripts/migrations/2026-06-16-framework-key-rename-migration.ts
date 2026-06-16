/**
 * Migration: rename framework identifiers in DB JSON properties
 *
 * Team.properties:
 *   - csc_statuses_mvps  → csc_statuses_mvsp
 *   - csc_statuses_2022  → csc_statuses_iso-2022
 *   - csc_statuses_2013  → csc_statuses_iso-2013
 *   - csc_iso values:    mvps → mvsp, 2022 → iso-2022, 2013 → iso-2013
 *
 * Task.properties:
 *   - csc_controls_mvps  → csc_controls_mvsp
 *   - csc_controls_2022  → csc_controls_iso-2022
 *   - csc_controls_2013  → csc_controls_iso-2013
 *
 * Task.properties.rpa_procedure[4].toms (array):
 *   - 'mvps' value → 'mvsp'
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../../prisma/generated/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type JsonObj = Record<string, unknown>;

function renameKey(obj: JsonObj, oldKey: string, newKey: string): boolean {
  if (oldKey in obj && !(newKey in obj)) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
    return true;
  }
  return false;
}

function transformTeamProps(raw: Prisma.JsonValue): { changed: boolean; props: JsonObj } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { changed: false, props: {} };
  }
  const props = { ...(raw as JsonObj) };
  let changed = false;

  changed = renameKey(props, 'csc_statuses_mvps', 'csc_statuses_mvsp') || changed;
  changed = renameKey(props, 'csc_statuses_2022', 'csc_statuses_iso-2022') || changed;
  changed = renameKey(props, 'csc_statuses_2013', 'csc_statuses_iso-2013') || changed;

  const iso = props.csc_iso;
  if (Array.isArray(iso)) {
    const isoMap: Record<string, string> = { mvps: 'mvsp', '2022': 'iso-2022', '2013': 'iso-2013' };
    const renamed = iso.map((v) => (typeof v === 'string' && isoMap[v] ? isoMap[v] : v));
    if (JSON.stringify(renamed) !== JSON.stringify(iso)) {
      props.csc_iso = renamed;
      changed = true;
    }
  }

  return { changed, props };
}

function transformTaskProps(raw: Prisma.JsonValue): { changed: boolean; props: JsonObj } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { changed: false, props: {} };
  }
  const props = { ...(raw as JsonObj) };
  let changed = false;

  changed = renameKey(props, 'csc_controls_mvps', 'csc_controls_mvsp') || changed;
  changed = renameKey(props, 'csc_controls_2022', 'csc_controls_iso-2022') || changed;
  changed = renameKey(props, 'csc_controls_2013', 'csc_controls_iso-2013') || changed;

  // Fix rpa_procedure[4].toms: rename 'mvps' → 'mvsp'
  const rpa = props.rpa_procedure;
  if (Array.isArray(rpa) && rpa[4] && typeof rpa[4] === 'object' && !Array.isArray(rpa[4])) {
    const step4 = { ...(rpa[4] as JsonObj) };
    const toms = step4.toms;
    if (Array.isArray(toms)) {
      const fixedToms = toms.map((v) => (v === 'mvps' ? 'mvsp' : v));
      if (JSON.stringify(fixedToms) !== JSON.stringify(toms)) {
        step4.toms = fixedToms;
        const newRpa = [...rpa];
        newRpa[4] = step4;
        props.rpa_procedure = newRpa;
        changed = true;
      }
    }
  }

  return { changed, props };
}

async function migrateTeams() {
  const batchSize = 50;
  let cursor: string | null = null;
  let updated = 0;
  let hasMore = true;

  console.log('--- Migrating Team.properties ---');

  while (hasMore) {
    const teams = await prisma.team.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (!teams.length) { hasMore = false; continue; }

    const tx: Prisma.PrismaPromise<unknown>[] = [];

    for (const team of teams) {
      const { changed, props } = transformTeamProps(team.properties);
      if (changed) {
        console.log(`  team ${team.id}: updating properties`);
        tx.push(prisma.team.update({ where: { id: team.id }, data: { properties: props as Prisma.InputJsonValue } }));
        updated++;
      }
    }

    if (tx.length) await prisma.$transaction(tx);
    cursor = teams[teams.length - 1].id;
    if (teams.length < batchSize) hasMore = false;
  }

  console.log(`Teams updated: ${updated}`);
}

async function migrateTasks() {
  const batchSize = 100;
  let cursor: number | null = null;
  let updated = 0;
  let hasMore = true;

  console.log('--- Migrating Task.properties ---');

  while (hasMore) {
    const tasks = await prisma.task.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (!tasks.length) { hasMore = false; continue; }

    const tx: Prisma.PrismaPromise<unknown>[] = [];

    for (const task of tasks) {
      const { changed, props } = transformTaskProps(task.properties);
      if (changed) {
        console.log(`  task ${task.id} (#${task.taskNumber}): updating properties`);
        tx.push(prisma.task.update({ where: { id: task.id }, data: { properties: props as Prisma.InputJsonValue } }));
        updated++;
      }
    }

    if (tx.length) await prisma.$transaction(tx);
    cursor = tasks[tasks.length - 1].id;
    if (tasks.length < batchSize) hasMore = false;
  }

  console.log(`Tasks updated: ${updated}`);
}

async function main() {
  await migrateTeams();
  await migrateTasks();
  console.log('Migration complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

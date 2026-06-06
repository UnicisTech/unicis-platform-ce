import type { ISO } from 'types';
import type { TFunction } from 'next-i18next';
import frameworks from '@/lib/csc/frameworks';
import { CSC_FRAMEWORK_TO_NAME } from '@/lib/csc/csc-frameworks';
import { DEFAULT_TASK_PRIORITY } from '@/lib/tasks';
import type { TaskImportRow } from './exportTasks';

export interface TemplateInfo {
  id: ISO;
  name: string;
  controlCount: number;
}

/**
 * Build the list of available templates for the team's enabled frameworks.
 */
export function getAvailableTemplates(
  enabledFrameworks: ISO[]
): TemplateInfo[] {
  return enabledFrameworks
    .filter((iso) => iso in frameworks)
    .map((iso) => {
      const fw = frameworks[iso];
      return {
        id: iso,
        name: CSC_FRAMEWORK_TO_NAME[iso] ?? iso,
        controlCount: fw.controls.length,
      };
    });
}

const TITLE_EXCERPT_MAX_LENGTH = 60;

/**
 * Build a task title from a control's code, name, and requirements.
 * Appends a short excerpt from the requirements to disambiguate controls
 * that share the same name (e.g. "Organizational Context").
 *
 * Format: "[code] control name — excerpt of requirements..."
 */
function buildTaskTitle(
  code: string,
  controlName: string,
  requirements: string
): string {
  const base = `[${code}] ${controlName}`;
  if (!requirements) return base;

  let excerpt = requirements.trim();
  if (excerpt.length > TITLE_EXCERPT_MAX_LENGTH) {
    excerpt = excerpt.slice(0, TITLE_EXCERPT_MAX_LENGTH).trimEnd() + '...';
  }

  return `${base} — ${excerpt}`;
}

/**
 * Generate TaskImportRow[] from a framework's controls using i18n translations.
 *
 * Each control becomes a task with:
 *   - title: "[code] control name"
 *   - description: requirements text (markdown)
 *   - status: "todo"
 */
export function generateTemplateRows(iso: ISO, t: TFunction): TaskImportRow[] {
  const fw = frameworks[iso];
  if (!fw) return [];

  return fw.controls.map((control) => {
    const code = t(`csc/${iso}:controls.${control.id}.code`);
    const controlName = t(`csc/${iso}:controls.${control.id}.control`);
    const requirements = t(`csc/${iso}:controls.${control.id}.requirements`);

    const title = buildTaskTitle(code, controlName, requirements);
    const description = requirements || '';

    return {
      title,
      status: 'todo',
      priority: DEFAULT_TASK_PRIORITY,
      duedate: '',
      description,
    };
  });
}

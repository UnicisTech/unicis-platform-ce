import { Role } from "@prisma/client";
import { TeamCourseWithProgress, TeamMemberWithUser } from "types";

export const getCourseStatus = (teamCourse: TeamCourseWithProgress, members: TeamMemberWithUser[]): 'todo' | 'inprogress' | 'done' => {
    const membersToPassCourse = members.filter(({role}) => role !== Role.AUDITOR)
    if (teamCourse.progress.length === 0) return 'todo'
    if (teamCourse.progress.length < membersToPassCourse.length) return 'inprogress'
    if ((teamCourse.progress.length === membersToPassCourse.length) && teamCourse.progress.every(({progress}) => progress === 100)) return 'done'
    return 'todo'
}
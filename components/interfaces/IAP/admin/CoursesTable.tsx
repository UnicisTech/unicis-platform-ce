import { Button } from 'react-daisyui';
import EditIcon from '@atlaskit/icon/glyph/edit';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import GraphLineIcon from '@atlaskit/icon/glyph/graph-line';
import TableIcon from '@atlaskit/icon/glyph/table';
import useCanAccess from 'hooks/useCanAccess';
import { TeamCourseWithProgress, TeamMemberWithUser } from 'types';
import { getCourseStatus } from '../services/helpers';
import { StatusBadge } from '@/components/shared';

const statuses = {
  todo: <StatusBadge label="To do" value="todo" />,
  inprogress: <StatusBadge label="In progress" value="inprogress" />,
  done: <StatusBadge label="Completed" value="done" />,
};

const CoursesTable = ({
  teamCourses,
  members,
  categories,
  editHandler,
  deleteHandler,
  completionHandler,
  statusHandler,
}: {
  teamCourses: TeamCourseWithProgress[];
  members: TeamMemberWithUser[];
  categories: any[];
  editHandler: (course: TeamCourseWithProgress) => void;
  deleteHandler: (course: TeamCourseWithProgress) => void;
  completionHandler: (course: TeamCourseWithProgress) => void;
  statusHandler: (teamCourse: TeamCourseWithProgress) => void;
}) => {
  const { canAccess } = useCanAccess();

  return (
    <div className="overflow-x-auto">
      <table className="table w-full border-b text-sm">
        <thead className="bg-base-200">
          <tr>
            <th style={{ width: '20%' }}>Name</th>
            <th style={{ width: '40%' }}>Category</th>
            <th style={{ width: '15%' }}>Status</th>
            <th style={{ width: '25%' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teamCourses.map((teamCourse, index) => {
            const status = getCourseStatus(teamCourse, members);
            const categoryName = categories.find(
              ({ id }) => id === teamCourse.course.categoryId
            )?.name;

            return (
              <tr key={teamCourse.course.name + index}>
                <td>{teamCourse.course.name}</td>
                <td>{categoryName}</td>
                <td>{statuses[status]}</td>
                <td>
                  <div className="flex items-center gap-2 flex-wrap">
                    {canAccess('iap_course', ['create']) && (
                      <Button
                        size="sm"
                        shape="square"
                        onClick={() => editHandler(teamCourse)}
                        disabled={Boolean(teamCourse.progress.length)}
                      >
                        <EditIcon label="Edit course" />
                      </Button>
                    )}
                    {canAccess('iap_course', ['delete']) && (
                      <Button
                        size="sm"
                        shape="square"
                        color="error"
                        onClick={() => deleteHandler(teamCourse)}
                      >
                        <TrashIcon label="Delete course" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      shape="square"
                      onClick={() => completionHandler(teamCourse)}
                    >
                      <GraphLineIcon label="Completion results" />
                    </Button>
                    <Button
                      size="sm"
                      shape="square"
                      onClick={() => statusHandler(teamCourse)}
                    >
                      <TableIcon label="Status results" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CoursesTable;

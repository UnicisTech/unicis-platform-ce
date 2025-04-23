import DynamicTable from '@atlaskit/dynamic-table';
import { Button } from 'react-daisyui';
import EditIcon from '@atlaskit/icon/glyph/edit';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import GraphLineIcon from '@atlaskit/icon/glyph/graph-line';
import TableIcon from '@atlaskit/icon/glyph/table';
import useCanAccess from 'hooks/useCanAccess';
import { TeamCourseWithProgress, TeamMemberWithUser } from 'types';
import { getCourseStatus } from '../services/helpers';
import { StatusBadge } from '@/components/shared';

const head = {
  cells: [
    {
      key: 'name',
      content: <a style={{ fontSize: '14px' }}>Name</a>,
      width: 20,
    },
    {
      key: 'category',
      content: <a style={{ fontSize: '14px' }}>Category</a>,
      isSortable: true,
      width: 40,
    },
    {
      key: 'status',
      content: <a style={{ fontSize: '14px' }}>Status</a>,
      isSortable: true,
      width: 15,
    },
    {
      key: 'actions',
      content: <a style={{ fontSize: '14px' }}>Actions</a>,
      isSortable: true,
      width: 15,
    },
  ],
};

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

  const rows = teamCourses.map((teamCourse, index) => {
    const status = getCourseStatus(teamCourse, members);
    return {
      cells: [
        { key: 'name', content: teamCourse.course.name },
        {
          key: 'category',
          content: categories.find(
            ({ id }) => id === teamCourse.course.categoryId
          )?.name,
        },
        { key: 'status', content: statuses[status] },
        {
          key: 'actions',
          content: (
            <div className="flex items-center gap-0.5">
              {canAccess('iap_course', ['create']) && (
                <Button
                  startIcon={<EditIcon label="Edit course" />}
                  shape="square"
                  size="sm"
                  onClick={() => editHandler(teamCourse)}
                  disabled={Boolean(teamCourse.progress.length)}
                />
              )}
              {canAccess('iap_course', ['delete']) && (
                <Button
                  startIcon={<TrashIcon label="Delete course" />}
                  shape="square"
                  size="sm"
                  onClick={() => deleteHandler(teamCourse)}
                />
              )}
              <Button
                startIcon={<GraphLineIcon label="Completion results" />}
                shape="square"
                size="sm"
                onClick={() => completionHandler(teamCourse)}
              />
              <Button
                startIcon={<TableIcon label="Status results" />}
                shape="square"
                size="sm"
                onClick={() => statusHandler(teamCourse)}
              />
            </div>
          ),
        },
      ],
      key: teamCourse.course.name + index,
    };
  });

  return (
    <DynamicTable
      head={head}
      rows={rows}
      defaultPage={1}
      defaultSortOrder="ASC"
      isFixedSize={true}
      rowsPerPage={10}
    />
  );
};

export default CoursesTable;

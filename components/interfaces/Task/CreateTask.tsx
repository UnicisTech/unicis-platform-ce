import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import axios from 'axios';

import { Team } from '@prisma/client';
import type { ApiResponse } from 'types';
import type { Task } from '@prisma/client';
import statusesData from '@/components/defaultLanding/data/statuses.json';
import { getCurrentStringDate } from '@/components/services/taskService';
import useTasks from 'hooks/useTasks';
import DaisyModal from '@/components/shared/daisyUI/DaisyModal';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';
import { Calendar } from '@/components/shadcn/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/shadcn/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const statuses = statusesData;
const DEFAULT_STATUS_VALUE = 'todo';

const CreateTask = ({ visible, setVisible, team }: { visible: boolean; setVisible: (visible: boolean) => void; team: Team }) => {
  const router = useRouter();
  const { slug } = router.query;
  const { mutateTasks } = useTasks(slug as string);
  const { t } = useTranslation('common');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const formik = useFormik({
    initialValues: {
      title: '',
      status: DEFAULT_STATUS_VALUE,
      duedate: getCurrentStringDate(),
      description: '',
    },
    validationSchema: Yup.object().shape({
      title: Yup.string().required('Title is required'),
      status: Yup.string().required('Status is required'),
      duedate: Yup.string().required('Due date is required'),
      description: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post<ApiResponse<Task>>(
        `/api/teams/${team.slug}/tasks`,
        values
      );

      const { error } = response.data;
      if (error) {
        toast.error(error.message);
        return;
      }

      mutateTasks();
      toast.success(t('task-created'));
      resetForm();
      setVisible(false);
    },
  });

  return (
    <DaisyModal open={visible} onClose={() => setVisible(false)}>
      <DaisyModal.Header>Create Task</DaisyModal.Header>
      <form onSubmit={formik.handleSubmit} className="flex flex-col justify-between h-[92%]">
        <DaisyModal.Body>
          <div className="flex flex-col space-y-4">
            <div className="form-control">
              <label className="label-text font-medium mb-1">Title</label>
              <Input
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                placeholder="Enter task title"
              />
            </div>

            <div className="form-control">
              <label className="label-text font-medium mb-1">Status</label>
              <Select
                value={formik.values.status}
                onValueChange={(val) => formik.setFieldValue('status', val)}
              >
                <SelectTrigger className="w-full" />
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-control">
              <label className="label-text font-medium mb-1">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <DaisyButton
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {formik.values.duedate ? (
                      format(new Date(formik.values.duedate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </DaisyButton>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      formik.setFieldValue("duedate", date?.toISOString().split("T")[0]);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="form-control">
              <label className="label-text font-medium mb-1">Description</label>
              <ReactQuill
                theme="snow"
                value={formik.values.description}
                onChange={(val) => formik.setFieldValue('description', val)}
              />
            </div>
          </div>
        </DaisyModal.Body>

        <DaisyModal.Actions>
          <DaisyButton type="button" color="ghost" onClick={() => setVisible(false)}>
            {t('close')}
          </DaisyButton>
          <DaisyButton type="submit" color="primary" loading={formik.isSubmitting}>
            {t('create')}
          </DaisyButton>
        </DaisyModal.Actions>
      </form>
    </DaisyModal>
  );
};

export default CreateTask;

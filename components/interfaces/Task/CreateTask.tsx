import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal, Button, Input, Select } from "react-daisyui";
//import Datepicker from "react-tailwindcss-datepicker";
import { useTranslation } from "next-i18next";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import useTeams from "hooks/useTeams";
//import Datepicker from 'flowbite-datepicker/Datepicker';
//import Datepicker from 'flowbite-datepicker/Datepicker';
import DatePicker from "react-datepicker";
//import Option
//import SelectOption from "react-daisyui/dist/Select/SelectOption";

const CreateTask = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const { mutateTeams } = useTeams();
  const { t } = useTranslation("common");

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { name } = values;

      const response = await axios.post<ApiResponse<Team>>(`/api/teams`, {
        name,
      });

      const { data: invitation, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      if (invitation) {
        toast.success(t("team-created"));
      }

      mutateTeams();
      formik.resetForm();
      setVisible(false);
    },
  });

  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  const handleValueChange = (newValue: any) => {
    console.log("newValue:", newValue);
    setValue(newValue);
  }

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">Create Task</Modal.Header>
        <Modal.Body>
          <div>
            {/* <Datepicker
              value={value}
              onChange={handleValueChange}
            /> */}
          </div>
          <div className="mt-2 flex flex-col space-y-4 font-sans">
            {/* <div className="form-control w-full max-w-xs"></div> */}
            {/* <p>{t("members-of-a-team")}</p> */}
            {/* <div className="flex justify-between space-x-3"> */}
            <div className="form-control w-full justify-between space-x-1 space-y-1">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <Input
                name="name"
                className="flex-grow"
                onChange={formik.handleChange}
                value={formik.values.name}
              //placeholder="Eg: operations, backend-team, frontend"
              />
            </div>
            {/* <div className="flex w-full component-preview p-4 items-center justify-center gap-2 font-sans"> */}
            <div className="flex items-center justify-center">
              <div className="datepicker relative form-floating mb-3 xl:w-96">
                <input type="text"
                  className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="Select a date" />
                <label className="text-gray-700">Select a date</label>
              </div>
            </div>
            <div className="form-control w-full justify-between space-x-1 space-y-1">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <Select
                //options={extensions}
                // {...args}
                // value={value}
                // onChange={(event) => setValue(event.target.value)}
                onChange={(event) => {
                  console.log('onChange select event', { event: event, val: event.target.value })
                }}
              >
                <option>To Do</option>
                <option>In Progress</option>
                {/* <SelectOption>ccc</SelectOption>
                <SelectOption>ccc</SelectOption>
                <SelectOption>ccc</SelectOption> */}
                {/* <Option value={'default'} disabled>
                  Pick your favorite Simpson
                </Option>
                <Option value={'Homer'}>Homer</Option>
                <Option value={'Marge'}>Marge</Option>
                <Option value={'Bart'}>Bart</Option>
                <Option value={'Lisa'}>Lisa</Option>
                <Option value={'Maggie'}>Maggie</Option> */}
              </Select>
            </div>

            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
            <p>below</p>
            <div className="flex items-center justify-center">
              <div
                id="myDatepicker"
                className="relative mb-3 xl:w-96"
                data-te-input-wrapper-init>
                <input
                  type="text"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent py-[0.32rem] px-3 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-gray-200 dark:placeholder:text-gray-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                  placeholder="Select a date" />
                <label
                  htmlFor="floatingInput"
                  className="pointer-events-none absolute top-0 left-3 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-600 peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-200 dark:peer-focus:text-gray-200"
                  >Select a date</label>
              </div>
            </div>


            <div className="flex items-center justify-center">
              <div
                className="relative mb-3 xl:w-96"
                data-te-datepicker-init
                data-te-input-wrapper-init>
                <input
                  type="text"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent py-[0.32rem] px-3 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                  placeholder="Select a date"
                  data-te-datepicker-toggle-ref
                  data-te-datepicker-toggle-button-ref />
                <label
                  htmlFor="floatingInput"
                  className="pointer-events-none absolute top-0 left-3 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-neutral-200"
                >Select a date</label>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
          >
            {t("create-task")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {t("close")}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default CreateTask;

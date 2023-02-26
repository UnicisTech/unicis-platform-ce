import type { NextPageWithLayout } from "types";
import { Button } from "react-daisyui";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { CreateTeam, Teams } from "@/components/interfaces/Team";
import { GetServerSidePropsContext } from "next";
import { CreateTask, CreateTask2, AtlaskitModalTest } from "@/components/interfaces/Task";
import DatePicker from "react-datepicker";
import AtlaskitButton from '@atlaskit/button';
import Select from '@atlaskit/select';
import { DateTimePicker } from '@atlaskit/datetime-picker'



const AllTasks: NextPageWithLayout = () => {
  const [visible, setVisible] = useState(false);

  const { t } = useTranslation("common");

  const [startDate, setStartDate] = useState<Date | null>(new Date())

  return (
    <>
      <div className="flex items-center justify-between">
        <h4>{t("all-tasks")}</h4>
        <Button
          size="sm"
          color="primary"
          className="text-white"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {t("create-task")}
        </Button>
      </div>
      <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
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
      <CreateTask visible={visible} setVisible={setVisible} />
      <AtlaskitButton>AtlaskitButton</AtlaskitButton>
      <>
        <label htmlFor="single-select-example">What city do you live in?</label>
        <Select
          inputId="single-select-example"
          className="single-select"
          classNamePrefix="react-select"
          options={[
            { label: 'Adelaide', value: 'adelaide' },
            { label: 'Brisbane', value: 'brisbane' },
            { label: 'Canberra', value: 'canberra' },
            { label: 'Darwin', value: 'darwin' },
            { label: 'Hobart', value: 'hobart' },
            { label: 'Melbourne', value: 'melbourne' },
            { label: 'Perth', value: 'perth' },
            { label: 'Sydney', value: 'sydney' },
          ]}
          placeholder="Choose a city"
        />
      </>
      <DateTimePicker />
      <AtlaskitModalTest/>
      {/* <CreateTask2 visible={visible} setVisible={setVisible}/> */}
      {/* <CreateTeam visible={visible} setVisible={setVisible} /> */}
      <Teams />
    </>
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
    },
  };
}

export default AllTasks;

import type { NextPageWithLayout } from "types";
import { Button } from "react-daisyui";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { CreateTeam, Teams } from "@/components/interfaces/Team";
import { GetServerSidePropsContext } from "next";
import { CreateTask, AtlaskitModalTest } from "@/components/interfaces/Task";
import DatePicker from "react-datepicker";
import AtlaskitButton from '@atlaskit/button';
import Select from '@atlaskit/select';
import { DateTimePicker } from '@atlaskit/datetime-picker'
import styled from 'styled-components'
import TableUncontrolled from "./test/example";

const WithoutRing = styled.div`
    input {
        --tw-ring-shadow: 0 0 #000 !important;
    }
`

const AllTasks: NextPageWithLayout = () => {
  const [visible, setVisible] = useState(false);

  const { t } = useTranslation("common");

  const [startDate, setStartDate] = useState<Date | null>(new Date())

  return (
    <>
    <TableUncontrolled/>
      {/* <div className="flex items-center justify-between">
        <TableUncontrolled/>
       </div> */}
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

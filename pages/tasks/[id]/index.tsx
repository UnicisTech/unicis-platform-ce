import type { NextPageWithLayout } from "types";
import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Loading, Error } from "@/components/ui";

import { GetServerSidePropsContext } from "next";

const TeamMembers: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { id } = router.query;

//   const [visible, setVisible] = useState(false);

//   const { isLoading, isError, team } = useTeam(slug as string);

//   if (isLoading || !team) {
//     return <Loading />;
//   }

//   if (isError) {
//     return <Error />;
//   }

  return (
    <>
        <p>id: {id}</p>
    </>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
    },
  };
}

export default TeamMembers;

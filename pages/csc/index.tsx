import type { NextPageWithLayout } from "types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Error, Loading } from "@/components/ui";
import { GetServerSidePropsContext } from "next";
import useTeams from "hooks/useTeams";
import styled from 'styled-components'
import { TeamSelector } from "@/components/interfaces/CSC";


const WithoutRing = styled.div`
    input {
        --tw-ring-shadow: 0 0 #000 !important;
    }
`

const CSC: NextPageWithLayout = () => {
  const { isLoading, isError, teams, mutateTeams } = useTeams();

  const router = useRouter();

  const { t } = useTranslation("common");

  useEffect(() => {
    if (teams?.length === 1) {
      const slug = teams[0].slug
      router.push(`/csc/${slug}`)
    }
  }, [teams])

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <div style={{margin: "0px auto", width: "50%"}}>
      <TeamSelector/>
    </div>
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
    },
  };
}

export default CSC;

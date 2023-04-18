import { useTranslation } from "next-i18next";
import { Error, Loading } from "@/components/ui";
import useTeams from "hooks/useTeams";
import Select, {
    ValueType,
    SingleValueProps
} from '@atlaskit/select';
import styled from 'styled-components'
import { useCallback } from "react";
import { useRouter } from "next/router";

const WithoutRing = styled.div`
    input {
        --tw-ring-shadow: 0 0 #000 !important;
    }
`

const TeamSelector = () => {
    const { t } = useTranslation("common");
    const { isLoading, isError, teams, mutateTeams } = useTeams();
    const router = useRouter();

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return <Error />;
    }

    const onSelectHandler = useCallback((option: any) => {
        const slug = option.value.slug
        router.push(`/csc/${slug}`)
    }, [])

    return (
        <>
            {teams &&
                <WithoutRing>
                    <Select
                        inputId="select-team"
                        placeholder="Select a team"
                        options={teams.map(({ id, name, slug }) => ({ label: name, value: { id, slug } }))}
                        onChange={onSelectHandler}
                    />
                </WithoutRing>
            }
        </>
    );
};

export default TeamSelector;

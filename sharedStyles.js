import styled from "styled-components";

export const WithoutRing = styled.div`
  input {
    --tw-ring-shadow: 0 0 #000 !important;
  }
`;

export const IssuePanelContainer = styled.div`
  background-color: white;
  padding: 20px 20px;
`;

export const TailwindTableWrapper = styled.div`
  & :where(th, td) {
    white-space: normal !important;
  }
`;

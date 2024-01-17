import styled from 'styled-components';

export const WithoutRing = styled.div.attrs(() => ({
  className: 'atlaskit-input',
}))`
  input {
    box-shadow: none !important;
  }
`;

export const IssuePanelContainer = styled.div`
  padding: 20px 20px;
`;

export const TailwindTableWrapper = styled.div`
  & :where(th, td) {
    white-space: normal !important;
  }
`;

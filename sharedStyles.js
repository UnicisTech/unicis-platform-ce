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

export const AtlaskitDarkThemeWrapper = styled.div`
  label span:not([title='required']) {
    color: var(--fallback-bc, oklch(var(--bc) / 1));
  }
`;

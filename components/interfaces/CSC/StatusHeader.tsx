import React, { useState } from 'react';
import Button from '@atlaskit/button';
import EditorPanelIcon from '@atlaskit/icon/glyph/editor/panel';
import Popup from '@atlaskit/popup';

const rowStyle = {
  color: 'white',
};

const tdStyle = {
  paddingLeft: '8px',
};

const Table = () => {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ ...tdStyle }}>Status</th>
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ ...tdStyle }}>Unknown</td>
          <td>Has not even been checked yet</td>
        </tr>
        <tr style={{ ...rowStyle, backgroundColor: 'rgba(178,178,178,255)' }}>
          <td style={{ ...tdStyle }}>Not Applicable</td>
          <td>Management can ignore them</td>
        </tr>
        <tr style={{ ...rowStyle, backgroundColor: 'rgba(255,0,0,255)' }}>
          <td style={{ ...tdStyle }}>Not Performed</td>
          <td>Complete lack of recognizable policy, procedure, control etc.</td>
        </tr>
        <tr style={{ ...rowStyle, backgroundColor: 'rgba(202,0,63,255)' }}>
          <td style={{ ...tdStyle }}>Performed Informally</td>
          <td>
            Development has barely started and will require significant work to
            fulfill the requirements
          </td>
        </tr>
        <tr style={{ ...rowStyle, backgroundColor: 'rgba(102,102,102,255)' }}>
          <td style={{ ...tdStyle }}>Planned</td>
          <td>Progressing nicely but not yet complete</td>
        </tr>
        <tr style={{ ...rowStyle, backgroundColor: 'rgba(255,190,0,255)' }}>
          <td style={{ ...tdStyle }}>Well Defined</td>
          <td>
            Development is more or less complete, although detail is lacking
            and/or it is not yet implemented, enforced and actively supported by
            top management
          </td>
        </tr>
        <tr style={{ ...rowStyle, backgroundColor: 'rgba(106,217,0,255)' }}>
          <td style={{ ...tdStyle }}>Quantitatively Controlled</td>
          <td>
            Development is complete, the process/control has been implemented
            and recently started operating
          </td>
        </tr>
        <tr style={{ ...rowStyle, backgroundColor: 'rgba(47,143,0,255)' }}>
          <td style={{ ...tdStyle }}>Continuously Improving</td>
          <td>
            The requirement is fully satisfied, is operating fully as expected,
            is being actively monitored and improved, and there is substantial
            evidence to prove all that to the auditors
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const PopupContent = () => {
  return (
    <div
      style={{
        background: 'white',
        maxWidth: '450px',
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        boxSizing: 'content-box',
        padding: '8px 12px',
      }}
    >
      <Table />
    </div>
  );
};

const StatusHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popup
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-start"
      content={() => <PopupContent />}
      trigger={(triggerProps) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Status</span>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            iconBefore={<EditorPanelIcon size="small" label="test" />}
            appearance="subtle-link"
            {...triggerProps}
          ></Button>
        </div>
      )}
    />
  );
};

export default StatusHeader;

//import json from "../../../data/MVPS-controls.json";
import json from '../MVPS-controls.json';

const controls = json['MVPS-Controls'];

const sections = [
  {
    label: 'Business controls',
    value: 'Business controls',
  },
  {
    label: 'Application design controls',
    value: 'Application design controls',
  },
  {
    label: 'Application implementation controls',
    value: 'Application implementation controls',
  },
  {
    label: 'Operational controls',
    value: 'Operational controls',
  },
];

const perPageOptions: { label: string; value: number }[] = [
  {
    label: '5',
    value: 5,
  },
  {
    label: '10',
    value: 10,
  },
  {
    label: '25',
    value: 25,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];

const controlOptions = controls.map(
  ({ Code, Control, Requirements, Section }) => ({
    label: Control,
    value: {
      code: Code,
      control: Control,
      requirements: Requirements,
      section: Section,
    },
  })
);

const statusOptions: { label: string; value: number }[] = [
  {
    label: 'Unknown',
    value: 0,
  },
  {
    label: 'Not Applicable',
    value: 0,
  },
  {
    label: 'Not Performed',
    value: 1,
  },
  {
    label: 'Performed Informally',
    value: 2,
  },
  {
    label: 'Planned',
    value: 3,
  },
  {
    label: 'Well Defined',
    value: 4,
  },
  {
    label: 'Quantitatively Controlled',
    value: 5,
  },
  {
    label: 'Continuously Improving',
    value: 6,
  },
];

const colourStyles = {
  control: (styles: any) => ({ ...styles }),
  option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
    if (data.label === 'Not Applicable') {
      return {
        ...styles,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(178,178,178,255)',
      };
    }
    if (data.label === 'Not Performed') {
      return {
        ...styles,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,0,0,255)',
      };
    }
    if (data.label === 'Performed Informally') {
      return {
        ...styles,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(202,0,63,255)',
      };
    }
    if (data.label === 'Planned') {
      return {
        ...styles,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(102,102,102,255)',
      };
    }
    if (data.label === 'Well Defined') {
      return {
        ...styles,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,190,0,255)',
      };
    }
    if (data.label === 'Quantitatively Controlled') {
      return {
        ...styles,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(106,217,0,255)',
      };
    }
    if (data.label === 'Continuously Improving') {
      return {
        ...styles,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(47,143,0,255)',
      };
    }
    return {
      ...styles,
    };
  },
};

export {
  colourStyles,
  controlOptions,
  statusOptions,
  json,
  sections,
  perPageOptions,
  controls,
};

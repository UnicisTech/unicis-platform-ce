import defaultJson from '../MVPS-controls.json';
import iso2013Json from '../ISO-CSC-controls-2013.json';
import iso2022Json from '../ISO-CSC-controls-2022.json';
import nistcsfv2 from '../CSF2_1.json';
import { Section } from 'types';

const controls = {
  '2013': iso2013Json,
  '2022': iso2022Json,
  default: defaultJson['MVPS-Controls'],
  nistcsfv2: nistcsfv2.map((item) => ({
    ...item,
    Control: `${item.Code}: ${item.Control}`,
    ControlLabel: item.Control,
  })),
};

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

const isoOptions = [
  { label: 'ISO/IEC 27001:2013', value: '2013' },
  { label: 'ISO/IEC 27001:2022', value: '2022' },
  { label: 'MVSP v1.0-20211007', value: 'default' },
  { label: 'NIST CSF v2', value: 'nistcsfv2' },
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

const trimToSecondDot = (inputString: string): string =>
  inputString.split('.').slice(0, 2).join('.');

const getSectionsLabels = (iso: string) => {
  switch (iso) {
    case '2022':
    case 'default':
    case 'nistcsfv2':
      return getSections(iso).map(({ label }) => label);
    // case 'nistcsfv2':
    //   return getFunctions().map(({ label }) => label)
    //For ISO 2013 we should merge the sections because of their big amount
    case '2013':
    default: {
      const labelSet = new Set<string>();
      controls[iso].forEach((item) => {
        labelSet.add(trimToSecondDot(item.Code));
      });

      const sections = Array.from(labelSet).map(
        (label) =>
          label +
          ' ' +
          controls[iso]
            .find(({ Code }) => Code.includes(label))
            ?.Section.split(' - ')[0]
      );

      return sections;
    }
  }
};

const getControlOptions = (iso: string) =>
  controls[iso].map(
    ({ Code, Control, Requirements, Section, ControlLabel }) => ({
      label: `${Code}: ${Section}, ${ControlLabel ? ControlLabel : Control}`,
      value: {
        code: Code,
        control: Control,
        requirements: Requirements,
        section: Section,
        controlLabel: ControlLabel,
      },
    })
  );

const mergePoints = (d) => {
  const merged = [
    d[0],
    (d[1] + d[2]) / 2,
    (d[3] + d[4] + d[5]) / 3,
    (d[6] + d[7] + d[8]) / 3,
    (d[9] + d[10] + d[11] + d[12]) / 4,
    d[13],
    (d[14] + d[15]) / 2,
    (d[16] + d[17] + d[18] + d[19] + d[20] + d[21] + d[22]) / 7,
    (d[23] + d[24]) / 2,
    (d[25] + d[26] + d[27]) / 3,
    (d[28] + d[29]) / 2,
    d[30],
    (d[31] + d[32]) / 2,
    (d[33] + d[34]) / 2,
  ];

  const rounded = merged.map((value) => Math.round(value));

  return rounded;
};

const getRadarChartLabels = (iso: string) => {
  const labels = getSectionsLabels(iso);
  return labels.map((label) => label.split(' '));
};

const getSections = (iso: string): Section[] => {
  const sectionSet = new Set<string>();

  if (controls[iso]) {
    controls[iso].forEach((item) => {
      sectionSet.add(item.Section);
    });
  }

  const sections: Section[] = Array.from(sectionSet).map((section) => ({
    label: section,
    value: section,
  }));

  return sections;
};

// // Functions that used in CSF2
// const getFunctions = (): { label: string; value: string }[] => {
//   const functionSet = new Set<string>();

//   nistcsfv2.forEach(item => {
//     functionSet.add(item.Function);
//   });

//   const functions = Array.from(functionSet).map(item => ({
//     label: item,
//     value: item,
//   }));

//   return functions;
// }

const getSectionFilterOptions = (iso: string) => {
  if (iso !== '2013') {
    return getSections(iso);
  }

  const labels = getSectionsLabels(iso);
  const options = labels.map((label) => ({
    label,
    value: removeBeforeFirstSpace(label),
  }));

  return options;
};

const removeBeforeFirstSpace = (string) => {
  const parts = string.split(' ');
  if (parts.length > 1) {
    return parts.slice(1).join(' ');
  }
  return string;
};

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

const taskStatusOptions: { label: string; value: number }[] = [
  {
    label: 'To Do',
    value: 0,
  },
  {
    label: 'In Progress',
    value: 1,
  },
  {
    label: 'In Review',
    value: 2,
  },
  {
    label: 'Feedback',
    value: 3,
  },
  {
    label: 'Done',
    value: 4,
  },
];

const colourStyles = {
  control: (styles: any) => ({ ...styles }),
  option: (styles: any, { data }: any) => {
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
  mergePoints,
  getRadarChartLabels,
  getControlOptions,
  getSections,
  getSectionFilterOptions,
  statusOptions,
  taskStatusOptions,
  sections,
  perPageOptions,
  controls,
  isoOptions,
};

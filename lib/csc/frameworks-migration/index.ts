import c5_2020 from './c5_2020'
import iso_2013 from './iso_2013'
import iso_2022 from './iso_2022'
import mvps from './mvps'
import nist_csf_v2 from './nist_csf_v2'
import eu_nis2 from './eu_nis2'
import gdpr from './gdpr'
import cis_v_81 from './cis_v_81'
import soc2V2 from './soc2-v2'

import { ISO } from 'types'

export interface CscFremaworkControl {
  id: string,
  section: string,
  code: string,
  control: string,
  label: string,
  requirements: string,
}

const frameworks = {
    '2013': iso_2013,
    '2022': iso_2022,
    'mvps': mvps,
    'nistcsfv2': nist_csf_v2,
    'eunis2': eu_nis2,
    'gdpr': gdpr,
    'cisv81': cis_v_81,
    'soc2v2': soc2V2,
    'c5_2020': c5_2020,
}

export default frameworks as Record<ISO, CscFremaworkControl[]>
import { passportFlow } from './passport'
import { civilRecordFlow } from './civil-record'
import { inheritanceFlow } from './inheritance'
import { companyFormationFlow } from './company-formation'
import { buildingPermitFlow } from './building-permit'
import { criminalRecordFlow } from './criminal-record'
import { birthCertificateFlow } from './birth-certificate'
import { documentCertificationFlow } from './document-certification'
import { propertySaleFlow } from './property-sale'
import { expatServicesFlow } from './expat-services'
import { powerOfAttorneyFlow } from './power-of-attorney'
import { marriageRegistrationFlow } from './marriage-registration'

export type { FlowDefinition, FlowStep, FlowOption, FlowCondition, FlowAnswers, FlowRequest } from './types'
export { buildFlowPrompt } from './types'

import type { FlowDefinition } from './types'

const FLOW_REGISTRY: FlowDefinition[] = [
  passportFlow,
  civilRecordFlow,
  inheritanceFlow,
  companyFormationFlow,
  buildingPermitFlow,
  criminalRecordFlow,
  birthCertificateFlow,
  documentCertificationFlow,
  propertySaleFlow,
  expatServicesFlow,
  powerOfAttorneyFlow,
  marriageRegistrationFlow,
]

export function getFlow(procedureSlug: string): FlowDefinition | undefined {
  return FLOW_REGISTRY.find(f => f.procedureSlug === procedureSlug)
}

export function getAllFlows(): FlowDefinition[] {
  return FLOW_REGISTRY
}

export default FLOW_REGISTRY

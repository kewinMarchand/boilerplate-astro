export interface AccessibilityAudit {
  auditDate: string | null
  complianceRate: number | null
  auditor: string | null
}

export type ComplianceStatus = 'non conforme' | 'partiellement conforme' | 'totalement conforme'

const PARTIAL_COMPLIANCE_THRESHOLD = 50
const FULL_COMPLIANCE_RATE = 100

export const hasAudit = ({ auditDate, complianceRate }: AccessibilityAudit) =>
  auditDate !== null && complianceRate !== null

export const computeComplianceStatus = ({
  auditDate,
  complianceRate,
}: AccessibilityAudit): ComplianceStatus => {
  if (auditDate === null || complianceRate === null) return 'non conforme'
  if (complianceRate >= FULL_COMPLIANCE_RATE) return 'totalement conforme'
  if (complianceRate >= PARTIAL_COMPLIANCE_THRESHOLD) return 'partiellement conforme'
  return 'non conforme'
}

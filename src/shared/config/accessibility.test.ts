import { computeComplianceStatus } from './accessibility'

const audit = (complianceRate: number | null, auditDate: string | null = '2026-09-01') => ({
  auditDate,
  complianceRate,
  auditor: auditDate ? 'Cabinet Exemple' : null,
})

describe('computeComplianceStatus', () => {
  it('déclare non conforme sans audit', () => {
    expect(computeComplianceStatus(audit(null, null))).toBe('non conforme')
    expect(computeComplianceStatus(audit(80, null))).toBe('non conforme')
  })

  it('déclare non conforme sous 50 %', () => {
    expect(computeComplianceStatus(audit(49.9))).toBe('non conforme')
  })

  it('déclare partiellement conforme de 50 % à moins de 100 %', () => {
    expect(computeComplianceStatus(audit(50))).toBe('partiellement conforme')
    expect(computeComplianceStatus(audit(99))).toBe('partiellement conforme')
  })

  it('déclare totalement conforme à 100 %', () => {
    expect(computeComplianceStatus(audit(100))).toBe('totalement conforme')
  })
})

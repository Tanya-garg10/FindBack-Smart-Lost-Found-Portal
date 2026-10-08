/**
 * Phase 0 & Phase 5 Security Rules Verification Suite
 * Verifies the "Dirty Dozen" adversarial payloads are rejected by our Firestore Security Rules.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_SECURITY_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Self-Assigned Admin Privilege Escalation',
    collection: 'users/student_1',
    operation: 'create',
    payload: { uid: 'student_1', name: 'Evil Student', email: 'student@college.edu', role: 'admin', createdAt: '2026-10-07T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'PII Blanket Read Attack on Another User',
    collection: 'users/victim_user',
    operation: 'get',
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Item Create',
    collection: 'items/item_99',
    operation: 'create',
    payload: { reportCode: 'FB-999', title: 'Earbuds', isVerifiedOverride: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Identity Spoofing on Item Create',
    collection: 'items/item_99',
    operation: 'create',
    payload: { userId: 'someone_else_uid' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Denial-of-Wallet Oversized String',
    collection: 'items/item_99',
    operation: 'create',
    payload: { description: 'A'.repeat(5000) },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID Poisoning Attack',
    collection: 'items/invalid$id!@#',
    operation: 'create',
    payload: { title: 'Test' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Unauthorized Claim Self-Approval on Create',
    collection: 'claims/claim_1',
    operation: 'create',
    payload: { status: 'Approved' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Claim Status Shortcutting on Update',
    collection: 'claims/claim_1',
    operation: 'update',
    payload: { status: 'Approved' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Immutable Field Mutation on Item Update',
    collection: 'items/item_1',
    operation: 'update',
    payload: { userId: 'hijacked_owner_uid' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Unverified Email Admin Spoof Attack',
    collection: 'items/item_1',
    operation: 'delete',
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Cross-User Notification Snooping',
    collection: 'notifications/notif_other',
    operation: 'get',
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Match Score Out-of-Bounds Poisoning',
    collection: 'matches/match_1',
    operation: 'create',
    payload: { matchScore: 999999 },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];

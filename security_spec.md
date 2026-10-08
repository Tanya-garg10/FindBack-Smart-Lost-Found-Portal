# FindBack – Application Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **User Profile Isolation (PII Protection)**: A document in `/users/{userId}` contains PII (`email`) and RBAC (`role`). Only the owner (`request.auth.uid == userId`) or a verified Admin can read a user document. During creation, users cannot self-assign `role: "admin"` unless their verified email matches the bootstrapped administrator (`taniyagarg1007@gmail.com`).
2. **Public Campus Reports (`/items/{itemId}`)**: Guests and signed-in users can read item reports (`isPublic == true`) so lost belongings can be identified. Creating an item requires a verified user (`userId == request.auth.uid`) and strict schema adherence (`title`, `description`, `category`, `type`, `location`, `status`).
3. **Smart Match Integrity (`/matches/{matchId}`)**: Match scores must be between `0` and `100`, and both `lostItemId` and `foundItemId` must be valid IDs.
4. **Claim Ownership Verification (`/claims/{claimId}`)**: Claims can only be created by the authenticated claimant (`claimantId == request.auth.uid`) with status `"Verification Pending"`. Only Admins can approve or reject claims (`status` transition to `"Approved"` or `"Rejected"`).
5. **Notification Privacy (`/notifications/{notificationId}`)**: Notifications can only be read (`get`/`list`) by the recipient (`resource.data.userId == request.auth.uid`) or an Admin.

## 2. The "Dirty Dozen" Payloads
1. **Self-Assigned Admin Privilege Escalation**: Authenticated student attempts `create` on `/users/user_1` with `{ role: "admin" }`.
2. **PII Blanket Read Attack**: Authenticated student `user_2` attempts `get` on `/users/user_1` to harvest email address.
3. **Shadow Field Injection on Item Create**: User attempts `create` on `/items/item_99` including unauthorized field `{ isVerifiedAdminOverride: true }`.
4. **Identity Spoofing on Item Create**: User `user_1` attempts `create` on `/items/item_99` with `{ userId: "victim_uid" }`.
5. **Denial-of-Wallet Oversized String**: Attacker attempts `create` on `/items/item_99` with a `description` of 50,000 characters (`> 2000` limit).
6. **ID Poisoning Attack**: Attacker attempts `create` on `/items/invalid$id!@#` violating `^[a-zA-Z0-9_\-]+$`.
7. **Unauthorized Claim Self-Approval**: Student `user_1` attempts `create` on `/claims/claim_1` with `{ status: "Approved" }`.
8. **Claim Status Shortcutting**: Student `user_1` attempts `update` on `/claims/claim_1` changing `status` from `"Verification Pending"` to `"Approved"`.
9. **Immutable Field Mutation**: Owner `user_1` attempts `update` on `/items/item_1` mutating `userId` or `createdAt`.
10. **Unverified Email Spoof Attack**: User with `email == "taniyagarg1007@gmail.com"` but `email_verified == false` attempts admin delete on `/items/item_1`.
11. **Cross-User Notification Snooping**: User `user_2` attempts `list` on `/notifications` without restricting `resource.data.userId == request.auth.uid`.
12. **Match Score Out-of-Bounds Poisoning**: User attempts `create` on `/matches/match_1` with `{ matchScore: 999999 }`.

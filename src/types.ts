export type UserRole = 'student' | 'admin' | 'guest';

export type ItemCategory =
  | 'Electronics'
  | 'ID Cards'
  | 'Bags'
  | 'Stationery'
  | 'Clothing'
  | 'Accessories'
  | 'Other';

export type ItemType = 'lost' | 'found';

export type ItemStatus =
  | 'Reported'
  | 'Possible Match'
  | 'Verification Pending'
  | 'Verified'
  | 'Returned'
  | 'Flagged';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  department?: string;
  createdAt: string;
}

export interface CampusItem {
  id: string;
  reportCode: string;
  title: string;
  description: string;
  additionalDetails?: string;
  category: ItemCategory;
  type: ItemType;
  date: string;
  location: string;
  image: string;
  status: ItemStatus;
  userId: string;
  reporterName: string;
  createdAt: string;
  updatedAt?: string;
  isPublic?: boolean;
}

export interface ItemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  lostItemTitle: string;
  foundItemTitle: string;
  matchScore: number;
  categoryMatch: boolean;
  descriptionSimilarity: boolean;
  locationMatch: boolean;
  dateMatch: boolean;
  reasonsSummary: string;
  status: 'Active' | 'Claimed' | 'Verified' | 'Dismissed';
  createdBy: string;
  createdAt: string;
  isPublic?: boolean;
}

export interface OwnershipClaim {
  id: string;
  itemId: string;
  matchedLostItemId?: string;
  itemTitle: string;
  claimantId: string;
  claimantName: string;
  uniqueFeature: string;
  attachedContents: string;
  exactLastSeen: string;
  proofImage?: string;
  status: 'Verification Pending' | 'Approved' | 'Rejected';
  adminNotes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type: 'match' | 'claim' | 'verified' | 'returned' | 'system';
  relatedItemId?: string;
  read: boolean;
  createdAt: string;
}

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { CheckCircle2, MapPin, Search, X } from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from './firebase';
import {
  INITIAL_DEMO_CLAIMS,
  INITIAL_DEMO_ITEMS,
  INITIAL_DEMO_MATCHES,
  INITIAL_DEMO_NOTIFICATIONS,
} from './demoData';
import { buildMatchPairsForItems } from './matchingEngine';
import {
  AppNotification,
  CampusItem,
  ItemMatch,
  ItemType,
  OwnershipClaim,
  UserProfile,
  UserRole,
} from './types';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ReportFormView } from './components/ReportFormView';
import { SearchFilterView } from './components/SearchFilterView';
import { ItemDetailView } from './components/ItemDetailView';
import { MyReportsView } from './components/MyReportsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { MatchComparisonModal } from './components/MatchComparisonModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [reportInitialType, setReportInitialType] = useState<ItemType>('lost');
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [items, setItems] = useState<CampusItem[]>(INITIAL_DEMO_ITEMS);
  const [matches, setMatches] = useState<ItemMatch[]>(INITIAL_DEMO_MATCHES);
  const [claims, setClaims] = useState<OwnershipClaim[]>(INITIAL_DEMO_CLAIMS);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    INITIAL_DEMO_NOTIFICATIONS
  );

  const [selectedItem, setSelectedItem] = useState<CampusItem | null>(null);
  const [activeMatchModal, setActiveMatchModal] = useState<ItemMatch | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  useEffect(() => {
    testFirestoreConnection();

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdminEmail = firebaseUser.email === 'taniyagarg1007@gmail.com';
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Tanya Garg',
          email: firebaseUser.email || 'taniyagarg1007@gmail.com',
          role: isAdminEmail ? 'admin' : 'student',
          department: 'Computer Science & Engineering',
          createdAt: new Date().toISOString(),
        };
        setUserProfile(profile);

        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
        } catch {
          // ignore
        }

        try {
          const snap = await getDocs(collection(db, 'items'));
          if (snap.empty) {
            for (const demoItem of INITIAL_DEMO_ITEMS) {
              const { id, ...rest } = demoItem;
              await setDoc(doc(db, 'items', id), {
                ...rest,
                userId: firebaseUser.uid,
              });
            }
            for (const demoMatch of INITIAL_DEMO_MATCHES) {
              const { id, ...rest } = demoMatch;
              await setDoc(doc(db, 'matches', id), {
                ...rest,
                createdBy: firebaseUser.uid,
              });
            }
          }
        } catch {
          // ignore
        }
      } else {
        setUserProfile(null);
      }
    });

    const unsubItems = onSnapshot(
      collection(db, 'items'),
      (snap) => {
        if (!snap.empty) {
          const loaded: CampusItem[] = snap.docs
            .filter((d) => d.id !== 'item_found_earbuds_02')
            .map((d) => ({ id: d.id, ...(d.data() as Omit<CampusItem, 'id'>) }));
          setItems(loaded);
        }
      },
      () => {}
    );

    const unsubMatches = onSnapshot(
      collection(db, 'matches'),
      (snap) => {
        if (!snap.empty) {
          const loaded: ItemMatch[] = snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as Omit<ItemMatch, 'id'>) })
          );
          setMatches(loaded.sort((a, b) => b.matchScore - a.matchScore));
        }
      },
      () => {}
    );

    return () => {
      unsubAuth();
      unsubItems();
      unsubMatches();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully.');
    } catch {
      const demoUser: UserProfile = {
        uid: 'student_tanya_01',
        name: 'Tanya Garg',
        email: 'taniyagarg1007@gmail.com',
        role: currentRole === 'admin' ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
      };
      setUserProfile(demoUser);
      showToast('Signed in as Tanya Garg.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUserProfile(null);
    setCurrentRole('guest');
    showToast('Signed out.');
  };

  const pushNotification = (
    message: string,
    type: AppNotification['type'],
    relatedItemId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: userProfile?.uid || 'student_tanya_01',
      message,
      type,
      relatedItemId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (auth.currentUser) {
      const { id, ...payload } = newNotif;
      setDoc(doc(db, 'notifications', id), {
        ...payload,
        userId: auth.currentUser.uid,
      }).catch(() => {});
    }
  };

  const handleSubmitReport = async (
    formData: Omit<
      CampusItem,
      'id' | 'reportCode' | 'status' | 'userId' | 'reporterName' | 'createdAt'
    >
  ) => {
    const newId = `item_${Date.now()}`;
    const reportCode = `FB-2026-${Math.floor(200 + Math.random() * 799)}`;
    const uid = auth.currentUser?.uid || userProfile?.uid || 'student_tanya_01';
    const reporterName = userProfile?.name || 'Tanya Garg';

    const createdItem: CampusItem = {
      ...formData,
      id: newId,
      reportCode,
      status: 'Reported',
      userId: uid,
      reporterName,
      createdAt: new Date().toISOString(),
      isPublic: true,
    };

    const nextItems = [createdItem, ...items];
    const computedPairs = buildMatchPairsForItems(nextItems, uid);

    const relevantMatch = computedPairs.find(
      (m) => m.lostItemId === newId || m.foundItemId === newId
    );

    if (relevantMatch) {
      createdItem.status = 'Possible Match';
    }

    setItems([createdItem, ...items]);

    if (relevantMatch) {
      const newMatchObj: ItemMatch = {
        ...relevantMatch,
        id: `match_${Date.now()}`,
      };
      setMatches((prev) => [newMatchObj, ...prev]);
      pushNotification(
        `Possible match found — Your ${createdItem.title} may have been found.`,
        'match',
        createdItem.id
      );
    }

    if (auth.currentUser) {
      try {
        const { id, ...firestorePayload } = createdItem;
        await setDoc(doc(db, 'items', id), firestorePayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `items/${newId}`);
      }
    }

    showToast(
      createdItem.type === 'lost'
        ? `Lost report ${reportCode} submitted.`
        : 'Found item successfully reported.'
    );

    return {
      reportCode,
      matchedScore: relevantMatch?.matchScore,
      createdItem,
    };
  };

  const handleSubmitClaim = async (claimInput: {
    itemId: string;
    matchedLostItemId?: string;
    itemTitle: string;
    uniqueFeature: string;
    attachedContents: string;
    exactLastSeen: string;
    proofImage?: string;
  }) => {
    const claimId = `claim_${Date.now()}`;
    const uid = auth.currentUser?.uid || userProfile?.uid || 'student_tanya_01';
    const claimantName = userProfile?.name || 'Tanya Garg';

    const newClaim: OwnershipClaim = {
      id: claimId,
      itemId: claimInput.itemId,
      matchedLostItemId: claimInput.matchedLostItemId,
      itemTitle: claimInput.itemTitle,
      claimantId: uid,
      claimantName,
      uniqueFeature: claimInput.uniqueFeature,
      attachedContents: claimInput.attachedContents,
      exactLastSeen: claimInput.exactLastSeen,
      proofImage: claimInput.proofImage,
      status: 'Verification Pending',
      createdAt: new Date().toISOString(),
    };

    setClaims((prev) => [newClaim, ...prev]);

    setItems((prev) =>
      prev.map((it) =>
        it.id === claimInput.itemId || it.id === claimInput.matchedLostItemId
          ? { ...it, status: 'Verified' }
          : it
      )
    );

    if (selectedItem && selectedItem.id === claimInput.itemId) {
      setSelectedItem({ ...selectedItem, status: 'Verified' });
    }

    pushNotification(
      'Claim submitted — Your verification answers are under review.',
      'claim',
      claimInput.itemId
    );
    showToast('Verification submitted.');

    if (auth.currentUser) {
      try {
        const { id, ...payload } = newClaim;
        if (!payload.proofImage) delete payload.proofImage;
        if (!payload.matchedLostItemId) delete payload.matchedLostItemId;
        await setDoc(doc(db, 'claims', id), payload);
      } catch {
        // ignore
      }
    }
  };

  const handleAdminApproveClaim = async (claim: OwnershipClaim) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claim.id ? { ...c, status: 'Approved' } : c))
    );

    setItems((prev) =>
      prev.map((it) => {
        if (
          it.id === claim.itemId ||
          it.id === claim.matchedLostItemId ||
          (it.title.toLowerCase().includes('earbuds') &&
            claim.itemTitle.toLowerCase().includes('earbuds'))
        ) {
          return { ...it, status: 'Returned' };
        }
        return it;
      })
    );

    if (
      selectedItem &&
      (selectedItem.id === claim.itemId || selectedItem.id === claim.matchedLostItemId)
    ) {
      setSelectedItem({ ...selectedItem, status: 'Returned' });
    }

    pushNotification(
      'Claim verified — Your ownership verification was approved.',
      'verified',
      claim.itemId
    );
    pushNotification(
      `Item returned — Your ${claim.itemTitle} has been marked as returned.`,
      'returned',
      claim.itemId
    );
    showToast('Ownership verified and item marked as Returned.');

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'items', claim.itemId), {
          status: 'Returned',
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }
  };

  const handleAdminVerifyItem = async (item: CampusItem) => {
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'Verified' } : it))
    );
    pushNotification(
      'Claim verified — Your ownership verification was approved.',
      'verified',
      item.id
    );
    showToast('Item marked as Verified.');
  };

  const handleAdminMarkItemReturned = async (item: CampusItem) => {
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'Returned' } : it))
    );
    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...selectedItem, status: 'Returned' });
    }
    pushNotification(
      `Item returned — Your ${item.title} has been marked as returned.`,
      'returned',
      item.id
    );
    showToast('Item marked as Returned.');

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'items', item.id), {
          status: 'Returned',
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }
  };

  const handleAdminRemoveDuplicate = async (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    showToast('Report removed.');
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'items', itemId));
      } catch {
        // ignore
      }
    }
  };

  const handleSelectItem = (item: CampusItem) => {
    setSelectedItem(item);
    setActiveTab('item-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReportWithType = (type: ItemType) => {
    setReportInitialType(type);
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const modalLostItem = activeMatchModal
    ? items.find((i) => i.id === activeMatchModal.lostItemId)
    : undefined;
  const modalFoundItem = activeMatchModal
    ? items.find((i) => i.id === activeMatchModal.foundItemId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        userProfile={userProfile}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onSelectNotificationItem={(itemId) => {
          const found = items.find((i) => i.id === itemId);
          if (found) handleSelectItem(found);
        }}
        onOpenReportWithType={handleOpenReportWithType}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <DashboardView
            items={items}
            matches={matches}
            onReportLost={() => handleOpenReportWithType('lost')}
            onReportFound={() => handleOpenReportWithType('found')}
            onSelectItem={handleSelectItem}
            onOpenMatchModal={(m) => setActiveMatchModal(m)}
            onCreateAlert={(queryText) =>
              showToast(`Alert created for "${queryText || 'matching campus items'}".`)
            }
          />
        )}

        {activeTab === 'explore' && (
          <SearchFilterView
            items={items}
            matches={matches}
            initialQuery=""
            initialCategory="All"
            onSelectItem={handleSelectItem}
            onOpenMatchModal={(m) => setActiveMatchModal(m)}
          />
        )}

        {activeTab === 'report' && (
          <ReportFormView
            initialType={reportInitialType}
            onSubmitReport={handleSubmitReport}
            onViewCreatedItem={handleSelectItem}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'item-detail' && selectedItem && (
          <ItemDetailView
            item={items.find((i) => i.id === selectedItem.id) || selectedItem}
            matches={matches}
            claims={claims}
            currentRole={currentRole}
            onBack={() => setActiveTab('home')}
            onSubmitClaim={handleSubmitClaim}
            onAdminApproveClaim={handleAdminApproveClaim}
            onAdminMarkReturned={handleAdminMarkItemReturned}
            onContactAdmin={(item) =>
              showToast(`Message sent to Campus Admin regarding ${item.title}.`)
            }
          />
        )}

        {activeTab === 'my-reports' && (
          <MyReportsView
            items={items}
            claims={claims}
            userName={userProfile?.name || 'Tanya'}
            onSelectItem={handleSelectItem}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            items={items}
            matches={matches}
            claims={claims}
            onApproveClaim={handleAdminApproveClaim}
            onMarkItemReturned={handleAdminMarkItemReturned}
            onVerifyItem={handleAdminVerifyItem}
            onRemoveDuplicateItem={handleAdminRemoveDuplicate}
            onSelectItem={handleSelectItem}
          />
        )}
      </main>

      {activeMatchModal && (
        <MatchComparisonModal
          match={activeMatchModal}
          lostItem={modalLostItem}
          foundItem={modalFoundItem}
          onClose={() => setActiveMatchModal(null)}
          onProceedToClaim={(targetItem) => {
            setActiveMatchModal(null);
            handleSelectItem(targetItem);
          }}
        />
      )}

      <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="relative w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white">
              <MapPin className="w-3.5 h-3.5" />
              <Search className="w-2 h-2 absolute bottom-1 right-1 text-blue-100" />
            </span>
            <strong className="text-slate-900 font-display">FindBack</strong>
            <span>·</span>
            <span>“Lost something? Find it back.”</span>
          </div>
          <span>Campus Lost &amp; Found Platform</span>
        </div>
      </footer>
    </div>
  );
}

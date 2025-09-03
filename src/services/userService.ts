import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export interface UserDetails {
  aisId: string;
  boatId: string;
  fishermanName: string;
  contactInfo: string;
  email?: string;
  createdAt: any;
  lastUpdated: any;
  status: 'active' | 'inactive';
  location?: {
    lat: number;
    lng: number;
    timestamp: number;
  };
}

export interface VesselData {
  aisId: string;
  boatId: string;
  location: {
    lat: number;
    lng: number;
    timestamp: number;
  };
  status: 'safe' | 'warning' | 'danger';
  speed: number;
  heading: number;
  lastUpdate: number;
  fishermanName?: string;
  contactInfo?: string;
}

class UserService {
  private readonly usersCollection = 'users';
  private readonly vesselsCollection = 'vessels';

  // Store user details in Firebase
  async storeUserDetails(userDetails: Omit<UserDetails, 'createdAt' | 'lastUpdated' | 'status'>): Promise<void> {
    try {
      const userRef = doc(db, this.usersCollection, userDetails.aisId);
      const userData: UserDetails = {
        ...userDetails,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        status: 'active'
      };

      await setDoc(userRef, userData);
      console.log('✅ User details stored successfully:', userDetails.aisId);
    } catch (error) {
      console.error('❌ Error storing user details:', error);
      throw error;
    }
  }

  // Get user details by AIS ID
  async getUserDetails(aisId: string): Promise<UserDetails | null> {
    try {
      const userRef = doc(db, this.usersCollection, aisId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as UserDetails;
      } else {
        console.log('ℹ️ No user found with AIS ID:', aisId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user details:', error);
      throw error;
    }
  }

  // Get all registered users
  async getAllUsers(): Promise<UserDetails[]> {
    try {
      const usersQuery = query(
        collection(db, this.usersCollection),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(usersQuery);
      
      const users: UserDetails[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserDetails);
      });

      console.log('✅ Retrieved all users:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Error getting all users:', error);
      throw error;
    }
  }

  // Store vessel data in Firebase
  async storeVesselData(vesselData: VesselData): Promise<void> {
    try {
      const vesselRef = doc(db, this.vesselsCollection, vesselData.aisId);
      await setDoc(vesselRef, {
        ...vesselData,
        lastUpdated: serverTimestamp()
      });
      console.log('✅ Vessel data stored successfully:', vesselData.aisId);
    } catch (error) {
      console.error('❌ Error storing vessel data:', error);
      throw error;
    }
  }

  // Get all vessels data
  async getAllVessels(): Promise<VesselData[]> {
    try {
      const vesselsQuery = query(collection(db, this.vesselsCollection));
      const querySnapshot = await getDocs(vesselsQuery);
      
      const vessels: VesselData[] = [];
      querySnapshot.forEach((doc) => {
        vessels.push(doc.data() as VesselData);
      });

      console.log('✅ Retrieved all vessels:', vessels.length);
      return vessels;
    } catch (error) {
      console.error('❌ Error getting all vessels:', error);
      throw error;
    }
  }

  // Update user location
  async updateUserLocation(aisId: string, location: { lat: number; lng: number; timestamp: number }): Promise<void> {
    try {
      const userRef = doc(db, this.usersCollection, aisId);
      await updateDoc(userRef, {
        location,
        lastUpdated: serverTimestamp()
      });
      console.log('✅ User location updated:', aisId);
    } catch (error) {
      console.error('❌ Error updating user location:', error);
      throw error;
    }
  }

  // Update vessel status
  async updateVesselStatus(aisId: string, status: 'safe' | 'warning' | 'danger'): Promise<void> {
    try {
      const vesselRef = doc(db, this.vesselsCollection, aisId);
      await updateDoc(vesselRef, {
        status,
        lastUpdate: serverTimestamp()
      });
      console.log('✅ Vessel status updated:', aisId, status);
    } catch (error) {
      console.error('❌ Error updating vessel status:', error);
      throw error;
    }
  }

  // Check if user exists
  async userExists(aisId: string): Promise<boolean> {
    try {
      const userRef = doc(db, this.usersCollection, aisId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error('❌ Error checking if user exists:', error);
      return false;
    }
  }
}

export const userService = new UserService();

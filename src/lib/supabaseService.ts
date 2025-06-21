import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Profile Types
export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

// Customer Request Types
export type CustomerRequest = Tables<"customer_requests">;
export type CustomerRequestInsert = TablesInsert<"customer_requests">;
export type CustomerRequestUpdate = TablesUpdate<"customer_requests">;

// Bank Details Types
export type BankDetails = Tables<"bank_details">;
export type BankDetailsInsert = TablesInsert<"bank_details">;
export type BankDetailsUpdate = TablesUpdate<"bank_details">;

// Availability Status
export interface AvailabilityStatus {
  isAvailable: boolean;
  lastUpdated: string;
  userId: string;
}

// Earnings Data
export interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  completedJobs: number;
  pendingPayments: number;
}

// Profile Service
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    return data;
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }
    
    return data;
  },

  async createProfile(profile: ProfileInsert): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }
    
    return data;
  }
};

// Job Service
export const jobService = {
  async getJobs(photographerId: string): Promise<CustomerRequest[]> {
    const { data, error } = await supabase
      .from("customer_requests")
      .select(`
        *,
        profiles!customer_id (
          full_name,
          profile_photo_url
        )
      `)
      .eq("photographer_id", photographerId)
      .neq("status", "pending") // Fetch accepted, in_progress, etc.
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
    return data || [];
  },

  async acceptJob(requestId: string): Promise<boolean> {
    const { error } = await supabase
      .from("customer_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      console.error("Error accepting job:", error);
      return false;
    }
    return true;
  },
};

// Customer Requests Service
export const customerRequestService = {
  async getRequestsForPhotographer(photographerId: string): Promise<CustomerRequest[]> {
    const { data, error } = await supabase
      .from("customer_requests")
      .select(`
        *,
        profiles!customer_id (
          full_name,
          profile_photo_url,
          email
        )
      `)
      .eq("photographer_id", photographerId)
      .eq("status", "pending") // Only show pending requests
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching customer requests:", error);
      return [];
    }
    
    return data || [];
  }
};

// Availability Service (using localStorage for now, can be extended to use a table)
export const availabilityService = {
  async getAvailability(userId: string): Promise<AvailabilityStatus> {
    // For now, we'll use localStorage. In a real app, you'd have an availability table
    const stored = localStorage.getItem(`availability_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      isAvailable: true,
      lastUpdated: new Date().toISOString(),
      userId
    };
  },

  async updateAvailability(userId: string, isAvailable: boolean): Promise<boolean> {
    const availability: AvailabilityStatus = {
      isAvailable,
      lastUpdated: new Date().toISOString(),
      userId
    };
    
    localStorage.setItem(`availability_${userId}`, JSON.stringify(availability));
    return true;
  }
};

// Earnings Service (mock data for now, can be connected to real transactions)
export const earningsService = {
  async getEarnings(userId: string): Promise<EarningsData> {
    // Mock earnings data - in a real app, this would query a transactions table
    const mockEarnings: EarningsData = {
      totalEarnings: 0.00,
      thisMonth: 0.00,
      lastMonth: 0.00,
      completedJobs: 0,
      pendingPayments: 0.00
    };
    
    return mockEarnings;
  }
};

// Storage Service for Portfolio Images
export const storageService = {
  async uploadPortfolioImage(userId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: false });
    
    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }
    
    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },

  async deletePortfolioImage(userId: string, fileName: string): Promise<boolean> {
    const filePath = `${userId}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([filePath]);
    
    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }
    
    return true;
  },

  async getPortfolioImages(userId: string): Promise<{ name: string; publicUrl: string }[]> {
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .list(`${userId}/`, {
        limit: 20,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error("Error fetching portfolio images:", error);
      return [];
    }
    
    return (data || [])
      .filter((item) => item.name.match(/\.(jpg|jpeg|png|webp)$/i))
      .map((item) => ({
        name: item.name,
        publicUrl: supabase.storage
          .from('profile-photos')
          .getPublicUrl(`${userId}/${item.name}`).data.publicUrl,
      }));
  },

  async uploadProfilePhoto(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() || "jpg";
    const filePath = `${userId}/profile.${ext}`;

    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Photo upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
    return data.publicUrl || null;
  },

  async uploadKycDocument(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() || "pdf";
    const filePath = `${userId}/kyc.${ext}`;

    // Note: It's good practice to have a separate bucket for sensitive documents.
    const { error } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("KYC doc upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from('kyc-documents').getPublicUrl(filePath);
    return data.publicUrl || null;
  }
};

// Auth Service
export const authService = {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    return user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return false;
    }
    return true;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}; 
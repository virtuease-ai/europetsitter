export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'owner' | 'sitter';
          avatar: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
          trial_end_date: string | null;
          subscription_status: 'trial' | 'active' | 'expired' | 'cancelled' | null;
          subscription_end_date: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: 'owner' | 'sitter';
          avatar?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          trial_end_date?: string | null;
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled' | null;
          subscription_end_date?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'owner' | 'sitter';
          avatar?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          trial_end_date?: string | null;
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled' | null;
          subscription_end_date?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
      };
      // Ajoutez les autres tables ici si nécessaire
    };
  };
};

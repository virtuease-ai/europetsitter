import { createClient } from '@/lib/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'sitter';
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp(data: SignUpData) {
  const supabase = createClient();

  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
        },
      },
    });

    if (error) throw error;

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      needsEmailConfirmation: !authData.session,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'inscription',
    };
  }
}

export async function signIn(data: SignInData) {
  const supabase = createClient();

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    // Récupérer le rôle pour la redirection
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    return {
      success: true,
      user: authData.user,
      role: userData?.role as 'owner' | 'sitter',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Email ou mot de passe incorrect',
    };
  }
}

export async function signOut() {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

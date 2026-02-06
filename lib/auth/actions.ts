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
  console.log('[signIn] 🔐 Tentative de connexion pour', data.email)
  const supabase = createClient();

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error('[signIn] ❌ signInWithPassword error:', error.message)
      throw error;
    }

    console.log('[signIn] ✅ Auth OK pour', authData.user.email, 'id=', authData.user.id.substring(0, 8))
    console.log('[signIn] 🍪 Session:', authData.session ? `access_token=${authData.session.access_token.substring(0, 20)}...` : 'PAS DE SESSION')

    // Vérifier les cookies après login
    console.log('[signIn] 🍪 document.cookie après login:', document.cookie.substring(0, 200))

    // Récupérer le rôle pour la redirection
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    console.log('[signIn] 👤 Rôle trouvé:', userData?.role, roleError ? `ERROR: ${roleError.message}` : '')

    return {
      success: true,
      user: authData.user,
      role: userData?.role as 'owner' | 'sitter',
    };
  } catch (error: any) {
    console.error('[signIn] ❌ Exception:', error.message)
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

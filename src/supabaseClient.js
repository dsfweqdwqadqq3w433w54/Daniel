import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key exists:', !!supabaseAnonKey);

    // Test basic connection
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Connection test failed:', error);
      return { success: false, error: error.message };
    }

    console.log('Connection test successful!');
    return { success: true, data };
  } catch (error) {
    console.error('Connection test error:', error);
    return { success: false, error: error.message };
  }
};

// Contact form submission function
export const submitContactForm = async (formData) => {
  try {
    // Test connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      throw new Error(`Connection failed: ${connectionTest.error}`);
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          submitted_at: new Date().toISOString(),
          status: 'new'
        }
      ])
      .select()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Function to get all contact submissions (for admin use)
export const getContactSubmissions = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    return { success: false, error: error.message }
  }
}

// Function to mark a submission as read
export const markSubmissionAsRead = async (id) => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error marking submission as read:', error)
    return { success: false, error: error.message }
  }
}

// Function to mark a submission as unread
export const markSubmissionAsUnread = async (id) => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ status: 'new', read_at: null })
      .eq('id', id)
      .select()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error marking submission as unread:', error)
    return { success: false, error: error.message }
  }
}

// Function to delete a submission
export const deleteSubmission = async (id) => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error deleting submission:', error)
    return { success: false, error: error.message }
  }
}

// Function to get contact statistics
export const getContactStats = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('status, submitted_at')

    if (error) {
      throw error
    }

    const stats = {
      total: data.length,
      new: data.filter(item => item.status === 'new').length,
      read: data.filter(item => item.status === 'read').length,
      today: data.filter(item => {
        const today = new Date().toDateString()
        const submittedDate = new Date(item.submitted_at).toDateString()
        return today === submittedDate
      }).length
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching contact stats:', error)
    return { success: false, error: error.message }
  }
}

// Supabase Authentication Functions

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error signing in:', error)
    return { success: false, error: error.message }
  }
}

// Sign up with email and password
export const signUpWithEmail = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: metadata
      }
    })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error signing up:', error)
    return { success: false, error: error.message }
  }
}

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error signing out:', error)
    return { success: false, error: error.message }
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    return { success: true, user }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { success: false, error: error.message }
  }
}

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    return { success: true, session }
  } catch (error) {
    console.error('Error getting current session:', error)
    return { success: false, error: error.message }
  }
}

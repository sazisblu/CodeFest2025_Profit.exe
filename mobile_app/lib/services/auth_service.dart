import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';

class AuthService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Get current user
  User? get currentUser => _supabase.auth.currentUser;

  // Stream of auth state changes
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;

  // Sign up with Email and Password
  Future<UserModel?> signUpWithEmail({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      final AuthResponse response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {'display_name': displayName},
      );

      if (response.user != null) {
        return await _createOrUpdateUser(response.user!);
      }

      return null;
    } catch (e) {
      print('Error signing up: $e');
      rethrow;
    }
  }

  // Sign in with Email and Password
  Future<UserModel?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final AuthResponse response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user != null) {
        return await _createOrUpdateUser(response.user!);
      }

      return null;
    } catch (e) {
      print('Error signing in: $e');
      rethrow;
    }
  }

  // Sign in with Google using Supabase OAuth
  Future<UserModel?> signInWithGoogle() async {
    try {
      // Use Supabase OAuth (works on both web and mobile)
      final response = await _supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'io.supabase.hamrochautari://login-callback',
      );

      if (!response) {
        throw Exception('Failed to initiate Google sign in');
      }

      // Wait for auth state to update
      await Future.delayed(const Duration(seconds: 2));

      final user = _supabase.auth.currentUser;
      if (user != null) {
        return await _createOrUpdateUser(user);
      }

      return null;
    } catch (e) {
      print('Error signing in with Google: $e');
      rethrow;
    }
  }

  // Create or update user in database
  Future<UserModel> _createOrUpdateUser(User user) async {
    final userModel = UserModel(
      id: user.id,
      email: user.email!,
      displayName:
          user.userMetadata?['full_name'] ?? user.userMetadata?['name'],
      photoUrl:
          user.userMetadata?['avatar_url'] ?? user.userMetadata?['picture'],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    // Upsert user to database
    await _supabase.from('users').upsert(userModel.toJson());

    return userModel;
  }

  // Get user profile
  Future<UserModel?> getUserProfile(String userId) async {
    try {
      final response = await _supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();

      return UserModel.fromJson(response);
    } catch (e) {
      print('Error getting user profile: $e');
      return null;
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await _supabase.auth.signOut();
    } catch (e) {
      print('Error signing out: $e');
      rethrow;
    }
  }

  // Check if user is signed in
  bool isSignedIn() {
    return _supabase.auth.currentUser != null;
  }
}

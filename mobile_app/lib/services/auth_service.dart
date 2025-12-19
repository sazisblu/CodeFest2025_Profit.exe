import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

class AuthService {
  static final supabase.SupabaseClient _supabase =
      supabase.Supabase.instance.client;

  // Sign up with email and password
  static Future<supabase.AuthResponse> signUp({
    required String email,
    required String password,
    String? fullName,
  }) async {
    try {
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: fullName != null ? {'full_name': fullName} : null,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  // Sign in with email and password
  static Future<supabase.AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  // Sign in with Google
  static Future<bool> signInWithGoogle() async {
    try {
      final response = await _supabase.auth.signInWithOAuth(
        supabase.OAuthProvider.google,
        redirectTo: kIsWeb
            ? null
            : 'com.example.hamro_chautari://login-callback',
      );
      return response;
    } catch (e) {
      debugPrint('Google sign in error: $e');
      return false;
    }
  }

  // Sign out
  static Future<void> signOut() async {
    try {
      await _supabase.auth.signOut();
    } catch (e) {
      rethrow;
    }
  }

  // Get current user
  static supabase.User? getCurrentUser() {
    return _supabase.auth.currentUser;
  }

  // Check if signed in
  static bool isSignedIn() {
    return _supabase.auth.currentUser != null;
  }

  // Listen to auth state changes
  static Stream<supabase.AuthState> get authStateChanges {
    return _supabase.auth.onAuthStateChange;
  }

  // Reset password
  static Future<void> resetPassword(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(email);
    } catch (e) {
      rethrow;
    }
  }
}

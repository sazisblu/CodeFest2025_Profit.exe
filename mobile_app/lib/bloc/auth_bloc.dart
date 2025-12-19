import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;
import '../services/auth_service.dart';
import 'auth_event.dart';
import 'auth_state.dart' as app_state;

class AuthBloc extends Bloc<AuthEvent, app_state.AuthState> {
  late final StreamSubscription<supabase.AuthState> _authSubscription;

  AuthBloc() : super(app_state.AuthInitial()) {
    on<AuthStarted>(_onAuthStarted);
    on<AuthSignUpRequested>(_onSignUpRequested);
    on<AuthSignInRequested>(_onSignInRequested);
    on<AuthGoogleSignInRequested>(_onGoogleSignInRequested);
    on<AuthSignOutRequested>(_onSignOutRequested);
    on<AuthStateChanged>(_onAuthStateChanged);

    // Listen to auth state changes
    _authSubscription = AuthService.authStateChanges.listen((
      supabaseAuthState,
    ) {
      add(AuthStateChanged(supabaseAuthState));
    });
  }

  void _onAuthStarted(AuthStarted event, Emitter<app_state.AuthState> emit) {
    final user = AuthService.getCurrentUser();
    if (user != null) {
      emit(app_state.AuthAuthenticated(user));
    } else {
      emit(app_state.AuthUnauthenticated());
    }
  }

  Future<void> _onSignUpRequested(
    AuthSignUpRequested event,
    Emitter<app_state.AuthState> emit,
  ) async {
    emit(app_state.AuthLoading());
    try {
      final response = await AuthService.signUp(
        email: event.email,
        password: event.password,
        fullName: event.fullName,
      );

      if (response.user != null) {
        emit(app_state.AuthAuthenticated(response.user!));
      } else {
        emit(const app_state.AuthError('Sign up failed'));
      }
    } catch (e) {
      emit(app_state.AuthError(e.toString()));
    }
  }

  Future<void> _onSignInRequested(
    AuthSignInRequested event,
    Emitter<app_state.AuthState> emit,
  ) async {
    emit(app_state.AuthLoading());
    try {
      final response = await AuthService.signIn(
        email: event.email,
        password: event.password,
      );

      if (response.user != null) {
        emit(app_state.AuthAuthenticated(response.user!));
      } else {
        emit(const app_state.AuthError('Sign in failed'));
      }
    } catch (e) {
      emit(app_state.AuthError(e.toString()));
    }
  }

  Future<void> _onGoogleSignInRequested(
    AuthGoogleSignInRequested event,
    Emitter<app_state.AuthState> emit,
  ) async {
    emit(app_state.AuthLoading());
    try {
      final success = await AuthService.signInWithGoogle();
      if (!success) {
        emit(const app_state.AuthError('Google sign in failed'));
      }
      // State will be updated via _onAuthStateChanged
    } catch (e) {
      emit(app_state.AuthError(e.toString()));
    }
  }

  Future<void> _onSignOutRequested(
    AuthSignOutRequested event,
    Emitter<app_state.AuthState> emit,
  ) async {
    emit(app_state.AuthLoading());
    try {
      await AuthService.signOut();
      emit(app_state.AuthUnauthenticated());
    } catch (e) {
      emit(app_state.AuthError(e.toString()));
    }
  }

  void _onAuthStateChanged(
    AuthStateChanged event,
    Emitter<app_state.AuthState> emit,
  ) {
    final user = AuthService.getCurrentUser();
    if (user != null) {
      emit(app_state.AuthAuthenticated(user));
    } else {
      emit(app_state.AuthUnauthenticated());
    }
  }

  @override
  Future<void> close() {
    _authSubscription.cancel();
    return super.close();
  }
}

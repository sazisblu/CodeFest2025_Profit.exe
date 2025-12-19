import 'package:equatable/equatable.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class AuthStarted extends AuthEvent {}

class AuthSignUpRequested extends AuthEvent {
  final String email;
  final String password;
  final String? fullName;

  const AuthSignUpRequested({
    required this.email,
    required this.password,
    this.fullName,
  });

  @override
  List<Object> get props => [email, password, fullName ?? ''];
}

class AuthSignInRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthSignInRequested({required this.email, required this.password});

  @override
  List<Object> get props => [email, password];
}

class AuthGoogleSignInRequested extends AuthEvent {}

class AuthSignOutRequested extends AuthEvent {}

class AuthStateChanged extends AuthEvent {
  final supabase.AuthState supabaseAuthState;

  const AuthStateChanged(this.supabaseAuthState);

  @override
  List<Object> get props => [supabaseAuthState];
}

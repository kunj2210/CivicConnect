import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<void> loginWithPhone(String phoneNumber) async {
    await _client.auth.signInWithOtp(
      phone: phoneNumber.startsWith('+') ? phoneNumber : '+91$phoneNumber',
    );
  }

  Future<AuthResponse> verifyOTP(String phoneNumber, String token) async {
    return await _client.auth.verifyOTP(
      phone: phoneNumber.startsWith('+') ? phoneNumber : '+91$phoneNumber',
      token: token,
      type: OtpType.sms,
    );
  }

  Future<AuthResponse> signUpWithEmail(String email, String password) async {
    return await _client.auth.signUp(email: email, password: password);
  }

  Future<AuthResponse> loginWithEmail(String email, String password) async {
    return await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  User? get currentUser => _client.auth.currentUser;
  
  Session? get currentSession => _client.auth.currentSession;
}

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:mobile/models/models.dart';
import 'package:mobile/features/auth/services/auth_api_service.dart';
import 'package:mobile/core/services/token_storage.dart';

import 'package:mobile/core/providers/dependencies.dart';

class AuthNotifier extends AsyncNotifier<User?> {
  AuthApiService get _authService => ref.read(authApiServiceProvider);
  TokenStorage get _tokens => ref.read(tokenStorageProvider);

  @override
  Future<User?> build() async {
    final access = await _tokens.readAccessToken();
    if (access == null || access.isEmpty) {
      return null;
    }
    try {
      return await _authService.fetchCurrentUser();
    } catch (_) {
      await _tokens.clear();
      return null;
    }
  }

  Future<void> login({required String email, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await _authService.login(email: email, password: password);
      return session.user;
    });
    if (state.hasError) throw state.error!;
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    String role = 'student',
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await _authService.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );
      return session.user;
    });
    if (state.hasError) throw state.error!;
  }

  Future<void> loginWithGoogle({String? role}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final googleSignIn = GoogleSignIn(
        clientId: '57881811503-fim5ubb5p4kulbcedbcmkvjr0vkmchhm.apps.googleusercontent.com',
        scopes: ['email', 'profile'],
      );

      try {
        await googleSignIn.signOut();
        final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
        if (googleUser == null) return state.valueOrNull;

        final GoogleSignInAuthentication googleAuth =
            await googleUser.authentication;
        final String? idToken = googleAuth.idToken;

        if (idToken == null) {
          throw Exception('Failed to obtain Google ID Token');
        }

        final session =
            await _authService.googleLogin(idToken: idToken, role: role);
        return session.user;
      } catch (e, stack) {
        debugPrint('[AuthNotifier] Google Sign-In Error: $e\n$stack');
        rethrow;
      }
    });
  }

  Future<void> logout() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      // 1. Sign out from Google if applicable
      final googleSignIn = GoogleSignIn();
      if (await googleSignIn.isSignedIn()) {
        await googleSignIn.signOut();
      }
      
      // 2. Clear backend session and local tokens
      await _authService.logout();
      return null;
    });
  }

  Future<void> forgotPassword(String email) async {
    // We don't set global loading state here to avoid blocking the whole app UI, 
    // the screen will handle its own local loading state.
    await _authService.forgotPassword(email);
  }

  Future<void> refreshProfile() async {
    if (state.valueOrNull == null) return;
    state = await AsyncValue.guard(() async {
      return await _authService.fetchCurrentUser();
    });
  }

  Future<void> completeOnboarding(Map<String, dynamic> data) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      return await _authService.updateProfile(data);
    });
    if (state.hasError) throw state.error!;
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, User?>(AuthNotifier.new);









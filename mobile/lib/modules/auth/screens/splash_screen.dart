import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    // Wait for animation to breathe
    await Future.delayed(const Duration(milliseconds: 3500));
    if (!mounted) return;

    final session = Supabase.instance.client.auth.currentSession;
    if (session != null) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030304), // Ultra deep black
      body: Stack(
        children: [
          // Background ambient glow
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF8B5CF6).withOpacity(0.05),
              ),
            ).animate(onPlay: (controller) => controller.repeat(reverse: true))
             .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.2, 1.2), duration: 2.seconds, curve: Curves.easeInOut)
             .fadeIn(duration: 1.seconds),
          ),

          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated Logo
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF8B5CF6).withOpacity(0.1),
                        blurRadius: 40,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                  child: Image.asset(
                    'assets/images/logo.png',
                    width: 100,
                    height: 100,
                  ),
                ).animate()
                 .fadeIn(duration: 800.ms)
                 .scale(begin: const Offset(0.5, 0.5), end: const Offset(1, 1), curve: Curves.elasticOut, duration: 1200.ms)
                 .shimmer(delay: 1500.ms, duration: 2.seconds, color: Colors.white.withOpacity(0.3))
                 .callback(delay: 3.seconds, callback: (_) => {}),

                const SizedBox(height: 40),

                // Premium Text
                Column(
                  children: [
                    Text(
                      'CIVIC CONNECT',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 6,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ).animate().fadeIn(delay: 1.seconds).slideY(begin: 0.2),
                    const SizedBox(height: 8),
                    Text(
                      'MUNICIPAL INTELLIGENCE HUB',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 2,
                        color: const Color(0xFF8B5CF6).withOpacity(0.6),
                      ),
                    ).animate().fadeIn(delay: 1200.ms),
                  ],
                ),
              ],
            ),
          ),

          // Loading bar at bottom
          Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 140,
                height: 2,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(2),
                ),
                child: Stack(
                  children: [
                    Container(
                      width: 0,
                      decoration: BoxDecoration(
                        color: const Color(0xFF8B5CF6),
                        borderRadius: BorderRadius.circular(2),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withOpacity(0.5),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                    ).animate()
                     .custom(
                       duration: 3.seconds,
                       builder: (context, value, child) => FractionallySizedBox(
                         widthFactor: value,
                         child: child,
                       ),
                     ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

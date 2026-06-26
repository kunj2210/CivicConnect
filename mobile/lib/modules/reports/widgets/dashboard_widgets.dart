import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CircularAction extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const CircularAction({super.key, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(50),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isDark ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.03),
          border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05)),
        ),
        child: Icon(icon, color: isDark ? Colors.white : const Color(0xFF0F172A), size: 22),
      ),
    );
  }
}

class BentoCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final bool isLarge;
  final VoidCallback onTap;

  const BentoCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    this.isLarge = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(28),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isLarge 
                ? (isDark ? color.withValues(alpha: 0.8) : color)
                : (isDark ? Colors.white.withValues(alpha: 0.04) : Colors.white),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: isLarge 
                  ? color.withValues(alpha: 0.2) 
                  : (isDark ? Colors.white.withValues(alpha: 0.05) : const Color(0xFFF1F5F9)),
                width: 1.5,
              ),
              boxShadow: isLarge && !isDark ? [
                BoxShadow(
                  color: color.withValues(alpha: 0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                )
              ] : null,
            ),
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.topLeft,
              child: SizedBox(
                width: 130,
                height: 130,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isLarge 
                          ? Colors.white.withValues(alpha: 0.2) 
                          : color.withValues(alpha: 0.1),
                      ),
                      child: Icon(
                        icon, 
                        color: isLarge ? Colors.white : color, 
                        size: 24
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: GoogleFonts.outfit(
                            textStyle: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              height: 1.1,
                              color: isLarge ? Colors.white : theme.textTheme.titleLarge?.color,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          subtitle,
                          style: GoogleFonts.outfit(
                            textStyle: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: isLarge 
                                ? Colors.white.withValues(alpha: 0.7) 
                                : theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.5),
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class StatBento extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const StatBento({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF121214) : Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.03) : const Color(0xFFF1F5F9),
        ),
        boxShadow: !isDark ? [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ] : null,
      ),
      child: FittedBox(
        fit: BoxFit.scaleDown,
        alignment: Alignment.topLeft,
        child: SizedBox(
          width: 130,
          height: 130,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color.withValues(alpha: isDark ? 0.4 : 0.6), size: 20),
              const Spacer(),
              Text(
                value,
                style: GoogleFonts.outfit(
                  textStyle: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    color: theme.textTheme.titleLarge?.color,
                    letterSpacing: -1,
                  ),
                ),
              ),
              Text(
                label.toUpperCase(),
                style: GoogleFonts.outfit(
                  textStyle: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.4),
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class LogItem extends StatelessWidget {
  final String title;
  final String status;
  final String time;
  final IconData icon;

  const LogItem({
    super.key,
    required this.title,
    required this.status,
    required this.time,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF121214) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.03) : const Color(0xFFF1F5F9),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF8B5CF6).withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: const Color(0xFF8B5CF6).withValues(alpha: 0.8), size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w800, 
                    color: theme.textTheme.titleLarge?.color, 
                    fontSize: 13
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  status.toUpperCase(),
                  style: GoogleFonts.outfit(
                    textStyle: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      color: status == 'Resolved' ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Text(
            time,
            style: TextStyle(
              color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.3), 
              fontSize: 10, 
              fontWeight: FontWeight.w700
            ),
          ),
        ],
      ),
    );
  }
}

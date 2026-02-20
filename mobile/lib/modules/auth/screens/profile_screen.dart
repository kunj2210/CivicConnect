import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/services/auth_service.dart';
import '../services/user_service.dart';
import '../../../shared/providers/theme_provider.dart';
import 'edit_profile_screen.dart';
import 'notification_settings_screen.dart';
import 'security_settings_screen.dart';
import 'help_center_screen.dart';
import 'about_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final UserService _userService = UserService();
  final AuthService _authService = AuthService();
  Map<String, dynamic>? _stats;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    final stats = await _userService.getUserStats();
    if (mounted) {
      setState(() {
        _stats = stats;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = _userService.currentUser;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(themeProvider.isDarkMode ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
            onPressed: () {
              themeProvider.toggleTheme(!themeProvider.isDarkMode);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadStats,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              const SizedBox(height: 20),
              // User Header
              Center(
                child: Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.1), width: 4),
                      ),
                      child: CircleAvatar(
                        radius: 55,
                        backgroundColor: theme.colorScheme.surfaceContainerHighest,
                        child: user?.photoURL != null 
                          ? ClipOval(child: Image.network(user!.photoURL!, width: 110, height: 110, fit: BoxFit.cover))
                          : Icon(Icons.person, size: 65, color: theme.colorScheme.primary),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () async {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const EditProfileScreen()),
                          );
                          if (result == true) setState(() {}); // Refresh UI for name change
                        },
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.secondary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.edit, size: 18, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                user?.displayName ?? 'Citizen User',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              Text(
                user?.email ?? user?.phoneNumber ?? 'anonymous@civicconnect.gov',
                style: TextStyle(color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.6), fontSize: 14),
              ),
              const SizedBox(height: 32),
              
              // Stats Row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem(_stats?['total']?.toString() ?? '-', 'Reports', theme),
                    _buildDivider(theme),
                    _buildStatItem(_stats?['resolved']?.toString() ?? '-', 'Resolved', theme),
                    _buildDivider(theme),
                    _buildStatItem(_stats?['rank'] ?? '-', 'Rank', theme),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              // Options Sections
              const _SectionTitle(title: 'Account Settings'),
              _buildProfileOption(
                icon: Icons.notifications_active_outlined, 
                title: 'Notifications', 
                subtitle: 'Alerts & updates',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const NotificationSettingsScreen())),
                theme: theme,
              ),
              _buildProfileOption(
                icon: Icons.lock_outline, 
                title: 'Security', 
                subtitle: 'Password & authentication',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SecuritySettingsScreen())),
                theme: theme,
              ),
              
              const _SectionTitle(title: 'Support & Info'),
              _buildProfileOption(
                icon: Icons.help_center_outlined, 
                title: 'Help Center', 
                subtitle: 'FAQs and contact us',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const HelpCenterScreen())),
                theme: theme,
              ),
              _buildProfileOption(
                icon: Icons.info_outline, 
                title: 'About CivicConnect', 
                subtitle: 'Version 2.0.4',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AboutScreen())),
                theme: theme,
              ),
              
              const SizedBox(height: 32),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: ElevatedButton.icon(
                  onPressed: () async {
                    await _authService.signOut();
                    if (context.mounted) {
                      Navigator.pushReplacementNamed(context, '/login');
                    }
                  },
                  icon: const Icon(Icons.logout),
                  label: const Text('Sign Out'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 56),
                    backgroundColor: Colors.red.withValues(alpha: 0.1),
                    foregroundColor: Colors.red,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
              const SizedBox(height: 60),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String value, String label, ThemeData theme) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: theme.colorScheme.primary)),
        Text(label, style: TextStyle(color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.5), fontSize: 12)),
      ],
    );
  }

  Widget _buildDivider(ThemeData theme) => Container(height: 30, width: 1, color: theme.dividerColor);

  Widget _buildProfileOption({
    required IconData icon, 
    required String title, 
    required String subtitle, 
    required VoidCallback onTap,
    required ThemeData theme
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: theme.colorScheme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, color: theme.colorScheme.primary, size: 22),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      subtitle: Text(subtitle, style: TextStyle(color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.5), fontSize: 12)),
      trailing: const Icon(Icons.chevron_right, size: 20, color: Colors.grey),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2),
      ),
    );
  }
}

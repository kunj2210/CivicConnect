import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'shared/providers/navigation_provider.dart';
import 'modules/reports/screens/dashboard_screen.dart';
import 'modules/reports/screens/history_screen.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'modules/auth/screens/profile_screen.dart';
import 'modules/reports/screens/staff_dashboard_screen.dart';
import 'modules/notifications/screens/notification_screen.dart';
import 'shared/utils/responsive_helper.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  final GlobalKey<DashboardScreenState> _dashboardKey = GlobalKey<DashboardScreenState>();
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    final user = Supabase.instance.client.auth.currentUser;
    final role = user?.userMetadata?['role'] ?? 'citizen';

    _screens = [
      role == 'staff' ? const StaffDashboardScreen() : DashboardScreen(key: _dashboardKey),
      const HistoryScreen(),
      const NotificationScreen(),
      const ProfileScreen(),
    ];
  }

  void _onTabTapped(BuildContext context, int index) {
    final navProvider = Provider.of<NavigationProvider>(context, listen: false);
    if (index == 0 && navProvider.currentIndex != 0) {
      _dashboardKey.currentState?.refreshStats();
    }
    navProvider.setIndex(index);
  }

  @override
  Widget build(BuildContext context) {
    final navProvider = Provider.of<NavigationProvider>(context);
    final theme = Theme.of(context);
    final bool isDesktop = Responsive.isDesktop(context) || Responsive.isTablet(context);

    return Scaffold(
      body: Row(
        children: [
          if (isDesktop)
            NavigationRail(
              selectedIndex: navProvider.currentIndex,
              onDestinationSelected: (index) => _onTabTapped(context, index),
              labelType: NavigationRailLabelType.all,
              selectedIconTheme: IconThemeData(color: theme.colorScheme.primary),
              unselectedIconTheme: IconThemeData(color: theme.hintColor),
              leading: Column(
                children: [
                  const SizedBox(height: 20),
                  FloatingActionButton(
                    mini: true,
                    onPressed: () => Navigator.pushNamed(context, '/report'),
                    backgroundColor: theme.colorScheme.secondary,
                    child: const Icon(Icons.add, color: Colors.white),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
              destinations: const [
                NavigationRailDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: Text('Dashboard')),
                NavigationRailDestination(icon: Icon(Icons.assignment_outlined), selectedIcon: Icon(Icons.assignment), label: Text('Reports')),
                NavigationRailDestination(icon: Icon(Icons.notifications_outlined), selectedIcon: Icon(Icons.notifications), label: Text('Alerts')),
                NavigationRailDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: Text('Profile')),
              ],
            ),
          Expanded(
            child: IndexedStack(
              index: navProvider.currentIndex,
              children: _screens,
            ),
          ),
        ],
      ),
      bottomNavigationBar: !isDesktop 
          ? BottomNavigationBar(
              currentIndex: navProvider.currentIndex,
              onTap: (index) => _onTabTapped(context, index),
              selectedItemColor: theme.colorScheme.primary,
              unselectedItemColor: theme.hintColor,
              type: BottomNavigationBarType.fixed,
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
                BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: 'My Reports'),
                BottomNavigationBarItem(icon: Icon(Icons.notifications_outlined), label: 'Alerts'),
                BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
              ],
            )
          : null,
      floatingActionButton: isDesktop ? null : FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/report'),
        backgroundColor: theme.colorScheme.secondary,
        child: const Icon(Icons.add, color: Colors.white, size: 30),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}

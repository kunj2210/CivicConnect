import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'shared/providers/navigation_provider.dart';
import 'modules/reports/screens/dashboard_screen.dart';
import 'modules/reports/screens/history_screen.dart';
import 'modules/auth/screens/profile_screen.dart';

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
    _screens = [
      DashboardScreen(key: _dashboardKey),
      const HistoryScreen(),
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

    return Scaffold(
      body: IndexedStack(
        index: navProvider.currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: navProvider.currentIndex,
        onTap: (index) => _onTabTapped(context, index),
        selectedItemColor: theme.colorScheme.primary,
        unselectedItemColor: theme.hintColor,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: 'My Reports'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/report'),
        backgroundColor: theme.colorScheme.secondary,
        child: const Icon(Icons.add, color: Colors.white, size: 30),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}

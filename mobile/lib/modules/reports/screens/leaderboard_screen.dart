import 'package:flutter/material.dart';
import '../../auth/services/user_service.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  final UserService _userService = UserService();
  List<dynamic> _leaderboard = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  Future<void> _fetchLeaderboard() async {
    final data = await _userService.getLeaderboard();
    if (mounted) {
      setState(() {
        _leaderboard = data;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = _userService.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Community Leaderboard', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchLeaderboard,
              child: Column(
                children: [
                  _buildHeader(theme),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _leaderboard.length,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemBuilder: (context, index) {
                        final entry = _leaderboard[index];
                        final isMe = entry['id'] == user?.id;
                        return _buildLeaderboardTile(index + 1, entry, isMe, theme);
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary,
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const Icon(Icons.emoji_events_outlined, size: 64, color: Colors.white),
          const SizedBox(height: 16),
          const Text(
            'Civic Champions',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 8),
          Text(
            'Top citizens contributing to city health',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildLeaderboardTile(int rank, dynamic entry, bool isMe, ThemeData theme) {
    final credits = entry['green_credits'] ?? 0;
    final achievements = entry['achievements'] as List?;
    final topBadge = (achievements != null && achievements.isNotEmpty ? (achievements.last['icon'] as String?) : null) ?? '👤';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: isMe ? theme.colorScheme.secondary.withValues(alpha: 0.1) : theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: isMe ? Border.all(color: theme.colorScheme.secondary, width: 2) : null,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10)],

      ),
      child: ListTile(
        leading: SizedBox(
          width: 60,
          child: Row(
            children: [
              Text(
                rank.toString(),
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: rank <= 3 ? Colors.orange : Colors.grey,
                ),
              ),
              const SizedBox(width: 8),
              CircleAvatar(
                radius: 18,
                backgroundColor: theme.colorScheme.surfaceContainerHighest,
                child: Text(topBadge, style: const TextStyle(fontSize: 18)),
              ),
            ],
          ),
        ),
        title: Text(
          isMe ? 'You' : (entry['phone'] ?? entry['email'] ?? 'Hero'),
          style: TextStyle(fontWeight: isMe ? FontWeight.bold : FontWeight.normal),
        ),
        subtitle: Text(
          '${achievements?.length ?? 0} Badges earned',
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            '$credits XP',
            style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.primary),
          ),
        ),
      ),
    );
  }
}

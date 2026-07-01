import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/navigation_provider.dart';

class VerificationHelper {
  static bool checkVerification(BuildContext context, {required String action}) {
    final user = Supabase.instance.client.auth.currentUser;
    if (user?.phone == null || user!.phone!.isEmpty) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
              SizedBox(width: 8),
              Text('Verification Required', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(
            'First verify your phone number from the profile screen to $action.',
            style: const TextStyle(fontSize: 15),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // Close dialog
                // Navigate to the profile tab (index 3)
                final navProvider = Provider.of<NavigationProvider>(context, listen: false);
                navProvider.setIndex(3);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Go to Profile'),
            ),
          ],
        ),
      );
      return false;
    }
    return true;
  }
}

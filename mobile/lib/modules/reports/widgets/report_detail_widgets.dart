import 'package:flutter/material.dart';

class SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;

  const SectionHeader({super.key, required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Row(
      children: [
        Icon(icon, size: 20, color: colorScheme.primary),
        const SizedBox(width: 8),
        Text(
          title,
          style: theme.textTheme.labelLarge?.copyWith(
            color: colorScheme.onSurfaceVariant,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    Color color = colorScheme.primary;
    if (status == 'Resolved') color = Colors.green;
    if (status == 'In Progress') color = Colors.blue;
    if (status == 'Pending Confirmation' || status == 'Pending Citizen Confirmation') color = Colors.orange;
    if (status == 'Disputed') color = Colors.red;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}

class ResolutionEvidenceCard extends StatelessWidget {
  final String? resolutionImageUrl;

  const ResolutionEvidenceCard({super.key, required this.resolutionImageUrl});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(icon: Icons.check_circle_outline, title: 'Resolution Evidence'),
        const SizedBox(height: 12),
        if (resolutionImageUrl != null)
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.network(
              resolutionImageUrl!,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                height: 200,
                color: Colors.grey.withValues(alpha: 0.1),
                child: const Center(child: Icon(Icons.image_not_supported_outlined)),
              ),
            ),
          )
        else
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Center(child: Text('Evidence image pending sync...')),
          ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class FieldResolutionCard extends StatelessWidget {
  final bool isUploadingResolution;
  final VoidCallback onCapturePressed;

  const FieldResolutionCard({
    super.key,
    required this.isUploadingResolution,
    required this.onCapturePressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.secondaryContainer.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colorScheme.secondary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: colorScheme.secondary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.engineering, color: colorScheme.onSecondary, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Field Resolution',
                      style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Submit photo proof to close this issue',
                      style: textTheme.bodyMedium?.copyWith(color: colorScheme.onSecondaryContainer),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: isUploadingResolution ? null : onCapturePressed,
            icon: isUploadingResolution 
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) 
              : const Icon(Icons.camera_enhance),
            label: Text(isUploadingResolution ? 'Uploading Proof...' : 'Capture Completion Proof'),
            style: ElevatedButton.styleFrom(
              backgroundColor: colorScheme.secondary,
              foregroundColor: colorScheme.onSecondary,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Note: You must be within 100m of the issue location to submit resolution proof.',
            textAlign: TextAlign.center,
            style: textTheme.bodySmall?.copyWith(fontStyle: FontStyle.italic),
          ),
        ],
      ),
    );
  }
}

class VerifyFixCard extends StatelessWidget {
  final bool isConfirming;
  final VoidCallback onVerifyPressed;

  const VerifyFixCard({
    super.key,
    required this.isConfirming,
    required this.onVerifyPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(icon: Icons.rate_review_outlined, title: 'Verify Fix'),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.blue.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.blue.withValues(alpha: 0.3)),
          ),
          child: Column(
            children: [
              const Text(
                'Municipal authorities have confirmed the resolution. Please verify if the issue is solved to earn your Green Credits.',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: isConfirming ? null : onVerifyPressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF8B5CF6),
                  minimumSize: const Size(double.infinity, 48),
                ),
                child: isConfirming 
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Verify & Claim Credits'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class PendingApprovalCard extends StatelessWidget {
  final String? resolutionImageUrl;

  const PendingApprovalCard({super.key, required this.resolutionImageUrl});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(icon: Icons.rate_review_outlined, title: 'Pending Approval'),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.orange.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
          ),
          child: Column(
            children: [
              const Text(
                'The field staff has submitted a resolution. This is currently undergoing review by municipal authorities.',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              if (resolutionImageUrl != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    resolutionImageUrl!,
                    height: 150,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 16),
              ],
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.hourglass_empty, color: Colors.orange, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Awaiting Authority Verification',
                      style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'dart:io';
import '../models/user_model.dart';
import '../models/user_stats_model.dart';
import '../services/auth_service.dart';
import '../services/profile_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _authService = AuthService();
  final _profileService = ProfileService();

  UserModel? _currentUser;
  UserStats? _userStats;
  String? _currentPhotoUrl;
  bool _isLoading = true;
  bool _isUploadingPhoto = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);

    try {
      final authUser = _authService.currentUser;
      if (authUser == null) {
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/login');
        }
        return;
      }

      // Get user profile from database
      final user = await _authService.getUserProfile(authUser.id);
      if (user == null) {
        throw Exception('User profile not found');
      }

      // Fetch stats and current photo URL from database
      final stats = await _profileService.getUserStats(user.id);
      final photoUrl = await _profileService.getUserPhotoUrl(user.id);

      setState(() {
        _currentUser = user;
        _userStats = stats;
        _currentPhotoUrl =
            photoUrl ??
            user.photoUrl; // Use DB photo or fallback to Google photo
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to load profile: $e')));
      }
    }
  }

  Future<void> _uploadPhoto() async {
    setState(() => _isUploadingPhoto = true);

    try {
      final imageFile = await _profileService.pickImage();
      if (imageFile == null) {
        setState(() => _isUploadingPhoto = false);
        return;
      }

      // Upload photo to Supabase Storage
      final photoUrl = await _profileService.uploadProfilePhoto(
        imageFile,
        _currentUser!.id,
      );

      setState(() {
        _currentPhotoUrl = photoUrl; // Update with new custom photo URL
        _isUploadingPhoto = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile photo updated successfully!')),
        );
      }
    } catch (e) {
      setState(() => _isUploadingPhoto = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to upload photo: $e')));
      }
    }
  }

  void _signOut() async {
    await _authService.signOut();
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.campaign, color: Colors.blue),
          onPressed: () {},
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Color(0xFF1E3A8A)),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(
              Icons.notifications_outlined,
              color: Color(0xFF1E3A8A),
            ),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    const SizedBox(height: 24),

                    // Title
                    const Text(
                      'Your Profile',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E3A8A),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Profile Photo with Edit Button
                    Stack(
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFF10B981),
                              width: 3,
                            ),
                          ),
                          child: CircleAvatar(
                            radius: 58,
                            backgroundColor: const Color(
                              0xFF10B981,
                            ).withOpacity(0.2),
                            backgroundImage: _currentPhotoUrl != null
                                ? NetworkImage(_currentPhotoUrl!)
                                : null,
                            child: _currentPhotoUrl == null
                                ? const Icon(
                                    Icons.person,
                                    size: 60,
                                    color: Color(0xFF10B981),
                                  )
                                : null,
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: GestureDetector(
                            onTap: _isUploadingPhoto ? null : _uploadPhoto,
                            child: Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E3A8A),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white,
                                  width: 2,
                                ),
                              ),
                              child: _isUploadingPhoto
                                  ? const Padding(
                                      padding: EdgeInsets.all(8.0),
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation(
                                          Colors.white,
                                        ),
                                      ),
                                    )
                                  : const Icon(
                                      Icons.edit,
                                      size: 18,
                                      color: Colors.white,
                                    ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Name
                    Text(
                      _currentUser?.displayName ?? 'User',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E3A8A),
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Email and placeholder info
                    Text(
                      'Email: ${_currentUser?.email ?? 'N/A'}',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),

                    const SizedBox(height: 32),

                    // User Stats Section
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'User Stats :',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E3A8A),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Stats Container
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE5E7EB),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              children: [
                                _buildStatRow(
                                  'Posts Created :',
                                  _userStats?.postsCreated.toString() ?? '0',
                                ),
                                const SizedBox(height: 12),
                                _buildStatRow(
                                  'Total Likes Received :',
                                  _userStats?.totalLikes.toString() ?? '0',
                                ),
                                const SizedBox(height: 12),
                                _buildStatRow(
                                  'Member Since :',
                                  _getMemberSinceText(),
                                ),
                                const SizedBox(height: 12),
                                _buildStatRow(
                                  'User Impact Score:',
                                  _userStats?.impactScore.toString() ?? '0',
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Sign Out Button
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0),
                      child: GestureDetector(
                        onTap: _signOut,
                        child: Container(
                          width: double.infinity,
                          height: 50,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F0FF),
                            borderRadius: BorderRadius.circular(25),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.logout,
                                color: Color(0xFF2E4F99),
                                size: 24,
                              ),
                              SizedBox(width: 8),
                              Text(
                                'Sign Out',
                                style: TextStyle(
                                  color: Color(0xFF2E4F99),
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: Color(0xFF1E3A8A),
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            color: Color(0xFF1E3A8A),
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  String _getMemberSinceText() {
    final memberSince = _currentUser?.createdAt;
    if (memberSince == null) return 'N/A';

    final now = DateTime.now();
    final difference = now.difference(memberSince);

    if (difference.inDays < 1) {
      return 'Today';
    } else if (difference.inDays < 30) {
      return '${difference.inDays}d';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '${months}mo';
    } else {
      final years = (difference.inDays / 365).floor();
      return '${years}y';
    }
  }
}

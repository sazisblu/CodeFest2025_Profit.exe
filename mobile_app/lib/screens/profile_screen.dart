import 'package:flutter/material.dart';
import 'package:hamro_chautari/widgets/custom_app_bar.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../models/user_model.dart';
import '../models/user_stats_model.dart';
import '../models/post_model.dart';
import '../models/thread_model.dart';
import '../services/auth_service.dart';
import '../services/profile_service.dart';
import '../services/post_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _authService = AuthService();
  final _profileService = ProfileService();
  final _postService = PostService();

  UserModel? _currentUser;
  UserStats? _userStats;
  String? _currentPhotoUrl;
  List<PostModel> _userPosts = [];
  bool _isLoading = true;
  bool _isUploadingPhoto = false;
  bool _isLoadingPosts = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
    _loadUserPosts();
  }

  Future<void> _loadUserPosts() async {
    if (_currentUser == null) return;

    setState(() => _isLoadingPosts = true);

    try {
      final posts = await _postService.getAllPosts();
      setState(() {
        _userPosts = posts;
        _isLoadingPosts = false;
      });
    } catch (e) {
      setState(() => _isLoadingPosts = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to load posts: $e')));
      }
    }
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

      // Load user posts after user is loaded
      _loadUserPosts();
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
      appBar: CustomAppBar(title: 'Profile'),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                await _loadProfile();
                await _loadUserPosts();
              },
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  // Profile Header Section
                  SliverToBoxAdapter(
                    child: Column(
                      children: [
                        // Background gradient decoration
                        Container(height: 80),
                      ],
                    ),
                  ),

                  // Profile Card
                  SliverToBoxAdapter(
                    child: Transform.translate(
                      offset: const Offset(0, -40),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(25),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.08),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              const SizedBox(height: 24),

                              // Profile Photo with Edit Button
                              Stack(
                                children: [
                                  Container(
                                    width: 120,
                                    height: 120,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: const Color(0xFF2E4F99),
                                        width: 3,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(
                                            0xFF2E4F99,
                                          ).withOpacity(0.2),
                                          blurRadius: 15,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: CircleAvatar(
                                      radius: 58,
                                      backgroundColor: const Color(
                                        0xFF2E4F99,
                                      ).withOpacity(0.1),
                                      backgroundImage: _currentPhotoUrl != null
                                          ? NetworkImage(_currentPhotoUrl!)
                                          : null,
                                      child: _currentPhotoUrl == null
                                          ? const Icon(
                                              Icons.person,
                                              size: 60,
                                              color: Color(0xFF2E4F99),
                                            )
                                          : null,
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 0,
                                    right: 0,
                                    child: GestureDetector(
                                      onTap: _isUploadingPhoto
                                          ? null
                                          : _uploadPhoto,
                                      child: Container(
                                        width: 40,
                                        height: 40,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF2E4F99),
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: Colors.white,
                                            width: 3,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: const Color(
                                                0xFF2E4F99,
                                              ).withOpacity(0.3),
                                              blurRadius: 8,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: _isUploadingPhoto
                                            ? const Padding(
                                                padding: EdgeInsets.all(8.0),
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  valueColor:
                                                      AlwaysStoppedAnimation(
                                                        Colors.white,
                                                      ),
                                                ),
                                              )
                                            : const Icon(
                                                Icons.edit,
                                                size: 20,
                                                color: Colors.white,
                                              ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),

                              const SizedBox(height: 20),

                              // Name
                              Text(
                                _currentUser?.displayName ?? 'User',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1a1a1a),
                                ),
                              ),

                              const SizedBox(height: 6),

                              // Email
                              Text(
                                _currentUser?.email ?? 'N/A',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF666666),
                                ),
                              ),

                              const SizedBox(height: 24),

                              // Stats Grid
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                child: Column(
                                  children: [
                                    Row(
                                      children: [
                                        _buildStatCard(
                                          'Posts',
                                          _userStats?.postsCreated.toString() ??
                                              '0',
                                          Icons.edit_note,
                                        ),
                                        const SizedBox(width: 12),
                                        _buildStatCard(
                                          'Likes',
                                          _userStats?.totalLikes.toString() ??
                                              '0',
                                          Icons.thumb_up_rounded,
                                        ),
                                        const SizedBox(width: 12),
                                        _buildStatCard(
                                          'Impact Score',
                                          _userStats?.impactScore.toString() ??
                                              '0',
                                          Icons.star,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF5F5F5),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Icon(
                                            Icons.calendar_today,
                                            color: Color(0xFF2E4F99),
                                            size: 20,
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              'Member since ${_getMemberSinceText()}',
                                              style: const TextStyle(
                                                fontSize: 13,
                                                color: Color(0xFF666666),
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 24),

                              // Sign Out Button
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16.0,
                                ),
                                child: GestureDetector(
                                  onTap: _signOut,
                                  child: Container(
                                    width: double.infinity,
                                    height: 50,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          const Color(
                                            0xFF2E4F99,
                                          ).withOpacity(0.1),
                                          const Color(
                                            0xFF2E4F99,
                                          ).withOpacity(0.05),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(25),
                                      border: Border.all(
                                        color: const Color(0xFF2E4F99),
                                        width: 1.5,
                                      ),
                                    ),
                                    child: const Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
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

                              const SizedBox(height: 24),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Posts Section Header
                  if (_userPosts.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Text(
                          'My Posts (${_userPosts.length})',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1a1a1a),
                          ),
                        ),
                      ),
                    ),

                  // User Posts List
                  if (_isLoadingPosts)
                    SliverToBoxAdapter(
                      child: SizedBox(
                        height: 200,
                        child: const Center(child: CircularProgressIndicator()),
                      ),
                    )
                  else if (_userPosts.isEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 40),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(
                                Icons.create_outlined,
                                size: 60,
                                color: Colors.grey.shade300,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No posts yet',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final post = _userPosts[index];
                        return PostCard(post: post, onLike: () {});
                      }, childCount: _userPosts.length),
                    ),

                  // Bottom padding
                  SliverToBoxAdapter(child: const SizedBox(height: 20)),
                ],
              ),
            ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: const Color(0xFF2E4F99), size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1a1a1a),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF666666),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
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
      return '${difference.inDays}d ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '${months}mo ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '${years}y ago';
    }
  }
}

class PostCard extends StatefulWidget {
  final PostModel post;
  final VoidCallback onLike;

  const PostCard({super.key, required this.post, required this.onLike});

  @override
  State<PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<PostCard>
    with SingleTickerProviderStateMixin {
  late int likeCount;
  late int threadCount;
  bool hasLiked = false;
  bool isProcessingLike = false;
  List<ThreadModel> threads = [];
  bool loadingThreads = false;
  bool showThreadInput = false;
  final _threadController = TextEditingController();
  final PostService _postService = PostService();
  final AuthService _authService = AuthService();
  final ImagePicker _picker = ImagePicker();
  File? _selectedThreadImage;
  bool _isAddingThread = false;

  // Animation related
  AnimationController? _animationController;
  Animation<double>? _scaleAnimation;
  Animation<Color?>? _colorAnimation;
  Animation<double>? _iconAnimation;

  @override
  void initState() {
    super.initState();
    likeCount = widget.post.likes;
    threadCount = widget.post.threadsCount;

    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.elasticOut),
    );

    _colorAnimation =
        ColorTween(
          begin: Colors.transparent,
          end: const Color(0xFF2E4F99),
        ).animate(
          CurvedAnimation(
            parent: _animationController!,
            curve: Curves.easeInOut,
          ),
        );

    _iconAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.bounceOut),
    );

    _checkIfLiked();
    _fetchThreads();
  }

  Future<void> _checkIfLiked() async {
    final user = _authService.currentUser;
    if (user != null && !isProcessingLike) {
      hasLiked = await _postService.hasUserLiked(widget.post.id, user.id);
      if (mounted && !isProcessingLike) {
        setState(() {});
      }
    }
  }

  Future<void> _fetchThreads() async {
    if (mounted) {
      setState(() {
        loadingThreads = true;
      });
    }
    threads = await _postService.getThreads(widget.post.id);
    if (mounted) {
      setState(() {
        loadingThreads = false;
      });
    }
  }

  Future<void> _handleLike() async {
    final user = _authService.currentUser;
    if (user == null || isProcessingLike) {
      return;
    }

    // Prevent double-taps with processing flag
    if (mounted) {
      setState(() {
        isProcessingLike = true;
      });
    }

    // Play animation immediately for better UX
    _animationController?.forward().then((_) {
      _animationController?.reverse();
    });

    try {
      // Toggle like in database and get new state
      final newLikeState = await _postService.toggleLike(
        widget.post.id,
        user.id,
      );
      // Update UI with new state
      if (mounted) {
        setState(() {
          hasLiked = newLikeState;
          // Update count based on the toggle
          if (newLikeState) {
            likeCount++;
          } else {
            likeCount = likeCount > 0 ? likeCount - 1 : 0;
          }
        });
      }

      // No need to refresh all posts, the UI is already updated optimistically
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error updating like: $e')));
      }
    } finally {
      // Always reset processing flag
      if (mounted) {
        setState(() {
          isProcessingLike = false;
        });
      }
    }
  }

  Future<void> _addThread() async {
    final user = _authService.currentUser;
    if (user == null || _threadController.text.trim().isEmpty) return;

    setState(() => _isAddingThread = true);

    try {
      await _postService.addThread(
        postId: widget.post.id,
        userId: user.id,
        content: _threadController.text.trim(),
        imageFile: _selectedThreadImage,
      );

      _threadController.clear();
      _selectedThreadImage = null;
      await _fetchThreads();

      if (mounted) {
        setState(() {
          threadCount++;
          _isAddingThread = false;
        });
      }

      // No need to refresh all posts for a thread
      // The thread count is already updated locally
    } catch (e) {
      setState(() => _isAddingThread = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error adding thread: $e')));
      }
    }
  }

  Future<void> _pickThreadImage() async {
    try {
      final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

      if (pickedFile != null) {
        setState(() {
          _selectedThreadImage = File(pickedFile.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error picking image: $e')));
      }
    }
  }

  void _removeThreadImage() {
    setState(() {
      _selectedThreadImage = null;
    });
  }

  @override
  void dispose() {
    _threadController.dispose();
    _animationController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // User header section
          Row(
            children: [
              // Profile avatar
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [Colors.orange, Colors.deepOrange],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: widget.post.userPhotoUrl != null
                    ? ClipOval(
                        child: Image.network(
                          widget.post.userPhotoUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return const Icon(
                              Icons.person,
                              color: Colors.white,
                              size: 28,
                            );
                          },
                        ),
                      )
                    : const Icon(Icons.person, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 12),
              // User info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text:
                                widget.post.userDisplayName ?? 'Anonymous User',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1a1a1a),
                            ),
                          ),
                          if (widget.post.location.isNotEmpty) ...[
                            const TextSpan(
                              text: ' is feeling angry in ',
                              style: TextStyle(
                                fontSize: 14,
                                color: Color(0xFF666666),
                              ),
                            ),
                            TextSpan(
                              text: widget.post.location,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1a1a1a),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatDate(widget.post.createdAt),
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF999999),
                      ),
                    ),
                  ],
                ),
              ),
              // More options menu
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F0FF),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.more_horiz,
                  color: Color(0xFF2E4F99),
                  size: 20,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Post title
          Text(
            widget.post.title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1a1a1a),
            ),
          ),
          const SizedBox(height: 8),

          // Post description
          Text(
            widget.post.description,
            style: const TextStyle(
              fontSize: 15,
              color: Color(0xFF333333),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),

          // Post image display
          if (widget.post.imageUrl != null &&
              widget.post.imageUrl!.isNotEmpty) ...[
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Image.network(
                  widget.post.imageUrl!,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      color: Colors.grey.shade200,
                      child: const Center(child: CircularProgressIndicator()),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: Colors.grey.shade200,
                      child: Icon(
                        Icons.broken_image,
                        size: 60,
                        color: Colors.grey.shade400,
                      ),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Likes count
          Text(
            '$likeCount likes',
            style: const TextStyle(fontSize: 13, color: Color(0xFF666666)),
          ),
          const SizedBox(height: 12),

          // Action buttons row
          Row(
            children: [
              // Animated Like button
              _animationController != null
                  ? AnimatedBuilder(
                      animation: _animationController!,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _scaleAnimation?.value ?? 1.0,
                          child: GestureDetector(
                            onTap: isProcessingLike ? null : _handleLike,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: isProcessingLike
                                    ? Colors.grey.shade300
                                    : hasLiked
                                    ? const Color(0xFF2E4F99)
                                    : Colors.transparent,
                                border: hasLiked || isProcessingLike
                                    ? null
                                    : Border.all(
                                        color: const Color(0xFF2E4F99),
                                        width: 1.5,
                                      ),
                                borderRadius: BorderRadius.circular(25),
                                boxShadow: hasLiked
                                    ? [
                                        BoxShadow(
                                          color: const Color(
                                            0xFF2E4F99,
                                          ).withValues(alpha: 0.3),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  AnimatedScale(
                                    scale: hasLiked
                                        ? (_iconAnimation?.value ?? 1.0)
                                        : 1.0,
                                    duration: const Duration(milliseconds: 200),
                                    child: Icon(
                                      hasLiked
                                          ? Icons.thumb_up
                                          : Icons.thumb_up_outlined,
                                      color: hasLiked
                                          ? Colors.white
                                          : const Color(0xFF2E4F99),
                                      size: 16,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  AnimatedDefaultTextStyle(
                                    duration: const Duration(milliseconds: 300),
                                    style: TextStyle(
                                      color: hasLiked
                                          ? Colors.white
                                          : const Color(0xFF2E4F99),
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                    child: Text(hasLiked ? 'Liked' : 'Like'),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    )
                  :
                    // Fallback like button without animation
                    GestureDetector(
                      onTap: isProcessingLike ? null : _handleLike,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: isProcessingLike
                              ? Colors.grey.shade300
                              : hasLiked
                              ? const Color(0xFF2E4F99)
                              : Colors.transparent,
                          border: hasLiked || isProcessingLike
                              ? null
                              : Border.all(
                                  color: const Color(0xFF2E4F99),
                                  width: 1.5,
                                ),
                          borderRadius: BorderRadius.circular(25),
                          boxShadow: hasLiked
                              ? [
                                  BoxShadow(
                                    color: const Color(
                                      0xFF2E4F99,
                                    ).withValues(alpha: 0.3),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              hasLiked
                                  ? Icons.thumb_up
                                  : Icons.thumb_up_outlined,
                              color: hasLiked
                                  ? Colors.white
                                  : const Color(0xFF2E4F99),
                              size: 16,
                            ),
                            const SizedBox(width: 6),
                            AnimatedDefaultTextStyle(
                              duration: const Duration(milliseconds: 300),
                              style: TextStyle(
                                color: hasLiked
                                    ? Colors.white
                                    : const Color(0xFF2E4F99),
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                              child: Text(hasLiked ? 'Liked' : 'Like'),
                            ),
                          ],
                        ),
                      ),
                    ),
              const SizedBox(width: 12),
              // Thread button
              GestureDetector(
                onTap: () {
                  setState(() {
                    showThreadInput = !showThreadInput;
                  });
                },
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: showThreadInput
                        ? const Color(0xFF2E4F99)
                        : const Color(0xFFE8F0FF),
                    shape: BoxShape.circle,
                    boxShadow: showThreadInput
                        ? [
                            BoxShadow(
                              color: const Color(0xFF2E4F99).withOpacity(0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : [],
                  ),
                  child: Icon(
                    Icons.mode_comment_rounded,
                    color: showThreadInput
                        ? Colors.white
                        : const Color(0xFF2E4F99),
                    size: 20,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Share button
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F0FF),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.send_rounded,
                  color: Color(0xFF2E4F99),
                  size: 20,
                ),
              ),
              const Spacer(),
              // Threads count
              Text(
                '$threadCount threads',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Threads section
          if (loadingThreads)
            const Center(child: CircularProgressIndicator())
          else ...[
            for (final thread in threads)
              Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Colors.green, Colors.teal],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: thread.userPhotoUrl != null
                          ? ClipOval(
                              child: Image.network(
                                thread.userPhotoUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return const Icon(
                                    Icons.person,
                                    color: Colors.white,
                                    size: 20,
                                  );
                                },
                              ),
                            )
                          : const Icon(
                              Icons.person,
                              color: Colors.white,
                              size: 20,
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            thread.userDisplayName ?? 'User',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1a1a1a),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            thread.content,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF333333),
                              height: 1.3,
                            ),
                          ),
                          // Display thread image if available
                          if (thread.imageUrl != null &&
                              thread.imageUrl!.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                thread.imageUrl!,
                                fit: BoxFit.cover,
                                width: double.infinity,
                                loadingBuilder:
                                    (context, child, loadingProgress) {
                                  if (loadingProgress == null) return child;
                                  return Container(
                                    height: 120,
                                    color: Colors.grey.shade200,
                                    child: const Center(
                                      child: CircularProgressIndicator(),
                                    ),
                                  );
                                },
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    height: 120,
                                    color: Colors.grey.shade200,
                                    child: Icon(
                                      Icons.broken_image,
                                      size: 30,
                                      color: Colors.grey.shade400,
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                          const SizedBox(height: 4),
                          Text(
                            _formatDate(thread.createdAt),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF999999),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
          // Add thread input (only show when thread icon is clicked)
          if (showThreadInput) ...[
            const SizedBox(height: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image preview if selected
                if (_selectedThreadImage != null) ...[
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(
                          _selectedThreadImage!,
                          height: 120,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: GestureDetector(
                          onTap: _removeThreadImage,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.6),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                ],
                // Input row
                Row(
                  children: [
                    // Image picker button
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F0FF),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: IconButton(
                        icon: const Icon(
                          Icons.image_outlined,
                          color: Color(0xFF2E4F99),
                          size: 20,
                        ),
                        onPressed: _pickThreadImage,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _threadController,
                        decoration: const InputDecoration(
                          hintText: 'Add a thread...',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.all(Radius.circular(32)),
                          ),
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: _isAddingThread
                            ? Colors.grey.shade400
                            : const Color(0xFFE8F0FF),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: _isAddingThread
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Color(0xFF2E4F99),
                                ),
                              ),
                            )
                          : IconButton(
                              icon: const Icon(
                                Icons.send_rounded,
                                color: Color(0xFF2E4F99),
                                size: 22,
                              ),
                              onPressed: _addThread,
                              padding: const EdgeInsets.only(left: 2),
                              constraints: const BoxConstraints(),
                            ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 0) {
      return '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h ago';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

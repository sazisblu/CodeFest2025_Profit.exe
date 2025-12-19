import 'package:flutter/material.dart';
import '../models/thread_model.dart';
import '../services/post_service.dart';
import '../services/auth_service.dart';

/// X (Twitter) style thread widget with nested replies
class XStyleThreadWidget extends StatefulWidget {
  final ThreadModel thread;
  final VoidCallback onUpdate;
  final bool isReply; // true if this is a nested reply

  const XStyleThreadWidget({
    super.key,
    required this.thread,
    required this.onUpdate,
    this.isReply = false,
  });

  @override
  State<XStyleThreadWidget> createState() => _XStyleThreadWidgetState();
}

class _XStyleThreadWidgetState extends State<XStyleThreadWidget> {
  final PostService _postService = PostService();
  final AuthService _authService = AuthService();
  bool _hasLiked = false;
  bool _isProcessing = false;
  bool _showReplyInput = false;
  final TextEditingController _replyController = TextEditingController();
  late int _likeCount;
  late int _replyCount;

  @override
  void initState() {
    super.initState();
    _likeCount = widget.thread.likesCount;
    _replyCount = widget.thread.repliesCount;
    _checkIfLiked();
  }

  Future<void> _checkIfLiked() async {
    final user = _authService.currentUser;
    if (user != null) {
      _hasLiked = await _postService.hasUserLikedThread(
        widget.thread.id,
        user.id,
      );
      if (mounted) setState(() {});
    }
  }

  Future<void> _handleLike() async {
    final user = _authService.currentUser;
    if (user == null || _isProcessing) return;

    setState(() => _isProcessing = true);

    try {
      final newLikeState = await _postService.toggleThreadLike(
        widget.thread.id,
        user.id,
      );

      if (mounted) {
        setState(() {
          _hasLiked = newLikeState;
          _likeCount = newLikeState ? _likeCount + 1 : _likeCount - 1;
        });
      }

      Future.delayed(const Duration(milliseconds: 300), widget.onUpdate);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _addReply() async {
    final user = _authService.currentUser;
    if (user == null || _replyController.text.trim().isEmpty) return;

    try {
      await _postService.addThread(
        postId: widget.thread.postId,
        userId: user.id,
        content: _replyController.text.trim(),
        parentThreadId: widget.thread.id,
      );

      _replyController.clear();
      setState(() {
        _showReplyInput = false;
        _replyCount++;
      });
      widget.onUpdate();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error adding reply: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Main thread
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left side: Avatar and vertical line
            Column(
              children: [
                // Avatar
                Container(
                  width: widget.isReply ? 32 : 40,
                  height: widget.isReply ? 32 : 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFF2E4F99),
                        const Color(0xFF5B7FC7),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: widget.thread.userPhotoUrl != null
                      ? ClipOval(
                          child: Image.network(
                            widget.thread.userPhotoUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Icon(
                                Icons.person,
                                color: Colors.white,
                                size: widget.isReply ? 16 : 20,
                              );
                            },
                          ),
                        )
                      : Icon(
                          Icons.person,
                          color: Colors.white,
                          size: widget.isReply ? 16 : 20,
                        ),
                ),
                // Vertical line (only if there are replies)
                if (widget.thread.replies.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Container(
                    width: 2,
                    height: 20,
                    color: const Color(0xFFE0E0E0),
                  ),
                ],
              ],
            ),
            const SizedBox(width: 12),
            // Right side: Thread content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // User info row
                  Row(
                    children: [
                      Text(
                        widget.thread.userDisplayName ?? 'User',
                        style: TextStyle(
                          fontSize: widget.isReply ? 14 : 15,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF1a1a1a),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _formatDate(widget.thread.createdAt),
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF666666),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  // Thread content
                  Text(
                    widget.thread.content,
                    style: TextStyle(
                      fontSize: widget.isReply ? 14 : 15,
                      color: const Color(0xFF1a1a1a),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Action buttons
                  Row(
                    children: [
                      // Like button
                      GestureDetector(
                        onTap: _isProcessing ? null : _handleLike,
                        child: Row(
                          children: [
                            Icon(
                              _hasLiked
                                  ? Icons.favorite
                                  : Icons.favorite_border,
                              size: widget.isReply ? 16 : 18,
                              color: _hasLiked
                                  ? const Color(0xFFE91E63)
                                  : const Color(0xFF666666),
                            ),
                            if (_likeCount > 0) ...[
                              const SizedBox(width: 4),
                              Text(
                                '$_likeCount',
                                style: TextStyle(
                                  fontSize: widget.isReply ? 12 : 13,
                                  color: const Color(0xFF666666),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(width: 24),
                      // Reply button
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _showReplyInput = !_showReplyInput;
                          });
                        },
                        child: Row(
                          children: [
                            Icon(
                              Icons.chat_bubble_outline,
                              size: widget.isReply ? 16 : 18,
                              color: const Color(0xFF666666),
                            ),
                            if (_replyCount > 0) ...[
                              const SizedBox(width: 4),
                              Text(
                                '$_replyCount',
                                style: TextStyle(
                                  fontSize: widget.isReply ? 12 : 13,
                                  color: const Color(0xFF666666),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(width: 24),
                      // Share button (placeholder)
                      Icon(
                        Icons.share_outlined,
                        size: widget.isReply ? 16 : 18,
                        color: const Color(0xFF666666),
                      ),
                    ],
                  ),
                  // Reply input
                  if (_showReplyInput) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFF5F5F5),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: const Color(0xFFE0E0E0),
                              ),
                            ),
                            child: TextField(
                              controller: _replyController,
                              decoration: const InputDecoration(
                                hintText: 'Post your reply',
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                                hintStyle: TextStyle(
                                  color: Color(0xFF999999),
                                  fontSize: 14,
                                ),
                              ),
                              maxLines: null,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: _addReply,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: Color(0xFF2E4F99),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.send,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ],
        ),
        // Nested replies
        if (widget.thread.replies.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.only(left: 20),
            child: Column(
              children: widget.thread.replies.map((reply) {
                return Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: XStyleThreadWidget(
                    thread: reply,
                    onUpdate: widget.onUpdate,
                    isReply: true,
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ],
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 0) {
      return '${diff.inDays}d';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m';
    } else {
      return 'now';
    }
  }
}

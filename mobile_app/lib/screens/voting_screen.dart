import 'package:flutter/material.dart';
import 'proposal_detail_screen.dart';
import 'package:confetti/confetti.dart';

class VotingScreen extends StatefulWidget {
  const VotingScreen({super.key});

  @override
  State<VotingScreen> createState() => _VotingScreenState();
}

class _VotingScreenState extends State<VotingScreen> {
  late ConfettiController _confettiController;
  bool hasVoted = false;
  int? votedProposalIndex;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(milliseconds: 800));
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  final List<Map<String, dynamic>> proposals = [
    {
      'id': '1',
      'title': 'Road Rehabilitation',
      'description': 'Repair 2.3km of deteriorated roads affecting 1,200 residents. Includes resurfacing and drainage improvements.',
      'budget': 'NPR 5,00,000',
      'votes': '1024',
      'location': 'Ward 5, Kathmandu',
      'timeline': '6 months',
      'isVoted': false,
    },
    {
      'id': '2',
      'title': 'Community Waste Sorting Facility',
      'description': 'Establish a centralized waste sorting facility to improve recycling and waste management in the community.',
      'budget': 'NPR 10,00,000',
      'votes': '756',
      'location': 'Ward 3, Kathmandu',
      'timeline': '8 months',
      'isVoted': false,
    },
    {
      'id': '3',
      'title': 'Community Health Center Upgrade',
      'description': 'Modernize the local health center with new medical equipment and facility improvements.',
      'budget': 'NPR 15,00,000',
      'votes': '892',
      'location': 'Ward 7, Kathmandu',
      'timeline': '12 months',
      'isVoted': false,
    },
    {
      'id': '4',
      'title': 'Public Park Development',
      'description': 'Create a new public park with playground equipment, walking paths, and green spaces.',
      'budget': 'NPR 8,00,000',
      'votes': '645',
      'location': 'Ward 2, Kathmandu',
      'timeline': '4 months',
      'isVoted': false,
    },
    {
      'id': '5',
      'title': 'Street Lighting Installation',
      'description': 'Install LED street lights across major roads to improve safety and visibility during night hours.',
      'budget': 'NPR 3,50,000',
      'votes': '523',
      'location': 'Ward 1, Kathmandu',
      'timeline': '3 months',
      'isVoted': false,
    },
  ];

  String selectedFilter = 'All';
  final List<String> filterOptions = ['All', 'Infrastructure', 'Health', 'Environment', 'Recreation'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Vote for Proposals',
          style: TextStyle(
            color: Color(0xFF2E4F99),
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF2E4F99)),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Header Card
              Container(
            margin: const EdgeInsets.all(16.0),
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2E4F99), Color(0xFF4A6FBF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Community Voting',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Your voice matters! Vote for the proposals you believe will benefit our community the most.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Icon(
                      hasVoted ? Icons.check_circle : Icons.how_to_vote,
                      color: Colors.white70,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      hasVoted ? 'You have voted!' : 'Select one proposal to vote',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Filter Row
          Container(
            height: 50,
            margin: const EdgeInsets.symmetric(horizontal: 16.0),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: filterOptions.length,
              itemBuilder: (context, index) {
                final filter = filterOptions[index];
                final isSelected = selectedFilter == filter;
                return Container(
                  margin: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        selectedFilter = filter;
                      });
                    },
                    selectedColor: const Color(0xFF2E4F99).withOpacity(0.2),
                    checkmarkColor: const Color(0xFF2E4F99),
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF2E4F99) : Colors.grey,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 16),

          // Proposals List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              itemCount: proposals.length,
              itemBuilder: (context, index) {
                final proposal = proposals[index];
                return _buildVotingProposalCard(proposal, index);
              },
            ),
          ),
        ],
      ),
          // Confetti Widget
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirection: 3.14159 / 2, // Downward
              particleDrag: 0.1,
              emissionFrequency: 0.1,
              numberOfParticles: 15,
              gravity: 0.1,
              shouldLoop: false,
              colors: const [
                Colors.green,
                Colors.blue,
                Colors.pink,
                Colors.orange,
                Colors.purple,
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: hasVoted
          ? FloatingActionButton.extended(
              onPressed: () {
                _showVotingSummary(context);
              },
              backgroundColor: const Color(0xFF2E4F99),
              foregroundColor: Colors.white,
              icon: const Icon(Icons.ballot),
              label: const Text('View My Votes'),
            )
          : null,
    );
  }

  Widget _buildVotingProposalCard(Map<String, dynamic> proposal, int index) {
    final isVoted = proposal['isVoted'] as bool;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: isVoted 
            ? Border.all(color: Color(0xFF1976D2), width: 2) 
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  proposal['title'] as String,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2E4F99),
                  ),
                ),
              ),
              if (isVoted)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'VOTED',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            proposal['description'] as String,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.grey,
              height: 1.4,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          
          // Budget and Location Row
          Row(
            children: [
              Icon(
                Icons.account_balance_wallet,
                size: 16,
                color: Colors.grey[600],
              ),
              const SizedBox(width: 4),
              Text(
                proposal['budget'] as String,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF2E4F99),
                ),
              ),
              const SizedBox(width: 16),
              Icon(
                Icons.location_on,
                size: 16,
                color: Colors.grey[600],
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  proposal['location'] as String,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          
          // Vote Count and Action Buttons Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    isVoted ? Icons.favorite : Icons.favorite_border,
                    size: 16,
                    color: isVoted ? Color(0xFF1976D2) : Colors.grey,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${proposal['votes']} votes',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ProposalDetailScreen(
                            title: proposal['title'] as String,
                            description: proposal['description'] as String,
                            budget: proposal['budget'] as String,
                            votes: proposal['votes'] as String,
                            location: proposal['location'] as String,
                            timeline: proposal['timeline'] as String,
                          ),
                        ),
                      );
                    },
                    child: const Text(
                      'Details',
                      style: TextStyle(
                        color: Color(0xFF2E4F99),
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: (hasVoted && !isVoted) ? null : (isVoted ? null : () => _voteForProposal(index)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isVoted ? Color(0xFF1976D2) : const Color(0xFF2E4F99),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      elevation: isVoted ? 0 : 1,
                    ),
                    child: Text(
                      isVoted ? 'Voted' : (hasVoted ? 'Cannot Vote' : 'Vote'),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _voteForProposal(int index) {
    if (hasVoted) return;
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirm Vote'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Are you sure you want to vote for "${proposals[index]['title']}"?'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.orange.withOpacity(0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.warning_amber, color: Colors.orange, size: 20),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'You can only vote for ONE proposal. This action cannot be undone.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.orange,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  hasVoted = true;
                  votedProposalIndex = index;
                  proposals[index]['isVoted'] = true;
                  // Increment vote count
                  final currentVotes = int.parse(proposals[index]['votes'].toString());
                  proposals[index]['votes'] = (currentVotes + 1).toString();
                });
                Navigator.of(context).pop();
                
                // Trigger confetti animation
                _confettiController.play();
                
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Row(
                      children: [
                        const Icon(Icons.celebration, color: Colors.white),
                        const SizedBox(width: 8),
                        Text('Vote submitted for "${proposals[index]['title']}"!'),
                      ],
                    ),
                    backgroundColor: Color(0xFF1976D2),
                    duration: const Duration(seconds: 4),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E4F99),
                foregroundColor: Colors.white,
              ),
              child: const Text('Vote'),
            ),
          ],
        );
      },
    );
  }

  void _showVotingSummary(BuildContext context) {
    final votedProposals = proposals.where((p) => p['isVoted']).toList();
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.5,
          maxChildSize: 0.8,
          minChildSize: 0.3,
          expand: false,
          builder: (context, scrollController) {
            return Container(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Text(
                    'My Votes',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2E4F99),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.builder(
                      controller: scrollController,
                      itemCount: votedProposals.length,
                      itemBuilder: (context, index) {
                        final proposal = votedProposals[index];
                        return ListTile(
                          leading: const Icon(Icons.check_circle, color: Colors.green),
                          title: Text(proposal['title'] as String),
                          subtitle: Text(proposal['budget'] as String),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
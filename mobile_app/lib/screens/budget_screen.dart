import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../widgets/custom_app_bar.dart';
import '../models/budget_model.dart';
import 'budget_proposal_detail_screen.dart';

class BudgetScreen extends StatelessWidget {
  const BudgetScreen({super.key});

  static final List<BudgetAllocation> budgetAllocations = [
    BudgetAllocation(
      category: 'Roads & Infrastructure',
      percentage: 64.0,
      amount: 128000000,
      color: const Color(0xFF2E4F99),
    ),
    BudgetAllocation(
      category: 'Community Safety',
      percentage: 12.0,
      amount: 24000000,
      color: const Color(0xFF8E44AD),
    ),
    BudgetAllocation(
      category: 'Waste Management',
      percentage: 8.0,
      amount: 16000000,
      color: const Color(0xFFE74C3C),
    ),
    BudgetAllocation(
      category: 'Parks & Greenery',
      percentage: 8.0,
      amount: 16000000,
      color: const Color(0xFFF39C12),
    ),
    BudgetAllocation(
      category: 'Water Supply & Sanitation',
      percentage: 8.0,
      amount: 16000000,
      color: const Color(0xFF27AE60),
    ),
  ];

  static final List<FundedProposal> fundedProposals = [
    FundedProposal(
      id: '1',
      title: 'Road Expansion Project - Baneshwor',
      description: 'Major road expansion project to ease traffic congestion in Baneshwor area with modern infrastructure.',
      budget: 'NPR 45,00,000',
      status: 'In Progress',
      location: 'Ward 5, Baneshwor',
      timeline: '8 months',
      category: 'Roads & Infrastructure',
      progress: 0.35,
      startDate: DateTime(2024, 8, 15),
      expectedEndDate: DateTime(2025, 4, 15),
      milestones: [
        'Environmental Impact Assessment - Completed',
        'Land Acquisition - Completed',
        'Construction Phase 1 - In Progress',
        'Utility Relocation - Pending',
        'Final Construction - Pending',
      ],
    ),
    FundedProposal(
      id: '2',
      title: 'Community Park Development',
      description: 'Development of a modern community park with playground facilities and green spaces.',
      budget: 'NPR 12,00,000',
      status: 'In Progress',
      location: 'Ward 3, Lalitpur',
      timeline: '4 months',
      category: 'Parks & Greenery',
      progress: 0.65,
      startDate: DateTime(2024, 10, 1),
      expectedEndDate: DateTime(2025, 2, 1),
      milestones: [
        'Site Preparation - Completed',
        'Landscaping - Completed',
        'Equipment Installation - In Progress',
        'Safety Measures - Pending',
      ],
    ),
    FundedProposal(
      id: '3',
      title: 'Water Supply System Upgrade',
      description: 'Upgrading the water supply system to provide clean drinking water to 500+ households.',
      budget: 'NPR 18,50,000',
      status: 'Planning',
      location: 'Ward 7, Bhaktapur',
      timeline: '6 months',
      category: 'Water Supply & Sanitation',
      progress: 0.15,
      startDate: DateTime(2024, 12, 1),
      expectedEndDate: DateTime(2025, 6, 1),
      milestones: [
        'Technical Assessment - Completed',
        'Pipeline Planning - In Progress',
        'Construction - Pending',
        'Testing & Commissioning - Pending',
      ],
    ),
    FundedProposal(
      id: '4',
      title: 'Enhanced Street Lighting',
      description: 'Installation of LED street lights and security cameras for improved community safety.',
      budget: 'NPR 8,75,000',
      status: 'In Progress',
      location: 'Ward 2, Kathmandu',
      timeline: '3 months',
      category: 'Community Safety',
      progress: 0.80,
      startDate: DateTime(2024, 11, 1),
      expectedEndDate: DateTime(2025, 2, 1),
      milestones: [
        'Site Survey - Completed',
        'Equipment Procurement - Completed',
        'Installation - In Progress',
        'Testing - Pending',
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Budget'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBudgetHeader(),
            const SizedBox(height: 24),
            _buildAllocationBreakdown(),
            const SizedBox(height: 32),
            _buildFundedProposalsSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildBudgetHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Community Budget:',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF2E4F99),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Fiscal Year: 2080-2081 B.S.',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                'Amount Allocated: ',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[700],
                ),
              ),
              Text(
                'NPR 2,00,00,000',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF2E4F99),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAllocationBreakdown() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Allocation Breakdown:',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF2E4F99),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 250,
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 0,
                sections: budgetAllocations.map((allocation) {
                  return PieChartSectionData(
                    color: allocation.color,
                    value: allocation.percentage,
                    title: '${allocation.percentage.toInt()}%',
                    radius: 100,
                    titleStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 20),
          ...budgetAllocations.map((allocation) => _buildLegendItem(allocation)),
        ],
      ),
    );
  }

  Widget _buildLegendItem(BudgetAllocation allocation) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: allocation.color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              allocation.category,
              style: const TextStyle(fontSize: 14),
            ),
          ),
          Text(
            '${allocation.percentage.toInt()}%',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFundedProposalsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Funded Proposals',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF2E4F99),
          ),
        ),
        const SizedBox(height: 16),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: fundedProposals.length,
          itemBuilder: (context, index) {
            final proposal = fundedProposals[index];
            return _buildProposalCard(context, proposal);
          },
        ),
      ],
    );
  }

  Widget _buildProposalCard(BuildContext context, FundedProposal proposal) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        proposal.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2E4F99),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getStatusColor(proposal.status).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        proposal.status,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: _getStatusColor(proposal.status),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  proposal.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        proposal.location,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                    Text(
                      proposal.budget,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2E4F99),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Progress',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        Text(
                          '${(proposal.progress * 100).toInt()}%',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF2E4F99),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: proposal.progress,
                      backgroundColor: Colors.grey[300],
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _getStatusColor(proposal.status),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(12),
                bottomRight: Radius.circular(12),
              ),
            ),
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => BudgetProposalDetailScreen(proposal: proposal),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E4F99),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'View Details',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'in progress':
        return const Color(0xFFF39C12);
      case 'completed':
        return const Color(0xFF27AE60);
      case 'planning':
        return const Color(0xFF3498DB);
      default:
        return const Color(0xFF95A5A6);
    }
  }
}

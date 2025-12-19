import 'package:flutter/material.dart';

class BudgetAllocation {
  final String category;
  final double percentage;
  final double amount;
  final Color color;

  BudgetAllocation({
    required this.category,
    required this.percentage,
    required this.amount,
    required this.color,
  });
}

class FundedProposal {
  final String id;
  final String title;
  final String description;
  final String budget;
  final String status;
  final String location;
  final String timeline;
  final String category;
  final double progress;
  final DateTime startDate;
  final DateTime expectedEndDate;
  final List<String> milestones;

  FundedProposal({
    required this.id,
    required this.title,
    required this.description,
    required this.budget,
    required this.status,
    required this.location,
    required this.timeline,
    required this.category,
    required this.progress,
    required this.startDate,
    required this.expectedEndDate,
    required this.milestones,
  });
}
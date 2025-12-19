import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'profile_screen.dart';
import 'proposals_screen.dart';
import 'budget_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const ProposalsScreen(),
    const BudgetScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    const double leftMargin = 0.0; // Left spacing
    const double rightMargin = 0.0; // Right spacing
    const double bottomMargin =
        0.0; // Bottom spacing (NEGATIVE = closer to bottom edge)
    const double topMargin = 0.0; // Top spacing (if needed)
    const double borderRadius = 50.0; // Rounded corners

    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
          margin: EdgeInsets.only(
            left: leftMargin,
            right: rightMargin,
            bottom: bottomMargin,
            top: topMargin,
          ),
          // Removed extra decoration and border radius for a flat look
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.white,
            elevation: 0,
            selectedItemColor: const Color(
              0xFF2E4F99,
            ), // Dark blue for selected
            unselectedItemColor: const Color(
              0xFFB8C5D6,
            ), // Light blue for unselected
            showSelectedLabels: false,
            showUnselectedLabels: false,
            items: [
              BottomNavigationBarItem(
                icon: Icon(
                  Icons.home_rounded,
                  color: _currentIndex == 0
                      ? const Color(0xFF2E4F99)
                      : const Color(0xFFB8C5D6),
                  size: 32,
                ),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Icon(
                  Icons.bookmark_rounded,
                  color: _currentIndex == 1
                      ? const Color(0xFF2E4F99)
                      : const Color(0xFFB8C5D6),
                  size: 32,
                ),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Icon(
                  Icons.pie_chart_outline_sharp,
                  color: _currentIndex == 2
                      ? const Color(0xFF2E4F99)
                      : const Color(0xFFB8C5D6),
                  size: 32,
                ),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Icon(
                  Icons.people_rounded,
                  color: _currentIndex == 3
                      ? const Color(0xFF2E4F99)
                      : const Color(0xFFB8C5D6),
                  size: 32,
                ),
                label: '',
              ),
            ],
          ),
        ),
    );
  }
}



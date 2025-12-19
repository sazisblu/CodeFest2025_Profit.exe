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
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(24), // Rounded top corners only
            topRight: Radius.circular(24),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1), // Shadow color
              blurRadius: 10, // How blurred the shadow is
              offset: const Offset(0, -3), // Position of shadow
              spreadRadius: 0,
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: const Color(0xFF2E4F99),
          unselectedItemColor: const Color(0xFFB8C5D6),
          showSelectedLabels: false,
          showUnselectedLabels: false,
          items: [
            BottomNavigationBarItem(
              icon: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Icon(
                  Icons.home_rounded,
                  color: _currentIndex == 0
                      ? const Color(0xFF2E4F99)
                      : const Color(0xFFB8C5D6),
                  size: 36,
                ),
              ),
              label: '',
            ),
            BottomNavigationBarItem(
              icon: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Icon(
                  Icons.bookmark_rounded,
                  color: _currentIndex == 1
                      ? const Color(0xFF2E4F99)
                      : const Color(0xFFB8C5D6),
                  size: 36,
                ),
              ),
              label: '',
            ),
            BottomNavigationBarItem(
              icon: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Icon(
                  Icons.pie_chart_outline_sharp,
                  color: _currentIndex == 2
                      ? const Color(0xFF2E4F99)
                      : const Color(0xFFB8C5D6),
                  size: 36,
                ),
              ),
              label: '',
            ),
            BottomNavigationBarItem(
              icon: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Icon(
                  Icons.people_rounded,
                  color: _currentIndex == 3
                      ? const Color(0xFF2E4F99)
                      : const Color(0xFFB8C5D6),
                  size: 36,
                ),
              ),
              label: '',
            ),
          ],
        ),
      ),
    );
  }
}

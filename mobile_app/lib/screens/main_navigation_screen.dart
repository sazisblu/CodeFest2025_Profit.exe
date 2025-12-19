import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'profile_screen.dart';
import '../widgets/custom_app_bar.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const BookmarksScreen(),
    const BudgetScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    // 🎯 ADJUST THESE VALUES TO CONTROL NAVBAR POSITION
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
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(borderRadius),
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
                icon: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _currentIndex == 0
                        ? const Color(0xFF2E4F99)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    Icons.home_rounded,
                    color: _currentIndex == 0
                        ? Colors.white
                        : const Color(0xFFB8C5D6),
                    size: 32,
                  ),
                ),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _currentIndex == 1
                        ? const Color(0xFF2E4F99)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    Icons.bookmark_rounded,
                    color: _currentIndex == 1
                        ? Colors.white
                        : const Color(0xFFB8C5D6),
                    size: 32,
                  ),
                ),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _currentIndex == 2
                        ? const Color(0xFF2E4F99)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    Icons.pie_chart_outline_sharp,
                    color: _currentIndex == 2
                        ? Colors.white
                        : const Color(0xFFB8C5D6),
                    size: 32,
                  ),
                ),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _currentIndex == 3
                        ? const Color(0xFF2E4F99)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    Icons.people_rounded,
                    color: _currentIndex == 3
                        ? Colors.white
                        : const Color(0xFFB8C5D6),
                    size: 32,
                  ),
                ),
                label: '',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Placeholder screens - you can replace these with your actual screens
class BookmarksScreen extends StatelessWidget {
  const BookmarksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Bookmarks'),
      body: const Center(
        child: Text('Bookmarks Screen', style: TextStyle(fontSize: 24)),
      ),
    );
  }
}

class BudgetScreen extends StatelessWidget {
  const BudgetScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Budget'),
      body: const Center(
        child: Text('Budget Screen', style: TextStyle(fontSize: 24)),
      ),
    );
  }
}

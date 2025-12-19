import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart' as app_state;

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hamro Chautari'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          BlocBuilder<AuthBloc, app_state.AuthState>(
            builder: (context, state) {
              if (state is app_state.AuthAuthenticated) {
                return PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'logout') {
                      context.read<AuthBloc>().add(AuthSignOutRequested());
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 'logout', child: Text('Logout')),
                  ],
                );
              }
              return Container();
            },
          ),
        ],
      ),
      body: BlocBuilder<AuthBloc, app_state.AuthState>(
        builder: (context, state) {
          if (state is app_state.AuthAuthenticated) {
            return Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Welcome!',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Email: ${state.user.email}',
                            style: const TextStyle(fontSize: 16),
                          ),
                          if (state.user.userMetadata?['full_name'] != null)
                            Text(
                              'Name: ${state.user.userMetadata!['full_name']}',
                              style: const TextStyle(fontSize: 16),
                            ),
                          const SizedBox(height: 8),
                          Text(
                            'User ID: ${state.user.id}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'App Features',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Expanded(
                    child: ListView(
                      children: const [
                        ListTile(
                          leading: Icon(Icons.chat),
                          title: Text('Community Chat'),
                          subtitle: Text('Connect with your community'),
                        ),
                        ListTile(
                          leading: Icon(Icons.event),
                          title: Text('Events'),
                          subtitle: Text('Discover local events'),
                        ),
                        ListTile(
                          leading: Icon(Icons.people),
                          title: Text('Groups'),
                          subtitle: Text('Join interest groups'),
                        ),
                        ListTile(
                          leading: Icon(Icons.newspaper),
                          title: Text('News'),
                          subtitle: Text('Stay updated with news'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }
}

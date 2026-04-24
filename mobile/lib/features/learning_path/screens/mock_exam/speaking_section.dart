import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
 
class SpeakingSection extends ConsumerStatefulWidget {
  const SpeakingSection({super.key});

  @override
  ConsumerState<SpeakingSection> createState() => _SpeakingSectionState();
}

class _SpeakingSectionState extends ConsumerState<SpeakingSection> {
  int _currentPart = 1;
  bool _isRecording = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: GlassContainer(
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(3, (index) {
                    final part = index + 1;
                    final isActive = part == _currentPart;
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFF10B981) : Colors.white10,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        "PART $part",
                        style: TextStyle(
                          color: isActive ? Colors.white : Colors.white38,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 20),
                const CircleAvatar(
                  radius: 40,
                  backgroundColor: Color(0xFF1E293B),
                  child: Icon(Icons.face, color: Color(0xFF10B981), size: 40),
                ),
                const SizedBox(height: 12),
                const Text(
                  "IELTS AI Examiner",
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                const Text(
                  "Online • Interview in progress",
                  style: TextStyle(color: Color(0xFF10B981), fontSize: 12),
                ),
              ],
            ),
          ),
        ),
        
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: GlassContainer(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Part $_currentPart: ${_getPartTitle()}",
                      style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0),
                      child: Text(
                        _getPartDescription(),
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 16, height: 1.5),
                      ),
                    ),
                    const SizedBox(height: 40),
                    _buildOrbUI(),
                  ],
                ),
              ),
            ),
          ),
        ),

        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              if (_currentPart < 3)
                ElevatedButton(
                  onPressed: () => setState(() => _currentPart++),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white10,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text("Next Part"),
                ),
            ],
          ),
        ),
      ],
    );
  }

  String _getPartTitle() {
    switch (_currentPart) {
      case 1: return "Introduction & Interview";
      case 2: return "Individual Long Turn";
      case 3: return "Two-way Discussion";
      default: return "";
    }
  }

  String _getPartDescription() {
    switch (_currentPart) {
      case 1: return "I will ask you some general questions about yourself and a range of familiar topics.";
      case 2: return "I'm going to give you a topic and I'd like you to talk about it for one to two minutes.";
      case 3: return "We will discuss some more abstract issues and questions related to the topic in Part 2.";
      default: return "";
    }
  }

  Widget _buildOrbUI() {
    return GestureDetector(
      onTap: () => setState(() => _isRecording = !_isRecording),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Pulse animations could be added here
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: _isRecording 
                  ? [const Color(0xFF10B981), const Color(0xFF059669)]
                  : [Colors.white24, Colors.white10],
              ),
              boxShadow: _isRecording ? [
                BoxShadow(
                  color: const Color(0xFF10B981).withOpacity(0.5),
                  blurRadius: 20,
                  spreadRadius: 5,
                )
              ] : [],
            ),
            child: Icon(
              _isRecording ? Icons.mic : Icons.mic_none,
              color: Colors.white,
              size: 32,
            ),
          ),
          if (_isRecording)
            const SizedBox(
              width: 100,
              height: 100,
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                strokeWidth: 2,
              ),
            ),
        ],
      ),
    );
  }
}

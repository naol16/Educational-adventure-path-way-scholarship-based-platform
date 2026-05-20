import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:lucide_icons/lucide_icons.dart';

class CustomTextField extends StatefulWidget {
  final String hintText;
  final IconData? prefixIcon;
  final bool isPassword;
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;
  final TextInputType keyboardType;
  final int maxLines;
  final Iterable<String>? autofillHints;
  final String? errorText;
  final bool hasError;
  final List<TextInputFormatter>? inputFormatters;

  const CustomTextField({
    super.key,
    required this.hintText,
    this.prefixIcon,
    this.isPassword = false,
    required this.controller,
    this.onChanged,
    this.keyboardType = TextInputType.text,
    this.maxLines = 1,
    this.autofillHints,
    this.errorText,
    this.hasError = false,
    this.inputFormatters,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  late bool _obscureText;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.isPassword;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          height: widget.maxLines > 1 ? null : 56,
          decoration: BoxDecoration(
            color: DesignSystem.inputFill(context),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: widget.hasError ? Colors.red.shade400 : Colors.transparent,
              width: 1.5,
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 18),
          alignment: Alignment.center,
          child: TextField(
            controller: widget.controller,
            obscureText: _obscureText,
            onChanged: widget.onChanged,
            keyboardType: widget.keyboardType,
            maxLines: widget.maxLines,
            autofillHints: widget.autofillHints,
            inputFormatters: widget.inputFormatters,
            style: DesignSystem.bodyStyle(
              buildContext: context,
              fontSize: 15,
              color: DesignSystem.mainText(context),
            ),
            decoration: InputDecoration(
              hintText: widget.hintText,
              hintStyle: DesignSystem.bodyStyle(
                buildContext: context,
                color: DesignSystem.labelText(context),
                fontSize: 14,
              ),
              prefixIcon: widget.prefixIcon != null
                  ? Icon(
                      widget.prefixIcon,
                      color: widget.hasError ? Colors.red.shade400 : DesignSystem.labelText(context),
                      size: 20,
                    )
                  : null,
              suffixIcon: widget.isPassword
                  ? GestureDetector(
                      onTap: () {
                        setState(() {
                          _obscureText = !_obscureText;
                        });
                      },
                      child: Icon(
                        _obscureText ? LucideIcons.eyeOff : LucideIcons.eye,
                        color: DesignSystem.labelText(context),
                        size: 20,
                      ),
                    )
                  : null,
              border: InputBorder.none,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
        if (widget.hasError && widget.errorText != null)
          Padding(
            padding: const EdgeInsets.only(left: 12, top: 6, bottom: 8),
            child: Text(
              widget.errorText!,
              style: const TextStyle(
                color: Colors.red,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          )
        else
          const SizedBox(height: 16),
      ],
    );
  }
}

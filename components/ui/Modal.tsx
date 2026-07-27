import { KeyboardAvoidingView, Modal as RNModal, Platform, Pressable, Text, View } from "react-native";
import { type ReactNode } from "react";
import { X } from "lucide-react-native";
import { colors } from "@/lib/colors";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          onPress={onClose}
          className="flex-1 items-center justify-center bg-black/70 px-5"
        >
          {/* Absorb taps so pressing the card doesn't close the modal */}
          <Pressable
            onPress={() => {}}
            className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
          >
            {title ? (
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-white">{title}</Text>
                <Pressable onPress={onClose} hitSlop={10}>
                  <X size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            ) : null}
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

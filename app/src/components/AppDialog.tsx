import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, radius, shadow } from "../theme";

type ButtonKind = "primary" | "cancel" | "destructive";
type DialogButton = { label: string; kind?: ButtonKind; onPress?: () => void };
type DialogState = {
  visible: boolean;
  title?: string;
  message?: string;
  icon?: string;
  buttons: DialogButton[];
};

type ConfirmOptions = {
  title: string;
  message?: string;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type DialogContextValue = {
  alert: (title: string, message?: string, icon?: string) => void;
  confirm: (opts: ConfirmOptions) => void;
};

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({
    visible: false,
    buttons: [],
  });

  const close = useCallback(
    () => setState((s) => ({ ...s, visible: false })),
    [],
  );

  const alert = useCallback<DialogContextValue["alert"]>(
    (title, message, icon) =>
      setState({
        visible: true,
        title,
        message,
        icon: icon ?? "ℹ️",
        buttons: [{ label: "OK", kind: "primary" }],
      }),
    [],
  );

  const confirm = useCallback<DialogContextValue["confirm"]>(
    (o) =>
      setState({
        visible: true,
        title: o.title,
        message: o.message,
        icon: o.icon ?? (o.destructive ? "⚠️" : "❓"),
        buttons: [
          { label: o.cancelLabel ?? "Cancel", kind: "cancel", onPress: o.onCancel },
          {
            label: o.confirmLabel ?? "Confirm",
            kind: o.destructive ? "destructive" : "primary",
            onPress: o.onConfirm,
          },
        ],
      }),
    [],
  );

  const press = (btn: DialogButton) => {
    close();
    btn.onPress?.();
  };

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            {!!state.icon && (
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>{state.icon}</Text>
              </View>
            )}
            {!!state.title && <Text style={styles.title}>{state.title}</Text>}
            {!!state.message && (
              <Text style={styles.message}>{state.message}</Text>
            )}

            <View
              style={[
                styles.buttonRow,
                state.buttons.length > 1 ? styles.row : styles.col,
              ]}
            >
              {state.buttons.map((btn, i) => (
                <Button
                  key={i}
                  btn={btn}
                  flex={state.buttons.length > 1}
                  onPress={() => press(btn)}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </DialogContext.Provider>
  );
}

function Button({
  btn,
  flex,
  onPress,
}: {
  btn: DialogButton;
  flex?: boolean;
  onPress: () => void;
}) {
  const kind = btn.kind ?? "primary";
  const wrap = [styles.btnWrap, flex && styles.btnFlex];

  if (kind === "primary") {
    return (
      <TouchableOpacity style={wrap} activeOpacity={0.88} onPress={onPress}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btn}
        >
          <Text style={styles.btnTextLight}>{btn.label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (kind === "destructive") {
    return (
      <TouchableOpacity
        style={[...wrap, styles.btn, styles.destructive]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Text style={styles.btnTextLight}>{btn.label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={[...wrap, styles.btn, styles.cancel]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={styles.btnTextMuted}>{btn.label}</Text>
    </TouchableOpacity>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(8, 30, 24, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: "center",
    ...shadow.raised,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  icon: { fontSize: 26 },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  buttonRow: { marginTop: 22, width: "100%", gap: 10 },
  row: { flexDirection: "row" },
  col: { flexDirection: "column", alignItems: "stretch" },
  btnWrap: { borderRadius: radius.md, overflow: "hidden" },
  btnFlex: { flex: 1 },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  destructive: { backgroundColor: colors.danger },
  cancel: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnTextLight: { color: colors.onBrand, fontSize: 15, fontWeight: "800" },
  btnTextMuted: { color: colors.textMuted, fontSize: 15, fontWeight: "700" },
});

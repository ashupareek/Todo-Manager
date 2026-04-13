import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createList,
  createTodo,
  getLists,
  login,
  me,
  signup,
  updateList,
} from "./src/api/todoApi";
import { clearToken, loadToken, saveToken } from "./src/storage/authStorage";

function AuthCard({
  mode,
  username,
  password,
  onModeChange,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  loading,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Agent Login</Text>
      <Text style={styles.cardSubtitle}>Enter your details to access Todo Manager.</Text>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, mode === "login" && styles.tabButtonActive]}
          onPress={() => onModeChange("login")}
        >
          <Text style={[styles.tabLabel, mode === "login" && styles.tabLabelActive]}>Login</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, mode === "signup" && styles.tabButtonActive]}
          onPress={() => onModeChange("signup")}
        >
          <Text style={[styles.tabLabel, mode === "signup" && styles.tabLabelActive]}>Sign up</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={onUsernameChange}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
      />

      <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</Text>
      </Pressable>
    </View>
  );
}

function ListCard({ list, renameDraft, todoDraft, onRenameDraftChange, onTodoDraftChange, onRename, onAddTodo }) {
  return (
    <View style={styles.listCard}>
      <View style={styles.listHeader}>
        <Text style={styles.listName}>{list.name}</Text>
        <Text style={styles.listCount}>{list.todos.length} todos</Text>
      </View>

      <View style={styles.inlineRow}>
        <TextInput
          style={[styles.input, styles.inlineInput]}
          placeholder="Rename list"
          value={renameDraft}
          onChangeText={(value) => onRenameDraftChange(list.id, value)}
        />
        <Pressable style={styles.subtleButton} onPress={() => onRename(list.id)}>
          <Text style={styles.subtleButtonText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.inlineRow}>
        <TextInput
          style={[styles.input, styles.inlineInput]}
          placeholder="Add todo"
          value={todoDraft}
          onChangeText={(value) => onTodoDraftChange(list.id, value)}
        />
        <Pressable style={styles.subtleButton} onPress={() => onAddTodo(list.id)}>
          <Text style={styles.subtleButtonText}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.todoList}>
        {list.todos.length === 0 ? (
          <Text style={styles.mutedText}>No todos yet.</Text>
        ) : (
          list.todos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <Text style={styles.todoText}>{todo.task}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

export default function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [listName, setListName] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [renameDrafts, setRenameDrafts] = useState({});
  const [todoDrafts, setTodoDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const authenticated = Boolean(token && user);

  useEffect(() => {
    async function bootstrap() {
      try {
        const saved = await loadToken();

        if (!saved) {
          return;
        }

        const meData = await me(saved);
        setToken(saved);
        setUser(meData.user);
        await refreshLists(saved);
      } catch {
        await clearToken();
      } finally {
        setInitializing(false);
      }
    }

    bootstrap();
  }, []);

  function showMessage(nextMessage, error = false) {
    setMessage(nextMessage);
    setIsError(error);
  }

  async function refreshLists(activeToken = token) {
    const data = await getLists(activeToken);
    setLists(data);
    setRenameDrafts(
      data.reduce((acc, list) => {
        acc[list.id] = list.name;
        return acc;
      }, {})
    );
  }

  async function handleAuthSubmit() {
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        await signup({ username, password });
        setMode("login");
        setUsername("");
        setPassword("");
        showMessage("Account created. Sign in now.");
        return;
      }

      const loginData = await login({ username, password });
      await saveToken(loginData.token);
      setToken(loginData.token);

      const meData = await me(loginData.token);
      setUser(meData.user);
      await refreshLists(loginData.token);
      setUsername("");
      setPassword("");
      showMessage("Login successful.");
    } catch (error) {
      showMessage(error.message, true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateList() {
    if (!listName.trim()) {
      showMessage("List name is required", true);
      return;
    }

    try {
      await createList(token, { name: listName.trim() });
      setListName("");
      await refreshLists();
      showMessage("List created.");
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  async function handleRenameList(listId) {
    const value = (renameDrafts[listId] || "").trim();

    if (!value) {
      showMessage("New list name is required", true);
      return;
    }

    try {
      await updateList(token, listId, { name: value });
      await refreshLists();
      showMessage("List updated.");
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  async function handleAddTodo(listId) {
    const value = (todoDrafts[listId] || "").trim();

    if (!value) {
      showMessage("Task is required", true);
      return;
    }

    try {
      await createTodo(token, listId, { task: value });
      setTodoDrafts((current) => ({ ...current, [listId]: "" }));
      await refreshLists();
      showMessage("Todo added.");
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  async function handleLogout() {
    await clearToken();
    setToken("");
    setUser(null);
    setLists([]);
    setRenameDrafts({});
    setTodoDrafts({});
    setMessage("");
  }

  if (initializing) {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#d8a65a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topHeader}>
          <Text style={styles.brand}>Todo Manager</Text>
          {authenticated ? (
            <Pressable style={styles.subtleButton} onPress={handleLogout}>
              <Text style={styles.subtleButtonText}>Logout</Text>
            </Pressable>
          ) : null}
        </View>

        {message ? (
          <View style={[styles.messageBox, isError && styles.errorBox]}>
            <Text style={[styles.messageText, isError && styles.errorText]}>{message}</Text>
          </View>
        ) : null}

        {!authenticated ? (
          <AuthCard
            mode={mode}
            username={username}
            password={password}
            onModeChange={setMode}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handleAuthSubmit}
            loading={loading}
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dashboard</Text>
            <Text style={styles.cardSubtitle}>Signed in as {user.username}</Text>

            <View style={styles.inlineRow}>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="New list name"
                value={listName}
                onChangeText={setListName}
              />
              <Pressable style={styles.primaryButtonSmall} onPress={handleCreateList}>
                <Text style={styles.primaryButtonText}>Create</Text>
              </Pressable>
            </View>

            <Pressable style={styles.subtleButtonFull} onPress={() => refreshLists()}>
              <Text style={styles.subtleButtonText}>Refresh lists</Text>
            </Pressable>

            <View style={styles.listStack}>
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  renameDraft={renameDrafts[list.id] ?? list.name}
                  todoDraft={todoDrafts[list.id] ?? ""}
                  onRenameDraftChange={(listId, value) =>
                    setRenameDrafts((current) => ({ ...current, [listId]: value }))
                  }
                  onTodoDraftChange={(listId, value) =>
                    setTodoDrafts((current) => ({ ...current, [listId]: value }))
                  }
                  onRename={handleRenameList}
                  onAddTodo={handleAddTodo}
                />
              ))}

              {lists.length === 0 ? <Text style={styles.mutedText}>No lists yet.</Text> : null}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3efe7",
  },
  centeredScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3efe7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center",
    gap: 12,
  },
  topHeader: {
    width: "100%",
    maxWidth: 540,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  brand: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },
  messageBox: {
    width: "100%",
    maxWidth: 540,
    borderWidth: 1,
    borderColor: "#e5d8bf",
    backgroundColor: "#fbf3e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBox: {
    borderColor: "#efc3c3",
    backgroundColor: "#feeeee",
  },
  messageText: {
    color: "#5d5038",
    fontSize: 14,
  },
  errorText: {
    color: "#973737",
  },
  card: {
    width: "100%",
    maxWidth: 540,
    backgroundColor: "#fcfcfb",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e7e0d3",
    padding: 18,
    gap: 12,
    shadowColor: "#20190f",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#222",
  },
  cardSubtitle: {
    textAlign: "center",
    color: "#6e675c",
    fontSize: 15,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 6,
  },
  tabButton: {
    borderWidth: 1,
    borderColor: "#ddd2bf",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#faf7f0",
  },
  tabButtonActive: {
    backgroundColor: "#f2bf76",
    borderColor: "#d6a65f",
  },
  tabLabel: {
    color: "#5f5f5f",
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#2d2416",
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#dfd8cb",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  inlineInput: {
    flex: 1,
  },
  primaryButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: "#f2bf76",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  primaryButtonSmall: {
    height: 46,
    borderRadius: 10,
    backgroundColor: "#f2bf76",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#2d2416",
    fontWeight: "700",
  },
  subtleButton: {
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#ded6c8",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#faf8f4",
  },
  subtleButtonFull: {
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#ded6c8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#faf8f4",
  },
  subtleButtonText: {
    color: "#5b564f",
    fontWeight: "600",
  },
  inlineRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  listStack: {
    marginTop: 4,
    gap: 10,
  },
  listCard: {
    borderWidth: 1,
    borderColor: "#e4dccf",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    backgroundColor: "#fefdfa",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2a2a2a",
  },
  listCount: {
    color: "#7b7368",
    fontSize: 13,
  },
  todoList: {
    gap: 6,
    marginTop: 2,
  },
  todoItem: {
    borderWidth: 1,
    borderColor: "#ebe4d6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  todoText: {
    color: "#35312b",
  },
  mutedText: {
    color: "#776f64",
    fontSize: 14,
  },
});

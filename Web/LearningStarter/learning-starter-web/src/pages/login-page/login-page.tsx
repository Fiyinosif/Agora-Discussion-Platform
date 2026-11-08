// src/pages/login-page/login-page.tsx

import { ApiResponse } from "../../constants/types";
import { useAsyncFn } from "react-use";
import { FormErrors, useForm } from "@mantine/form";
import {
  Alert,
  Button,
  Paper,
  Text,
  TextInput,
  PasswordInput,
  Stack,
} from "@mantine/core";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { createStyles } from "@mantine/emotion";

type LoginRequest = {
  userName: string;
  password: string;
};

type LoginResponse = ApiResponse<boolean>;

const useStyles = createStyles(() => ({
  root: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #111827 0%, #020617 55%, #000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
  },

  card: {
    width: 420,
    maxWidth: "100%",
    padding: "2.5rem 2.25rem",
    borderRadius: 24,
    backgroundColor: "#020617",
    border: "1px solid rgba(148,163,184,0.35)",
    boxShadow: "0 24px 80px rgba(15,23,42,0.9)",
  },

  heading: {
    fontSize: "1.7rem",
    fontWeight: 800,
    color: "#f9fafb",
    marginBottom: "0.25rem",
    textAlign: "center",
  },

  subheading: {
    fontSize: "0.95rem",
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: "1.75rem",
  },

  label: {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#e5e7eb",
  },

  input: {
    backgroundColor: "#020617",
    borderColor: "#1f2937",
    color: "#f9fafb",
    "&::placeholder": {
      color: "#6b7280",
    },
  },

  loginButton: {
    marginTop: "0.5rem",
    backgroundColor: "#2563eb",
    "&:hover": {
      backgroundColor: "#1d4ed8",
    },
  },

  generalErrors: {
    marginBottom: "0.75rem",
  },
}));

export const LoginPage = ({
  fetchCurrentUser,
}: {
  fetchCurrentUser: () => void;
}) => {
  const { classes } = useStyles();

  const form = useForm<LoginRequest>({
    initialValues: { userName: "", password: "" },
    validate: {
      userName: (value) =>
        value.trim().length <= 0 ? "Username must not be empty" : null,
      password: (value) =>
        value.trim().length <= 0 ? "Password must not be empty" : null,
    },
  });

  const [, submitLogin] = useAsyncFn(async (values: LoginRequest) => {
    const response = await api.post<LoginResponse>("/api/authenticate", values);

    if (response.data.hasErrors) {
      const formErrors: FormErrors = response.data.errors.reduce(
        (prev, curr) => ({ ...prev, [curr.property]: curr.message }),
        {}
      );
      form.setErrors(formErrors);
      return;
    }

    if (response.data.data) {
      showNotification({ message: "Successfully Logged In!", color: "green" });
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  return (
    <div className={classes.root}>
      <Paper className={classes.card} withBorder>
        {form.errors[""] && (
          <Alert className={classes.generalErrors} color="red">
            <Text>{form.errors[""]}</Text>
          </Alert>
        )}

        <Text className={classes.heading}>Welcome to Agora</Text>
        <Text className={classes.subheading}>
          Discover communities, share ideas, and connect.
        </Text>

        <form onSubmit={form.onSubmit(submitLogin)}>
          <Stack gap="sm">
            <div>
              <Text className={classes.label} mb={4}>
                Username
              </Text>
              <TextInput
                placeholder="Enter username"
                {...form.getInputProps("userName")}
                classNames={{ input: classes.input }}
              />
            </div>

            <div>
              <Text className={classes.label} mb={4}>
                Password
              </Text>
              <PasswordInput
                placeholder="Enter password"
                {...form.getInputProps("password")}
                classNames={{ input: classes.input }}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              radius="xl"
              size="md"
              className={classes.loginButton}
            >
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
};

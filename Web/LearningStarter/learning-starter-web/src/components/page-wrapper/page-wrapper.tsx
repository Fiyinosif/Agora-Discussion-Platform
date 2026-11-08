import React from "react";
import { createStyles } from "@mantine/emotion";
import {
  AppShell,
  Box,
  Burger,
  Drawer,
  Group,
  Text,
  Avatar,
  NavLink,
  Stack,
  Button,
  Switch,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useLocation, useNavigate } from "react-router-dom";

import { routes } from "../../routes";
import { useAuth } from "../../authentication/use-auth";

type PageWrapperProps = {
  children: React.ReactNode;
};

const useStyles = createStyles(() => ({
  shell: {
    minHeight: "100vh",
  },
  header: {},
  sidebar: {
    padding: 16,
  },
  navTitle: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.12,
    marginBottom: 8,
  },
  logo: {
    fontWeight: 800,
    fontSize: 22,
  },
}));

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const { classes } = useStyles();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const navLinks = [
    { label: "Home", path: routes.home },
    { label: "Discussions", path: routes.userDiscussionPage },
    { label: "My Invites", path: routes.myInvites },
    { label: "Profile", path: routes.user },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    closeDrawer();
  };

  const handleLogout = () => {
    logout();
  };

  // Colors based on current scheme
  const mainBg = dark ? theme.colors.dark[8] : theme.colors.gray[0];
  const sidebarBg = dark ? theme.colors.dark[7] : theme.white;
  const headerBg = dark ? theme.colors.dark[9] : theme.white;
  const borderColor = dark
    ? "1px solid rgba(148,163,184,0.35)"
    : "1px solid rgba(229,231,235,1)";

  const navContent = (
    <Stack justify="space-between" h="100%">
      {/* NAV LINKS */}
      <div>
        <Text className={classes.navTitle} c="dimmed">
          Navigation
        </Text>
        <Stack gap={4}>
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              label={link.label}
              active={location.pathname === link.path}
              onClick={() => handleNavClick(link.path)}
            />
          ))}
        </Stack>
      </div>

      {/* USER + ACTIONS */}
      <Stack gap="xs">
        {user && (
          <Group>
            <Avatar radius="xl">{user.userName?.[0]?.toUpperCase()}</Avatar>
            <Box>
              <Text fw={600}>{user.userName}</Text>
              <Text size="xs" c="dimmed">
                Signed in
              </Text>
            </Box>
            <Button
              variant="filled"
              size="md"
              onClick={() => handleNavClick(routes.createDiscussion)}
            >
              <Text>+ Create Discussion</Text>
            </Button>
          </Group>
        )}

        <Button
          fullWidth
          color="red"
          variant="light"
          mt="xs"
          onClick={handleLogout}
        >
          Sign out
        </Button>

        {/* ✅ FIXED: use justify instead of position */}
        <Group mt="xs" justify="space-between">
          <Text size="sm">Dark mode</Text>
          <Switch
            size="sm"
            checked={dark}
            onChange={() => toggleColorScheme()}
          />
        </Group>
      </Stack>
    </Stack>
  );

  return (
    <>
      {/* MOBILE DRAWER */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="left"
        size={260}
        padding={0}
      >
        <Box p="md">{navContent}</Box>
      </Drawer>

      <AppShell
        padding={0}
        className={classes.shell}
        header={{ height: 60 }}
        navbar={{
          width: 260,
          breakpoint: "md",
          collapsed: { mobile: true, desktop: false },
        }}
        styles={{
          main: { backgroundColor: mainBg },
          navbar: {
            backgroundColor: sidebarBg,
            borderRight: borderColor,
          },
          header: {
            backgroundColor: headerBg,
            borderBottom: borderColor,
          },
        }}
      >
        {/* HEADER */}
        <AppShell.Header className={classes.header}>
          <Group h="100%" px="md" justify="space-between">
            <Text className={classes.logo}>△ Agora</Text>

            <Group gap="sm">
              {!isMobile && user && (
                <Text size="sm" c="dimmed">
                  Hi,{" "}
                  <Text span fw={700}>
                    {user.userName}
                  </Text>
                </Text>
              )}
              {isMobile && (
                <Burger opened={drawerOpened} onClick={openDrawer} size="sm" />
              )}
            </Group>
          </Group>
        </AppShell.Header>

        {/* DESKTOP SIDEBAR */}
        {!isMobile && (
          <AppShell.Navbar className={classes.sidebar}>
            {navContent}
          </AppShell.Navbar>
        )}

        {/* MAIN CONTENT */}
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
};

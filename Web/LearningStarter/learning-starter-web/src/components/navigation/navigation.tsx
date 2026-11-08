import { Link, NavLink, NavLinkProps, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { routes } from "../../routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  Menu,
  Image,
  Container,
  Group,
  useMantineColorScheme,
  Button,
  Flex,
  Text,
  Avatar,
  Title,
  Badge,
} from "@mantine/core";
import { NAVBAR_HEIGHT } from "../../constants/theme-constants";
import logo from "../../assets/logo.png";
import { UserDto, ApiResponse, InviteGetDto } from "../../constants/types";
import { useAuth } from "../../authentication/use-auth";
import { createStyles } from "@mantine/emotion";
import api from "../../config/axios";

type PrimaryNavigationProps = {
  user?: UserDto;
};

type NavigationItem = {
  text: string;
  icon?: IconProp | undefined;
  hide?: boolean;
} & (
  | {
      nav: Omit<
        NavLinkProps,
        keyof React.AnchorHTMLAttributes<HTMLAnchorElement>
      >;
      children?: never;
    }
  | { nav?: never; children: NavigationItemForceNav[] }
);

export type NavigationItemForceNav = {
  text: string;
  icon?: IconProp | undefined;
  hide?: boolean;
  nav: NavLinkProps;
};

const navigation: NavigationItem[] = [
  {
    text: "Home",
    hide: false,
    nav: {
      to: routes.home,
    },
  },
  {
    text: "Discussions",
    hide: false,
    nav: {
      to: routes.userDiscussionPage,
    },
  },
  {
    text: "Invites",
    hide: false,
    nav: {
      to: routes.myInvites,
    },
  },
  {
    text: "Profile",
    hide: false,
    nav: {
      to: routes.user,
    },
  },
];

const DesktopNavigation: React.FC<{ pendingInvites: number }> = ({
  pendingInvites,
}) => {
  const { classes, cx } = useStyles();
  const { pathname } = useLocation();
  const [active, setActive] = useState(navigation[0].nav?.to.toString());

  useEffect(() => {
    setActive(pathname);
  }, [pathname, setActive]);

  return (
    <>
      <Container px={0} className={classes.desktopNav}>
        <Flex direction="row" align="center" className={classes.fullHeight}>
          {navigation
            .filter((x) => !x.hide)
            .map((x, i) => {
              if (x.children) {
                return (
                  <Menu trigger="hover" key={i}>
                    <Menu.Target>
                      <Button
                        size="md"
                        className={classes.paddedMenuItem}
                        variant="subtle"
                        key={i}
                      >
                        {x.icon && <FontAwesomeIcon icon={x.icon} />} {x.text}
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {x.children
                        .filter((x) => !x.hide)
                        .map((y) => {
                          return (
                            <Menu.Item
                              key={`${y.text}`}
                              to={y.nav.to}
                              component={NavLink}
                            >
                              <Flex direction="row">
                                <Text size="sm">
                                  {y.icon && <FontAwesomeIcon icon={y.icon} />}{" "}
                                  {y.text}
                                </Text>
                              </Flex>
                            </Menu.Item>
                          );
                        })}
                    </Menu.Dropdown>
                  </Menu>
                );
              }

              const isInvites = x.nav.to === routes.myInvites;

              return (
                <Button
                  size="md"
                  component={NavLink}
                  to={x.nav.to}
                  className={cx(classes.paddedMenuItem, {
                    [classes.linkActive]: active === x.nav.to,
                  })}
                  variant="subtle"
                  key={i}
                >
                  {x.icon && <FontAwesomeIcon icon={x.icon} />}

                  {isInvites && pendingInvites > 0 ? (
                    <Group gap={6} ml={x.icon ? 6 : 0}>
                      <span>{x.text}</span>
                      <Badge size="xs" radius="xl">
                        {pendingInvites}
                      </Badge>
                    </Group>
                  ) : (
                    <span style={{ marginLeft: x.icon ? 6 : 0 }}>{x.text}</span>
                  )}
                </Button>
              );
            })}
        </Flex>
      </Container>
    </>
  );
};

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
  user,
}) => {
  const { classes } = useStyles();
  const { logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const [pendingInvites, setPendingInvites] = useState(0);

  // fetch pending invites for the logged-in user
  useEffect(() => {
    const fetchInvites = async () => {
      if (!user?.id) return;

      try {
        const res = await api.get<ApiResponse<InviteGetDto[]>>(
          `/api/invites/user/${user.id}`
        );

        if (!res.data.hasErrors && res.data.data) {
          const pending = res.data.data.filter(
            (inv) => inv.status === "Pending"
          ).length;
          setPendingInvites(pending);
        }
      } catch (err) {
        // optional: ignore or log
        console.error("Failed to fetch invites", err);
      }
    };

    fetchInvites();
  }, [user?.id]);

  return (
    <Title order={4}>
      <Container px={20} fluid>
        <Flex direction="row" justify="space-between" align="center">
          <Group>
            <Flex direction="row" align="center">
              <NavLink to={routes.root}>
                <Image
                  className={classes.logo}
                  w={60}
                  h={50}
                  radius="sm"
                  fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                  src={logo}
                  alt="logo"
                />
              </NavLink>
              {user && <DesktopNavigation pendingInvites={pendingInvites} />}
            </Flex>
          </Group>
          <Group>
            {user && (
              <>
                <Button
                  variant="filled"
                  size="md"
                  component={NavLink}
                  to={routes.createDiscussion}
                >
                  + Create Discussion
                </Button>
                <Menu>
                  <Menu.Target>
                    <Avatar className={classes.pointer}>
                      {user.firstName.substring(0, 1)}
                      {user.lastName.substring(0, 1)}
                    </Avatar>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => toggleColorScheme()}>
                      {dark ? "Light mode" : "Dark mode"}
                    </Menu.Item>
                    <Menu.Item onClick={() => logout()}>Sign Out</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            )}
          </Group>
        </Flex>
      </Container>
    </Title>
  );
};

const useStyles = createStyles((theme) => {
  return {
    pointer: {
      cursor: "pointer",
    },
    logo: {
      cursor: "pointer",
      marginRight: "5px",
      paddingTop: "5px",
      height: NAVBAR_HEIGHT,
    },
    paddedMenuItem: {
      margin: "0px 5px 0px 5px",
    },
    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.variantColorResolver({
          theme: theme,
          color: theme.primaryColor,
          variant: "light",
        }).background,
        color: theme.variantColorResolver({
          theme: theme,
          color: theme.primaryColor,
          variant: "light",
        }).color,
      },
    },
    desktopNav: {
      height: NAVBAR_HEIGHT,
    },
    fullHeight: {
      height: "100%",
    },
  };
});

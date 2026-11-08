import {
  Card,
  Group,
  Avatar,
  Text,
  Stack,
  Divider,
  Badge,
  ScrollArea,
  ActionIcon,
  Collapse,
  AppShell,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";
import { DiscussionGetDto, MemberGetDto, Role } from "../../constants/types";
import { useNavigate } from "react-router-dom";

interface Props {
  discussion?: DiscussionGetDto;
  members: MemberGetDto[];
}

export const DiscussionMembersPanel = ({ discussion, members }: Props) => {
  const [adminsOpen, setAdminsOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(true);
  const navigate = useNavigate();

  if (!discussion) return null;
  if (!members) return null;

  const roleColors: Record<Role, string> = {
    0: "violet",
    1: "blue",
    2: "gray",
  };

  const owner = discussion!.owner;

  const admins = members.filter(
    (m) => m.role === Role.Admin && m.id !== owner.id
  );

  const member = members.filter(
    (m) => m.role === Role.Member && m.id !== owner.id
  );

  return (
    <AppShell
      p="lg"
      withBorder
      mih="100vh"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--mantine-color-body)",
      }}
    >
      {/* HEADER */}
      <Group justify="space-between" mb="sm">
        <Text fw={700} size="xl">
          Members
        </Text>
        <Badge radius="xl">{members.length}</Badge>
      </Group>

      {/* OWNER */}
      <Stack gap={4} mb="md">
        <Text fw={600} size="sm" c="dimmed">
          Owner
        </Text>
        <Card withBorder p="sm" radius="md" style={{ cursor: "pointer" }}>
          <Group justify="space-between">
            <Group
              gap="sm"
              onClick={() => navigate(`/userprofile/${owner!.id}`)}
            >
              <Avatar radius="xl" color="grape">
                {owner!.userName[0]?.toUpperCase()}
              </Avatar>
              <Text fw={600}>{owner!.userName}</Text>{" "}
            </Group>
            <Badge color="grape" size="xs">
              Owner
            </Badge>
          </Group>
        </Card>
      </Stack>

      <Divider my="sm" />

      {/* ------------------- ADMINS ------------------- */}
      <Group
        justify="space-between"
        onClick={() => setAdminsOpen((o) => !o)}
        style={{ cursor: "pointer" }}
        mb="xs"
      >
        <Text fw={600} size="sm">
          Admins
        </Text>

        <ActionIcon variant="subtle" size="sm">
          {adminsOpen ? (
            <IconChevronUp size={16} />
          ) : (
            <IconChevronDown size={16} />
          )}
        </ActionIcon>
      </Group>

      <Collapse in={adminsOpen}>
        <ScrollArea style={{ maxHeight: 180, marginBottom: 12 }}>
          <Stack gap="xs">
            {admins.map((m) => (
              <Card
                key={m.id}
                withBorder
                p="sm"
                radius="md"
                style={{
                  transition: "0.15s",
                  cursor: "pointer",
                }}
              >
                <Group justify="space-between">
                  <Group
                    gap="sm"
                    onClick={() => navigate(`/userprofile/${m.id}`)}
                  >
                    <Avatar radius="xl" color="blue">
                      {m.userName[0]?.toUpperCase()}
                    </Avatar>
                    <Text fw={500}>{m.userName}</Text>
                  </Group>
                  <Badge color={roleColors[m.role]} size="xs">
                    {Role[m.role]}
                  </Badge>
                </Group>
              </Card>
            ))}
            {admins.length === 0 && (
              <Text size="xs" c="dimmed">
                No admins
              </Text>
            )}
          </Stack>
        </ScrollArea>
      </Collapse>

      {/* ------------------- MEMBERS ------------------- */}
      <Group
        justify="space-between"
        onClick={() => setMembersOpen((o) => !o)}
        style={{ cursor: "pointer" }}
        mb="xs"
      >
        <Text fw={600} size="sm">
          Members
        </Text>

        <ActionIcon variant="subtle" size="sm">
          {membersOpen ? (
            <IconChevronUp size={16} />
          ) : (
            <IconChevronDown size={16} />
          )}
        </ActionIcon>
      </Group>

      <Collapse in={membersOpen} style={{ flex: 1 }}>
        <ScrollArea style={{ height: "100%" }}>
          <Stack gap="xs">
            {member.map((m) => (
              <Card
                key={m.id}
                withBorder
                p="sm"
                radius="md"
                style={{
                  transition: "0.15s",
                  cursor: "pointer",
                }}
              >
                <Group justify="space-between">
                  <Group
                    gap="sm"
                    onClick={() => navigate(`/userprofile/${m.id}`)}
                  >
                    <Avatar radius="xl" color="gray">
                      {m.userName[0]?.toUpperCase()}
                    </Avatar>
                    <Text fw={500}>{m.userName}</Text>
                  </Group>
                  <Badge color={roleColors[m.role]} size="xs">
                    {Role[m.role]}
                  </Badge>
                </Group>
              </Card>
            ))}
            {member.length === 0 && (
              <Text size="xs" c="dimmed">
                No members
              </Text>
            )}
          </Stack>
        </ScrollArea>
      </Collapse>
    </AppShell>
  );
};

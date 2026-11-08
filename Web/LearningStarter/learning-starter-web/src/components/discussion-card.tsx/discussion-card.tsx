import {
  Badge,
  Card,
  Flex,
  Text,
  Group,
  Divider,
  Stack,
  Button,
} from "@mantine/core";
import {
  DiscussionGetDto,
  DiscussionSettingsGetDto,
  Privacy,
} from "../../constants/types";
import { useLocation, useNavigate } from "react-router-dom";
import { createStyles } from "@mantine/emotion";
import { useUser } from "../../authentication/use-auth";

type DiscussionCardProps = {
  discussion: DiscussionGetDto;
  settings?: DiscussionSettingsGetDto;
  privacy: Privacy;
  isLocked: boolean;
  onDelete?: (id: number) => void; // optional callback for delete
};

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  settings,
  privacy,
  isLocked,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { classes } = useStyles();
  const location = useLocation();
  const isUserPage = location.pathname === "/user";
  const user = useUser();

  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/userprofile/${discussion.owner.id}`);
  };
  const bannedUser = discussion.bannedUsers.find(
    (m) => m.userId === user.id && discussion.id === m.discussionId
  );

  const handleClick = () => {
    if (privacy === Privacy.Private && isLocked) navigate("/warning");
    else if (bannedUser) {
      navigate("/warning/banned", {
        state: {
          reason: bannedUser.reason,
          expirationDate: bannedUser.expirationDate,
        },
      });
    } else if (privacy === Privacy.InviteOnly && isLocked) {
      navigate("/warning/invite", {
        state: { discussionId: discussion.id, ownerId: discussion.owner.id },
      });
    } else {
      navigate(`/discussion/${discussion.id}`, {
        state: { setting: settings },
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigating to discussion
    if (onDelete) onDelete(discussion.id);
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="lg"
      withBorder
      m="md"
      className={classes.card}
      onClick={handleClick}
    >
      <Stack className={classes.container}>
        {/* --- Title --- */}
        <Text fw={700} size="lg" ta="center" className={classes.title}>
          {settings?.title}
        </Text>

        {/* --- Body --- */}
        <Text
          size="sm"
          c="dimmed"
          ta="center"
          lineClamp={3}
          className={classes.body}
        >
          {discussion.body || "No description provided."}
        </Text>

        {/* --- Tags --- */}
        <Flex wrap="wrap" justify="center" gap={6} className={classes.tags}>
          {discussion.tags.length > 0 ? (
            discussion.tags.map((t) => (
              <Badge
                key={t.id}
                radius="sm"
                variant="light"
                color="blue"
                size="sm"
              >
                {t.name}
              </Badge>
            ))
          ) : (
            <Text size="xs" c="dimmed" fs="italic">
              No tags
            </Text>
          )}
        </Flex>

        <Divider my="xs" />
        <Text
          size="sm"
          fw={500}
          className={classes.linkHover}
          onClick={goToProfile}
        >
          Created by: {discussion.owner.userName}
        </Text>

        {/* --- Footer --- */}
        <Group justify="space-between" w="100%" className={classes.footer}>
          <Text size="xs" c="dimmed">
            {new Date(discussion.createdAt).toLocaleDateString()}
          </Text>
          <Text size="xs" c="dimmed">
            Members: {discussion.members.length}
          </Text>

          {/* --- Delete button only on /user page --- */}
          {isUserPage && onDelete && (
            <Button
              size="xs"
              color="red"
              variant="light"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

const useStyles = createStyles(() => ({
  card: {
    cursor: "pointer",
    width: 280,
    minHeight: 320,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    },
  },

  container: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
    textAlign: "center",
  },

  title: {
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  body: {
    minHeight: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tags: {
    minHeight: 40,
    alignContent: "center",
  },

  footer: {
    minHeight: 30,
  },

  linkHover: {
    cursor: "pointer",
    color: "white",
    transition: "color 0.2s ease",
    "&:hover": { color: "var(--mantine-color-grey-10)" },
  },
}));

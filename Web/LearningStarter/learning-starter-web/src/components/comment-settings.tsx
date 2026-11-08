import { useState } from "react";
import { ActionIcon, Menu, rem } from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import api from "../config/axios";
import { Role } from "../constants/types";

interface Reply {
  id: number;
  content: string;
  created_at: string;
  /*discussionId: number;*/
  user: {
    username: string;
    id: number;
  };
  handleDeleteReply: (id: number) => void;
}

interface Props {
  reply: Reply;
  currentUserRole: Role;
  handleDeleteReply: (id: number) => void;
}

export default function CommentSettings({
  reply,
  currentUserRole,
  handleDeleteReply,
}: Props) {
  const [loading, setLoading] = useState(false);

  const canDelete =
    currentUserRole === Role.Admin || currentUserRole === Role.Owner;

  const handleDelete = async () => {
    if (!canDelete) return;

    setLoading(true);
    try {
      const res = await api.delete(`/api/discussions/${reply.id}`);
    } catch (err) {
      console.error("Error deleting reply:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Menu
      shadow="md"
      width={140}
      position="bottom-end"
      offset={5}
      transitionProps={{ transition: "pop", duration: 80 }}
      withArrow
      arrowSize={8}
      styles={{
        dropdown: {
          backgroundColor: "#333",
          border: "1px solid #555",
          color: "#ccc",

          borderRadius: rem(8),
          padding: rem(4),
        },
        item: {
          fontSize: rem(14),
          padding: `${rem(6)} ${rem(10)}`,
          borderRadius: rem(6),
        },
      }}
    >
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          size="sm"
          color="gray.2"
          style={{ color: "#888" }}
        >
          <IconDotsVertical size={18} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {canDelete ? (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => handleDeleteReply(reply.id)}
          >
            {loading ? "Deleting..." : "Delete"}
          </Menu.Item>
        ) : (
          <Menu.Item disabled> No permission </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

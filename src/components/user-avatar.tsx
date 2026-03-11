import { Avatar, type AvatarProps } from "@mantine/core";

import defaultAvatar from "../assets/avatars/default-avatar.svg";

interface UserAvatarProps extends Omit<AvatarProps, "children" | "src"> {
  readonly name: string;
  readonly image?: string | null;
  readonly alt?: string;
}

export function UserAvatar({ name, image, alt, ...avatarProps }: Readonly<UserAvatarProps>) {
  return <Avatar {...avatarProps} src={image ?? defaultAvatar} alt={alt ?? name} />;
}

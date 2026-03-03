import { type ButtonProps, type PolymorphicComponentProps, Button } from "@mantine/core";
import { type LinkComponent, createLink } from "@tanstack/react-router";
import { forwardRef } from "react";

const _LinkButton = createLink(
  forwardRef<HTMLAnchorElement, PolymorphicComponentProps<"a", Omit<ButtonProps, "component" | "ref">>>((p, r) => (
    <Button ref={r} component="a" {...p} />
  )),
);

// oxlint-disable-next-line react/jsx-pascal-case
export const LinkButton: LinkComponent<typeof _LinkButton> = (props) => <_LinkButton {...props} />;

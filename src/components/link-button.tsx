import { type ButtonProps, type PolymorphicComponentProps, Button } from "@mantine/core";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import { forwardRef } from "react";

const BaseLinkButton = createLink(
  forwardRef<HTMLAnchorElement, PolymorphicComponentProps<"a", Omit<ButtonProps, "component" | "ref">>>((p, r) => (
    <Button ref={r} component="a" {...p} />
  )),
);

export const LinkButton: LinkComponent<typeof BaseLinkButton> = (props) => <BaseLinkButton {...props} />;

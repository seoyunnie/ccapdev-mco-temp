import { Link, type LinkProps } from "@tanstack/react-router";
import { forwardRef, type Ref } from "react";

/**
 * A thin wrapper around TanStack Router's Link to relax strict route typing.
 * Use this with Mantine's polymorphic `component` prop:
 *   <Button component={AppLink} to="/login">Log In</Button>
 */
const AppLink = forwardRef(function AppLink(props: LinkProps & Record<string, unknown>, ref: Ref<HTMLAnchorElement>) {
  return <Link ref={ref} {...props} />;
});

export { AppLink };

import { ActionIcon, Anchor, Container, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import adormableLogo from "../../assets/logos/adormable-logo.png";
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, type IconComponent } from "../../lib/icons.tsx";
import { FOOTER_ITEMS } from "./footer-items.ts";

import styles from "./footer.module.css";

const SOCIAL_LINKS = [
  { label: "Visit Adormable on X", href: "https://x.com", color: styles.socialX, icon: IconBrandTwitter },
  {
    label: "Visit Adormable on Facebook",
    href: "https://facebook.com",
    color: styles.socialFacebook,
    icon: IconBrandFacebook,
  },
  {
    label: "Visit Adormable on Instagram",
    href: "https://instagram.com",
    color: styles.socialInstagram,
    icon: IconBrandInstagram,
  },
] as const satisfies readonly { label: string; href: string; color: string; icon: IconComponent }[];

export function Footer() {
  const renderFooterLink = (link: (typeof FOOTER_ITEMS)[number]["links"][number]) => {
    if (link.to) {
      return (
        <Text key={link.label} className={styles.link} component={Link} to={link.to}>
          {link.label}
        </Text>
      );
    }

    if (link.href != null) {
      return (
        <Anchor key={link.label} className={styles.link} href={link.href} underline="never">
          {link.label}
        </Anchor>
      );
    }

    return (
      <Text key={link.label} className={styles.linkDisabled}>
        {link.label}
      </Text>
    );
  };

  return (
    <footer className={styles.root}>
      <Container size="xl">
        <div className={styles.container}>
          <div className={styles.logoSection}>
            <img src={adormableLogo} alt="Adormable" height={36} className={styles.logoMark} />
            <Text size="sm" c="dimmed" className={styles.description}>
              Your all-in-one dormitory companion since 2026.
            </Text>
          </div>
          <div className={styles.linksSection}>
            {FOOTER_ITEMS.map((group) => (
              <div className={styles.linksWrapper} key={group.title}>
                <Text className={styles.linksTitle}>{group.title}</Text>
                {group.links.map((link) => renderFooterLink(link))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.bottomBar}>
          <Text c="dimmed" size="sm">
            &copy; 2026 Adormable All rights reserved.
          </Text>
          <Group gap={0} className={styles.socialsSection} justify="flex-end" wrap="nowrap">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <ActionIcon
                  key={social.label}
                  size="lg"
                  variant="subtle"
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className={`${styles.socialIcon} ${social.color}`}
                >
                  <Icon size={18} stroke={1.7} />
                </ActionIcon>
              );
            })}
          </Group>
        </div>
      </Container>
    </footer>
  );
}
